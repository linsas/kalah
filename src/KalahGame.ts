class KalahGame {
	private board: number[]
	private isNorthTurn: boolean

	readonly numBins: number
	readonly maxVesselIndex: number

	constructor() {
		const numBins = 6
		const startingStones = 4

		this.maxVesselIndex = 2 * numBins + 1

		this.numBins = numBins
		this.isNorthTurn = false
		this.board = Array(this.maxVesselIndex + 1).fill(startingStones)
		this.board[this.numBins] = 0
		this.board[this.maxVesselIndex] = 0
	}

	/** Returns a copy of the game board */
	getBoard() {
		return this.board.slice()
	}

	/** Returns whether it is the north player's turn */
	getIsNorthTurn() {
		return this.isNorthTurn
	}

	/** Returns whether the vessel belongs to the north/south player */
	getIsOwnVessel(isNorthPlayer: boolean, vessel: number) {
		const ownStore = isNorthPlayer ? this.maxVesselIndex : this.numBins
		return vessel <= ownStore && vessel >= (ownStore - this.numBins)
	}

	/** Gets the number of stones in a vessel */
	getStonesInVessel(vessel: number) {
		if (vessel < 0) throw null
		if (vessel > this.maxVesselIndex) throw null
		return this.board[vessel]
	}

	/** Plays the given vessel index */
	play(vessel: number) {
		if (vessel < 0) throw null
		if (vessel > this.maxVesselIndex) throw null

		const isNorthPlaying = this.isNorthTurn

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
			this.isNorthTurn = !isNorthPlaying
		}
	}
}

export default KalahGame
