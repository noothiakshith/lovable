import express from 'express'
console.log("Starting server V2...");
const app = express()
import auth from './routes/auth'
import project from './routes/project'

import verifyUser from './middleware'
app.use(express.json())
app.get('/', () => {
    console.log("This is from the port")
})


app.use('/auth', auth)
app.use('/project', project)
app.listen(3000, () => {
    console.log("The server is running on port 3000")
})