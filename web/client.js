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
