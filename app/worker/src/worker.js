const express = require("express")
const { createClient } = require("redis")
const nodemailer = require("nodemailer");

const redis = createClient({
    socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
    }
})

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: true,
    auth: {
        user: process.env.EMAIL_ADDRESS,
        pass: process.env.EMAIL_PASSWORD,
    },
});

async function connectRedis() {
    if (!redis.isOpen) {
        await redis.connect()
        console.log("Redis connected!")
    }
}

const app = express()
app.use(express.json())


app.get("/health", async (req, res) => {
    res.status(200).json({
        status: "ok",
    })
})

app.get("/ready", async (req, res) => {

    if (redis.isOpen) {
        res.status(200).json({
            status: "ok",
            redis: "connected"
        })
    } else {
        res.status(503).json({
            status: "error",
            redis: "disconnected"
        })
    }
})

async function startWorker() {
    while (true) {
        try {
            const data = await redis.blPop("email_queue", 0)
            const ticket = JSON.parse(data.element)
            console.log("Send email to: ", ticket)
            console.log(process.env.EMAIL_ADDRESS)

            const html = `
                <body>
                    <h1>Dziękujemy za Twoje zgłoszenie</h1>
                    <h4>Treść zgłoszenia</h4>
                    <p>${ticket.description}</p>
                </body>
            `

            transporter.sendMail({
                from: `"Admin" <${process.env.EMAIL_ADDRESS}>`,
                to: ticket.email,
                subject: "Potwierdzenie zgłoszrnia",
                html: html,
            })

        } catch (err) {
            console.error(err)
        }
    }
}

async function startServer() {
    try {
        await connectRedis()

        app.listen(8081, () => {
            console.log("worker works")
        })

        startWorker()
    } catch (err) {
        console.log("Error:", err)
        process.exit(1)
    }
}

startServer()
