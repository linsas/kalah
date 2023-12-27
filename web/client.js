const numBins = 6
const stoneClasses = ['common', 'uncommon', 'rare', 'veryrare', 'ultrarare']

let previousRole = null

const socket = io({
	autoConnect: false,
	reconnection: false
})

const resetBoardStyles = () => {
	document.querySelector('div#board').classList.remove('offline', 'playerTurn', 'southTurn', 'northTurn', 'southVictory', 'northVictory', 'tie')
	document.querySelectorAll('.vessel').forEach(v => v.classList.remove('previous', 'capture', 'freeturn'))
}

socket.on('connect', () => {
	document.querySelector('div#board').classList.remove('offline')
	document.querySelector('button#connect').disabled = false
	document.querySelector('button#connect').textContent = 'Disconnect'
	document.querySelector('button#role').disabled = false
})
socket.on('connect_error', (error) => {
	// console.log(error)
	document.querySelector('button#connect').disabled = false
	document.querySelector('button#connect').textContent = 'Connect'
})
socket.on('disconnect', () => {
	previousRole = null
	resetBoardStyles()
	document.querySelector('div#board').classList.add('offline')
	document.querySelector('span#role').textContent = 'You are not connected.'
	document.querySelector('span#turn').textContent = ''
	document.querySelector('button#connect').disabled = false
	document.querySelector('button#connect').textContent = 'Connect'
	document.querySelector('button#role').textContent = 'Play'
	document.querySelector('button#role').disabled = true
})

socket.on('update', (payload) => {
	// console.log(payload)

	resetBoardStyles()

	const isPlayer = payload.role === 'south' || payload.role === 'north'

	document.querySelector('span#role').textContent = payload.role === 'south' ? 'You are south.' : payload.role === 'north' ? 'You are north.' : `You are spectating. The score is ${payload.game.southScore}:${payload.game.northScore}`
	document.querySelector('button#role').textContent = !isPlayer ? 'Play' : 'Spectate'

	if (!payload.game.isGameOver) {

		const isPlayerTurn = payload.role === (payload.game.isSouthTurn ? 'south' : 'north')
		if (isPlayerTurn) {
			document.querySelector('div#board').classList.add('playerTurn')
		}

		if (isPlayer) {
			document.querySelector('span#turn').textContent = isPlayerTurn ? 'It is your turn.' : 'It is the opponent\'s turn.'
		} else {
			document.querySelector('span#turn').textContent = payload.game.isSouthTurn ? 'It is the south player\'s turn.' : 'It is the north player\'s turn.'
		}

		if (payload.game.isSouthTurn) {
			document.querySelector('div#board').classList.add('southTurn')
		} else {
			document.querySelector('div#board').classList.add('northTurn')
		}

	} else {
		if (payload.game.southScore > payload.game.northScore) {
			document.querySelector('div#board').classList.add('southVictory')
			document.querySelector('span#turn').textContent = 'The south player has won.'
		} else if (payload.game.southScore < payload.game.northScore) {
			document.querySelector('div#board').classList.add('northVictory')
			document.querySelector('span#turn').textContent = 'The north player has won.'
		} else {
			document.querySelector('div#board').classList.add('tie')
			document.querySelector('span#turn').textContent = 'The game is a tie.'
		}
	}

	const board = payload.game.board
	const vessels = document.querySelectorAll('.vessel')
	for (let index = 0; index < board.length; index++) {
		const vessel = vessels[index]

		const label = vessel.querySelector('label')
		label.textContent = board[index]

		const stones = vessel.querySelectorAll('div.stone')

		if (previousRole === payload.role && stones.length == board[index]) continue

		stones.forEach(e => e.remove())
		for (let j = 0; j < board[index]; j++) {
			const node = document.createElement('div')
			const colorIndex = Math.floor(Math.random() ** 1.5 * 5)
			node.className = stoneClasses[colorIndex] + ' stone'
			vessel.append(node)
		}
	}

	const previousTurn = payload.game.previousTurn
	if (previousTurn != null) {
		const vessels = document.querySelectorAll('#board > .vessel')
		const startVessel = vessels[previousTurn.startVessel]
		const endVessel = vessels[previousTurn.endVessel]

		startVessel.classList.add('previous')
		if (previousTurn.endVessel === 6 || previousTurn.endVessel === 13)
			endVessel.classList.add('freeturn')
		else if (board[previousTurn.endVessel] === 0)
			endVessel.classList.add('capture')
	}

	previousRole = payload.role
})

const handleClickVessel = (vessel) => {
	socket.emit('play', vessel)
}

const handleClickConnect = () => {
	document.querySelector('button#connect').disabled = true
	if (socket.disconnected) {
		document.querySelector('button#connect').textContent = 'Connecting...'
		socket.connect()
	} else {
		document.querySelector('button#connect').textContent = 'Disconnecting...'
		socket.disconnect()
	}
}

const handleClickRole = () => {
	socket.emit('role', !(previousRole === 'south' || previousRole === 'north'))
}


const vessels = document.querySelectorAll('#board > .vessel')
for (let index = 0; index < vessels.length; index++) {
	vessels[index].addEventListener('click', () => handleClickVessel(index))
}

document.querySelector('button#connect').addEventListener('click', handleClickConnect)
document.querySelector('button#role').addEventListener('click', () => handleClickRole())
