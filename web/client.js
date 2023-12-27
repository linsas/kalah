const numBins = 6
const stoneClasses = ['common', 'uncommon', 'rare', 'veryrare', 'ultrarare']

let previousRole = null

const socket = io({
	autoConnect: false,
	reconnection: false
})

const resetBoardStyles = () => {
	document.querySelector('div#board').classList.remove('offline', 'playerTurn', 'southTurn', 'northTurn', 'southVictory', 'northVictory', 'tie')
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

	const isPlayer = payload.role === 'player'

	document.querySelector('span#role').textContent = isPlayer ? 'You are playing.' : 'You are spectating.'
	document.querySelector('button#role').textContent = !isPlayer ? 'Play' : 'Spectate'

	if (!payload.isGameOver) {
		if (payload.isNorthTurn) {
			document.querySelector('div#board').classList.add('northTurn')
			document.querySelector('span#turn').textContent = isPlayer ? 'It is the opponent\'s turn.' : 'It is the north player\'s turn.'
		} else {
			document.querySelector('div#board').classList.add(isPlayer ? 'playerTurn' : 'southTurn')
			document.querySelector('span#turn').textContent = isPlayer ? 'It is your turn.' : 'It is the south player\'s turn.'
		}
	} else {
		if (payload.southScore > payload.northScore) {
			document.querySelector('div#board').classList.add('southVictory')
		} else if (payload.southScore < payload.northScore) {
			document.querySelector('div#board').classList.add('northVictory')
		} else {
			document.querySelector('div#board').classList.add('tie')
		}
		document.querySelector('span#turn').textContent = 'The game is over.'
	}

	const board = payload.board
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
	socket.emit('role', previousRole !== 'player')
}


const vessels = document.querySelectorAll('#board > .vessel')
for (let index = 0; index < vessels.length; index++) {
	vessels[index].addEventListener('click', () => handleClickVessel(index))
}

document.querySelector('button#connect').addEventListener('click', handleClickConnect)
document.querySelector('button#role').addEventListener('click', () => handleClickRole())
