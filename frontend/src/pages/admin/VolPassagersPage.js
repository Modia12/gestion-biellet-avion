"use client"

import { useState, useEffect, useContext, useCallback } from "react"
import { Container, Card, Table, Button, Alert, Spinner, Badge, Row, Col, Modal } from "react-bootstrap"
import { useParams, useNavigate } from "react-router-dom"
import { volService, reservationService } from "../../services/api"
import { AuthContext } from "../../context/AuthContext"
import { FaPlane, FaUser, FaEnvelope, FaPassport, FaChair, FaTrash  } from "react-icons/fa"
import { formatDate, formatSeatNumber } from "../../utils/formatters"

const VolPassagersPage = () => {
  const { id } = useParams()
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()

  const [vol, setVol] = useState(null)
  const [passagers, setPassagers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [reservationToCancel, setReservationToCancel] = useState(null)

  const fetchVolAndPassagers = useCallback(async () => {
    setLoading(true)
    try {
      // Récupérer les détails du vol
      const volResponse = await volService.getVolById(id)
      setVol(volResponse.data)

      // Récupérer les passagers du vol
      const passagersResponse = await volService.getPassagersByVolId(id)
      setPassagers(passagersResponse.data)

      setError(null)
    } catch (error) {
      console.error("Erreur lors de la récupération des données:", error)
      setError("Une erreur est survenue lors de la récupération des données du vol et des passagers.")
    } finally {
      setLoading(false)
    }
  }, [id])

  // Vérifier si l'utilisateur est connecté et est admin
  useEffect(() => {
    if (!user) {
      navigate("/login", { state: { from: `/admin/vols/${id}/passagers` } })
      return
    }

    fetchVolAndPassagers()
  }, [user, navigate, id, fetchVolAndPassagers])

  const handleAnnulerReservation = (idReservation) => {
    setReservationToCancel(idReservation)
    setShowConfirmModal(true)
  }

  const confirmCancelReservation = async () => {
    try {
      await reservationService.deleteReservation(reservationToCancel)
      setShowConfirmModal(false)
      // Rafraîchir les données après l'annulation
      fetchVolAndPassagers()
    } catch (err) {
      console.error("Erreur lors de l'annulation de la réservation:", err)
      setError("Échec de l'annulation de la réservation: " + (err.response?.data?.message || err.message))
      setShowConfirmModal(false)
    }
  }

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Chargement...</span>
        </Spinner>
        <p className="mt-2">Chargement des détails du vol et des passagers...</p>
      </Container>
    )
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">{error}</Alert>
        <Button variant="primary" onClick={() => navigate("/admin/vols-reservations")}>
          Retour à la liste des vols
        </Button>
      </Container>
    )
  }

  if (!vol) {
    return (
      <Container className="mt-5">
        <Alert variant="warning">Vol non trouvé.</Alert>
        <Button variant="primary" onClick={() => navigate("/admin/vols-reservations")}>
          Retour à la liste des vols
        </Button>
      </Container>
    )
  }

  return (
    <Container className="my-5">
      <h1 className="mb-4">Passagers du vol {vol.numero_vol}</h1>

      <Card className="mb-4 shadow-sm">
        <Card.Header className="bg-primary text-white">
          <h3 className="mb-0 d-flex align-items-center">
            <FaPlane className="me-2" /> Détails du vol
          </h3>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <p>
                <strong>Numéro de vol:</strong> {vol.numero_vol}
              </p>
              <p>
                <strong>Origine:</strong> {vol.origine}
              </p>
              <p>
                <strong>Destination:</strong> {vol.destination}
              </p>
            </Col>
            <Col md={6}>
              <p>
                <strong>Date de départ:</strong> {formatDate(vol.date_depart, true)}
              </p>
              <p>
                <strong>Date d'arrivée:</strong> {formatDate(vol.date_arrive, true)}
              </p>
              <p>
                <strong>Prix:</strong> {vol.prix} €
              </p>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="mb-4 shadow-sm">
        <Card.Header className="bg-primary text-white">
          <h3 className="mb-0 d-flex align-items-center">
            <FaUser className="me-2" /> Liste des passagers ({passagers.length})
          </h3>
        </Card.Header>
        <Card.Body>
          {passagers.length > 0 ? (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Prénom</th>
                  <th>Passeport</th>
                  <th>Siège</th>
                  <th>Réservé par</th>
                  <th>Email</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {passagers.map((passager) => (
                  <tr key={passager.id_passager}>
                    <td>{passager.nom}</td>
                    <td>{passager.prenom}</td>
                    <td>
                      <div className="d-flex align-items-center">
                        <FaPassport className="me-1 text-muted" />
                        {passager.numero_passeport}
                      </div>
                    </td>
                    <td>
                      {passager.place_reservee ? (
                        <Badge bg="primary" className="d-flex align-items-center" style={{ width: "fit-content" }}>
                          <FaChair className="me-1" /> {formatSeatNumber(passager.place_reservee)}
                        </Badge>
                      ) : (
                        <Badge bg="secondary">Non assigné</Badge>
                      )}
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <FaUser className="me-1 text-primary" />
                        {passager.prenom_utilisateur} {passager.nom_utilisateur}
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <FaEnvelope className="me-1 text-muted" />
                        {passager.email}
                      </div>
                    </td>
                    <td>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleAnnulerReservation(passager.id_reservation)}
                      >
                        <FaTrash className="me-1" /> Annuler
                      </Button>
                     
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <Alert variant="info">Aucun passager trouvé pour ce vol.</Alert>
          )}
        </Card.Body>
      </Card>

      <div className="d-flex justify-content-between">
        <Button variant="outline-secondary" onClick={() => navigate("/admin/vols-reservations")}>
          Retour à la liste des vols
        </Button>
        <Button variant="outline-primary" onClick={() => navigate(`/reservations`)}>
          Gérer votre reservations
        </Button>
      </div>

      {/* Modal de confirmation d'annulation */}
      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmer l'annulation</Modal.Title>
        </Modal.Header>
        <Modal.Body>Êtes-vous sûr de vouloir annuler cette réservation ? Cette action est irréversible.</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
            Annuler
          </Button>
          
            
          <Button variant="danger" onClick={confirmCancelReservation}>
            Confirmer l'annulation
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}

export default VolPassagersPage
