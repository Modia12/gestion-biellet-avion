"use client"

import { useState, useEffect, useCallback } from "react"
import { Container, Row, Col, Alert, Spinner } from "react-bootstrap"
import { useLocation } from "react-router-dom"
import { volService } from "../services/api"
import SearchForm from "../components/SearchForm"
import VolCard from "../components/VolCard"

const SearchPage = () => {
  const [vols, setVols] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const location = useLocation()

  // Récupérer les paramètres de recherche de l'URL
  const getSearchParamsFromUrl = useCallback(() => {
    const searchParams = new URLSearchParams(location.search)
    return {
      origine: searchParams.get("origine") || "",
      destination: searchParams.get("destination") || "",
      date_depart: searchParams.get("date_depart") || "",
    }
  }, [location.search])

  // Effectuer la recherche avec les critères donnés
  const searchVols = async (criteria) => {
    setLoading(true)
    setError(null)
    try {
      const response = await volService.searchVols(criteria)
      setVols(response.data)
    } catch (error) {
      console.error("Erreur lors de la recherche des vols:", error)
      setError("Une erreur est survenue lors de la recherche des vols. Veuillez réessayer.")
    } finally {
      setLoading(false)
    }
  }

  // Effectuer une recherche initiale si des paramètres sont présents dans l'URL
  useEffect(() => {
    const searchCriteria = getSearchParamsFromUrl()
    if (searchCriteria.origine || searchCriteria.destination || searchCriteria.date_depart) {
      searchVols(searchCriteria)
    } else {
      // Si aucun critère, charger tous les vols
      const fetchAllVols = async () => {
        setLoading(true)
        try {
          const response = await volService.getAllVols()
          setVols(response.data)
        } catch (error) {
          console.error("Erreur lors de la récupération des vols:", error)
          setError("Une erreur est survenue lors de la récupération des vols. Veuillez réessayer.")
        } finally {
          setLoading(false)
        }
      }
      fetchAllVols()
    }
  }, [getSearchParamsFromUrl])

  // Gérer la soumission du formulaire de recherche
  const handleSearch = (searchCriteria) => {
    searchVols(searchCriteria)

    // Mettre à jour l'URL avec les critères de recherche
    const queryParams = new URLSearchParams(searchCriteria).toString()
    window.history.pushState({}, "", `${location.pathname}?${queryParams}`)
  }

  return (
    <Container>

      <SearchForm onSearch={handleSearch} />

      {error && (
        <Alert variant="danger" className="mt-3">
          {error}
        </Alert>
      )}

      {loading ? (
        <div className="text-center mt-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Chargement...</span>
          </Spinner>
          <p className="mt-2">Recherche des vols en cours...</p>
        </div>
      ) : (
        <div className="mt-4">
          <h2>Résultats de recherche</h2>
          {vols.length > 0 ? (
            <Row>
              <Col>
                {vols.map((vol) => (
                  <VolCard key={vol.id_vol} vol={vol} />
                ))}
              </Col>
            </Row>
          ) : (
            <Alert variant="info">
              Aucun vol ne correspond à vos critères de recherche. Veuillez essayer avec d'autres critères.
            </Alert>
          )}
        </div>
      )}
    </Container>
  )
}

export default SearchPage
