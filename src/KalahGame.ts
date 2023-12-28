const numBins = 6
const startingStones = 4

export enum TurnType {
	NORMAL = 'normal',
	FREETURN = 'freeturn',
	CAPTURE = 'capture',
}

export class KalahGame {
	private board: number[]
	private southTurn: boolean
	private gameOver: boolean
	private previousTurn: {
		isSouthTurn: boolean
		startVessel: number
		endVessel: number
		type: TurnType
	} | null

	readonly numBins: number
	readonly maxVesselIndex: number

	constructor() {
		this.numBins = numBins
		this.maxVesselIndex = 2 * numBins + 1

		this.southTurn = true
		this.gameOver = false
		this.previousTurn = null

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

	/** Returns information about the previous turn */
	getPreviousTurn() {
		if (this.previousTurn == null) return null
		return { ...this.previousTurn }
	}

	/** Returns whether it is the south player's turn */
	isSouthTurn(): boolean {
		return this.southTurn
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

		const startVessel = vessel
		let turnType = TurnType.NORMAL

		const ownStore = this.southTurn ? this.numBins : this.maxVesselIndex
		const opponentStore = this.southTurn ? this.maxVesselIndex : this.numBins

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
			turnType = TurnType.CAPTURE
		}

		if (vessel !== ownStore) {
			this.southTurn = !this.southTurn
		} else {
			turnType = TurnType.FREETURN
		}

		this.previousTurn = {
			isSouthTurn: this.southTurn,
			startVessel,
			endVessel: vessel,
			type: turnType,
		}

		this.checkForVictory()
	}

	playSouth(vessel: number) {
		if (this.gameOver) return false
		if (!this.southTurn) return false
		if (vessel > this.numBins) return false
		if (this.getStonesInVessel(vessel) === 0) return false

		this.play(vessel)
		return true
	}
	playNorth(vessel: number) {
		if (this.gameOver) return false
		if (this.southTurn) return false
		if (vessel <= this.numBins) return false
		if (this.getStonesInVessel(vessel) === 0) return false

		this.play(vessel)
		return true
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

	reset() {
		this.southTurn = true
		this.gameOver = false
		this.previousTurn = null

		this.board = Array(this.maxVesselIndex + 1).fill(startingStones)
		this.board[this.numBins] = 0
		this.board[this.maxVesselIndex] = 0
	}
}
