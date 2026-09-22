import express from 'express'
import { API_PORT } from '../../packages/common'

const app = express()
app.use(express.json())

console.log(API_PORT)

app.listen(API_PORT,()=>{
     console.log(`server is running on port ${API_PORT}`)
})