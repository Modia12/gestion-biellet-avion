const Paiement = require("../models/paiementModel")

exports.getAllPaiements = async (req, res) => {
  try {
    const paiements = await Paiement.getAll()
    res.status(200).json(paiements)
  } catch (error) {
    console.error("Erreur getAllPaiements:", error)
    res.status(500).json({ message: error.message })
  }
}

exports.getPaiementById = async (req, res) => {
  try {
    const paiement = await Paiement.getById(req.params.id)
    if (!paiement) {
      return res.status(404).json({ message: "Paiement non trouvé" })
    }
    res.status(200).json(paiement)
  } catch (error) {
    console.error("Erreur getPaiementById:", error)
    res.status(500).json({ message: error.message })
  }
}

exports.getPaiementsByReservationId = async (req, res) => {
  try {
    console.log("Récupération des paiements pour la réservation:", req.params.reservationId)
    const paiements = await Paiement.getByReservationId(req.params.reservationId)
    console.log("Paiements trouvés:", paiements)
    res.status(200).json(paiements)
  } catch (error) {
    console.error("Erreur getPaiementsByReservationId:", error)
    res.status(500).json({ message: error.message })
  }
}

exports.createPaiement = async (req, res) => {
  try {
    console.log("Données reçues pour le paiement:", req.body)
    const newPaiement = await Paiement.create(req.body)
    res.status(201).json(newPaiement)
  } catch (error) {
    console.error("Erreur createPaiement:", error)
    res.status(500).json({ message: error.message })
  }
}

exports.updatePaiement = async (req, res) => {
  try {
    const updatedPaiement = await Paiement.update(req.params.id, req.body)
    if (!updatedPaiement) {
      return res.status(404).json({ message: "Paiement non trouvé" })
    }
    res.status(200).json(updatedPaiement)
  } catch (error) {
    console.error("Erreur updatePaiement:", error)
    res.status(500).json({ message: error.message })
  }
}

exports.deletePaiement = async (req, res) => {
  try {
    const result = await Paiement.delete(req.params.id)
    res.status(200).json(result)
  } catch (error) {
    console.error("Erreur deletePaiement:", error)
    res.status(500).json({ message: error.message })
  }
}

exports.getStatsPaiements = async (req, res) => {
  try {
    const stats = await Paiement.getStatsPaiements()
    res.status(200).json(stats)
  } catch (error) {
    console.error("Erreur getStatsPaiements:", error)
    res.status(500).json({ message: error.message })
  }
}
