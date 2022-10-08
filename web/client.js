const numBins = 6

const socket = io({
	autoConnect: false
})

socket.on('connect', () => {
	document.querySelector('div#board').classList.add('connected')
})
socket.on('disconnect', () => {
	document.querySelector('div#board').classList.remove('connected')
})

const getVesselId = vessel => (vessel > numBins ? 'north' : 'south') + (vessel % (numBins + 1) === numBins ? 'Store' : ('Bin' + (vessel % (numBins + 1) + 1)))

socket.on('update', (gamestate) => {
	const vessels = document.querySelectorAll('div#board > div')
	vessels.forEach((node) => {
		node.classList.remove('turn')
		if (node.classList.contains(gamestate.isNorthTurn ? 'north' : 'south')) node.classList.add('turn')
	})

	for (let index = 0; index < gamestate.board.length; index++) {
		const stones = gamestate.board[index]
		const element = document.querySelector('div#' + getVesselId(index))
		element.innerText = stones
	}
})

const handleConnect = () => {
	if (socket.connected) return
	socket.connect()
}

const handleDisconnect = () => {
	if (socket.disconnected) return
	socket.disconnect()
}

document.querySelector('button#connect').addEventListener('click', handleConnect)
document.querySelector('button#disconnect').addEventListener('click', handleDisconnect)


const handleClickVessel = (vessel) => {
	if (socket.connected) {
		socket.emit('play', vessel)
	}
}

for (let index = 0; index < numBins; index++) {
	const southBin = document.querySelector('div#southBin' + (index + 1))
	const northBin = document.querySelector('div#northBin' + (index + 1))
	southBin.addEventListener('click', () => handleClickVessel(index))
	northBin.addEventListener('click', () => handleClickVessel(index + numBins + 1))
}
document.querySelector('div#southStore').addEventListener('click', () => handleClickVessel(numBins))
document.querySelector('div#northStore').addEventListener('click', () => handleClickVessel(numBins * 2 + 1))
