import express from 'express'
import http from 'http'
import { Server as SocketioServer } from 'socket.io'
import KalahGame, { KalahGameState } from './KalahGame.js'

const websiteRoot = './web'

const expressApp = express()
const httpServer = http.createServer(expressApp)

expressApp.get('/', (_req, res) => {
	res.sendFile('/index.html', { root: websiteRoot })
})
expressApp.get('/client.js', (_req, res) => {
	res.sendFile('/client.js', { root: websiteRoot })
})
expressApp.get('/styles.css', (_req, res) => {
	res.sendFile('/styles.css', { root: websiteRoot })
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
	const gameState = game.getGameState()

	ioServer.to(clientId).emit('update', {
		board,
		gameState,
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

	socket.on('role', (bePlayer: boolean) => {
		if (bePlayer) {
			if (south == socket.id || north == socket.id) {
				console.log(socket.id + ' is already a player!')
				return
			}
			if (south == null) {
				south = socket.id
				console.log(socket.id + ' is now south')
				return
			}
			if (north == null) {
				north = socket.id
				console.log(socket.id + ' is now north')
				return
			}
			console.log('No player slots for ' + socket.id)
		} else { // remove from actively playing
			if (socket.id === south) {
				south = null
				console.log(socket.id + ' is no longer south')
			}
			if (socket.id === north) {
				north = null
				console.log(socket.id + ' is no longer north')
			}
		}
	})

	socket.on('play', (vessel) => {
		const gameState = game.getGameState()

		if (socket.id === south) {
			if (gameState !== KalahGameState.SOUTH_TURN) return
		} else if (socket.id === north) {
			if (gameState !== KalahGameState.NORTH_TURN) return
		} else {
			console.log(socket.id + ' is not a player')
			return
		}

		const isNorthPlayer = socket.id === north

		if (!game.getIsOwnVessel(isNorthPlayer, vessel)) return
		if (game.getStonesInVessel(vessel) === 0) return

		console.log((isNorthPlayer ? 'north' : 'south') + ' played ' + vessel)
		game.play(vessel)
		updateAllClients()
	})

	socket.on('reset', () => {
		console.log(socket.id + ' reset the game!')

		south = null
		north = null
		game = new KalahGame()
		updateAllClients()
	})

	socket.on('disconnect', () => {
		console.log(socket.id + ' disconnected')
		if (socket.id === south) south = null
		if (socket.id === north) north = null
	})
})
