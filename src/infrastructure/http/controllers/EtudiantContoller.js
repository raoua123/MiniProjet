// interfaces/http/controllers/EtudiantController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class EtudiantController {
  async getEmploiDuTemps(req, res) {
    try {
      // req.user vient du middleware OAuth
      const { semaine } = req.query;
      const userId = req.user.id;

      // Récupérer l'étudiant
      const etudiant = await prisma.etudiant.findUnique({
        where: { userId },
        include: { groupe: true }
      });

      if (!etudiant) {
        return res.status(404).json({ error: 'Étudiant non trouvé' });
      }

      // Définir la plage de dates
      const dateDebut = semaine ? new Date(semaine) : new Date();
      const dateFin = new Date(dateDebut);
      dateFin.setDate(dateFin.getDate() + 7);

      // Récupérer les séances
      const seances = await prisma.seance.findMany({
        where: {
          OR: [
            { groupeId: etudiant.groupeId },
            { groupeId: null }
          ],
          date: {
            gte: dateDebut,
            lte: dateFin
          }
        },
        include: {
          cours: {
            select: { titre: true, code: true, credits: true }
          },
          enseignant: {
            include: {
              user: {
                select: { nom: true, prenom: true }
              }
            }
          }
        },
        orderBy: [
          { date: 'asc' },
          { heureDebut: 'asc' }
        ]
      });

      res.json({
        semaine: dateDebut,
        etudiant: {
          nom: req.user.nom,
          prenom: req.user.prenom,
          groupe: etudiant.groupe?.nom
        },
        seances: seances.map(s => ({
          id: s.id,
          date: s.date,
          debut: s.heureDebut,
          fin: s.heureFin,
          salle: s.salle,
          type: s.type,
          cours: s.cours.titre,
          enseignant: s.enseignant ? 
            `${s.enseignant.user.prenom} ${s.enseignant.user.nom}` : 
            'Non assigné'
        }))
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}