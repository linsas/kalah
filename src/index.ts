import { Server as SocketioServer } from 'socket.io'
import { getNorthPerspectivePayload, getSouthPerspectivePayload, getSpectatorPerspectivePayload, Payload } from './ClientPerspective.js'

import { KalahGame } from './KalahGame.js'

import { httpServer } from './KalahWebServer.js'

// the game

let south: string | null = null
let north: string | null = null

let game = new KalahGame()

const getPayload = (socketId: string): Payload => {
	if (socketId === south) {
		return getSouthPerspectivePayload(game)
	} else if (socketId === north) {
		return getNorthPerspectivePayload(game)
	} else {
		return getSpectatorPerspectivePayload(game)
	}
}

const updateClient = (clientId: string) => {
	const payload = getPayload(clientId)
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
		if (socket.id === south) {
			game.playSouth(vessel)
		} else if (socket.id === north) {
			const rotatedVessel = (game.numBins + 1 + vessel) % ((game.numBins + 1) * 2)
			game.playNorth(rotatedVessel)
		} else {
			return
		}

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
