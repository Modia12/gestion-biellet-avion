"use client"

import { useState, useEffect, useContext } from "react"
import { Container, Card, Table, Button, Modal, Alert, Spinner, Pagination, Badge } from "react-bootstrap"
import { useNavigate } from "react-router-dom"
import { passagerService, reservationService } from "../../services/api"
import { AuthContext } from "../../context/AuthContext"
import PassagerForm from "../../components/PassagerForm"
import { FaEdit, /*FaTrash,*/ FaSearch, FaChair } from "react-icons/fa"
import { formatSeatNumber } from "../../utils/formatters"

const PassagersAdminPage = () => {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()

  const [passagers, setPassagers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [currentPassager, setCurrentPassager] = useState({})
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [passagersPerPage] = useState(10)
  const [reservations, setReservations] = useState({})

  // Vérifier si l'utilisateur est connecté
  useEffect(() => {
    if (!user) {
      navigate("/login", { state: { from: "/admin/passagers" } })
      return
    }

    fetchPassagers()
  }, [user, navigate])

  // Remplacer la fonction fetchPassagers par cette version améliorée
  const fetchPassagers = async () => {
    setLoading(true)
    try {
      const response = await passagerService.getAllPassagers()
      setPassagers(response.data)

      // Récupérer les informations de réservation pour chaque passager
      const reservationIds = [...new Set(response.data.map((p) => p.id_reservation))]
      const reservationData = {}

      for (const resId of reservationIds) {
        try {
          const resResponse = await reservationService.getReservationById(resId)
          if (resResponse.data) {
            reservationData[resId] = resResponse.data
          }
        } catch (err) {
          console.error(`Erreur lors de la récupération de la réservation ${resId}:`, err)
          // Continuer malgré l'erreur pour une réservation spécifique
        }
      }

      setReservations(reservationData)
    } catch (error) {
      console.error("Erreur lors de la récupération des passagers:", error)
      setError("Une erreur est survenue lors de la récupération des passagers.")
    } finally {
      setLoading(false)
    }
  }

  const handleEditPassager = async (passagerData) => {
    try {
      await passagerService.updatePassager(currentPassager.id_passager, passagerData)
      setShowEditModal(false)
      fetchPassagers()
    } catch (error) {
      console.error("Erreur lors de la mise à jour du passager:", error)
      setError("Une erreur est survenue lors de la mise à jour du passager.")
    }
  }

  /*const handleDeletePassager = async () => {
    try {
      await passagerService.deletePassager(currentPassager.id_passager)
      setShowDeleteModal(false)
      fetchPassagers()
    } catch (error) {
      console.error("Erreur lors de la suppression du passager:", error)
      setError("Une erreur est survenue lors de la suppression du passager.")
    }
  }*/
    
  // Filtrer les passagers en fonction du terme de recherche
  const filteredPassagers = passagers.filter(
    (passager) =>
      passager.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      passager.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      passager.numero_passeport.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Pagination
  const indexOfLastPassager = currentPage * passagersPerPage
  const indexOfFirstPassager = indexOfLastPassager - passagersPerPage
  const currentPassagers = filteredPassagers.slice(indexOfFirstPassager, indexOfLastPassager)
  const totalPages = Math.ceil(filteredPassagers.length / passagersPerPage)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  // Remplacer la fonction getReservedSeat par cette version plus robuste
  const getReservedSeat = (passager) => {
    try {
      const reservation = reservations[passager.id_reservation]
      if (reservation && reservation.place_reservee) {
        return reservation.place_reservee
      }
      return null
    } catch (error) {
      console.error("Erreur lors de la récupération du siège:", error)
      return null
    }
  }

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Chargement...</span>
        </Spinner>
        <p className="mt-2">Chargement des passagers...</p>
      </Container>
    )
  }

  return (
    <Container className="my-5">
      <h1 className="mb-4">Gestion des passagers</h1>

      {error && (
        <Alert variant="danger" className="mb-4" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}

      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="d-flex align-items-center">
              <FaSearch className="text-muted me-2" />
              <input
                type="text"
                className="form-control"
                placeholder="Rechercher un passager..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <Table responsive hover>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nom</th>
                <th>Prénom</th>
                <th>Numéro de passeport</th>
                <th>Siège</th>
                <th>Actions</th>
              </tr>
            </thead>
            {/* Remplacer la partie du rendu du tableau pour améliorer l'affichage des sièges */}
            <tbody>
              {currentPassagers.length > 0 ? (
                currentPassagers.map((passager) => {
                  const seatNumber = getReservedSeat(passager)
                  const formattedSeat = formatSeatNumber(seatNumber)

                  return (
                    <tr key={passager.id_passager}>
                      <td>{passager.id_passager}</td>
                      <td>{passager.nom}</td>
                      <td>{passager.prenom}</td>
                      <td>{passager.numero_passeport}</td>
                      <td>
                        {formattedSeat ? (
                          <Badge bg="primary" className="d-flex align-items-center" style={{ width: "fit-content" }}>
                            <FaChair className="me-1" /> {formattedSeat}
                          </Badge>
                        ) : (
                          <Badge bg="secondary" className="d-flex align-items-center" style={{ width: "fit-content" }}>
                            <FaChair className="me-1" /> Non assigné
                          </Badge>
                        )}
                      </td>
                      <td>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-2"
                          onClick={() => {
                            setCurrentPassager({
                              ...passager,
                              place_reservee: seatNumber,
                            })
                            setShowEditModal(true)
                          }}
                        >
                          <FaEdit />
                        </Button>
                        {/*<Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => {
                            setCurrentPassager(passager)
                            setShowDeleteModal(true)
                          }}
                        >
                          <FaTrash />
                        </Button>*/}
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan="7" className="text-center">
                    Aucun passager trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <Pagination>
                <Pagination.First onClick={() => paginate(1)} disabled={currentPage === 1} />
                <Pagination.Prev onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} />

                {[...Array(totalPages).keys()].map((number) => (
                  <Pagination.Item
                    key={number + 1}
                    active={number + 1 === currentPage}
                    onClick={() => paginate(number + 1)}
                  >
                    {number + 1}
                  </Pagination.Item>
                ))}

                <Pagination.Next onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} />
                <Pagination.Last onClick={() => paginate(totalPages)} disabled={currentPage === totalPages} />
              </Pagination>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Modal de modification de passager */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Modifier le passager</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <PassagerForm
            onSubmit={handleEditPassager}
            initialData={currentPassager}
            volId={reservations[currentPassager.id_reservation]?.id_vol}
          />
        </Modal.Body>
      </Modal>

      {/* Modal de confirmation de suppression */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmer la suppression</Modal.Title>
        </Modal.Header>
        {/* Remplacer la partie du modal de suppression pour afficher correctement le siège */}
        <Modal.Body>
          <p>
            Êtes-vous sûr de vouloir supprimer le passager{" "}
            <strong>
              {currentPassager.nom} {currentPassager.prenom}
            </strong>{" "}
            ?
          </p>
          <p>
            <strong>Numéro de passeport:</strong> {currentPassager.numero_passeport}
          </p>
          {(() => {
            const seatNumber = getReservedSeat(currentPassager)
            const formattedSeat = formatSeatNumber(seatNumber)
            return formattedSeat ? (
              <p>
                <strong>Siège réservé:</strong>{" "}
                <Badge bg="primary">
                  <FaChair className="me-1" /> {formattedSeat}
                </Badge>
              </p>
            ) : null
          })()}
          <p className="text-danger">Cette action est irréversible.</p>
        </Modal.Body>
        {/*<Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Annuler
          </Button>
          <Button variant="danger" onClick={handleDeletePassager}>
            Supprimer
          </Button>
        </Modal.Footer>*/}
      </Modal>
    </Container>
  )
}

export default PassagersAdminPage
