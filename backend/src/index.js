import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json())

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' })
})

// Start server
app.listen(PORT, () => {
  console.log(`Zeal API running on port ${PORT}`)
})