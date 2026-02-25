const OAuthServer = require('../../oauth/OAuthServer');
const OAuthAuthService = require('../../../application/auth/OAuthAuthService');

const oauthServer = new OAuthServer();
const oauthAuthService = new OAuthAuthService(oauthServer);

class OAuthController {
  // ========== ENDPOINTS OAUTH STANDARD ==========
  
  // POST /oauth/token - Obtenir un token
  async token(req, res) {
    return oauthServer.token()(req, res);
  }

  // GET /oauth/authorize - Demander une autorisation
  async authorize(req, res) {
    return oauthServer.authorize()(req, res);
  }

  // ========== ENDPOINTS SIMPLIFIÉS POUR LE FRONTEND ==========
  
  // POST /oauth/login - Login simplifié (password grant)
  async login(req, res) {
    try {
      const { email, password, client_id, client_secret } = req.body;

      const result = await oauthAuthService.loginWithPassword(
        email,
        password,
        client_id,
        client_secret
      );

      res.json(result);
    } catch (error) {
      res.status(401).json({ 
        error: 'oauth_login_failed',
        message: error.message 
      });
    }
  }

  // POST /oauth/refresh - Rafraîchir un token
  async refresh(req, res) {
    try {
      const { refresh_token } = req.body;

      const result = await oauthAuthService.refreshAccessToken(refresh_token);
      res.json(result);
    } catch (error) {
      res.status(401).json({ 
        error: 'oauth_refresh_failed',
        message: error.message 
      });
    }
  }

  // POST /oauth/revoke - Révoquer un token
  async revoke(req, res) {
    try {
      const { refresh_token } = req.body;

      await oauthAuthService.revokeToken(refresh_token);
      res.json({ 
        success: true,
        message: 'Token révoqué avec succès' 
      });
    } catch (error) {
      res.status(400).json({ 
        error: 'oauth_revoke_failed',
        message: error.message 
      });
    }
  }

  // GET /oauth/me - Informations de l'utilisateur connecté
  async me(req, res) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ error: 'Token manquant' });
      }

      const token = authHeader.split(' ')[1];
      const user = await oauthAuthService.getUserFromToken(token);

      if (!user) {
        return res.status(401).json({ error: 'Utilisateur non trouvé' });
      }

      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // ========== GESTION DES CLIENTS OAUTH (ADMIN) ==========
  
  // POST /oauth/clients - Créer un client OAuth
  async createClient(req, res) {
    try {
      const client = await oauthAuthService.createOAuthClient({
        name: req.body.name,
        grants: req.body.grants,
        redirectUris: req.body.redirectUris,
        scope: req.body.scope
      });

      res.status(201).json({
        clientId: client.clientId,
        clientSecret: client.clientSecret,
        name: client.name,
        grants: client.grants,
        redirectUris: client.redirectUris,
        scope: client.scope
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // GET /oauth/clients - Liste des clients
  async getClients(req, res) {
    try {
      const clients = await oauthAuthService.getOAuthClients();
      res.json(clients);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // DELETE /oauth/clients/:clientId - Supprimer un client
  async deleteClient(req, res) {
    try {
      const { clientId } = req.params;
      await oauthAuthService.deleteOAuthClient(clientId);
      res.json({ message: 'Client supprimé avec succès' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new OAuthController();