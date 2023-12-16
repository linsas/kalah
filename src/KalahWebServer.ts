import express from 'express'
import http from 'http'

const websiteRoot = './web'

const expressApp = express()
const httpServer = http.createServer(expressApp)

expressApp.get('/', (_req, res) => {
	res.sendFile('/index.html', { root: websiteRoot })
})
expressApp.get('/client.js', (_req, res) => {
	res.sendFile('/client.js', { root: websiteRoot })
})
expressApp.get('/styles.css', (_req, res) => {
	res.sendFile('/styles.css', { root: websiteRoot })
})

const PORT = 9000

httpServer.listen(PORT, () => {
	console.log('Go to http://localhost:' + PORT)
})

export { httpServer }
