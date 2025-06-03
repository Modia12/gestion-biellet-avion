"use client"

import { useState, useEffect } from "react"
import { Row, Col, Button, Alert, Spinner } from "react-bootstrap"
import { reservationService } from "../services/api"

const SeatSelector = ({ volId, onSeatSelect, initialSeat = null, totalSeats = 60 }) => {
  const [selectedSeat, setSelectedSeat] = useState(initialSeat)
  const [reservedSeats, setReservedSeats] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [retryCount, setRetryCount] = useState(0)

  // Nombre de rangées et de sièges par rangée
  const rows = 10
  const seatsPerRow = 6

  // Initialiser le siège sélectionné avec initialSeat si fourni
  useEffect(() => {
    if (initialSeat) {
      setSelectedSeat(initialSeat)
      onSeatSelect(initialSeat)
    }
  }, [initialSeat, onSeatSelect])

  useEffect(() => {
    const fetchReservedSeats = async () => {
      try {
        setLoading(true)
        setError(null)
        console.log(`Récupération des sièges réservés pour le vol ${volId}`)

        // Vérifier si la fonction existe
        if (typeof reservationService.getReservedSeats !== "function") {
          console.error("La fonction getReservedSeats n'est pas définie dans le service de réservation")
          // Utiliser un tableau vide si la fonction n'existe pas
          setReservedSeats([])
          setLoading(false)
          return
        }

        const response = await reservationService.getReservedSeats(volId)
        console.log(`Réponse des sièges réservés:`, response.data)

        // S'assurer que les données sont un tableau
        if (!Array.isArray(response.data)) {
          console.warn("Les données reçues ne sont pas un tableau:", response.data)
          setReservedSeats([])
        } else {
          // Filtrer les valeurs non numériques ou NaN
          const validSeats = response.data
            .map((seat) => Number(seat))
            .filter((seat) => !isNaN(seat) && seat > 0 && seat <= totalSeats)

          // Si initialSeat est défini, ne pas l'inclure dans les sièges réservés
          // pour permettre à l'utilisateur de conserver son siège actuel
          const filteredSeats = initialSeat ? validSeats.filter((seat) => seat !== initialSeat) : validSeats

          setReservedSeats(filteredSeats)
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des sièges réservés:", error)
        // En cas d'erreur, on continue avec un tableau vide de sièges réservés
        // pour permettre à l'utilisateur de sélectionner un siège quand même
        setReservedSeats([])
        setError("Impossible de charger les sièges réservés. " + (error.response?.data?.message || error.message))
      } finally {
        setLoading(false)
      }
    }

    fetchReservedSeats()
  }, [volId, retryCount, totalSeats, initialSeat])

  const handleSeatClick = (seatNumber) => {
    if (reservedSeats.includes(seatNumber)) {
      return // Siège déjà réservé
    }

    setSelectedSeat(seatNumber)
    onSeatSelect(seatNumber)
  }

  const getSeatLetter = (index) => {
    return String.fromCharCode(65 + index) // A, B, C, D, E, F
  }

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1)
  }

  // Fonction pour générer un siège aléatoire non réservé
  const selectRandomSeat = () => {
    const availableSeats = []
    for (let i = 1; i <= totalSeats; i++) {
      if (!reservedSeats.includes(i)) {
        availableSeats.push(i)
      }
    }

    if (availableSeats.length === 0) {
      setError("Tous les sièges semblent être réservés. Veuillez choisir un autre vol.")
      return
    }

    const randomSeat = availableSeats[Math.floor(Math.random() * availableSeats.length)]
    setSelectedSeat(randomSeat)
    onSeatSelect(randomSeat)
  }

  // Formater le numéro de siège (ex: 1A, 2B, etc.)
  const formatSeatNumber = (seatNumber) => {
    if (!seatNumber) return null
    const row = Math.ceil(seatNumber / seatsPerRow)
    const seat = String.fromCharCode(65 + ((seatNumber - 1) % seatsPerRow))
    return `${row}${seat}`
  }

  if (loading) {
    return (
      <div className="text-center p-4">
        <Spinner animation="border" role="status" className="mb-2">
          <span className="visually-hidden">Chargement du plan de cabine...</span>
        </Spinner>
        <p>Chargement du plan de cabine...</p>
      </div>
    )
  }

  return (
    <div className="seat-selector mb-4">
      <h5 className="mb-3">Sélectionnez votre siège</h5>

      {error && (
        <Alert variant="warning" className="mb-3">
          <p>{error}</p>
          <div className="d-flex gap-2 mt-2">
            <Button variant="outline-warning" size="sm" onClick={handleRetry}>
              Réessayer
            </Button>
            <Button variant="outline-primary" size="sm" onClick={selectRandomSeat}>
              Sélectionner un siège aléatoire
            </Button>
          </div>
        </Alert>
      )}

      {selectedSeat && (
        <Alert variant="info" className="mb-3">
          <strong>Siège sélectionné:</strong> {formatSeatNumber(selectedSeat)}
        </Alert>
      )}

      <div className="text-center mb-3">
        <div className="d-inline-block me-3">
          <span className="seat-available me-1"></span> Disponible
        </div>
        <div className="d-inline-block me-3">
          <span className="seat-reserved me-1"></span> Réservé
        </div>
        <div className="d-inline-block">
          <span className="seat-selected me-1"></span> Sélectionné
        </div>
      </div>

      <div className="cabin-layout">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <Row key={rowIndex} className="mb-2 g-2">
            <Col xs={2} className="text-end pt-1">
              <strong>{rowIndex + 1}</strong>
            </Col>
            {Array.from({ length: seatsPerRow }).map((_, seatIndex) => {
              const seatNumber = rowIndex * seatsPerRow + seatIndex + 1
              const isReserved = reservedSeats.includes(seatNumber)
              const isSelected = selectedSeat === seatNumber

              return (
                <Col key={seatIndex} xs={1}>
                  <Button
                    variant={isSelected ? "primary" : isReserved ? "secondary" : "outline-secondary"}
                    size="sm"
                    className="w-100"
                    disabled={isReserved}
                    onClick={() => handleSeatClick(seatNumber)}
                  >
                    {getSeatLetter(seatIndex)}
                  </Button>
                </Col>
              )
            })}
          </Row>
        ))}
      </div>

      <div className="mt-3 text-center">
        <Button variant="outline-primary" size="sm" onClick={selectRandomSeat}>
          Sélectionner un siège aléatoire
        </Button>
      </div>

      <style jsx>{`
        .seat-available, .seat-reserved, .seat-selected {
          display: inline-block;
          width: 20px;
          height: 20px;
          border-radius: 4px;
          vertical-align: middle;
        }
        .seat-available {
          border: 1px solid #6c757d;
          background-color: white;
        }
        .seat-reserved {
          background-color: #6c757d;
        }
        .seat-selected {
          background-color: #0d6efd;
        }
        .cabin-layout {
          max-width: 400px;
          margin: 0 auto;
        }
      `}</style>
    </div>
  )
}

export default SeatSelector
