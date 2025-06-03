"use client"

import { createContext, useState, useEffect } from "react"

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté
    const storedUser = localStorage.getItem("user")
    const token = localStorage.getItem("token")
    const tokenExpiry = localStorage.getItem("tokenExpiry")

    if (storedUser && token) {
      // Vérifier si le token a expiré
      if (tokenExpiry && new Date() > new Date(tokenExpiry)) {
        // Token expiré, déconnecter l'utilisateur
        localStorage.removeItem("user")
        localStorage.removeItem("token")
        localStorage.removeItem("tokenExpiry")
        setUser(null)
      } else {
        setUser(JSON.parse(storedUser))
      }
    }

    setLoading(false)
  }, [])

  const login = (userData, token, expiresIn) => {
    // Calculer la date d'expiration du token
    const expiryDate = new Date()
    if (expiresIn === "7 jours") {
      expiryDate.setDate(expiryDate.getDate() + 7)
    } else {
      expiryDate.setHours(expiryDate.getHours() + 24)
    }

    localStorage.setItem("user", JSON.stringify(userData))
    localStorage.setItem("token", token)
    localStorage.setItem("tokenExpiry", expiryDate.toISOString())
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem("user")
    localStorage.removeItem("token")
    localStorage.removeItem("tokenExpiry")
    setUser(null)
  }

  const updateUser = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData))
    setUser(userData)
  }

  return <AuthContext.Provider value={{ user, login, logout, updateUser, loading }}>{children}</AuthContext.Provider>
}
