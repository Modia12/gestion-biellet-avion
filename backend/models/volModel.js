const db = require("../config/db")

class Vol {
  static async getAll() {
    try {
      const result = await db.query("SELECT * FROM vols ORDER BY date_depart")
      return result.rows
    } catch (error) {
      throw error
    }
  }

  static async getById(id) {
    try {
      const result = await db.query("SELECT * FROM vols WHERE id_vol = $1", [id])
      return result.rows[0]
    } catch (error) {
      throw error
    }
  }

  static async create(volData) {
    const { numero_vol, origine, destination, date_depart, date_arrive, prix, places_disponibles } = volData
    try {
      const result = await db.query(
        "INSERT INTO vols (numero_vol, origine, destination, date_depart, date_arrive, prix, places_disponibles) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
        [numero_vol, origine, destination, date_depart, date_arrive, prix, places_disponibles],
      )
      return result.rows[0]
    } catch (error) {
      throw error
    }
  }

  static async update(id, volData) {
    const { numero_vol, origine, destination, date_depart, date_arrive, prix, places_disponibles } = volData
    try {
      const result = await db.query(
        "UPDATE vols SET numero_vol = $1, origine = $2, destination = $3, date_depart = $4, date_arrive = $5, prix = $6, places_disponibles = $7 WHERE id_vol = $8 RETURNING *",
        [numero_vol, origine, destination, date_depart, date_arrive, prix, places_disponibles, id],
      )
      return result.rows[0]
    } catch (error) {
      throw error
    }
  }

  static async delete(id) {
    try {
      await db.query("DELETE FROM vols WHERE id_vol = $1", [id])
      return { message: "Vol supprimé avec succès" }
    } catch (error) {
      throw error
    }
  }

  static async search(criteria) {
    const { origine, destination, date_depart } = criteria
    try {
      let query = "SELECT * FROM vols WHERE 1=1"
      const params = []
      let paramIndex = 1

      if (origine) {
        query += ` AND origine ILIKE $${paramIndex}`
        params.push(`%${origine}%`)
        paramIndex++
      }

      if (destination) {
        query += ` AND destination ILIKE $${paramIndex}`
        params.push(`%${destination}%`)
        paramIndex++
      }

      if (date_depart) {
        query += ` AND DATE(date_depart) = $${paramIndex}`
        params.push(date_depart)
        paramIndex++
      }

      query += " ORDER BY date_depart"

      const result = await db.query(query, params)
      return result.rows
    } catch (error) {
      throw error
    }
  }

  static async updatePlacesDisponibles(id_vol, places) {
    try {
      const result = await db.query(
        "UPDATE vols SET places_disponibles = places_disponibles - $1 WHERE id_vol = $2 AND places_disponibles >= $1 RETURNING *",
        [places, id_vol],
      )
      return result.rows[0]
    } catch (error) {
      throw error
    }
  }

  // Nouvelle méthode pour récupérer les vols avec des réservations
  static async getVolsWithReservations() {
    try {
      const query = `
        SELECT v.*, 
               COUNT(r.id_reservation) AS nombre_reservations,
               COUNT(DISTINCT p.id_passager) AS nombre_passagers
        FROM vols v
        JOIN reservations r ON v.id_vol = r.id_vol
        JOIN passagers p ON r.id_reservation = p.id_reservation
        GROUP BY v.id_vol
        ORDER BY v.date_depart
      `
      const result = await db.query(query)
      return result.rows
    } catch (error) {
      console.error("Erreur getVolsWithReservations:", error)
      throw error
    }
  }

  // Nouvelle méthode pour récupérer les passagers d'un vol spécifique
  static async getPassagersByVolId(volId) {
    try {
      const query = `
        SELECT p.*, r.place_reservee, r.id_reservation, u.nom AS nom_utilisateur, u.prenom AS prenom_utilisateur, u.email
        FROM passagers p
        JOIN reservations r ON p.id_reservation = r.id_reservation
        JOIN users u ON r.id_users = u.id_users
        WHERE r.id_vol = $1
        ORDER BY p.nom, p.prenom
      `
      const result = await db.query(query, [volId])
      return result.rows
    } catch (error) {
      console.error("Erreur getPassagersByVolId:", error)
      throw error
    }
  }
}

module.exports = Vol
