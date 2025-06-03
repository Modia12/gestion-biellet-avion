"use client"

import { useState, useEffect } from "react"
import { Container, Row, Col, Card, Button } from "react-bootstrap"
import { Link } from "react-router-dom"
import { volService } from "../services/api"
import SearchForm from "../components/SearchForm"
import { useNavigate } from "react-router-dom"

const HomePage = () => {
  const [featuredVols, setFeaturedVols] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchFeaturedVols = async () => {
      try {
        const response = await volService.getAllVols()
        // Prendre les 3 premiers vols comme vols en vedette
        setFeaturedVols(response.data.slice(0, 3))
        setLoading(false)
      } catch (error) {
        console.error("Erreur lors de la récupération des vols en vedette:", error)
        setLoading(false)
      }
    }

    fetchFeaturedVols()
  }, [])

  const handleSearch = (searchCriteria) => {
    // Rediriger vers la page de recherche avec les critères
    const queryParams = new URLSearchParams(searchCriteria).toString()
    navigate(`/search?${queryParams}`)
  }

  // Formater la date
  const formatDate = (dateString) => {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }
    return new Date(dateString).toLocaleDateString("fr-FR", options)
  }

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-primary text-white py-5 mb-5">
        <Container>
          <Row className="align-items-center">
            <Col>
            <h2 className="text-center mb-4"><b>Bienvenue dans la gestion de reservation billet d'avion</b></h2>

              <h1 className="display-4 fw-bold">Réservez votre prochain voyage</h1>
              <p className="lead">
                Trouvez les meilleurs tarifs pour vos billets d'avion et voyagez en toute sérénité.
              </p>
              <Button as={Link} to="/search" variant="light" size="lg" className="mt-3">
                Commencer la recherche du vol en cours
              </Button>
            </Col>
            
          </Row>
        </Container>
      </div>

      <Container className="mb-5">
        <h2 className="text-center mb-4">Pourquoi nous choisir ?</h2>
        <Row>
          <Col md={4} className="mb-4">
            <Card className="h-100 text-center p-4 shadow-sm">
              <Card.Body>
                <div className="mb-3">
                  <i className="bi bi-cash-coin fs-1 text-primary"></i>
                </div>
                <Card.Title>Meilleurs prix</Card.Title>
                <Card.Text>Nous vous garantissons les meilleurs tarifs pour vos billets d'avion.</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} className="mb-4">
            <Card className="h-100 text-center p-4 shadow-sm">
              <Card.Body>
                <div className="mb-3">
                  <i className="bi bi-shield-check fs-1 text-primary"></i>
                </div>
                <Card.Title>Sécurité</Card.Title>
                <Card.Text>Vos paiements et vos données personnelles sont sécurisés.</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} className="mb-4">
            <Card className="h-100 text-center p-4 shadow-sm">
              <Card.Body>
                <div className="mb-3">
                  <i className="bi bi-headset fs-1 text-primary"></i>
                </div>
                <Card.Title>Support 24/7</Card.Title>
                <Card.Text>Notre équipe de support est disponible 24h/24 et 7j/7 pour vous aider.</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
      {/* Search Section Rechercher un vol*/}
      <Container className="mb-5">
        <Card className="border-0 shadow">
          <Card.Body>
            <SearchForm onSearch={handleSearch} />
          </Card.Body>
        </Card>
      </Container>

      {/* Featured Flights */}
      <Container className="mb-5">
        <h2 className="text-center mb-4">Vols en vedette</h2>
        <Row>
          {loading ? (
            <p className="text-center">Chargement des vols en vedette...</p>
          ) : featuredVols.length > 0 ? (
            featuredVols.map((vol) => (
              <Col md={4} key={vol.id_vol} className="mb-4">
                <Card className="h-100 shadow-sm">
                  <Card.Body>
                    <Card.Title>
                      {vol.origine} → {vol.destination}
                    </Card.Title>
                    <Card.Text>
                      <strong>Date de départ:</strong> {formatDate(vol.date_depart)}
                      <br />
                      <strong>Prix:</strong> {vol.prix} €
                    </Card.Text>
                  </Card.Body>
                  <Card.Footer className="bg-white">
                    <Button as={Link} to={`/vols/${vol.id_vol}`} variant="outline-primary" className="w-100">
                      Voir les détails
                    </Button>
                  </Card.Footer>
                </Card>
              </Col>
            ))
          ) : (
            <p className="text-center">Aucun vol en vedette disponible pour le moment.</p>
          )}
        </Row>
      </Container>

      
      {/* Why Choose Us */}
      
    </div>
  )
}

export default HomePage
