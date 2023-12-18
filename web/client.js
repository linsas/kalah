const numBins = 6
const stoneClasses = ['common', 'uncommon', 'rare', 'veryrare', 'ultrarare']

const socket = io({
	autoConnect: false,
	reconnection: false
})

const resetBoardStyles = () => {
	document.querySelector('div#board').classList.remove('offline', 'playerTurn', 'southTurn', 'northTurn', 'southVictory', 'northVictory', 'tie')
}

socket.on('connect', () => {
	document.querySelector('div#board').classList.remove('offline')
})
socket.on('disconnect', () => {
	resetBoardStyles()
	document.querySelector('div#board').classList.add('offline')
})

socket.on('update', (payload) => {

	resetBoardStyles()

	const isPlayer = payload.role === 'player'
	// document.querySelector('div#board').classList.add(isPlayer ? 'player' : 'spectator')

	if (!payload.isGameOver) {

		if (payload.isNorthTurn)
			document.querySelector('div#board').classList.add('northTurn')
		else
			document.querySelector('div#board').classList.add(isPlayer ? 'playerTurn' : 'southTurn')

	} else {
		if (payload.southScore > payload.northScore) document.querySelector('div#board').classList.add('southVictory')
		else if (payload.southScore < payload.northScore) document.querySelector('div#board').classList.add('northVictory')
		else if (payload.southScore === payload.northScore) document.querySelector('div#board').classList.add('tie')
	}

	const board = payload.board
	const vessels = document.querySelectorAll('.vessel')
	for (let index = 0; index < board.length; index++) {
		const vessel = vessels[index]

		const label = vessel.querySelector('label')
		label.textContent = board[index]

		const stones = vessel.querySelectorAll('div.stone')
		if (stones.length == board[index]) continue

		stones.forEach(e => e.remove())
		for (let j = 0; j < board[index]; j++) {
			const node = document.createElement('div')
			const colorIndex = Math.floor(Math.random() ** 1.5 * 5)
			node.className = stoneClasses[colorIndex] + ' stone'
			vessel.append(node)
		}
	}
})

const handleClickVessel = (vessel) => {
	socket.emit('play', vessel)
}

const handleConnect = () => {
	socket.connect()
}

const handleDisconnect = () => {
	socket.disconnect()
}

const handleClickRole = (bePlayer) => {
	socket.emit('role', bePlayer)
}

const handleClickReset = () => {
	socket.emit('reset')
}


const vessels = document.querySelectorAll('#board > .vessel')
for (let index = 0; index < vessels.length; index++) {
	vessels[index].addEventListener('click', () => handleClickVessel(index))
}

document.querySelector('button#connect').addEventListener('click', handleConnect)
document.querySelector('button#disconnect').addEventListener('click', handleDisconnect)
document.querySelector('button#play').addEventListener('click', () => handleClickRole(true))
document.querySelector('button#spectate').addEventListener('click', () => handleClickRole(false))
document.querySelector('button#reset').addEventListener('click', handleClickReset)
