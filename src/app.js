// app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const session = require('express-session');

// Import des routes
// Import des routes
const oauthRoutes = require('./infrastructure/http/routes/oauthRoute');
const etudiantRoutes = require('./infrastructure/http/routes/EtudiantRoute');
const adminRoutes = require('./infrastructure/http/routes/adminRoutes');
// Import des middlewares
const { errorHandler } = require('./infrastructure/http/middlewares/errorHandler');
const app = express();

// ========== MIDDLEWARES DE SÉCURITÉ ==========

// Helmet pour les headers de sécurité
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session pour OAuth (nécessaire pour le flow authorization_code)
app.use(session({
  secret: process.env.SESSION_SECRET || 'votre_secret_session',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 1000 * 60 * 60 // 1 heure
  }
}));

// Logging
app.use(morgan('combined'));

// Rate limiting global
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limite chaque IP à 100 requêtes
  message: 'Trop de requêtes, veuillez réessayer plus tard',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', globalLimiter);

// Rate limiting spécifique pour l'auth (plus strict)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 tentatives max
  skipSuccessfulRequests: true, // ne compte pas les requêtes réussies
  message: 'Trop de tentatives de connexion, veuillez réessayer dans 15 minutes'
});
app.use('/api/auth/login', authLimiter);
app.use('/api/oauth/login', authLimiter);

// ========== ROUTES PUBLIQUES ==========

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// Route racine
app.get('/', (req, res) => {
  res.json({
    name: 'API Plateforme Universitaire',
    version: '1.0.0',
    description: 'Backend pour la gestion universitaire avec OAuth2',
    endpoints: {
      auth: '/api/auth',
      oauth: '/api/oauth',
      etudiant: '/api/etudiant',
      enseignant: '/api/enseignant',
      admin: '/api/admin',
      health: '/health'
    },
    documentation: '/api-docs'
  });
});

// ========== ROUTES API ==========

// Routes d'authentification
app.use('/api/auth', authRoutes);

// Routes OAuth2
app.use('/api/oauth', oauthRoutes);

// Routes protégées par rôle
app.use('/api/etudiant', etudiantRoutes);
//app.use('/api/enseignant', enseignantRoutes);
app.use('/api/admin', adminRoutes);

// ========== GESTION DES FICHIERS STATIQUES ==========

// Servir les fichiers uploadés
app.use('/uploads', express.static('public/uploads'));

// ========== MIDDLEWARES DE GESTION D'ERREURS ==========

// Route 404
app.use((req, res) => {
  res.status(404).json({
    error: 'not_found',
    message: `Route ${req.method} ${req.url} non trouvée`
  });
});

// Gestionnaire d'erreurs global
app.use(errorHandler);

module.exports = app;