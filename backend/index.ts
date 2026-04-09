import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import project from './routes/project'

console.log("Starting server V2...")

const app = express()

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    console.log("Root endpoint hit")
    res.send("Server is running")
})

app.use('/api/project', project)

if (!process.env.VERCEL) {
    app.listen(5001, () => {
        console.log("The server is running on port 5001")
    })
}

export default app