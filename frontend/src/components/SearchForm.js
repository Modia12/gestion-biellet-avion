"use client"

import { useState } from "react"
import { Container, Form, Button, Row, Col } from "react-bootstrap"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { registerLocale } from "react-datepicker"
import fr from "date-fns/locale/fr"

registerLocale("fr", fr)

const SearchForm = ({ onSearch }) => {
  const [searchParams, setSearchParams] = useState({
    origine: "",
    destination: "",
    date_depart: new Date(),
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setSearchParams((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleDateChange = (date) => {
    setSearchParams((prev) => ({
      ...prev,
      date_depart: date,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const formattedDate = searchParams.date_depart
      ? searchParams.date_depart.toISOString().split("T")[0]
      : null

    onSearch({
      origine: searchParams.origine.trim(),
      destination: searchParams.destination.trim(),
      date_depart: formattedDate,
    })
  }

  return (
    <section className="h-100 text-center">
      <Container>
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <h1 className="text-center mb-4">Trouvez votre vol idéal</h1>
            <div className="search-box">
              <Form onSubmit={handleSubmit}>
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Départ</Form.Label>
                      <Form.Control
                        type="text"
                        name="origine"
                        value={searchParams.origine}
                        onChange={handleChange}
                        placeholder="Ville de départ"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Destination</Form.Label>
                      <Form.Control
                        type="text"
                        name="destination"
                        value={searchParams.destination}
                        onChange={handleChange}
                        placeholder="Ville de destination"
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col>
                    <Form.Group>
                      <Form.Label>Date de départ</Form.Label>
                      <DatePicker
                        selected={searchParams.date_depart}
                        onChange={handleDateChange}
                        className="form-control"
                        dateFormat="dd/MM/yyyy"
                        minDate={new Date()}
                        locale="fr"
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Button variant="outline-primary" type="submit" className="w-100">
                  Rechercher
                </Button>
              </Form>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  )
}

export default SearchForm
