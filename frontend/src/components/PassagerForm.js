"use client"

import { useState, useEffect } from "react"
import { Form, Button, Alert, Badge } from "react-bootstrap"
import SeatSelector from "./SeatSelector"

const PassagerForm = ({ onSubmit, initialData = {}, volId }) => {
  const [nom, setNom] = useState(initialData.nom || "")
  const [prenom, setPrenom] = useState(initialData.prenom || "")
  const [numeroPasseport, setNumeroPasseport] = useState(initialData.numero_passeport || "")
  const [selectedSeat, setSelectedSeat] = useState(initialData.place_reservee || null)
  const [formKey, setFormKey] = useState(Date.now()) // Clé unique pour forcer le rendu du formulaire

  // Effet pour charger les données sauvegardées au chargement du composant
  useEffect(() => {
    const loadSavedData = () => {
      // Essayer de récupérer les données du sessionStorage
      const savedData = sessionStorage.getItem(`passagerForm_${volId}`)

      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData)
          console.log("Données chargées du sessionStorage:", parsedData)

          // Mettre à jour l'état avec les données sauvegardées
          setNom(parsedData.nom || "")
          setPrenom(parsedData.prenom || "")
          setNumeroPasseport(parsedData.numero_passeport || "")
          setSelectedSeat(parsedData.place_reservee || null)

          // Forcer le rendu du formulaire avec les nouvelles valeurs
          setFormKey(Date.now())
        } catch (error) {
          console.error("Erreur lors du chargement des données sauvegardées:", error)
        }
      } else if (initialData && Object.keys(initialData).length > 0) {
        // Si pas de données sauvegardées mais des initialData, les utiliser
        setNom(initialData.nom || "")
        setPrenom(initialData.prenom || "")
        setNumeroPasseport(initialData.numero_passeport || "")
        setSelectedSeat(initialData.place_reservee || null)
        setFormKey(Date.now())
      }
    }

    loadSavedData()
  }, [volId, initialData])

  // Effet pour sauvegarder les données à chaque modification
  useEffect(() => {
    const saveFormData = () => {
      const formData = {
        nom,
        prenom,
        numero_passeport: numeroPasseport,
        place_reservee: selectedSeat,
      }

      // Sauvegarder uniquement si au moins un champ est rempli
      if (nom || prenom || numeroPasseport || selectedSeat) {
        console.log("Sauvegarde des données dans sessionStorage:", formData)
        sessionStorage.setItem(`passagerForm_${volId}`, JSON.stringify(formData))
      }
    }

    saveFormData()
  }, [nom, prenom, numeroPasseport, selectedSeat, volId])

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!selectedSeat) {
      alert("Veuillez sélectionner un siège")
      return
    }

    // Créer l'objet passager avec les données du formulaire
    const passagerData = {
      nom,
      prenom,
      numero_passeport: numeroPasseport,
      place_reservee: selectedSeat,
    }

    // Sauvegarder les données pour la page de paiement
    sessionStorage.setItem(`passagerInfo_${volId}`, JSON.stringify(passagerData))

    // Appeler la fonction onSubmit avec les données du passager
    onSubmit(passagerData)
  }

  const handleSeatSelect = (seatNumber) => {
    setSelectedSeat(seatNumber)
  }

  // Formater le numéro de siège (ex: 1A, 2B, etc.)
  const formatSeatNumber = (seatNumber) => {
    if (!seatNumber) return null
    const row = Math.ceil(seatNumber / 6)
    const seat = String.fromCharCode(65 + ((seatNumber - 1) % 6))
    return `${row}${seat}`
  }

  return (
    <Form key={formKey} onSubmit={handleSubmit}>
      <Form.Group className="mb-3" controlId="nom">
        <Form.Label>Nom</Form.Label>
        <Form.Control
          type="text"
          placeholder="Nom du passager"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          required
        />
      </Form.Group>

      <Form.Group className="mb-3" controlId="prenom">
        <Form.Label>Prénom</Form.Label>
        <Form.Control
          type="text"
          placeholder="Prénom du passager"
          value={prenom}
          onChange={(e) => setPrenom(e.target.value)}
          required
        />
      </Form.Group>

      <Form.Group className="mb-3" controlId="numeroPasseport">
        <Form.Label>Numéro de passeport</Form.Label>
        <Form.Control
          type="text"
          placeholder="Numéro de passeport"
          value={numeroPasseport}
          onChange={(e) => setNumeroPasseport(e.target.value)}
          required
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Siège</Form.Label>
        {selectedSeat ? (
          <div className="mb-2">
            <Badge bg="primary" className="p-2 fs-6">
              Siège sélectionné: {formatSeatNumber(selectedSeat)}
            </Badge>
          </div>
        ) : (
          <Alert variant="warning">Veuillez sélectionner un siège</Alert>
        )}
      </Form.Group>

      <SeatSelector volId={volId} onSeatSelect={handleSeatSelect} initialSeat={selectedSeat} />

      <div className="d-grid mt-3">
        <Button variant="primary" type="submit" disabled={!selectedSeat}>
          Continuer vers le paiement
        </Button>
      </div>
    </Form>
  )
}

export default PassagerForm
