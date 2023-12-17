import { KalahGame, KalahGameState } from './KalahGame.js'

enum ClientRole {
    PLAYER = 'player',
    SPECTATOR = 'spectator',
}

export interface Payload {
    board: Array<number>
    gameState: number
    role: ClientRole
}

export function getSouthPerspectivePayload(game: KalahGame): Payload {
    const payload = {
        board: game.getBoard(),
        gameState: game.getGameState(),
        role: ClientRole.PLAYER,
    }
    return payload
}

export function getNorthPerspectivePayload(game: KalahGame): Payload {
    const board = game.getBoard()
    const southSide = board.slice(0, game.numBins + 1)
    const northSide = board.slice(game.numBins + 1)

    const gameState = game.getGameState()
    let clientState = gameState
    if (gameState === KalahGameState.SOUTH_TURN) clientState = KalahGameState.NORTH_TURN
    else if (gameState === KalahGameState.NORTH_TURN) clientState = KalahGameState.SOUTH_TURN
    else if (gameState === KalahGameState.SOUTH_VICTORY) clientState = KalahGameState.NORTH_VICTORY
    else if (gameState === KalahGameState.NORTH_VICTORY) clientState = KalahGameState.SOUTH_VICTORY

    const payload = {
        board: northSide.concat(southSide),
        gameState: clientState,
        role: ClientRole.PLAYER,
    }

    return payload
}

export function getSpectatorPerspectivePayload(game: KalahGame): Payload {
    const payload = {
        board: game.getBoard(),
        gameState: game.getGameState(),
        role: ClientRole.SPECTATOR,
    }
    return payload
}
