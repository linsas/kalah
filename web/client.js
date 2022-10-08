const numBins = 6

const socket = io({
	autoConnect: false
})

socket.on('connect', () => {
	document.querySelector('div#board').classList.remove('offline')
})
socket.on('disconnect', () => {
	document.querySelector('div#board').classList.remove('southTurn', 'northTurn', 'southVictory', 'northVictory', 'tie')
	document.querySelector('div#board').classList.add('offline')
})

socket.on('update', (payload) => {
	const state = payload.gameState

	document.querySelector('div#board').classList.remove('southTurn', 'northTurn', 'southVictory', 'northVictory', 'tie')
	if (state === 0) document.querySelector('div#board').classList.add('southTurn')
	if (state === 1) document.querySelector('div#board').classList.add('northTurn')
	if (state === 2) document.querySelector('div#board').classList.add('southVictory')
	if (state === 3) document.querySelector('div#board').classList.add('northVictory')
	if (state === 4) document.querySelector('div#board').classList.add('tie')

	const board = payload.board
	for (let index = 0; index < board.length; index++) {
		const vessel = document.querySelectorAll('.vessel')[index]

		const label = vessel.querySelector('label')
		label.textContent = board[index]

		const stones = vessel.querySelectorAll('div.stone')
		if (stones.length != board[index]) {
			stones.forEach(e => e.remove())
			for (let j = 0; j < board[index]; j++) {
				const node = document.createElement('div');
				node.className = 'white stone'
				vessel.append(node)
			}
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
