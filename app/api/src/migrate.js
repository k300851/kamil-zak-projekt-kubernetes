const { Pool } = require("pg")

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
})

async function initDatabase() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS tickets (
            id SERIAL PRIMARY KEY,
            description TEXT NOT NULL,
            email TEXT NOT NULL
        )
        `)
}

initDatabase().catch(err => {
    console.log(err)
    process.exit(1)
})
