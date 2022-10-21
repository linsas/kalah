import { KalahGame, KalahGameState } from "./KalahGame.js"

interface IClient {
	/** Act on the client's request to play a given vessel. */
	play(vessel: number): void

	/** Get the payload for that client's perspective */
	getPayload(): any
}

class SouthPlayer implements IClient {
	private game: KalahGame
	constructor(game: KalahGame) {
		this.game = game
	}
	play(vessel: number) {
		if (this.game.getGameState() !== KalahGameState.SOUTH_TURN) return
		if (vessel > this.game.numBins) return
		if (this.game.getStonesInVessel(vessel) === 0) return

		this.game.play(vessel)
	}
	getPayload() {
		const gameState = this.game.getGameState()

		const payload = {
			board: this.game.getBoard(),
			gameState: gameState,
			role: 'player',
		}

		return payload
	}
}

class NorthPlayer implements IClient {
	private game: KalahGame
	constructor(game: KalahGame) {
		this.game = game
	}
	rotateVessel(vessel: number) {
		return (this.game.numBins + 1 + vessel) % ((this.game.numBins + 1) * 2)
	}
	play(vessel: number) {
		if (this.game.getGameState() !== KalahGameState.NORTH_TURN) return
		vessel = this.rotateVessel(vessel)
		if (vessel <= this.game.numBins) return
		if (this.game.getStonesInVessel(vessel) === 0) return

		this.game.play(vessel)
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
			role: 'player',
		}

		return payload
	}
}

class Spectator implements IClient {
	private game: KalahGame
	constructor(game: KalahGame) {
		this.game = game
	}
	play(_vessel: number) {
		return
	}
	getPayload() {
		const payload = {
			board: this.game.getBoard(),
			gameState: this.game.getGameState(),
			role: 'spectator',
		}
		return payload
	}
}

export { IClient, SouthPlayer, NorthPlayer, Spectator }
