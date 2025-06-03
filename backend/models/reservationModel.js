const db = require("../config/db")

class Reservation {
  static async getAll() {
    try {
      const result = await db.query(`
        SELECT r.*, v.numero_vol, v.origine, v.destination, v.date_depart, v.date_arrive, v.prix
        FROM reservations r
        JOIN vols v ON r.id_vol = v.id_vol
        ORDER BY r.date_reservation DESC
      `)
      return result.rows
    } catch (error) {
      console.error("Erreur getAll:", error)
      throw error
    }
  }

  static async getById(id) {
    try {
      const result = await db.query(
        `
        SELECT r.*, v.numero_vol, v.origine, v.destination, v.date_depart, v.date_arrive, v.prix
        FROM reservations r
        JOIN vols v ON r.id_vol = v.id_vol
        WHERE r.id_reservation = $1
      `,
        [id],
      )
      return result.rows[0]
    } catch (error) {
      console.error("Erreur getById:", error)
      throw error
    }
  }

  // Ajout de la fonction manquante getByUserId
  static async getByUserId(userId) {
    try {
      console.log(`Récupération des réservations pour l'utilisateur ${userId}`)
      const result = await db.query(
        `
        SELECT r.*, v.numero_vol, v.origine, v.destination, v.date_depart, v.date_arrive, v.prix
        FROM reservations r
        JOIN vols v ON r.id_vol = v.id_vol
        WHERE r.id_users = $1
        ORDER BY r.date_reservation DESC
      `,
        [userId],
      )
      console.log(`Nombre de réservations trouvées: ${result.rows.length}`)
      return result.rows
    } catch (error) {
      console.error("Erreur getByUserId:", error)
      throw error
    }
  }

  static async create(reservationData) {
    const { id_users, id_vol, place_reservee } = reservationData
    try {
      const client = await db.pool.connect()
      try {
        await client.query("BEGIN")

        // Vérifier si la place est déjà réservée
        if (place_reservee) {
          const placeCheck = await client.query(
            "SELECT id_reservation FROM reservations WHERE id_vol = $1 AND place_reservee = $2",
            [id_vol, place_reservee],
          )

          if (placeCheck.rows.length > 0) {
            throw new Error("Cette place est déjà réservée. Veuillez en choisir une autre.")
          }
        }

        // Si place_reservee n'est pas fourni, générer un siège aléatoire non réservé
        let finalPlaceReservee = place_reservee

        if (!finalPlaceReservee) {
          // Récupérer les sièges déjà réservés
          const reservedSeatsResult = await client.query("SELECT place_reservee FROM reservations WHERE id_vol = $1", [
            id_vol,
          ])

          const reservedSeats = reservedSeatsResult.rows.map((row) => Number.parseInt(row.place_reservee))

          // Générer un siège aléatoire non réservé (entre 1 et 60)
          const totalSeats = 60
          const availableSeats = []

          for (let i = 1; i <= totalSeats; i++) {
            if (!reservedSeats.includes(i)) {
              availableSeats.push(i)
            }
          }

          if (availableSeats.length === 0) {
            throw new Error("Plus de places disponibles pour ce vol")
          }

          // Sélectionner un siège aléatoire parmi les disponibles
          finalPlaceReservee = availableSeats[Math.floor(Math.random() * availableSeats.length)]
        }

        // Créer la réservation avec le siège final
        const reservationResult = await client.query(
          `INSERT INTO reservations (id_users, id_vol, place_reservee, date_reservation) 
           VALUES ($1, $2, $3, CURRENT_TIMESTAMP) 
           RETURNING *`,
          [id_users, id_vol, finalPlaceReservee],
        )

        // Mettre à jour les places disponibles
        const volResult = await client.query(
          "UPDATE vols SET places_disponibles = places_disponibles - 1 WHERE id_vol = $1 AND places_disponibles > 0 RETURNING *",
          [id_vol],
        )

        if (volResult.rows.length === 0) {
          throw new Error("Plus de places disponibles pour ce vol")
        }

        // Récupérer les informations complètes de la réservation
        const completeReservation = await client.query(
          `
          SELECT r.*, v.numero_vol, v.origine, v.destination, v.date_depart, v.date_arrive, v.prix
          FROM reservations r
          JOIN vols v ON r.id_vol = v.id_vol
          WHERE r.id_reservation = $1
        `,
          [reservationResult.rows[0].id_reservation],
        )

        await client.query("COMMIT")
        return completeReservation.rows[0]
      } catch (e) {
        await client.query("ROLLBACK")
        throw e
      } finally {
        client.release()
      }
    } catch (error) {
      console.error("Erreur create:", error)
      throw error
    }
  }

  static async delete(id) {
    try {
      const client = await db.pool.connect()
      try {
        await client.query("BEGIN")

        // Récupérer l'ID du vol avant de supprimer la réservation
        const reservationResult = await client.query("SELECT id_vol FROM reservations WHERE id_reservation = $1", [id])

        if (reservationResult.rows.length === 0) {
          throw new Error("Réservation non trouvée")
        }

        const id_vol = reservationResult.rows[0].id_vol

        // Supprimer la réservation
        await client.query("DELETE FROM reservations WHERE id_reservation = $1", [id])

        // Mettre à jour les places disponibles
        await client.query("UPDATE vols SET places_disponibles = places_disponibles + 1 WHERE id_vol = $1", [id_vol])

        await client.query("COMMIT")
        return { message: "Réservation supprimée avec succès" }
      } catch (e) {
        await client.query("ROLLBACK")
        throw e
      } finally {
        client.release()
      }
    } catch (error) {
      console.error("Erreur delete:", error)
      throw error
    }
  }

  static async getReservedSeats(volId) {
    try {
      console.log(`Récupération des sièges réservés pour le vol ${volId}`)

      // Récupérer les sièges réservés
      const result = await db.query(
        `
        SELECT place_reservee 
        FROM reservations 
        WHERE id_vol = $1 
        AND place_reservee IS NOT NULL
      `,
        [volId],
      )

      console.log(`Sièges réservés trouvés:`, result.rows)

      // Convertir les résultats en tableau de nombres
      const reservedSeats = result.rows.map((row) => Number.parseInt(row.place_reservee))

      console.log(`Sièges réservés convertis:`, reservedSeats)
      return reservedSeats
    } catch (error) {
      console.error("Erreur getReservedSeats:", error)
      throw error
    }
  }
}

module.exports = Reservation
