"use client"

import { useState, useEffect, useContext } from "react"
import { Container, Card, Table, Button, Modal, Alert, Spinner, Badge, Pagination } from "react-bootstrap"
import { useNavigate } from "react-router-dom"
import { volService } from "../../services/api"
import { AuthContext } from "../../context/AuthContext"
import VolForm from "../../components/VolForm"
import { FaPlus, FaEdit, FaTrash, FaSearch } from "react-icons/fa"

const VolsAdminPage = () => {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()

  const [vols, setVols] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [currentVol, setCurrentVol] = useState({})
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [volsPerPage] = useState(10)

  // Vérifier si l'utilisateur est connecté
  useEffect(() => {
    if (!user) {
      navigate("/login", { state: { from: "/admin/vols" } })
      return
    }

    fetchVols()
  }, [user, navigate])

  const fetchVols = async () => {
    setLoading(true)
    try {
      const response = await volService.getAllVols()
      setVols(response.data)
    } catch (error) {
      console.error("Erreur lors de la récupération des vols:", error)
      setError("Une erreur est survenue lors de la récupération des vols.")
    } finally {
      setLoading(false)
    }
  }

  const handleAddVol = async (volData) => {
    try {
      await volService.createVol(volData)
      setShowAddModal(false)
      fetchVols()
    } catch (error) {
      console.error("Erreur lors de l'ajout du vol:", error)
      setError("Une erreur est survenue lors de l'ajout du vol.")
    }
  }

  const handleEditVol = async (volData) => {
    try {
      await volService.updateVol(currentVol.id_vol, volData)
      setShowEditModal(false)
      fetchVols()
    } catch (error) {
      console.error("Erreur lors de la mise à jour du vol:", error)
      setError("Une erreur est survenue lors de la mise à jour du vol.")
    }
  }

  const handleDeleteVol = async () => {
    try {
      await volService.deleteVol(currentVol.id_vol)
      setShowDeleteModal(false)
      fetchVols()
    } catch (error) {
      console.error("Erreur lors de la suppression du vol:", error)
      setError("Une erreur est survenue lors de la suppression du vol.")
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

  // Filtrer les vols en fonction du terme de recherche
  const filteredVols = vols.filter(
    (vol) =>
      vol.numero_vol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vol.origine.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vol.destination.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Pagination
  const indexOfLastVol = currentPage * volsPerPage
  const indexOfFirstVol = indexOfLastVol - volsPerPage
  const currentVols = filteredVols.slice(indexOfFirstVol, indexOfLastVol)
  const totalPages = Math.ceil(filteredVols.length / volsPerPage)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Chargement...</span>
        </Spinner>
        <p className="mt-2">Chargement des vols...</p>
      </Container>
    )
  }

  return (
    <Container className="my-5">
      <h1 className="mb-4">Gestion des vols</h1>

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
                placeholder="Rechercher un vol..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="primary" onClick={() => setShowAddModal(true)}>
              <FaPlus className="me-2" /> Ajouter un vol
            </Button>
          </div>

          <Table responsive hover>
            <thead>
              <tr>
                <th>Numéro</th>
                <th>Origine</th>
                <th>Destination</th>
                <th>Date de Départ</th>
                <th>Date d'Arrivée</th>
                <th>Prix</th>
                <th>Places</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentVols.length > 0 ? (
                currentVols.map((vol) => (
                  <tr key={vol.id_vol}>
                    <td>{vol.numero_vol}</td>
                    <td>{vol.origine}</td>
                    <td>{vol.destination}</td>
                    <td>{formatDate(vol.date_depart)}</td>
                    <td>{formatDate(vol.date_arrive)}</td>
                    <td>{vol.prix} €</td>
                    <td>
                      <Badge
                        bg={vol.places_disponibles > 10 ? "success" : vol.places_disponibles > 0 ? "warning" : "danger"}
                      >
                        {vol.places_disponibles}
                      </Badge>
                    </td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => {
                          setCurrentVol(vol)
                          setShowEditModal(true)
                        }}
                      >
                        <FaEdit />
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => {
                          setCurrentVol(vol)
                          setShowDeleteModal(true)
                        }}
                      >
                        <FaTrash />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center">
                    Aucun vol trouvé
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

      {/* Modal d'ajout de vol */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Ajouter un vol</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <VolForm onSubmit={handleAddVol} />
        </Modal.Body>
      </Modal>

      {/* Modal de modification de vol */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Modifier le vol {currentVol.numero_vol}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <VolForm onSubmit={handleEditVol} initialData={currentVol} />
        </Modal.Body>
      </Modal>

      {/* Modal de confirmation de suppression */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmer la suppression</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Êtes-vous sûr de vouloir supprimer le vol <strong>{currentVol.numero_vol}</strong> ?
          </p>
          <p>
            <strong>Origine:</strong> {currentVol.origine}
          </p>
          <p>
            <strong>Destination:</strong> {currentVol.destination}
          </p>
          <p>
            <strong>Date de départ:</strong> {currentVol.date_depart && formatDate(currentVol.date_depart)}
          </p>
          <p className="text-danger">Cette action est irréversible.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Annuler
          </Button>
          <Button variant="danger" onClick={handleDeleteVol}>
            Supprimer
          </Button>
        </Modal.Footer>
      </Modal>
      <Button variant="primary" onClick={() => navigate("/search")}>
            reservation du vol
      </Button>
        
    </Container>
    
    
  )
}

export default VolsAdminPage
