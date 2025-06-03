"use client"

import { useState, useEffect } from "react"
import { Form, Button, Card, Row, Col, Alert } from "react-bootstrap"
import { FaCreditCard, FaPaypal, FaUniversity } from "react-icons/fa"

const PaiementForm = ({ montant, passagers, onSubmit }) => {
  const [modePaiement, setModePaiement] = useState("carte")
  const [typePaiement] = useState("complet")
  const [numeroCard, setNumeroCard] = useState("")
  const [nomCard, setNomCard] = useState("")
  const [expirationCard, setExpirationCard] = useState("")
  const [cvcCard, setCvcCard] = useState("")
  const [numeroCardErreur, setNumeroCardErreur] = useState("")

  // Initialiser la date d'expiration avec le mois/année actuels
  useEffect(() => {
    const now = new Date()
    const mois = String(now.getMonth() + 1).padStart(2, "0")
    const annee = String(now.getFullYear()).slice(-2)
    setExpirationCard(`${mois}/${annee}`)
  }, [])

  const getMontantAPayer = () => {
    switch (typePaiement) {
      case "partiel":
        return montant / 2
      case "depart":
        return 0
      default:
        return montant
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (modePaiement === "carte" && numeroCard.replace(/\s/g, "").length > 16) {
      setNumeroCardErreur("Le numéro de la carte est 16 exactement")
      return
    }

    setNumeroCardErreur("")

    onSubmit({
      mode_paiement: modePaiement,
      type_paiement: typePaiement,
      montant: getMontantAPayer(),
      montant_total: montant,
      details: {
        numeroCard,
        nomCard,
        expirationCard,
        cvcCard,
      },
    })
  }

  return (
    <Form onSubmit={handleSubmit}>
      <h4 className="mb-3">Montant total: {montant} €</h4>

      {typePaiement === "depart" ? (
        <Alert variant="info">
          <p>Vous avez choisi de payer au départ de l'avion.</p>
          <p>Le montant de {montant} € sera à régler le jour du départ.</p>
          <p>Veuillez vous présenter au comptoir d'enregistrement au moins 2 heures avant le départ.</p>
        </Alert>
      ) : (
        <>
          <Form.Group className="mb-4">
            <Form.Label>Mode de paiement</Form.Label>
            <Row>
              {[
                { value: "carte", icon: <FaCreditCard />, label: "Carte bancaire" },
                { value: "paypal", icon: <FaPaypal />, label: "PayPal" },
                { value: "virement", icon: <FaUniversity />, label: "Virement" },
              ].map(({ value, icon, label }) => (
                <Col md={4} key={value}>
                  <Card
                    className={`text-center p-3 ${modePaiement === value ? "border-primary" : ""}`}
                    onClick={() => setModePaiement(value)}
                    style={{ cursor: "pointer" }}
                  >
                    {icon}
                    <Form.Check
                      type="radio"
                      id={value}
                      label={label}
                      name="modePaiement"
                      value={value}
                      checked={modePaiement === value}
                      onChange={() => setModePaiement(value)}
                      className="d-inline"
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          </Form.Group>

          {modePaiement === "carte" && (
            <>
              <Form.Group className="mb-3" controlId="numeroCard">
                <Form.Label>Numéro de carte</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  value={numeroCard}
                  onChange={(e) => setNumeroCard(e.target.value)}
                  required
                />
                {numeroCardErreur && (
                  <Form.Text className="text-danger">{numeroCardErreur}</Form.Text>
                )}
              </Form.Group>

              <Form.Group className="mb-3" controlId="nomCard">
                <Form.Label>Nom sur la carte</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Entrer le nom du titulaire"
                  value={nomCard}
                  onChange={(e) => setNomCard(e.target.value)}
                  required
                />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="expirationCard">
                    <Form.Label>Date d'expiration (MM/AA)</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="MM/AA"
                      value={expirationCard}
                      onChange={(e) => setExpirationCard(e.target.value)}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="cvcCard">
                    <Form.Label>CVC</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="123"
                      value={cvcCard}
                      onChange={(e) => setCvcCard(e.target.value)}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
            </>
          )}

          {modePaiement === "paypal" && (
            <Alert variant="info">Vous allez être redirigé vers PayPal pour finaliser votre paiement.</Alert>
          )}

          {modePaiement === "virement" && (
            <Alert variant="info">
              <p>Veuillez effectuer un virement bancaire avec les informations suivantes:</p>
              <p>IBAN: PS18 1818 1730 1743 1716</p>
              <p>BIC: PUISSANCE</p>
              <p>Référence: RESERVATION-{Date.now()}</p>
            </Alert>
          )}
        </>
      )}

      <div className="d-grid mt-4">
        <Button variant="success" type="submit" size="lg">
          {typePaiement === "depart"
            ? "Confirmer le paiement au départ"
            : `Payer ${getMontantAPayer()} €${typePaiement === "partiel" ? " maintenant" : ""}`}
        </Button>
      </div>
    </Form>
  )
}

export default PaiementForm
