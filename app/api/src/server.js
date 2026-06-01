const express = require("express")
const { createClient } = require("redis")
const { Pool } = require("pg")
const client = require("prom-client")

const register = new client.Registry()
client.collectDefaultMetrics({
    register
})

const httpRequests = new client.Counter({
    name: "http_request_count",
    help: "Http request count"
})

register.registerMetric(httpRequests)

const redis = createClient({
    socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
    }
})

function connectRedis() {
    if (!redis.isOpen) {
        redis.connect()
        console.log("Redis connected!")
    }
}

const app = express()
app.use(express.json())


app.use((req, res, next) => {
    httpRequests.inc()
    next()
})

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
})

app.get("/api/metrics", async (req, res) => {
    res.set("Content-Type", register.contentType)
    res.end(await register.metrics())
})

app.get("/api/tickets", async (req, res) => {
    const result = await pool.query("SELECT * FROM tickets")
    res.json(result.rows)
})

app.post("/api/tickets", async (req, res) => {
    const { description, email } = req.body || {}
    if (!description) {
        return res.status(400).json({ message: "Brak description" })
    }
    if (!email) {
        return res.status(400).json({ message: "Brak adresu email" })
    }
    const result = await pool.query("INSERT INTO tickets (description, email) VALUES ($1, $2) RETURNING *", [description, email])
    if(result.rows) {
        await redis.rPush("email_queue", JSON.stringify({description, email}))
    }
    res.status(201).json(result.rows)
})

app.get("/api/health", async (req, res) => {
    res.status(200).json({
        status: "ok",
    })
})

app.get("/api/ready", async (req, res) => {
    if(!redis.isOpen) {
        return res.status(503).json({
            status: "error",
            redis: "disconnected"
        })
    }

    try {
        await pool.query("SELECT 1")
        res.status(200).json({
            status: "ok",
            database: "connected",
            redis: "conntected"
        })
    } catch (err) {
        res.status(503).json({
            status: "error",
            database: "disconnected"
        })
    }
})

async function startServer() {
    try {
        await connectRedis()

        app.listen(8080, () => {
            console.log("server works")
        })
    } catch (err) {
        console.log("Error:", err)
        process.exit(1)
    }
}

startServer()