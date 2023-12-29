import { createHttpServer } from './WebServer.js'
import { startGameServer } from './GameServer.js'

const httpServer = createHttpServer()

const PORT = 9000
httpServer.listen(PORT, () => {
	console.log('Go to http://localhost:' + PORT)
})

startGameServer(httpServer)
