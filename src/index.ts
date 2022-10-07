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

// the game

let south: string | null = null
let north: string | null = null

const ioServer = new SocketioServer(httpServer)

ioServer.on('connection', (socket) => {
	console.log(socket.id + ' connected')

	if (south == null) {
		south = socket.id
		console.log(socket.id + ' is south')
	} else if (north == null) {
		north = socket.id
		console.log(socket.id + ' is north')
	}

	socket.on('play', (vessel) => {
		if (socket.id !== north && socket.id !== south) {
			console.log(socket.id + ' is not a player')
			return
		}

		const isNorthPlayer = socket.id === north
		console.log((isNorthPlayer ? 'north' : 'south') + ' played ' + vessel)

		ioServer.emit('update', { vessel, isNorthPlayer })
	})

	socket.on('disconnect', () => {
		console.log(socket.id + ' disconnected')
		if (socket.id === north) north = null
		if (socket.id === south) south = null
	})
})
