import express from 'express'
import http from 'http'
import { Server as SocketioServer } from 'socket.io'

const websiteRoot = './web'

const expressApp = express()
const httpServer = http.createServer(expressApp)

expressApp.get('/', (_req, res) => {
	res.sendFile('/index.html', { root: websiteRoot })
})
expressApp.get('/client.js', (_req, res) => {
	res.sendFile('/client.js', { root: websiteRoot })
})

const PORT = 9000

httpServer.listen(PORT, () => {
	console.log('Go to http://localhost:' + PORT)
})

const ioServer = new SocketioServer(httpServer)

ioServer.on('connection', (socket) => {
	console.log(socket.id + ' connected')

	socket.on('disconnect', () => {
		console.log(socket.id + ' disconnected')
	})
})
