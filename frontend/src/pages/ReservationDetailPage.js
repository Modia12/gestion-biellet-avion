"use client"

import { useState, useEffect, useContext } from "react"
import { Container, Row, Col, Card, Alert, Spinner, Button, Badge, Table } from "react-bootstrap"
import { useParams, useNavigate, Link } from "react-router-dom"
import { reservationService, passagerService, paiementService } from "../services/api"
import { AuthContext } from "../context/AuthContext"
import { FaPlaneDeparture, FaPlaneArrival, FaUser, FaMoneyBillWave, FaTicketAlt } from "react-icons/fa"

const ReservationDetailPage = () => {
  const { id } = useParams()
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()

  const [reservation, setReservation] = useState(null)
  const [passagers, setPassagers] = useState([])
  const [paiements, setPaiements] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [passagersLoading, setPassagersLoading] = useState(true)
  const [passagersError, setPassagersError] = useState(null)
  const [paiementsLoading, setPaiementsLoading] = useState(true)
  const [paiementsError, setPaiementsError] = useState(null)

  useEffect(() => {
    // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
    if (!user) {
      navigate("/login", { state: { from: `/reservations/${id}` } })
      return
    }

    const fetchReservation = async () => {
      try {
        // Récupérer les détails de la réservation
        const reservationResponse = await reservationService.getReservationById(id)
        setReservation(reservationResponse.data)
      } catch (error) {
        console.error("Erreur lors de la récupération de la réservation:", error)
        setError("Une erreur est survenue lors de la récupération des détails de la réservation.")
      } finally {
        setLoading(false)
      }
    }

    fetchReservation()
  }, [id, user, navigate])

  useEffect(() => {
    if (!reservation) return

    const fetchPassagers = async () => {
      setPassagersLoading(true)
      try {
        // Récupérer les passagers associés à cette réservation
        const passagersResponse = await passagerService.getPassagersByReservation(id)
        setPassagers(passagersResponse.data)
        setPassagersError(null)
      } catch (error) {
        console.error("Erreur lors de la récupération des passagers:", error)
        setPassagersError("Une erreur est survenue lors de la récupération des passagers.")
      } finally {
        setPassagersLoading(false)
      }
    }

    const fetchPaiements = async () => {
      setPaiementsLoading(true)
      try {
        // Tester la connexion à l'API
        try {
          await paiementService.testConnection()
        } catch (testError) {
          console.error("Erreur lors du test de connexion à l'API:", testError)
          setPaiementsError("Impossible de se connecter à l'API de paiement.")
          setPaiementsLoading(false)
          return
        }

        // Récupérer les paiements associés à cette réservation
        console.log("Récupération des paiements pour la réservation:", id)
        const paiementsResponse = await paiementService.getPaiementsByReservation(id)
        console.log("Réponse des paiements:", paiementsResponse)
        setPaiements(paiementsResponse.data)
        setPaiementsError(null)
      } catch (error) {
        console.error("Erreur lors de la récupération des paiements:", error)
        setPaiementsError("Une erreur est survenue lors de la récupération des paiements.")
      } finally {
        setPaiementsLoading(false)
      }
    }

    fetchPassagers()
    fetchPaiements()
  }, [id, reservation])

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
        <p className="mt-2">Chargement des détails de la réservation...</p>
      </Container>
    )
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">{error}</Alert>
        <Button variant="primary" onClick={() => navigate("/reservations")}>
          Retour à mes réservations
        </Button>
      </Container>
    )
  }

  if (!reservation) {
    return (
      <Container className="mt-5">
        <Alert variant="warning">Réservation non trouvée.</Alert>
        <Button variant="primary" onClick={() => navigate("/reservations")}>
          Retour à mes réservations
        </Button>
      </Container>
    )
  }

  // Vérifier si un paiement a été effectué
  const hasPaiement = paiements && paiements.length > 0
  const isPaiementComplet =
    hasPaiement && paiements.some((p) => p.statut === "complete" && p.type_paiement === "complet")
  const isPaiementPartiel = hasPaiement && paiements.some((p) => p.type_paiement === "partiel")
  const isPaiementDepart = hasPaiement && paiements.some((p) => p.type_paiement === "depart")

  return (
    <Container className="my-5">
      <h1 className="mb-4">Détails de la réservation {}</h1>

      <Row>
        <Col lg={8}>
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-primary text-white">
              <h3 className="mb-0 d-flex align-items-center">
                <FaTicketAlt className="me-2" /> Informations du vol
              </h3>
            </Card.Header>
            <Card.Body>
              <div className="mb-4">
                <div className="d-flex align-items-center mb-3">
                  <FaPlaneDeparture className="me-3 text-primary fs-3" />
                  <div>
                    <h4 className="mb-0">{reservation.origine}</h4>
                    <p className="text-muted mb-0">{formatDate(reservation.date_depart)}</p>
                  </div>
                </div>
                <div className="d-flex align-items-center">
                  <FaPlaneArrival className="me-3 text-primary fs-3" />
                  <div>
                    <h4 className="mb-0">{reservation.destination}</h4>
                    <p className="text-muted mb-0">{formatDate(reservation.date_arrive)}</p>
                  </div>
                </div>
              </div>

              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <Badge bg="info" className="me-2">
                    Vol {reservation.numero_vol}
                  </Badge>
                  <Badge bg="secondary">Réservé le {formatDate(reservation.date_reservation)}</Badge>
                  {reservation.place_reservee && (
                    <Badge bg="primary" className="ms-2">
                      Siège {Math.ceil(reservation.place_reservee / 6)}
                      {String.fromCharCode(65 + ((reservation.place_reservee - 1) % 6))}
                    </Badge>
                  )}
                </div>
                <div className="fs-4 fw-bold text-success">{reservation.prix} €</div>
              </div>
            </Card.Body>
          </Card>

          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-primary text-white">
              <h3 className="mb-0 d-flex align-items-center">
                <FaUser className="me-2" /> Passagers
              </h3>
            </Card.Header>
            <Card.Body>
              {passagersLoading ? (
                <div className="text-center py-3">
                  <Spinner animation="border" size="sm" className="me-2" />
                  Chargement des passagers...
                </div>
              ) : passagersError ? (
                <Alert variant="danger">{passagersError}</Alert>
              ) : passagers && passagers.length > 0 ? (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Nom</th>
                      <th>Prénom</th>
                      <th>Numéro de passeport</th>
                      <th>Siège</th>
                    </tr>
                  </thead>
                  <tbody>
                    {passagers.map((passager) => (
                      <tr key={passager.id_passager}>
                        <td>{passager.nom}</td>
                        <td>{passager.prenom}</td>
                        <td>{passager.numero_passeport}</td>
                        <td>
                          {reservation.place_reservee && (
                            <Badge bg="primary">
                              {Math.ceil(reservation.place_reservee / 6)}
                              {String.fromCharCode(65 + ((reservation.place_reservee - 1) % 6))}
                            </Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <Alert variant="info">Aucun passager enregistré pour cette réservation.</Alert>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-primary text-white">
              <h3 className="mb-0 d-flex align-items-center">
                <FaMoneyBillWave className="me-2" /> Paiement
              </h3>
            </Card.Header>
            <Card.Body>
              {paiementsLoading ? (
                <div className="text-center py-3">
                  <Spinner animation="border" size="sm" className="me-2" />
                  Chargement des informations de paiement...
                </div>
              ) : paiementsError ? (
                <div>
                  <Alert variant="danger" className="mb-3">
                    {paiementsError}
                  </Alert>
                  <div className="d-grid gap-2">
                    <Button as={Link} to={`/paiement/${reservation.id_reservation}`} variant="success" size="lg">
                      Procéder au paiement
                    </Button>
                  </div>
                </div>
              ) : hasPaiement ? (
                <div>
                  {isPaiementComplet && (
                    <Alert variant="success">
                      <strong>Paiement complet effectué</strong>
                      <p className="mb-0">Montant: {paiements[0].montant} €</p>
                      <p className="mb-0">Date: {formatDate(paiements[0].date_paiement)}</p>
                    </Alert>
                  )}

                  {isPaiementPartiel && (
                    <Alert variant="warning">
                      <strong>Paiement partiel effectué</strong>
                      <p className="mb-0">Montant payé: {paiements[0].montant} €</p>
                      <p className="mb-0">Reste à payer: {paiements[0].montant_total - paiements[0].montant} €</p>
                      <p className="mb-0">Date: {formatDate(paiements[0].date_paiement)}</p>
                    </Alert>
                  )}

                  {isPaiementDepart && (
                    <Alert variant="info">
                      <strong>Paiement prévu au départ</strong>
                      <p className="mb-0">Montant à payer: {paiements[0].montant_total} €</p>
                      <p className="mb-0">
                        Veuillez vous présenter au comptoir d'enregistrement au moins 2 heures avant le départ.
                      </p>
                    </Alert>
                  )}
                </div>
              ) : (
                <div className="d-grid gap-2">
                  <Button as={Link} to={`/paiement/${reservation.id_reservation}`} variant="success" size="lg">
                    Procéder au paiement
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>

          <div className="d-grid gap-2">
            <Button variant="outline-secondary" onClick={() => navigate("/reservations")}>
              Retour à mes réservations
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  )
}

export default ReservationDetailPage
