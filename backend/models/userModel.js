const db = require("../config/db")
const bcrypt = require("bcrypt")

class User {
  static async getAll() {
    try {
      const result = await db.query("SELECT id_users, nom, prenom, email, telephone, role FROM users")
      return result.rows
    } catch (error) {
      throw error
    }
  }

  static async getById(id) {
    try {
      const result = await db.query(
        "SELECT id_users, nom, prenom, email, telephone, role FROM users WHERE id_users = $1",
        [id],
      )
      return result.rows[0]
    } catch (error) {
      throw error
    }
  }

  static async create(userData) {
    const { nom, prenom, email, password, telephone, role } = userData
    try {
      // Hachage du mot de passe
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(password, salt)

      const result = await db.query(
        "INSERT INTO users (nom, prenom, email, password, telephone, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id_users, nom, prenom, email, telephone, role",
        [nom, prenom, email, hashedPassword, telephone, role || "user"],
      )
      return result.rows[0]
    } catch (error) {
      throw error
    }
  }

  static async update(id, userData) {
    const { nom, prenom, email, telephone, role } = userData
    try {
      const result = await db.query(
        "UPDATE users SET nom = $1, prenom = $2, email = $3, telephone = $4, role = $5 WHERE id_users = $6 RETURNING id_users, nom, prenom, email, telephone, role",
        [nom, prenom, email, telephone, role, id],
      )
      return result.rows[0]
    } catch (error) {
      throw error
    }
  }

  static async delete(id) {
    try {
      await db.query("DELETE FROM users WHERE id_users = $1", [id])
      return { message: "Utilisateur supprimé avec succès" }
    } catch (error) {
      throw error
    }
  }

  static async findByEmail(email) {
    try {
      const result = await db.query("SELECT * FROM users WHERE email = $1", [email])
      return result.rows[0]
    } catch (error) {
      throw error
    }
  }

  static async login(email, password) {
    try {
      const user = await this.findByEmail(email)
      if (!user) {
        return null
      }

      const isMatch = await bcrypt.compare(password, user.password)
      if (!isMatch) {
        return null
      }

      return {
        id_users: user.id_users,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        telephone: user.telephone,
        role: user.role || "user",
      }
    } catch (error) {
      throw error
    }
  }
}

module.exports = User
