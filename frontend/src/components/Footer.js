import { Container, Row, Col } from "react-bootstrap"

const Footer = () => {
  return (
    <footer className="bg-dark text-white py-4 mt-5">
      <Container>
        <Row>
          <Col md={4}>
            <h5>AirPuissance</h5>
            <p>Votre plateforme de réservation de billets d'avion.</p>
          </Col>
          <Col md={4}>
            <h5>Liens Utiles</h5>
            <ul className="list-unstyled">
              <li>
                <a href="/" className="text-white">
                  Accueil
                </a>
              </li>
              <li>
                <a href="/search" className="text-white">
                  Rechercher un vol
                </a>
              </li>
              <li>
                
              </li>
            </ul>
          </Col>
          <Col md={4}>
            <h5>Contact</h5>
            <address>
              <p>Email: andriniainajohanessa@gmail.com</p>
              <p>Téléphone: +261 34 86 626 83</p>
              <p>WhatsApp: +261 34 86 626 83/ +261 33 76 488 37</p>
            </address>
          </Col>
        </Row>
        <Row>
          <Col className="text-center mt-3">
            <p>&copy; {new Date().getFullYear()} AirPuissance. Tous droits réservés.</p>
          </Col>
        </Row>
      </Container>
    </footer>
  )
}

export default Footer
