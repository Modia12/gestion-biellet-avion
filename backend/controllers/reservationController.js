const Reservation = require("../models/reservationModel")

exports.getAllReservations = async (req, res) => {
  try {
    const reservations = await Reservation.getAll()
    res.status(200).json(reservations)
  } catch (error) {
    console.error("Erreur getAllReservations:", error)
    res.status(500).json({ message: error.message })
  }
}

exports.getReservationById = async (req, res) => {
  try {
    const reservation = await Reservation.getById(req.params.id)
    if (!reservation) {
      return res.status(404).json({ message: "Réservation non trouvée" })
    }
    res.status(200).json(reservation)
  } catch (error) {
    console.error("Erreur getReservationById:", error)
    res.status(500).json({ message: error.message })
  }
}

exports.getReservationsByUserId = async (req, res) => {
  try {
    console.log("Récupération des réservations pour l'utilisateur:", req.params.userId)
    const reservations = await Reservation.getByUserId(req.params.userId)
    console.log("Réservations récupérées:", reservations.length)
    res.status(200).json(reservations)
  } catch (error) {
    console.error("Erreur getReservationsByUserId:", error)
    res.status(500).json({ message: error.message })
  }
}

exports.createReservation = async (req, res) => {
  try {
    const newReservation = await Reservation.create(req.body)
    res.status(201).json(newReservation)
  } catch (error) {
    console.error("Erreur createReservation:", error)
    res.status(500).json({ message: error.message })
  }
}

exports.deleteReservation = async (req, res) => {
  try {
    const result = await Reservation.delete(req.params.id)
    res.status(200).json(result)
  } catch (error) {
    console.error("Erreur deleteReservation:", error)
    res.status(500).json({ message: error.message })
  }
}

exports.getReservedSeats = async (req, res) => {
  try {
    console.log(`Récupération des sièges réservés pour le vol ${req.params.volId}`)
    const reservedSeats = await Reservation.getReservedSeats(req.params.volId)
    console.log(`Sièges réservés récupérés:`, reservedSeats)
    res.status(200).json(reservedSeats)
  } catch (error) {
    console.error("Erreur getReservedSeats:", error)
    res.status(500).json({
      message: "Erreur lors de la récupération des sièges réservés",
      details: error.message,
    })
  }
}
