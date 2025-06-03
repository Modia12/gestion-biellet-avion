const Passager = require("../models/passagerModel")

exports.getAllPassagers = async (req, res) => {
  try {
    const passagers = await Passager.getAll()
    res.status(200).json(passagers)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.getPassagerById = async (req, res) => {
  try {
    const passager = await Passager.getById(req.params.id)
    if (!passager) {
      return res.status(404).json({ message: "Passager non trouvé" })
    }
    res.status(200).json(passager)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.getPassagersByReservationId = async (req, res) => {
  try {
    const passagers = await Passager.getByReservationId(req.params.reservationId)
    res.status(200).json(passagers)
  } catch (error) {
    console.error("Erreur lors de la récupération des passagers:", error)
    res.status(500).json({
      message: "Une erreur est survenue lors de la récupération des passagers",
      details: error.message,
    })
  }
}

exports.createPassager = async (req, res) => {
  try {
    const newPassager = await Passager.create(req.body)
    res.status(201).json(newPassager)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.updatePassager = async (req, res) => {
  try {
    const updatedPassager = await Passager.update(req.params.id, req.body)
    if (!updatedPassager) {
      return res.status(404).json({ message: "Passager non trouvé" })
    }
    res.status(200).json(updatedPassager)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.deletePassager = async (req, res) => {
  try {
    const result = await Passager.delete(req.params.id)
    res.status(200).json(result)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
exports.getReservedSeats = async (req, res) => {
  try {
    console.log(`Récupération des sièges réservés pour le vol ${req.params.volId}`)

    // Vérification directe dans la base de données pour éviter les erreurs du modèle
    try {
      // Vérifier si le vol existe
      const volCheck = await db.query("SELECT id_vol FROM vols WHERE id_vol = $1", [req.params.volId])
      if (volCheck.rows.length === 0) {
        return res.status(404).json({ message: "Vol non trouvé" })
      }

      // Récupérer directement les sièges réservés
      const result = await db.query(
        "SELECT place_reservee FROM reservations WHERE id_vol = $1 AND place_reservee IS NOT NULL",
        [req.params.volId],
      )

      // Convertir en tableau de nombres
      const reservedSeats = result.rows.map((row) => Number(row.place_reservee))
      console.log("Sièges réservés trouvés:", reservedSeats)

      return res.status(200).json(reservedSeats)
    } catch (dbError) {
      console.error("Erreur de base de données:", dbError)
      throw new Error(`Erreur de base de données: ${dbError.message}`)
    }
  } catch (error) {
    console.error("Erreur getReservedSeats:", error)
    res.status(500).json({
      message: "Erreur lors de la récupération des sièges réservés",
      details: error.message,
    })
  }
}