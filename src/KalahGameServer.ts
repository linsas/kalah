import { Server as SocketioServer } from 'socket.io'
import { getNorthPerspectivePayload, getNorthPerspectiveVessel, getSouthPerspectivePayload, getSouthPerspectiveVessel, getSpectatorPerspectivePayload, Payload } from './ClientPerspective.js';
import { KalahGame } from './KalahGame.js';
import { httpServerType } from './KalahWebServer.js';

interface ClientData {
	timeJoined: Date,
	timeLastAction: Date,
}

export function startKalahGameServer(httpServer: httpServerType) {
	let game: KalahGame = new KalahGame()
	let clients: Map<string, ClientData> = new Map()

	let south: string | null = null
	let north: string | null = null

	const ioServer = new SocketioServer(httpServer)

	function getPayload(socketId: string): Payload {
		if (socketId === south) {
			return getSouthPerspectivePayload(game)
		} else if (socketId === north) {
			return getNorthPerspectivePayload(game)
		} else {
			return getSpectatorPerspectivePayload(game)
		}
	}

	function updateClient(socketId: string) {
		const payload = getPayload(socketId)
		ioServer.to(socketId).emit('update', payload)
	}

	function updateAllClients() {
		for (const socketId of clients.keys()) {
			updateClient(socketId)
		}
	}


	function onConnect(socketId: string) {
		clients.set(socketId, {
			timeJoined: new Date,
			timeLastAction: new Date,
		})
		updateClient(socketId)
	}

	function onChangeRole(socketId: string, bePlayer: boolean) {
		if (bePlayer) {
			if (south === socketId) return
			if (north === socketId) return
			if (south === null) {
				south = socketId
				updateClient(socketId)
				return
			}
			if (north === null) {
				north = socketId
				updateClient(socketId)
				return
			}
			console.log('No player slots for ' + socketId)
		} else {
			// remove from actively playing
			if (socketId === south) {
				south = null
				updateClient(socketId)
				return
			}
			if (socketId === north) {
				north = null
				updateClient(socketId)
				return
			}
		}
	}

	function onPlay(socketId: string, vessel: number) {
		if (socketId !== south && socketId !== north) return

		if (socketId === south) {
			game.playSouth(getSouthPerspectiveVessel(vessel, game))
		} else if (socketId === north) {
			game.playNorth(getNorthPerspectiveVessel(vessel, game))
		}

		if (game.isGameOver()) {
			const [southScore, northScore] = game.getScores()
			if (southScore > northScore)
				console.log('south player wins!')
			else if (southScore < northScore)
				console.log('north player wins!')
			else if (southScore === northScore)
				console.log('it\'s a tie!')
			else
				console.log('game over (unspecified outcome)')
		}

		updateAllClients()
	}

	function onReset(socketId: string) {
		console.log(socketId + ' reset the game!')
		game = new KalahGame()
		updateAllClients()
	}

	function onDisconnect(socketId: string) {
		if (south === socketId) south = null
		if (north === socketId) north = null
		clients.delete(socketId)
	}


	ioServer.on('connection', (socket) => {
		onConnect(socket.id)
		socket.on('role', (bePlayer: boolean) => {
			onChangeRole(socket.id, bePlayer)
		})
		socket.on('play', (vessel: number) => {
			onPlay(socket.id, vessel)
		})
		socket.on('reset', () => {
			onReset(socket.id)
		})
		socket.on('disconnect', () => {
			onDisconnect(socket.id)
		})
	})

	return
}
