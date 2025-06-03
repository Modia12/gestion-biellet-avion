"use client"

import { useState, useEffect } from "react"
import { Container, Card, Alert, Spinner, Button, Row, Col, Badge } from "react-bootstrap"
import { useParams, useNavigate } from "react-router-dom"
import { reservationService, passagerService } from "../services/api"
import { FaPlaneDeparture, FaPlaneArrival, FaUser, FaTicketAlt, FaCheck } from "react-icons/fa"

const ConfirmationPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [reservation, setReservation] = useState(null)
  const [passagers, setPassagers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Récupérer les détails de la réservation
        const reservationResponse = await reservationService.getReservationById(id)
        setReservation(reservationResponse.data)

        // Récupérer les passagers
        const passagersResponse = await passagerService.getPassagersByReservation(id)
        setPassagers(passagersResponse.data)
      } catch (error) {
        console.error("Erreur lors de la récupération des données:", error)
        setError("Une erreur est survenue lors de la récupération des détails de la réservation.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  // Formater la date
  const formatDate = (dateString) => {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
    return new Date(dateString).toLocaleDateString("fr-FR", options)
  }

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Chargement...</span>
        </Spinner>
        <p className="mt-2">Chargement de la confirmation...</p>
      </Container>
    )
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">{error}</Alert>
        <Button variant="primary" onClick={() => navigate("/reservations")}>
          Mes réservations
        </Button>
      </Container>
    )
  }

  if (!reservation) {
    return (
      <Container className="mt-5">
        <Alert variant="warning">Réservation non trouvée.</Alert>
        <Button variant="primary" onClick={() => navigate("/reservations")}>
          Mes réservations
        </Button>
      </Container>
    )
  }

  return (
    <Container className="my-5">
      <div className="text-center mb-5">
        <div className="display-1 text-success mb-3">
          <FaCheck />
        </div>
        <h1 className="display-4">Réservation confirmée !</h1>
        <p className="lead">
          Votre réservation a été effectuée avec succès. Vous avez 2h avant de l'heures de depart pour la verification du passagers.
        </p>
      </div>

      <Card className="shadow mb-4">
        <Card.Header className="bg-primary text-white">
          <h2 className="mb-0">Détails de la réservation</h2>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <h4 className="d-flex align-items-center mb-3">
                <FaTicketAlt className="me-2 text-primary" /> Informations du vol
              </h4>
              <p>
                <strong>Numéro de réservation est:</strong> {reservation.id_reservation}
              </p>
              <p>
                <strong>Numero de Vol:</strong> {reservation.numero_vol}
              </p>
              <div className="mb-3">
                <div className="d-flex align-items-center mb-2">
                  <FaPlaneDeparture className="me-2 text-primary" />
                  <div>
                    <div className="fw-bold">{reservation.origine}</div>
                    <small>{formatDate(reservation.date_depart)}</small>
                  </div>
                </div>
                <div className="d-flex align-items-center">
                  <FaPlaneArrival className="me-2 text-primary" />
                  <div>
                    <div className="fw-bold">{reservation.destination}</div>
                    <small>{formatDate(reservation.date_arrive)}</small>
                  </div>
                </div>
              </div>
              <p>
                <strong>Prix:</strong> {reservation.prix} €
              </p>
            </Col>
            <Col md={6}>
              <h4 className="d-flex align-items-center mb-3">
                <FaUser className="me-2 text-primary" /> Passagers
              </h4>
              {passagers.map((passager) => (
                <div key={passager.id_passager} className="mb-3 p-3 border rounded">
                  <p className="mb-1">
                    <strong>Nom et prenoms:</strong> {passager.nom} {passager.prenom}
                  </p>
                  <p className="mb-1">
                    <strong>Numéro de Passeport:</strong> {passager.numero_passeport}
                  </p>
                  {reservation.place_reservee && (
                    <p className="mb-0">
                      <strong>Siège:</strong>{" "}
                      <Badge bg="primary">
                        {Math.ceil(reservation.place_reservee / 6)}
                        {String.fromCharCode(65 + ((reservation.place_reservee - 1) % 6))}
                      </Badge>
                    </p>
                  )}
                </div>
              ))}
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <div className="d-flex justify-content-between">
        <Button variant="outline-primary" onClick={() => navigate("/reservations")}>
          Mes réservations
        </Button>
        <Button variant="outline-secondary" onClick={() => window.print()}>
          Imprimer
        </Button>
      </div>
    </Container>
  )
}

export default ConfirmationPage
