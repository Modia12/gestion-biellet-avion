"use client"

import { useState, useEffect, useContext } from "react"
import { Container, Card, Table, Button, Alert, Spinner, Badge, Pagination } from "react-bootstrap"
import { useNavigate } from "react-router-dom"
import { volService } from "../../services/api"
import { AuthContext } from "../../context/AuthContext"
import { FaEye, FaPlane, FaUsers } from "react-icons/fa"
import { formatDate } from "../../utils/formatters"

const VolsReservationsPage = () => {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()

  const [vols, setVols] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [volsPerPage] = useState(10)

  // Vérifier si l'utilisateur est connecté et est admin
  useEffect(() => {
    if (!user) {
      navigate("/login", { state: { from: "/admin/vols-reservations" } })
      return
    }

    fetchVols()
  }, [user, navigate])

  const fetchVols = async () => {
    setLoading(true)
    try {
      const response = await volService.getVolsWithReservations()
      setVols(response.data)
      setError(null)
    } catch (error) {
      console.error("Erreur lors de la récupération des vols avec réservations:", error)
      setError("Une erreur est survenue lors de la récupération des vols avec réservations.")
    } finally {
      setLoading(false)
    }
  }

  // Pagination
  const indexOfLastVol = currentPage * volsPerPage
  const indexOfFirstVol = indexOfLastVol - volsPerPage
  const currentVols = vols.slice(indexOfFirstVol, indexOfLastVol)
  const totalPages = Math.ceil(vols.length / volsPerPage)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Chargement...</span>
        </Spinner>
        <p className="mt-2">Chargement des vols avec réservations...</p>
      </Container>
    )
  }

  return (
    <Container className="my-5">
      <h1 className="mb-4">Vols avec réservations</h1>

      {error && (
        <Alert variant="danger" className="mb-4" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}

      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Table responsive hover>
            <thead>
              <tr>
                <th>Numéro de vol</th>
                <th>Origine</th>
                <th>Destination</th>
                <th>Date de départ</th>
                <th>Réservations</th>
                <th>Passagers</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentVols.length > 0 ? (
                currentVols.map((vol) => (
                  <tr key={vol.id_vol}>
                    <td>
                      <div className="d-flex align-items-center">
                        <FaPlane className="me-2 text-primary" />
                        {vol.numero_vol}
                      </div>
                    </td>
                    <td>{vol.origine}</td>
                    <td>{vol.destination}</td>
                    <td>{formatDate(vol.date_depart, true)}</td>
                    <td>
                      <Badge bg="info">{vol.nombre_reservations}</Badge>
                    </td>
                    <td>
                      <Badge bg="success">
                        <FaUsers className="me-1" /> {vol.nombre_passagers}
                      </Badge>
                    </td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => navigate(`/admin/vols/${vol.id_vol}/passagers`)}
                      >
                        <FaEye className="me-1" /> Détails
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center">
                    Aucun vol avec réservations trouvé
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
    </Container>
  )
}

export default VolsReservationsPage
