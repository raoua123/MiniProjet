const { PrismaClient } = require('@prisma/client');
const UserRepository = require('../../domain/user/UserRepository');
const User = require('../../domain/user/User');

const prisma = new PrismaClient();

class PrismaUserRepository extends UserRepository {
  async findById(id) {
    const userData = await prisma.user.findUnique({
      where: { id },
      include: {
        etudiant: { include: { filiere: true, groupe: true } },
        enseignant: true,
        admin: true
      }
    });
    return userData ? new User(userData) : null;
  }

  async findByEmail(email) {
    const userData = await prisma.user.findUnique({
      where: { email },
      include: {
        etudiant: { include: { filiere: true, groupe: true } },
        enseignant: true,
        admin: true
      }
    });
    return userData ? new User(userData) : null;
  }

  async save(user) {
    const { id, email, password, nom, prenom, role, status, ...props } = user;
    
    const userData = await prisma.user.create({
      data: {
        email,
        password,
        nom,
        prenom,
        role,
        status,
        // Création des entités associées selon le rôle
        ...(role === 'ETUDIANT' && {
          etudiant: {
            create: {
              matricule: props.matricule,
              niveau: props.niveau,
              filiere: { connect: { id: props.filiereId } }
            }
          }
        }),
        ...(role === 'ENSEIGNANT' && {
          enseignant: {
            create: {
              matricule: props.matricule,
              specialite: props.specialite,
              grade: props.grade
            }
          }
        }),
        ...(role === 'ADMIN' && {
          admin: {
            create: {}
          }
        })
      }
    });
    
    return new User(userData);
  }

  async update(user) {
    const { id, ...data } = user;
    const userData = await prisma.user.update({
      where: { id },
      data
    });
    return new User(userData);
  }

  async findPendingRequests() {
    const users = await prisma.user.findMany({
      where: { status: 'EN_ATTENTE' },
      include: {
        etudiant: { include: { filiere: true } },
        enseignant: true
      }
    });
    return users.map(u => new User(u));
  }
}

module.exports = PrismaUserRepository;