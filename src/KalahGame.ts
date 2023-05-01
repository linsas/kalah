enum KalahGameState {
	SOUTH_TURN = 0,
	NORTH_TURN = 1,
	SOUTH_VICTORY = 2,
	NORTH_VICTORY = 3,
	TIE = 4,
	GAME_OVER = 5,
}

class KalahGame {
	private board: number[]
	private gameState: KalahGameState

	readonly numBins: number
	readonly maxVesselIndex: number

	constructor() {
		const numBins = 6
		const startingStones = 4

		this.maxVesselIndex = 2 * numBins + 1

		this.numBins = numBins
		this.gameState = KalahGameState.SOUTH_TURN
		this.board = Array(this.maxVesselIndex + 1).fill(startingStones)
		this.board[this.numBins] = 0
		this.board[this.maxVesselIndex] = 0
	}

	/** Returns a representation of the game board */
	getBoard() {
		return this.board.slice()
	}

	/** Returns the state of the game (@see KalahGameState) */
	getGameState() {
		return this.gameState
	}

	/** Gets the number of stones in a vessel */
	getStonesInVessel(vessel: number) {
		if (vessel < 0) throw null
		if (vessel > this.maxVesselIndex) throw null
		return this.board[vessel]
	}

	private play(vessel: number) {
		if (vessel < 0) throw null
		if (vessel > this.maxVesselIndex) throw null

		const isNorthPlaying = this.gameState === KalahGameState.NORTH_TURN

		const ownStore = isNorthPlaying ? this.maxVesselIndex : this.numBins
		const opponentStore = isNorthPlaying ? this.numBins : this.maxVesselIndex

		let hand = this.board[vessel]
		this.board[vessel] = 0
		while (hand > 0) {
			vessel++
			if (vessel === opponentStore) vessel++
			if (vessel > this.maxVesselIndex) vessel = 0

			this.board[vessel] += 1
			hand--
		}

		const isSelfOwnedBin = vessel < ownStore && vessel >= (ownStore - this.numBins)
		if (this.board[vessel] === 1 && isSelfOwnedBin) {
			const oppositeBin = 2 * this.numBins - vessel
			this.board[ownStore] += this.board[oppositeBin] + 1
			this.board[vessel] = 0
			this.board[oppositeBin] = 0
		}

		if (vessel !== ownStore) {
			this.gameState = isNorthPlaying ? KalahGameState.SOUTH_TURN : KalahGameState.NORTH_TURN
		} else {
			this.gameState = isNorthPlaying ? KalahGameState.NORTH_TURN : KalahGameState.SOUTH_TURN
		}

		this.checkForVictory()
	}

	playSouth(vessel: number) {
		if (this.getGameState() !== KalahGameState.SOUTH_TURN) return
		if (vessel > this.numBins) return
		if (this.getStonesInVessel(vessel) === 0) return
		this.play(vessel)
	}
	playNorth(vessel: number) {
		if (this.getGameState() !== KalahGameState.NORTH_TURN) return
		if (vessel <= this.numBins) return
		if (this.getStonesInVessel(vessel) === 0) return
		this.play(vessel)
	}

	private checkForVictory() {
		let southScore = 0
		let northScore = 0
		let southClear = true
		let northClear = true
		for (let index = 0; index < this.board.length; index++) {
			const numStones = this.board[index]
			if (index <= this.numBins) {
				// south side
				southScore += numStones
				if (numStones > 0 && index !== this.numBins) {
					southClear = false
				}
			} else {
				// north side
				northScore += numStones
				if (numStones > 0 && index !== this.maxVesselIndex) {
					northClear = false
				}
			}
		}

		if (southClear || northClear) {
			if (southScore > northScore) {
				this.gameState = KalahGameState.SOUTH_VICTORY
			} else if (northScore > southScore) {
				this.gameState = KalahGameState.NORTH_VICTORY
			} else {
				this.gameState = KalahGameState.TIE
			}
		}
	}
}

export { KalahGame, KalahGameState }
