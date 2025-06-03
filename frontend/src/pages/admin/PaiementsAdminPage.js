"use client"

import { useState, useEffect, useContext } from "react"
import {
  Container,
  Card,
  Table,
  Button,
  Modal,
  Alert,
  Spinner,
  Badge,
  Pagination,
  Row,
  Col,
  Form,
} from "react-bootstrap"
import { useNavigate } from "react-router-dom"
import { paiementService, passagerService, reservationService } from "../../services/api"
import { AuthContext } from "../../context/AuthContext"
import { FaEdit, /*FaTrash,*/ FaSearch, FaChartBar, FaUser } from "react-icons/fa"

const PaiementsAdminPage = () => {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()

  const [paiements, setPaiements] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [currentPaiement, setCurrentPaiement] = useState({})
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [paiementsPerPage] = useState(10)
  const [passagersInfo, setPassagersInfo] = useState({})
  // Nous n'avons pas besoin de stocker les informations des réservations séparément

  // Vérifier si l'utilisateur est connecté
  useEffect(() => {
    if (!user) {
      navigate("/login", { state: { from: "/admin/paiements" } })
      return
    }

    fetchPaiements()
    fetchStats()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, navigate])

  const fetchPaiements = async () => {
    setLoading(true)
    try {
      const response = await paiementService.getAllPaiements()
      setPaiements(response.data)

      // Récupérer les informations des réservations et des passagers
      await fetchReservationsAndPassagers(response.data)
    } catch (error) {
      console.error("Erreur lors de la récupération des paiements:", error)
      setError("Une erreur est survenue lors de la récupération des paiements.")
    } finally {
      setLoading(false)
    }
  }

  const fetchReservationsAndPassagers = async (paiementsData) => {
    try {
      // Récupérer les IDs de réservation uniques
      const reservationIds = [...new Set(paiementsData.map((p) => p.id_reservation))]

      // Créer des objets pour stocker les informations
      const reservations = {}
      const passagers = {}

      // Récupérer les informations de chaque réservation
      for (const resId of reservationIds) {
        try {
          // Récupérer les détails de la réservation
          const resResponse = await reservationService.getReservationById(resId)
          reservations[resId] = resResponse.data

          // Récupérer les passagers associés à cette réservation
          const passagersResponse = await passagerService.getPassagersByReservation(resId)
          passagers[resId] = passagersResponse.data
        } catch (err) {
          console.error(`Erreur lors de la récupération des informations pour la réservation ${resId}:`, err)
        }
      }

      // Nous n'avons pas besoin de stocker les informations des réservations
      setPassagersInfo(passagers)
    } catch (error) {
      console.error("Erreur lors de la récupération des réservations et passagers:", error)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await paiementService.getStatsPaiements()
      setStats(response.data)
    } catch (error) {
      console.error("Erreur lors de la récupération des statistiques:", error)
    }
  }

  const handleEditPaiement = async (paiementData) => {
    try {
      await paiementService.updatePaiement(currentPaiement.id_paiement, paiementData)
      setShowEditModal(false)
      fetchPaiements()
      fetchStats()
    } catch (error) {
      console.error("Erreur lors de la mise à jour du paiement:", error)
      setError("Une erreur est survenue lors de la mise à jour du paiement.")
    }
  }

  const handleDeletePaiement = async () => {
    try {
      await paiementService.deletePaiement(currentPaiement.id_paiement)
      setShowDeleteModal(false)
      fetchPaiements()
      fetchStats()
    } catch (error) {
      console.error("Erreur lors de la suppression du paiement:", error)
      setError("Une erreur est survenue lors de la suppression du paiement.")
    }
  }

  // Formater la date
  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
    return new Date(dateString).toLocaleDateString("fr-FR", options)
  }

  // Obtenir les informations du passager pour une réservation
  const getPassagerInfo = (reservationId) => {
    const passagersList = passagersInfo[reservationId] || []
    if (passagersList.length > 0) {
      const passager = passagersList[0] // Prendre le premier passager
      return {
        nom: passager.nom,
        prenom: passager.prenom,
        fullName: `${passager.prenom} ${passager.nom}`,
      }
    }
    return { nom: "", prenom: "", fullName: "Inconnu" }
  }

  // Filtrer les paiements en fonction du terme de recherche
  const filteredPaiements = paiements.filter((paiement) => {
    const passagerInfo = getPassagerInfo(paiement.id_reservation)
    return (
      paiement.id_paiement.toString().includes(searchTerm) ||
      paiement.id_reservation.toString().includes(searchTerm) ||
      paiement.mode_paiement.toLowerCase().includes(searchTerm.toLowerCase()) ||
      paiement.type_paiement.toLowerCase().includes(searchTerm.toLowerCase()) ||
      paiement.statut.toLowerCase().includes(searchTerm.toLowerCase()) ||
      passagerInfo.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      passagerInfo.prenom.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  // Pagination
  const indexOfLastPaiement = currentPage * paiementsPerPage
  const indexOfFirstPaiement = indexOfLastPaiement - paiementsPerPage
  const currentPaiements = filteredPaiements.slice(indexOfFirstPaiement, indexOfLastPaiement)
  const totalPages = Math.ceil(filteredPaiements.length / paiementsPerPage)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  // Obtenir le statut du badge
  const getStatusBadge = (statut) => {
    switch (statut) {
      case "complete":
        return <Badge bg="success">Complété</Badge>
      case "en_attente":
        return <Badge bg="warning">En attente</Badge>
      default:
        return <Badge bg="secondary">{statut}</Badge>
    }
  }

  // Obtenir le type de paiement
  const getPaymentType = (type) => {
    switch (type) {
      case "complet":
        return "Complet"
      case "partiel":
        return "Partiel (50%)"
      case "depart":
        return "Au départ"
      default:
        return type
    }
  }

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Chargement...</span>
        </Spinner>
        <p className="mt-2">Chargement des paiements...</p>
      </Container>
    )
  }

  return (
    <Container className="my-5">
      <h1 className="mb-4">Gestion des paiements</h1>

      {error && (
        <Alert variant="danger" className="mb-4" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}

      {stats && (
        <Card className="mb-4 shadow-sm">
          <Card.Header className="bg-primary text-white">
            <h3 className="mb-0 d-flex align-items-center">
              <FaChartBar className="me-2" /> Statistiques des paiements
            </h3>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={3} className="text-center mb-3">
                <h5>Total des paiements</h5>
                <div className="display-6">{stats.total_paiements}</div>
              </Col>
              <Col md={3} className="text-center mb-3">
                <h5>Montant total</h5>
                <div className="display-6">{Number.parseFloat(stats.montant_total).toFixed(2)} €</div>
              </Col>
              <Col md={3} className="text-center mb-3">
                <h5>Paiements complets</h5>
                <div className="display-6">{stats.paiements_complets}</div>
              </Col>
              <Col md={3} className="text-center mb-3">
                <h5>Paiements partiels</h5>
                <div className="display-6">{stats.paiements_partiels}</div>
              </Col>
            </Row>
            <Row className="mt-3">
              <Col md={4} className="text-center">
                <h5>Paiements au départ</h5>
                <div className="display-6">{stats.paiements_depart}</div>
              </Col>
              <Col md={4} className="text-center">
                <h5>Paiements complétés</h5>
                <div className="display-6">{stats.paiements_completes}</div>
              </Col>
              <Col md={4} className="text-center">
                <h5>Paiements en attente</h5>
                <div className="display-6">{stats.paiements_en_attente}</div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}

      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="d-flex align-items-center">
              <FaSearch className="text-muted me-2" />
              <input
                type="text"
                className="form-control"
                placeholder="Rechercher un paiement..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <Table responsive hover>
            <thead>
              <tr>
                <th>ID</th>
                <th>Passager</th>
                <th>Date de paiement</th>
                <th>Montant</th>
                <th>Total</th>
                <th>Mode</th>
                <th>Type</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentPaiements.length > 0 ? (
                currentPaiements.map((paiement) => {
                  const passagerInfo = getPassagerInfo(paiement.id_reservation)

                  return (
                    <tr key={paiement.id_paiement}>
                      <td>{paiement.id_paiement}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <FaUser className="text-primary me-1" />
                          <span>
                            {passagerInfo.prenom} {passagerInfo.nom}
                          </span>
                        </div>
                      </td>
                      <td>{formatDate(paiement.date_paiement)}</td>
                      <td>{paiement.montant} €</td>
                      <td>{paiement.montant_total || paiement.montant} €</td>
                      <td>{paiement.mode_paiement}</td>
                      <td>{getPaymentType(paiement.type_paiement)}</td>
                      <td>{getStatusBadge(paiement.statut)}</td>
                      <td>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-2"
                          onClick={() => {
                            setCurrentPaiement(paiement)
                            setShowEditModal(true)
                          }}
                        >
                          <FaEdit />
                        </Button>
                        {/*<Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => {
                            setCurrentPaiement(paiement)
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
                  <td colSpan="10" className="text-center">
                    Aucun paiement trouvé
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

      {/* Modal de modification de paiement */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Modifier le paiement {currentPaiement.id_paiement}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentPaiement.id_reservation && (
            <Alert variant="info" className="mb-3">
              <strong>Passager:</strong> {getPassagerInfo(currentPaiement.id_reservation).fullName}
            </Alert>
          )}
          <Form
            onSubmit={(e) => {
              e.preventDefault()
              handleEditPaiement({
                montant: e.target.montant.value,
                montant_total: e.target.montant_total.value,
                mode_paiement: e.target.mode_paiement.value,
                type_paiement: e.target.type_paiement.value,
                statut: e.target.statut.value,
              })
            }}
          >
            <Form.Group className="mb-3">
              <Form.Label>Montant</Form.Label>
              <Form.Control type="number" name="montant" defaultValue={currentPaiement.montant} step="0.01" required />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Montant total</Form.Label>
              <Form.Control
                type="number"
                name="montant_total"
                defaultValue={currentPaiement.montant_total || currentPaiement.montant}
                step="0.01"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Mode de paiement</Form.Label>
              <Form.Select name="mode_paiement" defaultValue={currentPaiement.mode_paiement}>
                <option value="carte">Carte bancaire</option>
                <option value="paypal">PayPal</option>
                <option value="virement">Virement</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Type de paiement</Form.Label>
              <Form.Select name="type_paiement" defaultValue={currentPaiement.type_paiement || "complet"}>
                <option value="complet">Complet</option>
                <option value="partiel">Partiel (50%)</option>
                <option value="depart">Au départ</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Statut</Form.Label>
              <Form.Select name="statut" defaultValue={currentPaiement.statut || "complete"}>
                <option value="complete">Complété</option>
                <option value="en_attente">En attente</option>
              </Form.Select>
            </Form.Group>

            <div className="d-grid">
              <Button variant="primary" type="submit">
                Mettre à jour
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Modal de confirmation de suppression */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmer la suppression</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Êtes-vous sûr de vouloir supprimer le paiement <strong>#{currentPaiement.id_paiement}</strong> ?
          </p>
          {currentPaiement.id_reservation && (
            <p>
              <strong>Passager:</strong> {getPassagerInfo(currentPaiement.id_reservation).fullName}
            </p>
          )}
          <p>
            <strong>Montant:</strong> {currentPaiement.montant} €
          </p>
          <p>
            <strong>Réservation:</strong> #{currentPaiement.id_reservation}
          </p>
          <p className="text-danger">Cette action est irréversible.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Annuler
          </Button>
          <Button variant="danger" onClick={handleDeletePaiement}>
            Supprimer
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}

export default PaiementsAdminPage
