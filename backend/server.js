const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

// Import des routes
const userRoutes = require("./routes/userRoutes");
const volRoutes = require("./routes/volRoutes");
const reservationRoutes = require("./routes/reservationRoutes");
const passagerRoutes = require("./routes/passagerRoutes");
const paiementRoutes = require("./routes/paiementRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Autorise les requêtes cross-origin
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes principales
app.use("/api/users", userRoutes);
app.use("/api/vols", volRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/passagers", passagerRoutes);
app.use("/api/paiements", paiementRoutes);

// Route test pour vérifier que le serveur fonctionne
app.get("/api/endpoint", (req, res) => {
  res.json({ message: "Backend fonctionne !" });
});

// Route de base
app.get("/", (req, res) => {
  res.send("API de Gestion de Réservation de Billets d'Avion");
});

// Démarrage du serveur en écoutant sur toutes les interfaces pour Docker
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
