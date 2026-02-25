// interfaces/http/middlewares/oauthMiddleware.js
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

const oauthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'oauth_missing_token',
        message: 'Token d\'accès manquant' 
      });
    }

    const token = authHeader.split(' ')[1];

    // Vérifier le token JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Vérifier si le token existe dans la base
    const tokenRecord = await prisma.oAuthToken.findUnique({
      where: { accessToken: token },
      include: { client: true }
    });

    if (!tokenRecord) {
      return res.status(401).json({ 
        error: 'oauth_invalid_token',
        message: 'Token invalide' 
      });
    }

    if (tokenRecord.accessTokenExpiresAt < new Date()) {
      return res.status(401).json({ 
        error: 'oauth_token_expired',
        message: 'Token expiré' 
      });
    }

    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      include: {
        etudiant: { include: { filiere: true, groupe: true } },
        enseignant: true,
        admin: true
      }
    });

    if (!user) {
      return res.status(401).json({ 
        error: 'oauth_user_not_found',
        message: 'Utilisateur non trouvé' 
      });
    }

    if (user.status !== 'VALIDE') {
      return res.status(403).json({ 
        error: 'oauth_account_pending',
        message: 'Compte en attente de validation' 
      });
    }

    // Ajouter l'utilisateur et le token à la requête
    req.user = {
      id: user.id,
      email: user.email,
      nom: user.nom,
      prenom: user.prenom,
      role: user.role,
      ...(user.etudiant && { 
        etudiantId: user.etudiant.id,
        filiere: user.etudiant.filiere,
        niveau: user.etudiant.niveau,
        groupe: user.etudiant.groupe 
      }),
      ...(user.enseignant && { 
        enseignantId: user.enseignant.id,
        specialite: user.enseignant.specialite,
        grade: user.enseignant.grade 
      })
    };
    
    req.token = {
      id: tokenRecord.id,
      scope: tokenRecord.scope,
      clientId: tokenRecord.client.clientId
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'oauth_token_expired',
        message: 'Token expiré' 
      });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'oauth_invalid_token',
        message: 'Token invalide' 
      });
    }
    res.status(500).json({ 
      error: 'oauth_server_error',
      message: error.message 
    });
  }
};

// Middleware pour vérifier les scopes
const oauthScopeMiddleware = (requiredScope) => {
  return (req, res, next) => {
    const tokenScopes = req.token.scope ? req.token.scope.split(' ') : [];

    if (!tokenScopes.includes(requiredScope)) {
      return res.status(403).json({ 
        error: 'oauth_insufficient_scope',
        message: `Scope '${requiredScope}' requis`,
        required: requiredScope,
        available: tokenScopes
      });
    }

    next();
  };
};

// Middleware pour vérifier les rôles
const oauthRoleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'oauth_insufficient_role',
        message: `Rôle ${req.user.role} non autorisé`,
        required: allowedRoles
      });
    }
    next();
  };
};

module.exports = { 
  oauthMiddleware, 
  oauthScopeMiddleware,
  oauthRoleMiddleware 
};