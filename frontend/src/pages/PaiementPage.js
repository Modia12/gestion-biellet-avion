"use client"

import { useState, useEffect, useContext } from "react"
import { Container, Row, Col, Card, Alert, Spinner, Button } from "react-bootstrap"
import { useParams, useNavigate } from "react-router-dom"
import { reservationService, passagerService, paiementService } from "../services/api"
import { AuthContext } from "../context/AuthContext"
import PaiementForm from "../components/PaiementForm"

const PaiementPage = () => {
  const { id } = useParams()
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()

  const [reservation, setReservation] = useState(null)
  const [passagers, setPassagers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [paiementSuccess, setPaiementSuccess] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Récupérer les détails de la réservation
        const reservationResponse = await reservationService.getReservationById(id)
        setReservation(reservationResponse.data)

        // Récupérer les passagers associés à cette réservation
        const passagersResponse = await passagerService.getPassagersByReservation(id)
        setPassagers(passagersResponse.data)

        // Sauvegarder l'ID de réservation actuel
        sessionStorage.setItem("currentReservationId", id)
      } catch (error) {
        console.error("Erreur lors de la récupération des données:", error)
        setError("Une erreur est survenue lors de la récupération des détails de la réservation.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  // Vérifier si l'utilisateur est autorisé à accéder à cette page
  useEffect(() => {
    if (reservation && user && reservation.id_users !== user.id_users) {
      setError("Vous n'êtes pas autorisé à accéder à cette page.")
    }
  }, [reservation, user])

  const handlePaiementSubmit = async (paiementData) => {
    try {
      console.log("Données de paiement à envoyer:", {
        id_reservation: reservation.id_reservation,
        montant: paiementData.montant,
        montant_total: paiementData.montant_total,
        mode_paiement: paiementData.mode_paiement,
        type_paiement: paiementData.type_paiement,
        statut: paiementData.type_paiement === "depart" ? "en_attente" : "complete",
      })

      const response = await paiementService.createPaiement({
        id_reservation: reservation.id_reservation,
        montant: paiementData.montant,
        montant_total: paiementData.montant_total,
        mode_paiement: paiementData.mode_paiement,
        type_paiement: paiementData.type_paiement,
        statut: paiementData.type_paiement === "depart" ? "en_attente" : "complete",
      })

      console.log("Réponse du serveur:", response)
      setPaiementSuccess(true)

      // Nettoyer les données temporaires
      sessionStorage.removeItem(`passagerForm_${reservation.id_vol}`)
      sessionStorage.removeItem(`passagerInfo_${reservation.id_vol}`)
      sessionStorage.removeItem(`passagerInfo_${id}`)
      sessionStorage.removeItem("currentReservationId")

      // Rediriger vers la page de confirmation
      setTimeout(() => {
        navigate(`/reservations/${id}/confirmation`)
      }, 2000)
    } catch (error) {
      console.error("Erreur lors du paiement:", error)
      setError(
        "Une erreur est survenue lors du paiement. Veuillez réessayer. Détails: " +
          (error.response?.data?.message || error.message),
      )
    }
  }

  const handleRetour = () => {
    // Conserver l'ID de réservation pour pouvoir y revenir
    const volId = reservation?.id_vol

    if (volId) {
      navigate(`/vols/${volId}`)
    } else {
      navigate(-1)
    }
  }

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Chargement...</span>
        </Spinner>
        <p className="mt-2">Chargement des détails de la réservation...</p>
      </Container>
    )
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">{error}</Alert>
        <Button variant="primary" onClick={() => navigate(-1)}>
          Retour
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

  if (paiementSuccess) {
    return (
      <Container className="mt-5">
        <Alert variant="success">
          Votre paiement a été traité avec succès ! Vous allez être redirigé vers la page de confirmation...
        </Alert>
      </Container>
    )
  }

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

  return (
    <Container className="my-5">
      <h1 className="mb-4">Paiement de votre réservation</h1>

      <Row>
        <Col md={6}>
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-primary text-white">
              <h3 className="mb-0">Récapitulatif de la réservation</h3>
            </Card.Header>
            <Card.Body>
              <p>
                <strong>Numéro de Vol:</strong> {reservation.numero_vol}
              </p>
              <p>
                <strong>depart à</strong> {reservation.origine}
              </p>
              <p>
                <strong>Arrivée à</strong> {reservation.destination}
              </p>
              <p>
                <strong>Date de départ:</strong> {formatDate(reservation.date_depart)}
              </p>
              <p>
                <strong>Date d'arrivée:</strong> {formatDate(reservation.date_arrive)}
              </p>
              <p>
                <strong>Prix:</strong> {reservation.prix} €
              </p>

              {/* Afficher les informations du passager */}
              {passagers.length > 0 && (
                <div className="mt-4">
                  <h5>Informations passager</h5>
                  <p>
                    <strong>Nom et prenoms:</strong> {passagers[0].nom} {passagers[0].prenom}
                  </p>
                  <p>
                    <strong>Passeport:</strong> {passagers[0].numero_passeport}
                  </p>
                  {reservation.place_reservee && (
                    <p>
                      <strong>Siège:</strong> {Math.ceil(reservation.place_reservee / 6)}
                      {String.fromCharCode(65 + ((reservation.place_reservee - 1) % 6))}
                    </p>
                  )}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="shadow-sm">
            <Card.Header className="bg-primary text-white">
              <h3 className="mb-0">Paiement</h3>
            </Card.Header>
            <Card.Body>
              <PaiementForm montant={reservation.prix} passagers={passagers} onSubmit={handlePaiementSubmit} />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <div className="mt-4">
        <Button variant="outline-secondary" onClick={handleRetour}>
          Retour
        </Button>
      </div>
    </Container>
  )
}

export default PaiementPage
