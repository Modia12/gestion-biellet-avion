import axios from "axios"

const API_URL = "http://localhost:5000/api"

// Créer une instance axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Intercepteur pour ajouter le token aux requêtes
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Intercepteur pour gérer les erreurs de réponse
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    console.error("Erreur API:", error.response || error)
    return Promise.reject(error)
  },
)

// Services utilisateur
export const userService = {
  register: (userData) => api.post("/users/register", userData),
  login: (credentials) => api.post("/users/login", credentials),
  getProfile: (id) => api.get(`/users/${id}`),
  updateProfile: (id, userData) => api.put(`/users/${id}`, userData),
}

// Services vol
export const volService = {
  getAllVols: () => api.get("/vols"),
  getVolById: (id) => api.get(`/vols/${id}`),
  searchVols: (criteria) => api.get("/vols/search", { params: criteria }),
  createVol: (volData) => api.post("/vols", volData),
  updateVol: (id, volData) => api.put(`/vols/${id}`, volData),
  deleteVol: (id) => api.delete(`/vols/${id}`),
  // Nouvelles méthodes
  getVolsWithReservations: () => api.get("/vols/with-reservations/list"),
  getPassagersByVolId: (id) => api.get(`/vols/${id}/passagers`),
}

// Services réservation
// Vérifier que la méthode deleteReservation existe bien dans reservationService
export const reservationService = {
  getAllReservations: () => api.get("/reservations"),
  getReservationById: (id) => api.get(`/reservations/${id}`),
  getUserReservations: (userId) => api.get(`/reservations/user/${userId}`),
  getReservedSeats: (volId) => {
    console.log(`Récupération des sièges réservés pour le vol ${volId}`)
    try {
      // Ajout d'un timeout plus long et d'une meilleure gestion des erreurs
      return api.get(`/reservations/vol/${volId}/reserved-seats`, {
        timeout: 15000,
        validateStatus: (status) => {
          return status < 500 // Accepter les statuts 2xx, 3xx et 4xx
        },
      })
    } catch (error) {
      console.error("Erreur lors de la récupération des sièges réservés:", error)
      // Retourner un tableau vide en cas d'erreur pour éviter de bloquer l'interface
      return Promise.resolve({ data: [] })
    }
  },
  createReservation: (reservationData) => api.post("/reservations", reservationData),
  updateReservation: (id, reservationData) => api.put(`/reservations/${id}`, reservationData),
  deleteReservation: (id) => api.delete(`/reservations/${id}`),
}

// Services passager
export const passagerService = {
  getAllPassagers: () => api.get("/passagers"),
  getPassagerById: (id) => api.get(`/passagers/${id}`),
  getPassagersByReservation: (reservationId) => api.get(`/passagers/reservation/${reservationId}`),
  createPassager: (passagerData) => api.post("/passagers", passagerData),
  updatePassager: (id, passagerData) => api.put(`/passagers/${id}`, passagerData),
  deletePassager: (id) => api.delete(`/passagers/${id}`),
}

// Services paiement
export const paiementService = {
  getAllPaiements: () => api.get("/paiements"),
  getPaiementById: (id) => api.get(`/paiements/${id}`),
  getPaiementsByReservation: (reservationId) => {
    console.log(`Récupération des paiements pour la réservation ${reservationId}`)
    return api.get(`/paiements/reservation/${reservationId}`)
  },
  createPaiement: (paiementData) => api.post("/paiements", paiementData),
  updatePaiement: (id, paiementData) => api.put(`/paiements/${id}`, paiementData),
  deletePaiement: (id) => api.delete(`/paiements/${id}`),
  getStatsPaiements: () => api.get("/paiements/stats"),
  testConnection: () => api.get("/paiements/test"),
}

export default api
