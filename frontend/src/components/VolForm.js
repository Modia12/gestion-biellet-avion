"use client"

import { useState, useEffect } from "react"
import { Form, Button, Row, Col } from "react-bootstrap"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { registerLocale } from "react-datepicker"
import fr from "date-fns/locale/fr"

registerLocale("fr", fr)

const flightOptions = {
  "1818H-F": 200,
  "1743H-F": 400,
  "1730H-F": 100,
  "1716H-F": 100,
}

const origins = ["Madagascar", "Antananarivo", "Fianarantsoa", "Manandriana"]
const destinations = [
  "Paris", "Tokyo", "New York", "France", "Morice", "Comores",
  "Toamasina", "Mahajanga", "Fianarantsoa", "Tuléar",
]

const VolForm = ({ onSubmit, initialData = {} }) => {
  const [numeroVol, setNumeroVol] = useState(initialData.numero_vol || "")
  const [origine, setOrigine] = useState(initialData.origine || "")
  const [destination, setDestination] = useState(initialData.destination || "")
  const [dateDepart, setDateDepart] = useState(initialData.date_depart ? new Date(initialData.date_depart) : new Date())
  const [dateArrive, setDateArrive] = useState(initialData.date_arrive ? new Date(initialData.date_arrive) : null)
  const [prix, setPrix] = useState(initialData.prix || "")
  const [placesDisponibles, setPlacesDisponibles] = useState(initialData.places_disponibles || "")

  useEffect(() => {
    if (initialData.id_vol) {
      setNumeroVol(initialData.numero_vol || "")
      setOrigine(initialData.origine || "")
      setDestination(initialData.destination || "")
      setDateDepart(initialData.date_depart ? new Date(initialData.date_depart) : new Date())
      setDateArrive(initialData.date_arrive ? new Date(initialData.date_arrive) : null)
      setPrix(initialData.prix || "")
      setPlacesDisponibles(initialData.places_disponibles || "")
    }
  }, [initialData])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (dateArrive && dateArrive < dateDepart) {
      alert("La date d’arrivée ne peut pas être antérieure à la date de départ.")
      return
    }
    onSubmit({
      numero_vol: numeroVol,
      origine,
      destination,
      date_depart: dateDepart,
      date_arrive: dateArrive,
      prix: Number.parseFloat(prix),
      places_disponibles: Number.parseInt(placesDisponibles, 10),
    })
  }

  const handleNumeroVolChange = (e) => {
    const selectedVol = e.target.value
    setNumeroVol(selectedVol)
    if (flightOptions[selectedVol]) {
      setPlacesDisponibles(flightOptions[selectedVol])
    } else {
      setPlacesDisponibles("")
    }
  }

  const handleDateDepartChange = (date) => {
    setDateDepart(date)
    if (dateArrive && date && dateArrive < date) {
      setDateArrive(null)
    }
  }

  const now = new Date()

  return (
    <Form onSubmit={handleSubmit}>
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3" controlId="numeroVol">
            <Form.Label>Numéro de vol</Form.Label>
            <Form.Select value={numeroVol} onChange={handleNumeroVolChange} required>
              <option value="">Sélectionner le numero d'avion</option>
              {Object.keys(flightOptions).map((vol) => (
                <option key={vol} value={vol}>{vol}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3" controlId="placesDisponibles">
            <Form.Label>Places disponibles</Form.Label>
            <Form.Control
              type="number"
              min="0"
              placeholder="Nombre de places"
              value={placesDisponibles}
              onChange={(e) => setPlacesDisponibles(e.target.value)}
              required
            />
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3" controlId="origine">
            <Form.Label>Origine</Form.Label>
            <Form.Select value={origine} onChange={(e) => setOrigine(e.target.value)} required>
              <option value=""> Sélectionner la ville d'origine</option>
              {origins.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3" controlId="destination">
            <Form.Label>Destination</Form.Label>
            <Form.Select value={destination} onChange={(e) => setDestination(e.target.value)} required>
              <option value="">Sélectionner la ville d'arrivée</option>
              {destinations.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3" controlId="dateDepart">
            <Form.Label>Date et heure de départ</Form.Label>
            <DatePicker
              selected={dateDepart}
              onChange={handleDateDepartChange}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="dd/MM/yyyy HH:mm"
              locale="fr"
              className="form-control"
              minDate={now}
              minTime={dateDepart?.toDateString() === now.toDateString() ? now : new Date(0, 0, 0, 0, 0)}
              maxTime={new Date(0, 0, 0, 23, 45)}
              required
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3" controlId="dateArrive">
            <Form.Label>Date et heure d'arrivée</Form.Label>
            <DatePicker
              selected={dateArrive}
              onChange={(date) => setDateArrive(date)}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="dd/MM/yyyy HH:mm"
              locale="fr"
              className="form-control"
              minDate={dateDepart || now}
              minTime={dateDepart?.toDateString() === dateArrive?.toDateString()
                ? dateDepart
                : new Date(0, 0, 0, 0, 0)}
              maxTime={new Date(0, 0, 0, 23, 45)}
              required
              disabled={!dateDepart}
            />
          </Form.Group>
        </Col>
      </Row>

      <Form.Group className="mb-3" controlId="prix">
        <Form.Label>Prix par personne (€)</Form.Label>
        <Form.Control
          type="number"
          min="0"
          step="0.01"
          placeholder="Prix du vol"
          value={prix}
          onChange={(e) => setPrix(e.target.value)}
          required
        />
      </Form.Group>

      <div className="d-grid gap-2">
        <Button variant="primary" type="submit">
          {initialData.id_vol ? "Mettre à jour" : "Ajouter"} le vol
        </Button>
      </div>
    </Form>
  )
}

export default VolForm
