const socket = io({
	autoConnect: false
})

const handleConnect = () => {
	if (socket.connected) return
	socket.connect()
}

const handleSend = () => {
	if (!socket.connected) return
	socket.emit('hello', 'world')
}

const handleDisconnect = () => {
	if (socket.disconnected) return
	socket.disconnect()
}

document.querySelector('button#connect').addEventListener('click', handleConnect)
document.querySelector('button#send').addEventListener('click', handleSend)
document.querySelector('button#disconnect').addEventListener('click', handleDisconnect)
