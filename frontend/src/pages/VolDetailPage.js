"use client"

import { useState, useEffect, useContext } from "react"
import { Container, Row, Col, Card, Button, Alert, Spinner, Badge } from "react-bootstrap"
import { useParams, useNavigate } from "react-router-dom"
import { volService, reservationService, passagerService } from "../services/api"
import { AuthContext } from "../context/AuthContext"
import PassagerForm from "../components/PassagerForm"
import { FaPlaneDeparture, FaPlaneArrival, FaClock, FaEuroSign, FaUser } from "react-icons/fa"

const VolDetailPage = () => {
  const { id } = useParams()
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()

  const [vol, setVol] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reservationSuccess, setReservationSuccess] = useState(false)
  const [passager, setPassager] = useState({})
  // Aucune variable d'état n'est nécessaire ici car nous utilisons sessionStorage

  useEffect(() => {
    const fetchVol = async () => {
      try {
        const response = await volService.getVolById(id)
        setVol(response.data)
      } catch (error) {
        console.error("Erreur lors de la récupération du vol:", error)
        setError("Une erreur est survenue lors de la récupération des détails du vol.")
      } finally {
        setLoading(false)
      }
    }

    fetchVol()

    // Récupérer les données du passager sauvegardées
    const savedPassagerInfo = sessionStorage.getItem(`passagerInfo_${id}`)
    if (savedPassagerInfo) {
      try {
        const passagerInfo = JSON.parse(savedPassagerInfo)
        console.log("Informations passager récupérées:", passagerInfo)
        setPassager(passagerInfo)
      } catch (e) {
        console.error("Erreur lors de la récupération des informations passager:", e)
      }
    } else {
      // Récupérer les données du formulaire sauvegardées
      const savedFormData = sessionStorage.getItem(`passagerForm_${id}`)
      if (savedFormData) {
        try {
          const formData = JSON.parse(savedFormData)
          console.log("Données du formulaire passager récupérées:", formData)
          setPassager(formData)
        } catch (e) {
          console.error("Erreur lors de la récupération des données du formulaire:", e)
        }
      }
    }
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

  // Calculer la durée du vol
  const calculateDuration = (depart, arrivee) => {
    const departDate = new Date(depart)
    const arriveeDate = new Date(arrivee)
    const diff = arriveeDate - departDate

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    return `${hours}h ${minutes}min`
  }

  const handlePassagerSubmit = async (passagerData) => {
    if (!user) {
      // Stocker les informations du passager avant de rediriger vers la page de connexion
      sessionStorage.setItem(`passagerInfo_${id}`, JSON.stringify(passagerData))
      navigate("/login", { state: { from: `/vols/${id}` } })
      return
    }

    try {
      // Afficher un indicateur de chargement
      setLoading(true)

      // Créer la réservation avec la place réservée
      const reservationResponse = await reservationService.createReservation({
        id_users: user.id_users,
        id_vol: vol.id_vol,
        place_reservee: passagerData.place_reservee,
      })

      const newReservationId = reservationResponse.data.id_reservation
      // Nous utilisons directement newReservationId sans passer par l'état

      // Supprimer place_reservee des données du passager car elle est déjà dans la réservation
      const { place_reservee, ...passagerDataWithoutSeat } = passagerData
      setPassager(passagerDataWithoutSeat)

      // Ajouter le passager
      await passagerService.createPassager({
        ...passagerDataWithoutSeat,
        id_reservation: newReservationId,
      })

      // Sauvegarder les informations pour la page de paiement
      sessionStorage.setItem("currentReservationId", newReservationId)
      sessionStorage.setItem(
        `passagerInfo_${newReservationId}`,
        JSON.stringify({
          ...passagerData,
          id_reservation: newReservationId,
        }),
      )

      setReservationSuccess(true)
      setLoading(false)

      // Rediriger vers la page de paiement
      navigate(`/paiement/${newReservationId}`)
    } catch (error) {
      console.error("Erreur lors de la réservation:", error)
      setError("Une erreur est survenue lors de la réservation: " + (error.response?.data?.message || error.message))
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Chargement...</span>
        </Spinner>
        <p className="mt-2">Chargement des détails du vol...</p>
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

  if (!vol) {
    return (
      <Container className="mt-5">
        <Alert variant="warning">Vol non trouvé.</Alert>
        <Button variant="primary" onClick={() => navigate("/search")}>
          Retour à la recherche
        </Button>
      </Container>
    )
  }

  if (reservationSuccess) {
    return (
      <Container className="mt-5">
        <Alert variant="success">
          Votre réservation a été effectuée avec succès ! Vous allez être redirigé vers la page de paiement...
        </Alert>
      </Container>
    )
  }

  return (
    <Container className="my-5">
      <Row>
        <Col md={8}>
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-primary text-white">
              <h2 className="mb-0">Vol {vol.numero_vol}</h2>
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between mb-4">
                <div>
                  <div className="d-flex align-items-center mb-3">
                    <FaPlaneDeparture className="me-3 text-primary fs-3" />
                    <div>
                      <h4 className="mb-0">{vol.origine}</h4>
                      <p className="text-muted mb-0">{formatDate(vol.date_depart)}</p>
                    </div>
                  </div>
                  <div className="d-flex align-items-center">
                    <FaPlaneArrival className="me-3 text-primary fs-3" />
                    <div>
                      <h4 className="mb-0">{vol.destination}</h4>
                      <p className="text-muted mb-0">{formatDate(vol.date_arrive)}</p>
                    </div>
                  </div>
                </div>
                <div className="text-end">
                  <div className="d-flex align-items-center justify-content-end mb-3">
                    <FaClock className="me-2 text-muted" />
                    <span className="fs-5">{calculateDuration(vol.date_depart, vol.date_arrive)}</span>
                  </div>
                  <div className="d-flex align-items-center justify-content-end">
                    <FaEuroSign className="me-1 text-success fs-4" />
                    <span className="fs-3 fw-bold text-success">{vol.prix} €</span>
                  </div>
                </div>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <Badge
                  bg={vol.places_disponibles > 10 ? "success" : vol.places_disponibles > 0 ? "warning" : "danger"}
                  className="fs-6 py-2 px-3"
                >
                  {vol.places_disponibles > 0 ? `${vol.places_disponibles} places disponibles` : "Complet"}
                </Badge>
                {vol.places_disponibles <= 5 && vol.places_disponibles > 0 && (
                  <Alert variant="warning" className="mb-0 py-1 px-2">
                    Plus que {vol.places_disponibles} places disponibles !
                  </Alert>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm">
            <Card.Header className="bg-primary text-white">
              <h3 className="mb-0">Réserver</h3>
            </Card.Header>
            <Card.Body>
              {vol.places_disponibles > 0 ? (
                <>
                  <div className="mb-4">
                    <h5 className="d-flex align-items-center">
                      <FaUser className="me-2" /> Informations passager
                    </h5>
                    <PassagerForm onSubmit={handlePassagerSubmit} volId={vol.id_vol} initialData={passager} />
                  </div>
                </>
              ) : (
                <Alert variant="danger">Ce vol est complet. Veuillez choisir un autre vol.</Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <div className="mt-4">
        <Button variant="outline-secondary" onClick={() => navigate(-1)}>
          Retour
        </Button>
      </div>
    </Container>
  )
}

export default VolDetailPage
