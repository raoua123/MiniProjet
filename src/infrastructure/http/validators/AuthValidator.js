// interfaces/http/validators/authValidator.js
const { z } = require('zod');

const registerSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Mot de passe trop court'),
  nom: z.string().min(2, 'Nom trop court'),
  prenom: z.string().min(2, 'Prénom trop court'),
  telephone: z.string().optional(),
  adresse: z.string().optional(),
  dateNaissance: z.string().optional(),
  sexe: z.enum(['HOMME', 'FEMME']).optional(),
  role: z.enum(['ETUDIANT', 'ENSEIGNANT']),
  // Champs spécifiques étudiants
  matricule: z.string().optional(),
  niveau: z.string().optional(),
  filiereId: z.string().optional(),
  // Champs spécifiques enseignants
  specialite: z.string().optional(),
  grade: z.string().optional()
}).refine((data) => {
  if (data.role === 'ETUDIANT') {
    return data.matricule && data.niveau && data.filiereId;
  }
  if (data.role === 'ENSEIGNANT') {
    return data.matricule && data.specialite && data.grade;
  }
  return true;
}, {
  message: "Champs spécifiques au rôle manquants"
});

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis')
});

module.exports = { registerSchema, loginSchema };