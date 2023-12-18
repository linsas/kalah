import express from 'express'
import http from 'node:http'

const websiteRoot = './web'

export type httpServerType = http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>

export function createHttpServer(): httpServerType {
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

	return httpServer
}
