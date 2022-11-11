import express from 'express'
import http from 'http'
import { Server as SocketioServer } from 'socket.io'

import { IClient, NorthPlayer, SouthPlayer, Spectator } from './Client.js'
import { KalahGame } from './KalahGame.js'

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

let southClient = new SouthPlayer(game)
let northClient = new NorthPlayer(game)
let spectatorClient = new Spectator(game)

const getClientProxy = (socketId: string): IClient => {
	if (socketId === south) {
		return southClient
	} else if (socketId === north) {
		return northClient
	}
	return spectatorClient
}

const updateClient = (clientId: string) => {
	const playerProxy = getClientProxy(clientId)
	const payload = playerProxy.getPayload()
	ioServer.to(clientId).emit('update', payload)
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
			if (south == socket.id) {
				console.log(socket.id + ' is already south!')
				return
			}
			if (north == socket.id) {
				console.log(socket.id + ' is already north!')
				return
			}
			if (south == null) {
				south = socket.id
				console.log(socket.id + ' is now south')
				updateClient(socket.id)
				return
			}
			if (north == null) {
				north = socket.id
				console.log(socket.id + ' is now north')
				updateClient(socket.id)
				return
			}
			console.log('No player slots for ' + socket.id)
		} else {
			// remove from actively playing
			if (socket.id === south) {
				south = null
				console.log(socket.id + ' is no longer south')
				updateClient(socket.id)
				return
			}
			if (socket.id === north) {
				north = null
				console.log(socket.id + ' is no longer north')
				updateClient(socket.id)
				return
			}
		}
	})

	socket.on('play', (vessel) => {
		const player = getClientProxy(socket.id)
		player.play(vessel)

		updateAllClients()
	})

	socket.on('reset', () => {
		console.log(socket.id + ' reset the game!')

		south = null
		north = null
		game = new KalahGame()
		southClient = new SouthPlayer(game)
		northClient = new NorthPlayer(game)
		spectatorClient = new Spectator(game)
		updateAllClients()
	})

	socket.on('disconnect', () => {
		console.log(socket.id + ' disconnected')
		if (socket.id === south) south = null
		if (socket.id === north) north = null
	})
})
