const express = require("express")
const router = express.Router()
const paiementController = require("../controllers/paiementController")
const { protect } = require("../middleware/authMiddleware")

// Routes publiques (pour le débogage)
router.get("/test", (req, res) => {
  res.status(200).json({ message: "Route de test des paiements fonctionnelle" })
})

// Routes protégées
router.get("/", protect, paiementController.getAllPaiements)
router.get("/stats", protect, paiementController.getStatsPaiements)
router.get("/:id", protect, paiementController.getPaiementById)
router.get("/reservation/:reservationId", protect, paiementController.getPaiementsByReservationId)
router.post("/", protect, paiementController.createPaiement)
router.put("/:id", protect, paiementController.updatePaiement)
router.delete("/:id", protect, paiementController.deletePaiement)

module.exports = router
