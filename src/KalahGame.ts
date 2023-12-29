const numBinsDefault = 6
const startingStonesDefault = 4

enum TurnType {
	NORMAL = 'normal',
	FREETURN = 'freeturn',
	CAPTURE = 'capture',
}

export interface PreviousTurn {
	isSouthTurn: boolean
	startVessel: number
	endVessel: number
	type: TurnType
}

export interface Game {
	getBoard: () => number[],
	isGameOver: () => boolean,
	getPreviousTurn: () => PreviousTurn | null,
	isSouthTurn: () => boolean,
	getScores: () => number[],
	playSouth: (vessel: number) => boolean,
	playNorth: (vessel: number) => boolean,
	reset: () => void,
}

export function newGame(): Game {
	let southTurn: boolean = true
	let gameOver: boolean = false

	let previousTurn: PreviousTurn | null = null

	const numBins: number = numBinsDefault
	const maxVesselIndex: number = 2 * numBins + 1

	let board: number[] = Array(maxVesselIndex + 1).fill(startingStonesDefault)
	board[numBins] = 0
	board[maxVesselIndex] = 0

	/** Returns a representation of the game board */
	function getBoard(): number[] {
		return board.slice()
	}

	/** Returns whether the game is over */
	function isGameOver(): boolean {
		return gameOver
	}

	/** Returns information about the previous turn */
	function getPreviousTurn(): PreviousTurn | null {
		if (previousTurn == null) return null
		return { ...previousTurn }
	}

	/** Returns whether it is the south player's turn */
	function isSouthTurn(): boolean {
		return southTurn
	}

	/** Returns the number of stones in each players' vessels */
	function getScores(): number[] {
		let southScore = 0
		let northScore = 0
		for (let index = 0; index < board.length; index++) {
			const numStones = board[index]
			if (index <= numBins) {
				southScore += numStones
			} else {
				northScore += numStones
			}
		}

		return [southScore, northScore]
	}

	/** Gets the number of stones in a vessel */
	function getStonesInVessel(vessel: number): number {
		if (vessel < 0) throw null
		if (vessel > maxVesselIndex) throw null
		return board[vessel]
	}

	function play(vessel: number): void {
		if (vessel < 0) throw null
		if (vessel > maxVesselIndex) throw null

		const startVessel = vessel
		let turnType = TurnType.NORMAL

		const ownStore = southTurn ? numBins : maxVesselIndex
		const opponentStore = southTurn ? maxVesselIndex : numBins

		let hand = board[vessel]
		board[vessel] = 0
		while (hand > 0) {
			vessel++
			if (vessel === opponentStore) vessel++
			if (vessel > maxVesselIndex) vessel = 0

			board[vessel] += 1
			hand--
		}

		const isSelfOwnedBin = vessel < ownStore && vessel >= (ownStore - numBins)
		if (board[vessel] === 1 && isSelfOwnedBin) {
			const oppositeBin = 2 * numBins - vessel
			board[ownStore] += board[oppositeBin] + 1
			board[vessel] = 0
			board[oppositeBin] = 0
			turnType = TurnType.CAPTURE
		}

		if (vessel !== ownStore) {
			southTurn = !southTurn
		} else {
			turnType = TurnType.FREETURN
		}

		previousTurn = {
			isSouthTurn: southTurn,
			startVessel,
			endVessel: vessel,
			type: turnType,
		}

		checkForVictory()
	}

	function playSouth(vessel: number): boolean {
		if (gameOver) return false
		if (!southTurn) return false
		if (vessel > numBins) return false
		if (getStonesInVessel(vessel) === 0) return false

		play(vessel)
		return true
	}

	function playNorth(vessel: number): boolean {
		if (gameOver) return false
		if (southTurn) return false
		if (vessel <= numBins) return false
		if (getStonesInVessel(vessel) === 0) return false

		play(vessel)
		return true
	}

	function checkForVictory(): void {
		let southClear = true
		let northClear = true
		for (let index = 0; index < board.length; index++) {
			const numStones = board[index]
			if (index <= numBins) {
				// south side
				if (numStones > 0 && index !== numBins) {
					southClear = false
				}
			} else {
				// north side
				if (numStones > 0 && index !== maxVesselIndex) {
					northClear = false
				}
			}
		}

		if (southClear || northClear) {
			gameOver = true
		}
	}

	function reset(): void {
		southTurn = true
		gameOver = false
		previousTurn = null

		board = Array(maxVesselIndex + 1).fill(startingStonesDefault)
		board[numBins] = 0
		board[maxVesselIndex] = 0
	}

	const game = {
		getBoard,
		isGameOver,
		getPreviousTurn,
		isSouthTurn,
		getScores,
		playSouth,
		playNorth,
		reset,
	} as Game

	return game
}
