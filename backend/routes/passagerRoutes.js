const express = require("express")
const router = express.Router()
const passagerController = require("../controllers/passagerController")
const { protect } = require("../middleware/authMiddleware")

// Routes protégées
router.get("/", protect, passagerController.getAllPassagers)
router.get("/:id", protect, passagerController.getPassagerById)
router.get("/reservation/:reservationId", protect, passagerController.getPassagersByReservationId)
router.post("/", protect, passagerController.createPassager)
router.put("/:id", protect, passagerController.updatePassager)
router.delete("/:id", protect, passagerController.deletePassager)

module.exports = router
