import express from 'express'
import http from 'http'
import { Server as SocketioServer } from 'socket.io'
import KalahGame from './KalahGame.js'

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

let game = new KalahGame()

const updateClient = (clientId: string) => {
	const board = game.getBoard()
	const isNorthTurn = game.getIsNorthTurn()

	ioServer.to(clientId).emit('update', {
		board,
		isNorthTurn,
	})
}

const updateAllClients = async () => {
	const clients = await ioServer.fetchSockets()
	for (const client of clients) {
		updateClient(client.id)
	}
}

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

	updateClient(socket.id)

	socket.on('play', (vessel) => {
		if (socket.id !== north && socket.id !== south) {
			console.log(socket.id + ' is not a player')
			return
		}

		const isNorthPlayer = socket.id === north

		if (game.getIsNorthTurn() !== isNorthPlayer) return
		if (!game.getIsOwnVessel(isNorthPlayer, vessel)) return
		if (game.getStonesInVessel(vessel) === 0) return

		console.log((isNorthPlayer ? 'north' : 'south') + ' played ' + vessel)
		game.play(vessel)
		updateAllClients()
	})

	socket.on('disconnect', () => {
		console.log(socket.id + ' disconnected')
		if (socket.id === north) north = null
		if (socket.id === south) south = null
	})
})
