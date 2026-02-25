// application/auth/OAuthServer.js
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto'); // ⚠️ Import manquant corrigé
const prisma = require('../../prisma'); // Import de ton instance Prisma centralisée

class OAuthServer {
  constructor() {
    this.prisma = prisma;
  }

  // ========== ENREGISTRER UN UTILISATEUR ==========
  async register(userData, role) {
    return await this.prisma.$transaction(async (tx) => {
      const existingUser = await tx.utilisateur.findUnique({
        where: { email: userData.email },
      });
      if (existingUser) throw new Error('Email déjà utilisé');

      const salt = crypto.randomBytes(16).toString('hex');
      const hashedPassword = await bcrypt.hash(userData.motDePasse + salt, 10);

      const user = await tx.utilisateur.create({
        data: {
          email: userData.email,
          motDePasse: hashedPassword,
          sel: salt,
          nom: userData.nom,
          prenom: userData.prenom,
          typeUtilisateur: role,
          statut: 'EN_ATTENTE',
        },
      });

      // Création de l'entité spécifique selon le rôle
      if (role === 'ETUDIANT') {
        await tx.etudiant.create({
          data: {
            utilisateurId: user.id,
            numeroEtudiant: userData.numeroEtudiant,
            niveau: userData.niveau,
            filiereId: userData.filiereId,
          },
        });
      } else if (role === 'ENSEIGNANT') {
        await tx.enseignant.create({
          data: {
            utilisateurId: user.id,
            matricule: userData.matricule,
            specialite: userData.specialite,
            grade: userData.grade,
          },
        });
      }

      return {
        id: user.id,
        email: user.email,
        nom: user.nom,
        prenom: user.prenom,
        role: user.typeUtilisateur,
        statut: user.statut,
      };
    });
  }

  // ========== LOGIN AVEC PASSWORD ==========
  async login(email, password, clientId, clientSecret) {
    const client = await this.prisma.oAuthClient.findUnique({
      where: { clientId },
    });
    if (!client || client.clientSecret !== clientSecret)
      throw new Error('Client OAuth invalide');

    const user = await this.prisma.utilisateur.findUnique({
      where: { email },
      include: { etudiant: true, enseignant: true, administrateur: true },
    });

    if (!user) throw new Error('Utilisateur non trouvé');
    if (user.statut !== 'ACTIF') throw new Error('Compte non actif');

    const validPassword = await bcrypt.compare(password + user.sel, user.motDePasse);
    if (!validPassword) throw new Error('Mot de passe incorrect');

    return this.createTokens(user, client);
  }

  // ========== CREATION DES TOKENS ==========
  async createTokens(user, client, scope = 'profile email') {
    const accessToken = jwt.sign(
      {
        sub: user.id,
        client_id: client.clientId,
        role: user.typeUtilisateur,
        scope,
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const refreshToken = crypto.randomBytes(40).toString('hex');
    const now = new Date();

    await this.prisma.oAuthToken.create({
      data: {
        accessToken,
        accessTokenExpiresAt: new Date(now.getTime() + 3600 * 1000), // 1h
        refreshToken,
        refreshTokenExpiresAt: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000), // 14 jours
        scope,
        clientId: client.id,
        utilisateurId: user.id,
      },
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: 3600,
      token_type: 'Bearer',
      scope,
    };
  }

  // ========== RAFRAICHIR LE TOKEN ==========
  async refreshToken(refreshToken) {
    const tokenRecord = await this.prisma.oAuthToken.findUnique({
      where: { refreshToken },
      include: { client: true, user: true }, // ✅ Inclure user et client
    });

    if (!tokenRecord) throw new Error('Refresh token invalide');
    if (tokenRecord.refreshTokenExpiresAt < new Date())
      throw new Error('Refresh token expiré');

    return this.createTokens(tokenRecord.user, tokenRecord.client, tokenRecord.scope);
  }

  // ========== REVOQUER LE TOKEN ==========
  async revokeToken(refreshToken) {
    await this.prisma.oAuthToken.deleteMany({ where: { refreshToken } });
    return { success: true };
  }

  // ========== RECUPERER L'UTILISATEUR ==========
  async getUserFromToken(accessToken) {
    try {
      const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
      const user = await this.prisma.utilisateur.findUnique({
        where: { id: decoded.sub },
        include: { etudiant: true, enseignant: true, administrateur: true },
      });
      if (!user || user.statut !== 'ACTIF') return null;
      return user;
    } catch {
      return null;
    }
  }
}

module.exports = OAuthServer;