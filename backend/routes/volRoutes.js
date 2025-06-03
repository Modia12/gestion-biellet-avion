const express = require("express")
const router = express.Router()
const volController = require("../controllers/volController")
const { protect, admin } = require("../middleware/authMiddleware")

// Routes publiques
router.get("/", volController.getAllVols)
router.get("/search", volController.searchVols)
router.get("/:id", volController.getVolById)

// Routes protégées (admin)
router.post("/", protect, volController.createVol)
router.put("/:id", protect, volController.updateVol)
router.delete("/:id", protect, volController.deleteVol)

// Nouvelles routes pour les réservations
router.get("/with-reservations/list", protect, volController.getVolsWithReservations)
router.get("/:id/passagers", protect, volController.getPassagersByVolId)

module.exports = router
