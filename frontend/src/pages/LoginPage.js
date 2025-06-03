"use client"

import { useState, useContext } from "react"
import { Container, Row, Col, Card, Form, Button, Alert } from "react-bootstrap"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { userService } from "../services/api"
import { AuthContext } from "../context/AuthContext"

const LoginPage = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const { login } = useContext(AuthContext)
  const navigate = useNavigate()
  const location = useLocation()

  // Récupérer l'URL de redirection si elle existe
  const from = location.state?.from || "/"

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await userService.login({ email, password })
      login(response.data.user, response.data.token, response.data.expiresIn)

      // Afficher un message différent selon le rôle
      if (response.data.user.role === "admin") {
        alert("Connexion réussie en tant qu'administrateur. Votre session expirera dans 7 jours.")
      }

      navigate(from)
    } catch (error) {
      console.error("Erreur de connexion:", error)
      setError(error.response?.data?.message || "Une erreur est survenue lors de la connexion. Veuillez réessayer.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container className="my-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card className="shadow">
            <Card.Body className="p-5">
              <h2 className="text-center mb-4">Connexion</h2>

              {error && <Alert variant="danger">{error}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="email">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Entrez votre email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-4" controlId="password">
                  <Form.Label>Mot de passe</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Entrez votre mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </Form.Group>

                <div className="d-grid">
                  <Button variant="primary" type="submit" disabled={loading}>
                    {loading ? "Connexion en cours..." : "Se connecter"}
                  </Button>
                </div>
              </Form>

              <div className="text-center mt-4">
                <p>
                  Vous n'avez pas de compte ? <Link to="/register">S'inscrire</Link>
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default LoginPage
