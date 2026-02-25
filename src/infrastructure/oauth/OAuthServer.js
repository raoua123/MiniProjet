// infrastructure/oauth/OAuthServer.js
const OAuth2Server = require('oauth2-server');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class OAuthServer {
  constructor() {
    this.oauth = new OAuth2Server({
      model: this.createModel(),
      accessTokenLifetime: 3600, // 1 heure
      refreshTokenLifetime: 1209600, // 14 jours
      allowBearerTokensInQueryString: true,
      requireClientAuthentication: true // Important pour la sécurité
    });
  }

  createModel() {
    return {
      // Récupérer un client OAuth
      getClient: async (clientId, clientSecret) => {
        const client = await prisma.oAuthClient.findUnique({
          where: { clientId }
        });

        if (!client) return null;

        // Vérifier le secret si fourni
        if (clientSecret && client.clientSecret !== clientSecret) {
          return null;
        }

        return {
          id: client.id,
          clientId: client.clientId,
          clientSecret: client.clientSecret,
          grants: client.grants,
          redirectUris: client.redirectUris,
          scope: client.scope
        };
      },

      // Sauvegarder un token
      saveToken: async (token, client, user) => {
        const savedToken = await prisma.oAuthToken.create({
          data: {
            accessToken: token.accessToken,
            accessTokenExpiresAt: token.accessTokenExpiresAt,
            refreshToken: token.refreshToken,
            refreshTokenExpiresAt: token.refreshTokenExpiresAt,
            scope: token.scope,
            clientId: client.id,
            userId: user.id
          }
        });

        return {
          ...token,
          client,
          user: {
            id: user.id,
            email: user.email,
            role: user.role
          }
        };
      },

      // Récupérer un token d'accès
      getAccessToken: async (accessToken) => {
        const token = await prisma.oAuthToken.findUnique({
          where: { accessToken },
          include: {
            client: true,
            user: {
              include: {
                etudiant: { include: { filiere: true } },
                enseignant: true,
                admin: true
              }
            }
          }
        });

        if (!token) return null;

        return {
          accessToken: token.accessToken,
          accessTokenExpiresAt: token.accessTokenExpiresAt,
          client: token.client,
          user: token.user,
          scope: token.scope
        };
      },

      // Récupérer un refresh token
      getRefreshToken: async (refreshToken) => {
        const token = await prisma.oAuthToken.findUnique({
          where: { refreshToken },
          include: {
            client: true,
            user: true
          }
        });

        if (!token) return null;

        return {
          refreshToken: token.refreshToken,
          refreshTokenExpiresAt: token.refreshTokenExpiresAt,
          client: token.client,
          user: token.user,
          scope: token.scope
        };
      },

      // Révoquer un token
      revokeToken: async (token) => {
        const deleted = await prisma.oAuthToken.deleteMany({
          where: { refreshToken: token.refreshToken }
        });
        return deleted.count > 0;
      },

      // Vérifier les scopes
      verifyScope: async (token, scope) => {
        if (!token.scope) return false;
        const requestedScopes = scope.split(' ');
        const tokenScopes = token.scope.split(' ');
        return requestedScopes.every(s => tokenScopes.includes(s));
      },
       // Authentifier un utilisateur (pour password grant)
      getUser: async (username, password) => {
        const user = await prisma.user.findUnique({
          where: { email: username }
        });

        if (!user) return null;

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return null;

        if (user.status !== 'VALIDE') {
          throw new Error('Compte non validé');
        }

        return {
          id: user.id,
          email: user.email,
          role: user.role
        };
      },

      // Valider un code d'autorisation
      getAuthorizationCode: async (authorizationCode) => {
        const code = await prisma.oAuthCode.findUnique({
          where: { authorizationCode },
          include: {
            client: true,
            user: true
          }
        });

        if (!code) return null;

        return {
          authorizationCode: code.authorizationCode,
          expiresAt: code.expiresAt,
          redirectUri: code.redirectUri,
          scope: code.scope,
          client: code.client,
          user: code.user
        };
      },

      // Sauvegarder un code d'autorisation
      saveAuthorizationCode: async (code, client, user) => {
        const savedCode = await prisma.oAuthCode.create({
          data: {
            authorizationCode: code.authorizationCode,
            expiresAt: code.expiresAt,
            redirectUri: code.redirectUri,
            scope: code.scope,
            clientId: client.id,
            userId: user.id
          }
        });

        return {
          ...code,
          client,
          user
        };
      },

      // Révoquer un code d'autorisation
      revokeAuthorizationCode: async (code) => {
        const deleted = await prisma.oAuthCode.deleteMany({
          where: { authorizationCode: code.authorizationCode }
        });
        return deleted.count > 0;
      },

      // Valider le scope (optionnel)
      validateScope: async (user, client, scope) => {
        // Logique métier pour valider les scopes selon l'utilisateur
        // Par exemple, un étudiant ne peut pas avoir de scope admin
        if (user.role === 'ETUDIANT' && scope.includes('admin')) {
          return false;
        }
        return scope;
      }
    };
  }

  // Middleware pour authentifier les requêtes
  authenticate(options = {}) {
    return async (req, res, next) => {
      try {
        const request = new OAuth2Server.Request(req);
        const response = new OAuth2Server.Response(res);

        const token = await this.oauth.authenticate(request, response, options);
        
        req.user = token.user;
        req.accessToken = token;
        
        next();
      } catch (err) {
        res.status(401).json({ 
          error: 'oauth_unauthorized',
          message: err.message 
        });
      }
    };
  }
   // Middleware pour le endpoint token
  token() {
    return async (req, res) => {
      try {
        const request = new OAuth2Server.Request(req);
        const response = new OAuth2Server.Response(res);

        const token = await this.oauth.token(request, response);
        
        res.json({
          access_token: token.accessToken,
          token_type: 'Bearer',
          expires_in: 3600,
          refresh_token: token.refreshToken,
          scope: token.scope
        });
      } catch (err) {
        res.status(400).json({ 
          error: 'oauth_invalid_request',
          message: err.message 
        });
      }
    };
  }

  // Middleware pour le endpoint authorize
  authorize() {
    return async (req, res) => {
      try {
        const request = new OAuth2Server.Request(req);
        const response = new OAuth2Server.Response(res);

        const code = await this.oauth.authorize(request, response);
        
        // Rediriger vers l'URI avec le code
        res.redirect(`${code.redirectUri}?code=${code.authorizationCode}`);
      } catch (err) {
        res.status(400).json({ 
          error: 'oauth_authorization_error',
          message: err.message 
        });
      }
    };
  }
}

module.exports = OAuthServer;
