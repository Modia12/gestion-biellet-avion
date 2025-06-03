const express = require("express")
const router = express.Router()
const reservationController = require("../controllers/reservationController")
const { protect } = require("../middleware/authMiddleware")

// Routes protégées
router.get("/", protect, reservationController.getAllReservations)
router.get("/:id", protect, reservationController.getReservationById)
router.get("/user/:userId", protect, reservationController.getReservationsByUserId)
// Cette route doit être définie avant la route /:id pour éviter les conflits
router.get("/vol/:volId/reserved-seats", reservationController.getReservedSeats)
router.post("/", protect, reservationController.createReservation)
router.delete("/:id", protect, reservationController.deleteReservation)

module.exports = router
