const jwt = require("jsonwebtoken")
const User = require("../models/userModel")

// Clé secrète pour JWT
const JWT_SECRET = "votre_cle_secrete_jwt"

exports.protect = async (req, res, next) => {
  let token

  // Vérifier si le token est présent dans les headers
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1]
  }

  // Vérifier si le token existe
  if (!token) {
    return res.status(401).json({ message: "Accès non autorisé, token manquant" })
  }

  try {
    // Vérifier le token
    const decoded = jwt.verify(token, JWT_SECRET)

    // Récupérer l'utilisateur
    const user = await User.getById(decoded.id)
    if (!user) {
      return res.status(401).json({ message: "Utilisateur non trouvé" })
    }

    // Ajouter l'utilisateur à la requête
    req.user = user
    next()
  } catch (error) {
    return res.status(401).json({ message: "Token invalide ou expiré" })
  }
}

exports.admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next()
  } else {
    res.status(403).json({ message: "Accès non autorisé, privilèges administrateur requis" })
  }
}
