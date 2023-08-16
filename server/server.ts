import express from 'express'
import path from 'path'
import spotifyAuth from './routes/spotifyAuth'

const server = express()

server.use(express.json())
server.use(express.static(path.join(__dirname, 'public')))

server.use('/api/v1/', spotifyAuth)

export default server
