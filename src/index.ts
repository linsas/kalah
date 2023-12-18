import { createHttpServer } from './KalahWebServer.js'
import { startKalahGameServer } from './KalahGameServer.js'

const httpServer = createHttpServer()

const PORT = 9000
httpServer.listen(PORT, () => {
	console.log('Go to http://localhost:' + PORT)
})

startKalahGameServer(httpServer)
