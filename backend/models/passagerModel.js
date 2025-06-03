const db = require("../config/db")

class Passager {
  static async getAll() {
    try {
      const result = await db.query("SELECT * FROM passagers")
      return result.rows
    } catch (error) {
      throw error
    }
  }

  static async getById(id) {
    try {
      const result = await db.query("SELECT * FROM passagers WHERE id_passager = $1", [id])
      return result.rows[0]
    } catch (error) {
      throw error
    }
  }

  static async getByReservationId(reservationId) {
    try {
      // Joindre avec la table reservations pour obtenir la place_reservee
      const result = await db.query(
        `
        SELECT p.*, r.place_reservee 
        FROM passagers p
        JOIN reservations r ON p.id_reservation = r.id_reservation
        WHERE p.id_reservation = $1
      `,
        [reservationId],
      )
      return result.rows
    } catch (error) {
      throw error
    }
  }

  static async create(passagerData) {
    const { id_reservation, nom, prenom, numero_passeport } = passagerData
    try {
      const result = await db.query(
        "INSERT INTO passagers (id_reservation, nom, prenom, numero_passeport) VALUES ($1, $2, $3, $4) RETURNING *",
        [id_reservation, nom, prenom, numero_passeport],
      )
      return result.rows[0]
    } catch (error) {
      throw error
    }
  }

  static async update(id, passagerData) {
    const { nom, prenom, numero_passeport } = passagerData
    try {
      const result = await db.query(
        "UPDATE passagers SET nom = $1, prenom = $2, numero_passeport = $3 WHERE id_passager = $4 RETURNING *",
        [nom, prenom, numero_passeport, id],
      )
      return result.rows[0]
    } catch (error) {
      throw error
    }
  }

  static async delete(id) {
    try {
      await db.query("DELETE FROM passagers WHERE id_passager = $1", [id])
      return { message: "Passager supprimé avec succès" }
    } catch (error) {
      throw error
    }
  }
}

module.exports = Passager
