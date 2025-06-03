import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import "bootstrap/dist/css/bootstrap.min.css"

// Composants
import Header from "./components/Header"
import Footer from "./components/Footer"

// Pages
import HomePage from "./pages/HomePage"
import SearchPage from "./pages/SearchPage"
import VolDetailPage from "./pages/VolDetailPage"
import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"
import ProfilePage from "./pages/ProfilePage"
import ReservationsPage from "./pages/ReservationsPage"
import ReservationDetailPage from "./pages/ReservationDetailPage"
import PaiementPage from "./pages/PaiementPage"
import ConfirmationPage from "./pages/ConfirmationPage"

// Pages d'administration
import VolsAdminPage from "./pages/admin/VolsAdminPage"
import PassagersAdminPage from "./pages/admin/PassagersAdminPage"
import PaiementsAdminPage from "./pages/admin/PaiementsAdminPage"
import VolsReservationsPage from "./pages/admin/VolsReservationsPage"
import VolPassagersPage from "./pages/admin/VolPassagersPage"

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="d-flex flex-column min-vh-100">
          <Header />
          <main className="flex-grow-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/vols/:id" element={<VolDetailPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/reservations" element={<ReservationsPage />} />
              <Route path="/reservations/:id" element={<ReservationDetailPage />} />
              <Route path="/paiement/:id" element={<PaiementPage />} />
              <Route path="/reservations/:id/confirmation" element={<ConfirmationPage />} />

              {/* Routes d'administration */}
              <Route path="/admin/vols" element={<VolsAdminPage />} />
              <Route path="/admin/passagers" element={<PassagersAdminPage />} />
              <Route path="/admin/paiements" element={<PaiementsAdminPage />} />
              {/* Nouvelles routes */}
              <Route path="/admin/vols-reservations" element={<VolsReservationsPage />} />
              <Route path="/admin/vols/:id/passagers" element={<VolPassagersPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
