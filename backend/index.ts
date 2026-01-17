import express from 'express'
const app = express()
import auth from './routes/auth'
app.use(express.json())
app.get('/',()=>{
    console.log("This is from the port")
})


app.use('/auth',auth)
app.listen(3000,()=>{
    console.log("The server is running on port 3000")
})