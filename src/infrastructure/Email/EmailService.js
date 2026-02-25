const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async sendVerificationEmail(email, userId) {
    const verificationLink = `${process.env.FRONTEND_URL}/verify/${userId}`;
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Vérification de votre compte universitaire',
      html: `
        <h1>Bienvenue sur la plateforme universitaire</h1>
        <p>Votre compte a été créé avec succès. Il sera validé par un administrateur.</p>
        <p>Vous recevrez un email de confirmation après validation.</p>
      `
    };

    // En développement, on peut logger au lieu d'envoyer vraiment
    console.log(`Email de vérification envoyé à ${email}`);
    // await this.transporter.sendMail(mailOptions);
  }

  async sendAccountValidatedEmail(email) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Votre compte a été validé',
      html: `
        <h1>Compte validé</h1>
        <p>Votre compte a été validé par l'administrateur.</p>
        <p>Vous pouvez maintenant vous connecter à la plateforme.</p>
      `
    };

    console.log(`Email de validation envoyé à ${email}`);
    // await this.transporter.sendMail(mailOptions);
  }
}

module.exports = EmailService;