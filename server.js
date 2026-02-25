// server.js
require('dotenv').config();
const app = require('./src/app');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

// Fonction pour démarrer le serveur
async function startServer() {
  try {
    // Tester la connexion à la base de données
    await prisma.$connect();
    console.log('✅ Connexion à la base de données établie');

    // Vérifier si un client OAuth par défaut existe, sinon le créer
    const defaultClient = await prisma.oAuthClient.findFirst({
      where: { name: 'Web Application' }
    });

    if (!defaultClient) {
      console.log('⚠️  Aucun client OAuth trouvé, création du client par défaut...');
      
      const crypto = require('crypto');
      const newClient = await prisma.oAuthClient.create({
        data: {
          clientId: crypto.randomBytes(16).toString('hex'),
          clientSecret: crypto.randomBytes(32).toString('hex'),
          name: 'Web Application',
          grants: ['password', 'refresh_token', 'authorization_code'],
          redirectUris: ['http://localhost:3000/callback'],
          scope: 'profile email'
        }
      });

      console.log('✅ Client OAuth par défaut créé:');
      console.log('📋 Client ID:', newClient.clientId);
      console.log('🔐 Client Secret:', newClient.clientSecret);
      console.log('📝 Ajoutez ces valeurs dans votre fichier .env\n');
    }

    // Démarrer le serveur
    const server = app.listen(PORT, () => {
      console.log(`
      🚀 Serveur démarré sur http://localhost:${PORT}
      📚 Documentation API: http://localhost:${PORT}/api-docs
      🔑 OAuth2 Endpoint: http://localhost:${PORT}/api/oauth
      📊 Prisma Studio: npx prisma studio
      `);
    });

    // Gestion de l'arrêt gracieux
    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);

    async function gracefulShutdown() {
      console.log('\n🛑 Arrêt du serveur...');
      server.close(async () => {
        await prisma.$disconnect();
        console.log('✅ Connexions fermées');
        process.exit(0);
      });
    }

  } catch (error) {
    console.error('❌ Erreur au démarrage:', error);
    process.exit(1);
  }
}

startServer();