"use client"

import { useState, useEffect, useContext } from "react"
import { Container, Alert, Spinner, Button, Modal } from "react-bootstrap"
import { useNavigate } from "react-router-dom"
import { reservationService, passagerService } from "../services/api"
import { AuthContext } from "../context/AuthContext"
import ReservationCard from "../components/ReservationCard"

const ReservationsPage = () => {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()

  const [reservations, setReservations] = useState([])
  const [passagersMap, setPassagersMap] = useState({}) // Stocke les passagers par ID de réservation
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [reservationToCancel, setReservationToCancel] = useState(null)

  useEffect(() => {
    // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
    if (!user) {
      navigate("/login", { state: { from: "/reservations" } })
      return
    }

    const fetchReservations = async () => {
      try {
        console.log("Récupération des réservations pour l'utilisateur:", user.id_users)
        const response = await reservationService.getUserReservations(user.id_users)
        console.log("Réponse du serveur:", response)
        setReservations(response.data)

        // Récupérer les passagers pour chaque réservation
        const passagersData = {}
        for (const reservation of response.data) {
          try {
            const passagersResponse = await passagerService.getPassagersByReservation(reservation.id_reservation)
            passagersData[reservation.id_reservation] = passagersResponse.data
          } catch (passagerError) {
            console.error(
              `Erreur lors de la récupération des passagers pour la réservation ${reservation.id_reservation}:`,
              passagerError,
            )
            passagersData[reservation.id_reservation] = []
          }
        }
        setPassagersMap(passagersData)

        setError(null)
      } catch (error) {
        console.error("Erreur lors de la récupération des réservations:", error)
        setError(
          "Une erreur est survenue lors de la récupération de vos réservations. Détails: " +
            (error.response?.data?.message || error.message),
        )
      } finally {
        setLoading(false)
      }
    }

    fetchReservations()
  }, [user, navigate])

  const handleCancelClick = (id) => {
    setReservationToCancel(id)
    setShowModal(true)
  }

  const handleCancelConfirm = async () => {
    try {
      await reservationService.deleteReservation(reservationToCancel)
      setReservations(reservations.filter((r) => r.id_reservation !== reservationToCancel))

      // Mettre à jour la carte des passagers
      const updatedPassagersMap = { ...passagersMap }
      delete updatedPassagersMap[reservationToCancel]
      setPassagersMap(updatedPassagersMap)

      setShowModal(false)
    } catch (error) {
      console.error("Erreur lors de l'annulation de la réservation:", error)
      setError("Une erreur est survenue lors de l'annulation de la réservation.")
    }
  }

  const handleRetry = () => {
    setLoading(true)
    setError(null)

    const fetchReservations = async () => {
      try {
        const response = await reservationService.getUserReservations(user.id_users)
        setReservations(response.data)

        // Récupérer les passagers pour chaque réservation
        const passagersData = {}
        for (const reservation of response.data) {
          try {
            const passagersResponse = await passagerService.getPassagersByReservation(reservation.id_reservation)
            passagersData[reservation.id_reservation] = passagersResponse.data
          } catch (passagerError) {
            console.error(
              `Erreur lors de la récupération des passagers pour la réservation ${reservation.id_reservation}:`,
              passagerError,
            )
            passagersData[reservation.id_reservation] = []
          }
        }
        setPassagersMap(passagersData)
      } catch (error) {
        console.error("Erreur lors de la récupération des réservations:", error)
        setError("Une erreur est survenue lors de la récupération de vos réservations.")
      } finally {
        setLoading(false)
      }
    }

    fetchReservations()
  }

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Chargement...</span>
        </Spinner>
        <p className="mt-2">Chargement de vos réservations...</p>
      </Container>
    )
  }

  return (
    <Container className="my-5">
      <h1 className="mb-4">Mes réservations</h1>

      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
          <div className="mt-2">
            <Button variant="outline-danger" onClick={handleRetry}>
              Réessayer
            </Button>
          </div>
        </Alert>
      )}

      {reservations.length > 0 ? (
        reservations.map((reservation) => (
          <ReservationCard
            key={reservation.id_reservation}
            reservation={reservation}
            passagers={passagersMap[reservation.id_reservation] || []}
            onCancel={handleCancelClick}
          />
        ))
      ) : (
        <Alert variant="info">
          {error ? "Impossible d'afficher vos réservations." : "Vous n'avez pas encore de réservation."}{" "}
          <Button variant="link" className="p-0" onClick={() => navigate("/search")}>
            Rechercher un vol
          </Button>
        </Alert>
      )}

      {/* Modal de confirmation d'annulation */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmer l'annulation</Modal.Title>
        </Modal.Header>
        <Modal.Body>Êtes-vous sûr de vouloir annuler cette réservation ? Cette action est irréversible.</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Annuler
          </Button>
          <Button variant="danger" onClick={handleCancelConfirm}>
            Confirmer l'annulation
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}

export default ReservationsPage
