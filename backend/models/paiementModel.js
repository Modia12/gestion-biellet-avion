const db = require("../config/db")

class Paiement {
  static async getAll() {
    try {
      const result = await db.query(`
        SELECT p.*, r.id_users, r.id_vol
        FROM paiements p
        JOIN reservations r ON p.id_reservation = r.id_reservation
        ORDER BY p.date_paiement DESC
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
        SELECT p.*, r.id_users, r.id_vol
        FROM paiements p
        JOIN reservations r ON p.id_reservation = r.id_reservation
        WHERE p.id_paiement = $1
      `,
        [id],
      )
      return result.rows[0]
    } catch (error) {
      console.error("Erreur getById:", error)
      throw error
    }
  }

  static async getByReservationId(reservationId) {
    try {
      console.log(`Exécution de la requête SQL pour récupérer les paiements de la réservation ${reservationId}`)

      // Vérifier si la table existe
      try {
        const tableCheck = await db.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'paiements'
          );
        `)

        if (!tableCheck.rows[0].exists) {
          console.log("La table paiements n'existe pas")
          return []
        }
      } catch (error) {
        console.error("Erreur lors de la vérification de l'existence de la table:", error)
        return []
      }

      const result = await db.query("SELECT * FROM paiements WHERE id_reservation = $1", [reservationId])
      console.log(`Résultat de la requête:`, result.rows)
      return result.rows
    } catch (error) {
      console.error("Erreur getByReservationId:", error)
      throw error
    }
  }

  static async create(paiementData) {
    const { id_reservation, montant, montant_total, mode_paiement, type_paiement, statut } = paiementData
    try {
      console.log("Création du paiement avec les données:", paiementData)

      // Vérifier si la table existe
      try {
        const tableCheck = await db.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'paiements'
          );
        `)

        if (!tableCheck.rows[0].exists) {
          console.log("La table paiements n'existe pas, création de la table")
          await db.query(`
            CREATE TABLE paiements (
              id_paiement SERIAL PRIMARY KEY,
              id_reservation INTEGER NOT NULL REFERENCES reservations(id_reservation) ON DELETE CASCADE,
              montant DECIMAL(10, 2) NOT NULL,
              montant_total DECIMAL(10, 2),
              date_paiement TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              mode_paiement VARCHAR(50) NOT NULL,
              type_paiement VARCHAR(20) DEFAULT 'complet',
              statut VARCHAR(20) DEFAULT 'complete'
            );
          `)
        }
      } catch (error) {
        console.error("Erreur lors de la vérification/création de la table:", error)
        throw new Error("Impossible de créer la table paiements: " + error.message)
      }

      // Vérifier si les colonnes nécessaires existent
      try {
        await db.query("SELECT montant_total, type_paiement, statut FROM paiements LIMIT 1")
      } catch (error) {
        console.error("Les colonnes requises n'existent pas, création des colonnes:", error)
        // Ajouter les colonnes si elles n'existent pas
        await db.query(`
          ALTER TABLE paiements 
          ADD COLUMN IF NOT EXISTS montant_total DECIMAL(10, 2),
          ADD COLUMN IF NOT EXISTS type_paiement VARCHAR(20) DEFAULT 'complet',
          ADD COLUMN IF NOT EXISTS statut VARCHAR(20) DEFAULT 'complete'
        `)
      }

      const result = await db.query(
        `INSERT INTO paiements 
         (id_reservation, montant, montant_total, mode_paiement, type_paiement, statut) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         RETURNING *`,
        [
          id_reservation,
          montant,
          montant_total || montant,
          mode_paiement,
          type_paiement || "complet",
          statut || "complete",
        ],
      )
      return result.rows[0]
    } catch (error) {
      console.error("Erreur create:", error)
      throw error
    }
  }

  static async update(id, paiementData) {
    const { montant, montant_total, mode_paiement, type_paiement, statut } = paiementData
    try {
      const result = await db.query(
        `UPDATE paiements 
         SET montant = $1, 
             montant_total = $2, 
             mode_paiement = $3, 
             type_paiement = $4, 
             statut = $5 
         WHERE id_paiement = $6 
         RETURNING *`,
        [montant, montant_total || montant, mode_paiement, type_paiement || "complet", statut || "complete", id],
      )
      return result.rows[0]
    } catch (error) {
      console.error("Erreur update:", error)
      throw error
    }
  }

  static async delete(id) {
    try {
      await db.query("DELETE FROM paiements WHERE id_paiement = $1", [id])
      return { message: "Paiement supprimé avec succès" }
    } catch (error) {
      console.error("Erreur delete:", error)
      throw error
    }
  }

  static async getStatsPaiements() {
    try {
      // Vérifier si la table existe
      try {
        const tableCheck = await db.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'paiements'
          );
        `)

        if (!tableCheck.rows[0].exists) {
          console.log("La table paiements n'existe pas pour les stats")
          return {
            total_paiements: 0,
            montant_total: 0,
            paiements_complets: 0,
            paiements_partiels: 0,
            paiements_depart: 0,
            paiements_completes: 0,
            paiements_en_attente: 0,
          }
        }
      } catch (error) {
        console.error("Erreur lors de la vérification de l'existence de la table pour les stats:", error)
        return {
          total_paiements: 0,
          montant_total: 0,
          paiements_complets: 0,
          paiements_partiels: 0,
          paiements_depart: 0,
          paiements_completes: 0,
          paiements_en_attente: 0,
        }
      }

      // Vérifier si les colonnes existent
      try {
        await db.query("SELECT type_paiement, statut FROM paiements LIMIT 1")
      } catch (error) {
        console.error("Les colonnes requises n'existent pas pour les stats:", error)
        return {
          total_paiements: 0,
          montant_total: 0,
          paiements_complets: 0,
          paiements_partiels: 0,
          paiements_depart: 0,
          paiements_completes: 0,
          paiements_en_attente: 0,
        }
      }

      const result = await db.query(`
        SELECT 
          COUNT(*) as total_paiements,
          COALESCE(SUM(montant), 0) as montant_total,
          COUNT(CASE WHEN type_paiement = 'complet' THEN 1 END) as paiements_complets,
          COUNT(CASE WHEN type_paiement = 'partiel' THEN 1 END) as paiements_partiels,
          COUNT(CASE WHEN type_paiement = 'depart' THEN 1 END) as paiements_depart,
          COUNT(CASE WHEN statut = 'complete' THEN 1 END) as paiements_completes,
          COUNT(CASE WHEN statut = 'en_attente' THEN 1 END) as paiements_en_attente
        FROM paiements
      `)
      return result.rows[0]
    } catch (error) {
      console.error("Erreur getStatsPaiements:", error)
      throw error
    }
  }
}

module.exports = Paiement
