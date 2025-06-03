const User = require("../models/userModel")
const jwt = require("jsonwebtoken")

// Clé secrète pour JWT
const JWT_SECRET = "votre_cle_secrete_jwt"

// Générer un token JWT avec une durée d'expiration différente selon le rôle
const generateToken = (user) => {
  // Définir la durée d'expiration en fonction du rôle de l'utilisateur
  const expiresIn = user.role === "admin" ? "7d" : "24h"

  return jwt.sign(
    {
      id: user.id_users,
      email: user.email,
      role: user.role || "user", // Inclure le rôle dans le token
    },
    JWT_SECRET,
    { expiresIn },
  )
}

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.getAll()
    res.status(200).json(users)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.getUserById = async (req, res) => {
  try {
    const user = await User.getById(req.params.id)
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" })
    }
    res.status(200).json(user)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.createUser = async (req, res) => {
  try {
    // Vérifier si l'email existe déjà
    const existingUser = await User.findByEmail(req.body.email)
    if (existingUser) {
      return res.status(400).json({ message: "Cet email est déjà utilisé" })
    }

    const newUser = await User.create(req.body)
    const token = generateToken(newUser)

    res.status(201).json({
      user: newUser,
      token,
      expiresIn: newUser.role === "admin" ? "7 jours" : "",
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.updateUser = async (req, res) => {
  try {
    const updatedUser = await User.update(req.params.id, req.body)
    if (!updatedUser) {
      return res.status(404).json({ message: "Utilisateur non trouvé" })
    }
    res.status(200).json(updatedUser)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.deleteUser = async (req, res) => {
  try {
    const result = await User.delete(req.params.id)
    res.status(200).json(result)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.login = async (req, res) => {
  const { email, password } = req.body

  try {
    const user = await User.login(email, password)
    if (!user) {
      return res.status(401).json({ message: "Email ou mot de passe incorrect" })
    }

    const token = generateToken(user)

    res.status(200).json({
      user,
      token,
      expiresIn: user.role === "admin" ? "7 jours" : "24 heures",
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
