// test.js ← Créez ce fichier
const prisma = require('./prisma.js');

async function test() {
  try {
    await prisma.$connect();
    console.log('✅ Connecté PostgreSQL!');
    
    const count = await prisma.utilisateur.count();
    console.log(`📊 ${count} utilisateurs`);
    
    const users = await prisma.utilisateur.findMany({
      take: 2,
      select: { id: true, nom: true, email: true }
    });
    console.log('👥 Utilisateurs:', users);
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

test();
