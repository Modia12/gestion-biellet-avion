const { Pool } = require("pg")

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "avion",
  password: "123456789",
  port: 5432,
})

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
}
