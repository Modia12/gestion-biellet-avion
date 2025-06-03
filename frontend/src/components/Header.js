"use client"

import { useContext } from "react"
import { Navbar, Container, Nav, NavDropdown } from "react-bootstrap"
import { Link, useNavigate } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"

const Header = () => {
  const { user, logout } = useContext(AuthContext)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <Navbar bg="primary" variant="dark" expand="lg" className="mb-4">
      <Container>
        <Navbar.Brand as={Link} to="/">
          AirPuissance
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">
              Accueil
            </Nav.Link>
            <Nav.Link as={Link} to="/search">
              vol en cours
            </Nav.Link>
            {user && (
              <Nav.Link as={Link} to="/reservations">
                Mes Réservations
              </Nav.Link>
            )}
            {user && (
              <NavDropdown title="Administration" id="admin-dropdown">
                <NavDropdown.Item as={Link} to="/admin/vols">
                  Gestion des vols
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/admin/passagers">
                  Gestion des passagers
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/admin/paiements">
                  Gestion des paiements
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item as={Link} to="/admin/vols-reservations">
                  Vols avec réservations
                </NavDropdown.Item>
              </NavDropdown>
            )}
          </Nav>
          <Nav>
            {user ? (
              <NavDropdown title={`${user.prenom} ${user.nom}`} id="basic-nav-dropdown">
                <NavDropdown.Item as={Link} to="/profile">
                  Mon Profil
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout}>Déconnexion</NavDropdown.Item>
              </NavDropdown>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">
                  Connexion
                </Nav.Link>
                <Nav.Link as={Link} to="/register">
                  Inscription
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default Header
