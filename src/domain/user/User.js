class User {
  constructor({ id, email, password, nom, prenom, role, status, ...props }) {
    this.id = id;
    this.email = email;
    this.password = password;
    this.nom = nom;
    this.prenom = prenom;
    this.role = role;
    this.status = status;
    this.props = props;
  }

  // Règles métier
  canLogin() {
    return this.status === 'VALIDE';
  }

  isEnseignant() {
    return this.role === 'ENSEIGNANT';
  }

  isEtudiant() {
    return this.role === 'ETUDIANT';
  }

  isAdmin() {
    return this.role === 'ADMIN';
  }

  validate() {
    if (this.status === 'EN_ATTENTE') {
      this.status = 'VALIDE';
    }
  }

  reject() {
    this.status = 'REFUSE';
  }
}

module.exports = User;