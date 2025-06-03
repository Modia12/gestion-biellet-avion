"use client"

import { useState, useEffect, useContext } from "react"
import { Container, Row, Col, Card, Form, Button, Alert } from "react-bootstrap"
import { useNavigate } from "react-router-dom"
import { userService } from "../services/api"
import { AuthContext } from "../context/AuthContext"

const ProfilePage = () => {
  const { user, updateUser, logout } = useContext(AuthContext)
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
    if (!user) {
      navigate("/login", { state: { from: "/profile" } })
      return
    }

    // Pré-remplir le formulaire avec les données de l'utilisateur
    setFormData({
      nom: user.nom || "",
      prenom: user.prenom || "",
      email: user.email || "",
      telephone: user.telephone || "",
    })
  }, [user, navigate])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    try {
      const response = await userService.updateProfile(user.id_users, formData)
      updateUser(response.data)
      setSuccess("Votre profil a été mis à jour avec succès.")
    } catch (error) {
      console.error("Erreur de mise à jour du profil:", error)
      setError(
        error.response?.data?.message ||
          "Une erreur est survenue lors de la mise à jour du profil. Veuillez réessayer.",
      )
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  if (!user) {
    return null // L'effet useEffect redirigera l'utilisateur
  }

  return (
    <Container className="my-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="shadow">
            <Card.Body className="p-5">
              <h2 className="text-center mb-4">Mon Profil</h2>

              {error && <Alert variant="danger">{error}</Alert>}

              {success && <Alert variant="success">{success}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="nom">
                      <Form.Label>Nom</Form.Label>
                      <Form.Control
                        type="text"
                        name="nom"
                        placeholder="Entrez votre nom"
                        value={formData.nom}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="prenom">
                      <Form.Label>Prénom</Form.Label>
                      <Form.Control
                        type="text"
                        name="prenom"
                        placeholder="Entrez votre prénom"
                        value={formData.prenom}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3" controlId="email">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    placeholder="Entrez votre email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-4" controlId="telephone">
                  <Form.Label>Téléphone</Form.Label>
                  <Form.Control
                    type="tel"
                    name="telephone"
                    placeholder="Entrez votre numéro de téléphone"
                    value={formData.telephone}
                    onChange={handleChange}
                  />
                </Form.Group>

                <div className="d-grid">
                  <Button variant="primary" type="submit" disabled={loading}>
                    {loading ? "Mise à jour en cours..." : "Mettre à jour le profil"}
                  </Button>
                </div>
              </Form>

              <div className="text-center mt-4">
                <Button variant="outline-danger" onClick={handleLogout}>
                  Se déconnecter
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default ProfilePage
