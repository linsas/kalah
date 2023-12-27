import { Server as SocketioServer } from 'socket.io'
import { KalahGame } from './KalahGame.js';
import { httpServerType } from './KalahWebServer.js';

interface ClientData {
	idleTimer: NodeJS.Timeout | null,
	disconnectTimer: NodeJS.Timeout | null,
}

enum ClientRole {
	SPECTATOR = 'spectator',
	SOUTH = 'south',
	NORTH = 'north',
}

interface Payload {
	role: ClientRole
	game: {
		board: Array<number>
		isSouthTurn: boolean
		isGameOver: boolean
		southScore: number
		northScore: number
	}
}

export function startKalahGameServer(httpServer: httpServerType) {
	let game: KalahGame = new KalahGame()
	let clients: Map<string, ClientData> = new Map()

	let south: string | null = null
	let north: string | null = null

	const ioServer = new SocketioServer(httpServer)

	const idleTimeoutMs: number | null = 5 * 60 * 1000
	const disconnectTimeoutMs: number | null = 15 * 60 * 1000

	function clearIdleTimer(socketId: string) {
		const client = clients.get(socketId)
		if (client == null) return
		if (client.idleTimer != null) clearTimeout(client.idleTimer)
	}

	function resetIdleTimer(socketId: string) {
		if (idleTimeoutMs == null) return
		const client = clients.get(socketId)
		if (client == null) return
		if (client.idleTimer != null) clearTimeout(client.idleTimer)
		client.idleTimer = setTimeout(() => {
			console.log('client moved to spectator %s', socketId)
			if (south === socketId) south = null
			if (north === socketId) north = null
			updateClient(socketId)
		}, idleTimeoutMs)
	}

	function resetDisconnectTimer(socketId: string) {
		if (disconnectTimeoutMs == null) return
		const client = clients.get(socketId)
		if (client == null) return
		if (client.disconnectTimer != null) clearTimeout(client.disconnectTimer)
		client.disconnectTimer = setTimeout(() => {
			console.log('client timeout %s', socketId)
			ioServer.to(socketId).disconnectSockets()
		}, disconnectTimeoutMs)
	}


	function getPayload(socketId: string): Payload {
		const [southScore, northScore] = game.getScores()
		const role = socketId === south ? ClientRole.SOUTH : socketId === north ? ClientRole.NORTH : ClientRole.SPECTATOR
		const payload = {
			role: role,
			game: {
				board: game.getBoard(),
				isSouthTurn: game.isSouthTurn(),
				isGameOver: game.isGameOver(),
				southScore,
				northScore,
			}
		}
		return payload
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
			idleTimer: null,
			disconnectTimer: null,
		})
		updateClient(socketId)
		resetDisconnectTimer(socketId)
		console.log(socketId + ' connected')
	}

	function onChangeRole(socketId: string, bePlayer: boolean) {
		if (bePlayer) {
			if (south === socketId) return
			if (north === socketId) return
			if (south === null) {
				south = socketId
				updateClient(socketId)
				resetIdleTimer(socketId)
				resetDisconnectTimer(socketId)
				return
			}
			if (north === null) {
				north = socketId
				updateClient(socketId)
				resetIdleTimer(socketId)
				resetDisconnectTimer(socketId)
				return
			}
			console.log('No player slots for ' + socketId)
		} else {
			// remove from actively playing
			if (socketId === south) {
				south = null
				updateClient(socketId)
				clearIdleTimer(socketId)
				resetDisconnectTimer(socketId)
				return
			}
			if (socketId === north) {
				north = null
				updateClient(socketId)
				clearIdleTimer(socketId)
				resetDisconnectTimer(socketId)
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
			setTimeout(() => {
				north = null
				south = null
				game.reset()
				updateAllClients()
			}, 10 * 1000)
		}

		resetIdleTimer(socketId)
		resetDisconnectTimer(socketId)
		updateAllClients()
	}

	function onDisconnect(socketId: string) {
		if (south === socketId) south = null
		if (north === socketId) north = null

		const client = clients.get(socketId)
		if (client == null) return
		if (client.idleTimer != null) clearTimeout(client.idleTimer)
		if (client.disconnectTimer != null) clearTimeout(client.disconnectTimer)

		clients.delete(socketId)
		console.log(socketId + ' disconnected')
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
