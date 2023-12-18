import { KalahGame } from './KalahGame.js'

enum ClientRole {
    PLAYER = 'player',
    SPECTATOR = 'spectator',
}

export interface Payload {
    role: ClientRole
    board: Array<number>
    isNorthTurn: boolean
    isGameOver: boolean
    southScore: number
    northScore: number
}

export function getSouthPerspectiveVessel(vessel: number, game: KalahGame): number {
    return vessel
}

export function getNorthPerspectiveVessel(vessel: number, game: KalahGame): number {
    return (game.numBins + 1 + vessel) % ((game.numBins + 1) * 2)
}

export function getSouthPerspectivePayload(game: KalahGame): Payload {
    const [southScore, northScore] = game.getScores()
    const payload = {
        role: ClientRole.PLAYER,
        board: game.getBoard(),
        isNorthTurn: game.isNorthTurn(),
        isGameOver: game.isGameOver(),
        southScore,
        northScore,
    }
    return payload
}

export function getNorthPerspectivePayload(game: KalahGame): Payload {
    const southPayload = getSouthPerspectivePayload(game)

    const southSide = southPayload.board.slice(0, game.numBins + 1)
    const northSide = southPayload.board.slice(game.numBins + 1)

    const payload = {
        ...southPayload,
        board: northSide.concat(southSide),
        isNorthTurn: !southPayload.isNorthTurn,
        southScore: southPayload.northScore,
        northScore: southPayload.southScore,
    }

    return payload
}

export function getSpectatorPerspectivePayload(game: KalahGame): Payload {
    const payload = {
        ...getSouthPerspectivePayload(game),
        role: ClientRole.SPECTATOR,
    }
    return payload
}
