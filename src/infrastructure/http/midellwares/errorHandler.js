// interfaces/http/middlewares/errorHandler.js
const { Prisma } = require('@prisma/client');

const errorHandler = (err, req, res, next) => {
  console.error('❌ Erreur:', err);

  // Erreurs Prisma
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002':
        return res.status(409).json({
          error: 'duplicate_entry',
          message: 'Une entrée avec ces données existe déjà',
          field: err.meta?.target
        });
      case 'P2025':
        return res.status(404).json({
          error: 'not_found',
          message: 'Enregistrement non trouvé'
        });
      default:
        return res.status(400).json({
          error: 'database_error',
          message: 'Erreur base de données',
          code: err.code
        });
    }
  }

  // Erreurs de validation
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'validation_error',
      message: err.message,
      details: err.details
    });
  }

  // Erreurs JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'invalid_token',
      message: 'Token invalide'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'token_expired',
      message: 'Token expiré'
    });
  }

  // Erreurs OAuth2
  if (err.name === 'OAuth2Error') {
    return res.status(400).json({
      error: err.name,
      message: err.message
    });
  }

  // Erreur par défaut
  const status = err.status || 500;
  const message = err.message || 'Erreur interne du serveur';

  res.status(status).json({
    error: err.code || 'internal_error',
    message: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = { errorHandler };