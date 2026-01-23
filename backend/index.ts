import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import auth from './routes/auth'
import project from './routes/project'

console.log("Starting server V2...")

const app = express()

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    console.log("Root endpoint hit")
    res.send("Server is running")
})

app.use('/auth', auth)
app.use('/project', project)

app.listen(5000, () => {
    console.log("The server is running on port 5000")
})