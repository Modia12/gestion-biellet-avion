const express = require("express")
const cors = require("cors")
const bodyParser = require("body-parser")
const userRoutes = require("./routes/userRoutes")
const volRoutes = require("./routes/volRoutes")
const reservationRoutes = require("./routes/reservationRoutes")
const passagerRoutes = require("./routes/passagerRoutes")
const paiementRoutes = require("./routes/paiementRoutes")

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Routes
app.use("/api/users", userRoutes)
app.use("/api/vols", volRoutes)
app.use("/api/reservations", reservationRoutes)
app.use("/api/passagers", passagerRoutes)
app.use("/api/paiements", paiementRoutes)

// Route de base
app.get("/", (req, res) => {
  res.send("API de Gestion de Réservation de Billets d'Avion")
})

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`)
})
