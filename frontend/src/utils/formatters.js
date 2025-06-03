/**
 * Formate un numéro de siège en format lisible (ex: 1A, 2B, etc.)
 * @param {number} seatNumber - Le numéro de siège (1-60)
 * @returns {string|null} - Le siège formaté ou null si seatNumber est invalide
 */
export const formatSeatNumber = (seatNumber) => {
    if (!seatNumber) return null
  
    const row = Math.ceil(seatNumber / 6)
    const seat = String.fromCharCode(65 + ((seatNumber - 1) % 6))
    return `${row}${seat}`
  }
  
  /**
   * Formate une date en format lisible
   * @param {string} dateString - La date à formater
   * @param {boolean} includeTime - Inclure l'heure dans le format
   * @returns {string} - La date formatée
   */
  export const formatDate = (dateString, includeTime = true) => {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  
    if (includeTime) {
      options.hour = "2-digit"
      options.minute = "2-digit"
    }
  
    return new Date(dateString).toLocaleDateString("fr-FR", options)
  }
  