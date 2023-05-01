import { KalahGame, KalahGameState } from "./KalahGame.js"

interface IPerspective {
	/** Get the payload for that client's perspective */
	getPayload(): Payload
}

interface IPlayer extends IPerspective {
	/** Act on the client's request to play a given vessel. */
	play(vessel: number): void
}

enum ClientRole {
	PLAYER = 'player',
	SPECTATOR = 'spectator',
}

interface Payload {
	board: Array<number>
	gameState: number
	role: ClientRole
}

class SouthPlayer implements IPlayer {
	private game: KalahGame
	constructor(game: KalahGame) {
		this.game = game
	}
	play(vessel: number) {
		this.game.playSouth(vessel)
	}
	getPayload() {
		const gameState = this.game.getGameState()

		const payload = {
			board: this.game.getBoard(),
			gameState: gameState,
			role: ClientRole.PLAYER,
		}

		return payload
	}
}

class NorthPlayer implements IPlayer {
	private game: KalahGame
	constructor(game: KalahGame) {
		this.game = game
	}
	private rotateVessel(vessel: number) {
		return (this.game.numBins + 1 + vessel) % ((this.game.numBins + 1) * 2)
	}
	play(vessel: number) {
		vessel = this.rotateVessel(vessel)
		this.game.playNorth(vessel)
	}
	getPayload() {
		const board = this.game.getBoard()
		const southSide = board.slice(0, this.game.numBins + 1)
		const northSide = board.slice(this.game.numBins + 1)

		const gameState = this.game.getGameState()
		let clientState = gameState
		if (gameState === KalahGameState.SOUTH_TURN) clientState = KalahGameState.NORTH_TURN
		else if (gameState === KalahGameState.NORTH_TURN) clientState = KalahGameState.SOUTH_TURN
		else if (gameState === KalahGameState.SOUTH_VICTORY) clientState = KalahGameState.NORTH_VICTORY
		else if (gameState === KalahGameState.NORTH_VICTORY) clientState = KalahGameState.SOUTH_VICTORY

		const payload = {
			board: northSide.concat(southSide),
			gameState: clientState,
			role: ClientRole.PLAYER,
		}

		return payload
	}
}

class Spectator implements IPerspective {
	private game: KalahGame
	constructor(game: KalahGame) {
		this.game = game
	}
	getPayload() {
		const payload = {
			board: this.game.getBoard(),
			gameState: this.game.getGameState(),
			role: ClientRole.SPECTATOR,
		}
		return payload
	}
}

export { IPerspective, IPlayer, SouthPlayer, NorthPlayer, Spectator }
