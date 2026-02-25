class UserRepository {
  async findById(id) { throw new Error('Not implemented'); }
  async findByEmail(email) { throw new Error('Not implemented'); }
  async save(user) { throw new Error('Not implemented'); }
  async update(user) { throw new Error('Not implemented'); }
  async delete(id) { throw new Error('Not implemented'); }
  async findPendingRequests() { throw new Error('Not implemented'); }
}

module.exports = UserRepository;