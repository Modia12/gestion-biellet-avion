import { Card, Button, Badge } from "react-bootstrap"
import { Link } from "react-router-dom"
import { FaPlaneDeparture, FaPlaneArrival, FaClock, FaEuroSign } from "react-icons/fa"

const VolCard = ({ vol }) => {
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

  return (
    <Card className="mb-3 shadow-sm">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <span className="fw-bold">{vol.numero_vol}</span>
        <Badge bg={vol.places_disponibles > 10 ? "success" : vol.places_disponibles > 0 ? "warning" : "danger"}>
          {vol.places_disponibles > 0 ? `${vol.places_disponibles} places disponibles` : "Complet"}
        </Badge>
      </Card.Header>
      <Card.Body>
        <div className="d-flex justify-content-between mb-3">
          <div>
            <div className="d-flex align-items-center mb-2">
              <FaPlaneDeparture className="me-2 text-primary" />
              <div>
                <div className="fw-bold">{vol.origine}</div>
                <small>{formatDate(vol.date_depart)}</small>
              </div>
            </div>
            <div className="d-flex align-items-center">
              <FaPlaneArrival className="me-2 text-primary" />
              <div>
                <div className="fw-bold">{vol.destination}</div>
                <small>{formatDate(vol.date_arrive)}</small>
              </div>
            </div>
          </div>
          <div className="text-end">
            <div className="d-flex align-items-center justify-content-end mb-2">
              <FaClock className="me-2 text-muted" />
              <span>{calculateDuration(vol.date_depart, vol.date_arrive)}</span>
            </div>
            <div className="d-flex align-items-center justify-content-end">
              <FaEuroSign className="me-1 text-success" />
              <span className="fs-4 fw-bold text-success">{vol.prix} €</span>
            </div>
          </div>
        </div>
        <div className="d-grid">
          <Button as={Link} to={`/vols/${vol.id_vol}`} variant="primary" disabled={vol.places_disponibles <= 0}>
            {vol.places_disponibles > 0 ? "Réserver" : "Indisponible"}
          </Button>
        </div>
      </Card.Body>
    </Card>
  )
}

export default VolCard
