export interface Timer {
	restart: () => void
	stop: () => void
	isRunning: () => boolean
}

export function createTimer(timeoutMs: number, callback: () => void) : Timer {
	let timer: NodeJS.Timeout | null = null

	const isRunning = () => {
		return timer != null
	}

	const stop = () => {
		if (timer != null) clearTimeout(timer)
		timer = null
	}

	const restart = () => {
		stop()
		timer = setTimeout(() => {
			callback()
            stop()
		}, timeoutMs)
	}

	return {
		restart,
		stop,
		isRunning,
	} as Timer
}
