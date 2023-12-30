import { Server as SocketioServer } from 'socket.io'
import { Game, newGame, PreviousTurn } from './Game.js';
import { createTimer, Timer } from './Timer.js';
import { httpServerType } from './WebServer.js';

interface ClientData {
	disconnectTimer: Timer,
}

enum ClientRole {
	SPECTATOR = 'spectator',
	SOUTH = 'south',
	NORTH = 'north',
}

interface Payload {
	role: ClientRole
	spectators: number
	isSouthActive: boolean
	isNorthActive: boolean
	game: {
		board: Array<number>
		isSouthTurn: boolean
		isGameOver: boolean
		southScore: number
		northScore: number
		previousTurn: PreviousTurn | null
	}
}

const idleTimeoutMs = 5 * 60 * 1000
const gameTimeoutMs = 15 * 60 * 1000
const disconnectTimeoutMs = 30 * 60 * 1000

export function startGameServer(httpServer: httpServerType) {
	const game: Game = newGame()
	const clients: Map<string, ClientData> = new Map()

	let south: string | null = null
	let north: string | null = null

	const ioServer = new SocketioServer(httpServer)

	const idleTimer: Timer = createTimer(idleTimeoutMs, () => {
		let socketId: string | null
		if (game.isSouthTurn()) {
			socketId = south
			south = null
		} else {
			socketId = north
			north = null
		}
		if (socketId == null) return
		console.log('player moved to spectator: %s', socketId)
		updateAllClients()
	})

	const gameTimer: Timer = createTimer(gameTimeoutMs, () => {
		console.log('game timeout')
		north = null
		south = null
		game.reset()
		idleTimer.stop()
		updateAllClients()
	})


	function getPayload(socketId: string): Payload {
		const [southScore, northScore] = game.getScores()
		const role = socketId === south ? ClientRole.SOUTH : socketId === north ? ClientRole.NORTH : ClientRole.SPECTATOR
		const payload = {
			role: role,
			spectators: clients.size - (south != null ? 1 : 0) - (north != null ? 1 : 0),
			isSouthActive: south != null,
			isNorthActive: north != null,
			game: {
				board: game.getBoard(),
				isSouthTurn: game.isSouthTurn(),
				isGameOver: game.isGameOver(),
				southScore,
				northScore,
				previousTurn: game.getPreviousTurn(),
			}
		} as Payload
		return payload
	}

	function updateAllClients() {
		for (const socketId of clients.keys()) {
			const payload = getPayload(socketId)
			ioServer.to(socketId).emit('update', payload)
		}
	}


	function onConnect(socketId: string) {
		const disconnectTimer = createTimer(disconnectTimeoutMs, () => {
			console.log('client timeout %s', socketId)
			ioServer.to(socketId).disconnectSockets()
		})

		clients.set(socketId, {
			disconnectTimer: disconnectTimer,
		})

		disconnectTimer.restart()
		updateAllClients()
		console.log(socketId + ' connected')
	}

	function onChangeRole(socketId: string, bePlayer: boolean) {
		const client = clients.get(socketId)
		if (client == null) return

		if (bePlayer) {
			if (south === socketId) return
			if (north === socketId) return
			if (south === null) {
				south = socketId
				updateAllClients()
				client.disconnectTimer.restart()
				if (game.isSouthTurn()) idleTimer.restart()
				if (!gameTimer.isRunning()) gameTimer.restart()
				return
			}
			if (north === null) {
				north = socketId
				updateAllClients()
				client.disconnectTimer.restart()
				if (!game.isSouthTurn()) idleTimer.restart()
				if (!gameTimer.isRunning()) gameTimer.restart()
				return
			}
			console.log('No player slots for ' + socketId)
		} else {
			// remove from actively playing
			if (socketId === south) {
				south = null
				updateAllClients()
				client.disconnectTimer.restart()
				if (game.isSouthTurn()) idleTimer.stop()
				return
			}
			if (socketId === north) {
				north = null
				updateAllClients()
				client.disconnectTimer.restart()
				if (!game.isSouthTurn()) idleTimer.stop()
				return
			}
		}
	}

	function onPlay(socketId: string, vessel: number) {
		let role = socketId
		let hasPlayed = false

		if (game.isSouthTurn()) {
			if (socketId !== south) return
			role = 'South'
			hasPlayed = game.playSouth(vessel)
		} else {
			if (socketId !== north) return
			role = 'North'
			hasPlayed = game.playNorth(vessel)
		}

		if (!hasPlayed) return

		const [southScore, northScore] = game.getScores()
		console.log('%s played (%d); score is %d ; %d', role, vessel, southScore, northScore)

		if (game.isGameOver()) {
			const [southScore, northScore] = game.getScores()
			if (southScore > northScore) {
				console.log('south player wins!')
			} else if (southScore < northScore) {
				console.log('north player wins!')
			} else {
				console.log('it\'s a tie!')
			}
			gameTimer.stop()
			setTimeout(() => {
				north = null
				south = null
				game.reset()
				updateAllClients()
			}, 10 * 1000)
		}

		const client = clients.get(socketId)
		if (client != null) client.disconnectTimer.restart()

		updateAllClients()
		idleTimer.restart()
	}

	function onDisconnect(socketId: string) {
		console.log(socketId + ' disconnected')
		if (south === socketId) {
			south = null
			if (game.isSouthTurn()) idleTimer.stop()
		}
		if (north === socketId) {
			north = null
			if (!game.isSouthTurn()) idleTimer.stop()
		}

		const client = clients.get(socketId)
		if (client == null) return

		client.disconnectTimer.stop()

		clients.delete(socketId)
		updateAllClients()
	}


	ioServer.on('connection', (socket) => {
		onConnect(socket.id)
		socket.on('role', (bePlayer: boolean) => {
			onChangeRole(socket.id, bePlayer)
		})
		socket.on('play', (vessel: number) => {
			onPlay(socket.id, vessel)
		})
		socket.on('disconnect', () => {
			onDisconnect(socket.id)
		})
	})

	return
}
