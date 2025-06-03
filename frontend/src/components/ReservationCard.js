"use client"
import { Card, Badge, Button, Row, Col } from "react-bootstrap"
import { Link } from "react-router-dom"
import { FaPlaneDeparture, FaPlaneArrival, FaCalendarAlt, FaChair, FaUser } from "react-icons/fa"

const ReservationCard = ({ reservation, passagers = [], onCancel }) => {
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

  // Formater le numéro de siège
  const formatSeatNumber = (seatNumber) => {
    if (!seatNumber) return null

    const row = Math.ceil(seatNumber / 6)
    const seat = String.fromCharCode(65 + ((seatNumber - 1) % 6))
    return `${row}${seat}`
  }

  return (
    <Card className="mb-3 shadow-sm">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <span className="fw-bold"> {reservation.id_reservation} Réservation</span>
        <Badge bg="info">{formatDate(reservation.date_reservation)}</Badge>
      </Card.Header>
      <Card.Body>
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

        {/* Affichage des passagers */}
        {passagers && passagers.length > 0 && (
          <div className="mb-3 p-2 bg-light rounded">
            <div className="d-flex align-items-center mb-2">
              <FaUser className="me-2 text-primary" />
              <div className="fw-bold">Passager{passagers.length > 1 ? "s" : ""}</div>
            </div>
            {passagers.map((passager, index) => (
              <div key={passager.id_passager} className={index > 0 ? "mt-2 pt-2 border-top" : ""}>
                <Row>
                  <Col>
                    <div className="fw-bold">
                     <label><small>Nom et prenoms:</small> </label> {passager.nom} {passager.prenom}
                    </div>
                    <small>Passeport: {passager.numero_passeport}</small>
                  </Col>
                  
                </Row>
              </div>
            ))}
          </div>
        )}

        <div className="d-flex justify-content-between">
          <div>
            <FaCalendarAlt className="me-2 text-muted" />
            <span>Vol {reservation.numero_vol}</span>
            {reservation.place_reservee && (
              <span className="ms-3">
                <FaChair className="me-1 text-primary" />
                Siège {formatSeatNumber(reservation.place_reservee)}
              </span>
            )}
          </div>
          <div>
            <span className="fs-5 fw-bold text-success">{reservation.prix} €</span>
          </div>
        </div>
      </Card.Body>
      <Card.Footer className="d-flex justify-content-between">
        <Button as={Link} to={`/reservations/${reservation.id_reservation}`} variant="outline-primary">
          Détails
        </Button>
        <Button variant="outline-danger" onClick={() => onCancel(reservation.id_reservation)}>
          Annuler
        </Button>
      </Card.Footer>
    </Card>
  )
}

export default ReservationCard
