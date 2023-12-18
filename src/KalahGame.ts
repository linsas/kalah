class KalahGame {
	private board: number[]
	private northTurn: boolean
	private gameOver: boolean

	readonly numBins: number
	readonly maxVesselIndex: number

	constructor() {
		const numBins = 6
		const startingStones = 4

		this.maxVesselIndex = 2 * numBins + 1

		this.numBins = numBins
		this.northTurn = false
		this.gameOver = false
		this.board = Array(this.maxVesselIndex + 1).fill(startingStones)
		this.board[this.numBins] = 0
		this.board[this.maxVesselIndex] = 0
	}

	/** Returns a representation of the game board */
	getBoard() {
		return this.board.slice()
	}

	/** Returns whether the game is over */
	isGameOver(): boolean {
		return this.gameOver
	}

	/** Returns whether it is the north player's turn */
	isNorthTurn(): boolean {
		return this.northTurn
	}

	/** Returns the number of stones in each players' vessels */
	getScores() {
		let southScore = 0
		let northScore = 0
		for (let index = 0; index < this.board.length; index++) {
			const numStones = this.board[index]
			if (index <= this.numBins) {
				southScore += numStones
			} else {
				northScore += numStones
			}
		}

		return [southScore, northScore]
	}

	/** Gets the number of stones in a vessel */
	private getStonesInVessel(vessel: number) {
		if (vessel < 0) throw null
		if (vessel > this.maxVesselIndex) throw null
		return this.board[vessel]
	}

	private play(vessel: number) {
		if (vessel < 0) throw null
		if (vessel > this.maxVesselIndex) throw null

		const ownStore = this.northTurn ? this.maxVesselIndex : this.numBins
		const opponentStore = this.northTurn ? this.numBins : this.maxVesselIndex

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
			this.northTurn = !this.northTurn
		}

		this.checkForVictory()
	}

	playSouth(vessel: number) {
		if (this.gameOver) return
		if (this.northTurn) return
		if (vessel > this.numBins) return
		if (this.getStonesInVessel(vessel) === 0) return
		this.play(vessel)
	}
	playNorth(vessel: number) {
		if (this.gameOver) return
		if (!this.northTurn) return
		if (vessel <= this.numBins) return
		if (this.getStonesInVessel(vessel) === 0) return
		this.play(vessel)
	}

	private checkForVictory() {
		let southClear = true
		let northClear = true
		for (let index = 0; index < this.board.length; index++) {
			const numStones = this.board[index]
			if (index <= this.numBins) {
				// south side
				if (numStones > 0 && index !== this.numBins) {
					southClear = false
				}
			} else {
				// north side
				if (numStones > 0 && index !== this.maxVesselIndex) {
					northClear = false
				}
			}
		}

		if (southClear || northClear) {
			this.gameOver = true
		}
	}
}

export { KalahGame }
