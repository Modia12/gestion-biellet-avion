const Vol = require("../models/volModel")

exports.getAllVols = async (req, res) => {
  try {
    const vols = await Vol.getAll()
    res.status(200).json(vols)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.getVolById = async (req, res) => {
  try {
    const vol = await Vol.getById(req.params.id)
    if (!vol) {
      return res.status(404).json({ message: "Vol non trouvé" })
    }
    res.status(200).json(vol)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.createVol = async (req, res) => {
  try {
    const newVol = await Vol.create(req.body)
    res.status(201).json(newVol)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.updateVol = async (req, res) => {
  try {
    const updatedVol = await Vol.update(req.params.id, req.body)
    if (!updatedVol) {
      return res.status(404).json({ message: "Vol non trouvé" })
    }
    res.status(200).json(updatedVol)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.deleteVol = async (req, res) => {
  try {
    const result = await Vol.delete(req.params.id)
    res.status(200).json(result)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.searchVols = async (req, res) => {
  try {
    const vols = await Vol.search(req.query)
    res.status(200).json(vols)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Nouvelle fonction pour récupérer les vols avec des réservations
exports.getVolsWithReservations = async (req, res) => {
  try {
    const vols = await Vol.getVolsWithReservations()
    res.status(200).json(vols)
  } catch (error) {
    console.error("Erreur lors de la récupération des vols avec réservations:", error)
    res.status(500).json({ message: error.message })
  }
}

// Nouvelle fonction pour récupérer les passagers d'un vol spécifique
exports.getPassagersByVolId = async (req, res) => {
  try {
    const passagers = await Vol.getPassagersByVolId(req.params.id)
    res.status(200).json(passagers)
  } catch (error) {
    console.error("Erreur lors de la récupération des passagers du vol:", error)
    res.status(500).json({ message: error.message })
  }
}
