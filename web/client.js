const numBins = 6

const socket = io({
	autoConnect: false
})

socket.on('connect', () => {
	document.querySelector('div#board').classList.remove('offline')
})
socket.on('disconnect', () => {
	document.querySelector('div#board').classList.remove('southTurn', 'northTurn')
	document.querySelector('div#board').classList.add('offline')
})

socket.on('update', (gamestate) => {
	document.querySelector('div#board').classList.remove('southTurn', 'northTurn')
	document.querySelector('div#board').classList.add(gamestate.isNorthTurn ? 'northTurn' : 'southTurn')

	const labelElements = document.querySelectorAll('.vessel > label')
	for (let vessel = 0; vessel < gamestate.board.length; vessel++) {
		labelElements[vessel].textContent = gamestate.board[vessel]
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
