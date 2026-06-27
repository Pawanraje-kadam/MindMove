import { GameState, Move, MoveClassification, PieceColor, AnalyzedMove, GameSummary } from './types';
import { cloneGameState, makeMove, generateLegalMoves } from './board';
import { findBestMove, evaluatePosition } from './ai';

// Eval loss → classification thresholds (centipawns)
function classifyMove(
  evalLoss: number,
  playedMove: Move,
  bestMove: Move | null,
  isBestMove: boolean,
): MoveClassification {
  if (isBestMove) {
    // Brilliant: best move that also involves a sacrifice
    if (playedMove.captured && playedMove.piece.type !== 'pawn') return 'brilliant';
    return 'best';
  }
  if (evalLoss === 0)      return 'best';
  if (evalLoss < 10)       return 'excellent';
  if (evalLoss < 25)       return 'good';
  if (evalLoss < 100)      return 'inaccuracy';
  if (evalLoss < 300)      return 'mistake';
  return 'blunder';
}

// Chess.com accuracy formula
function accuracyFromAvgLoss(avgLossCP: number): number {
  const acc = 103.1668 * Math.exp(-0.04354 * avgLossCP) - 3.1669;
  return Math.max(0, Math.min(100, Math.round(acc * 10) / 10));
}

function emptyCounts() {
  return { best: 0, excellent: 0, good: 0, inaccuracy: 0, mistake: 0, blunder: 0 };
}

// Called once per move inside the batched loop in the store
export function analyzeMove(
  stateBefore: GameState,
  playedMove: Move,
  moveIndex: number,
): AnalyzedMove {
  const color: PieceColor = stateBefore.turn;

  // Eval of the position before this move (from the engine's PoV — positive = white better)
  const evalBefore = evaluatePosition(stateBefore) * 100; // → centipawns

  // Find engine best move for this position
  const engineBest = findBestMove(stateBefore, 'intermediate');

  // Eval after played move
  const stateAfterPlayed = makeMove(stateBefore, playedMove);
  const evalAfterPlayed = evaluatePosition(stateAfterPlayed) * 100;

  // Eval after engine best move
  let evalAfterBest = evalAfterPlayed;
  if (engineBest) {
    const stateAfterBest = makeMove(stateBefore, engineBest);
    evalAfterBest = evaluatePosition(stateAfterBest) * 100;
  }

  // From this player's POV: better positions have higher value
  // White wants higher, black wants lower raw eval
  const sign = color === 'white' ? 1 : -1;
  const playedVal = sign * evalAfterPlayed;
  const bestVal   = sign * evalAfterBest;

  // Eval loss = how much worse the played move was than the best (always >= 0)
  const evalLoss = Math.max(0, Math.round(bestVal - playedVal));

  const isBestMove = !engineBest || (
    engineBest.from.row === playedMove.from.row &&
    engineBest.from.col === playedMove.from.col &&
    engineBest.to.row   === playedMove.to.row   &&
    engineBest.to.col   === playedMove.to.col
  );

  const classification = classifyMove(evalLoss, playedMove, engineBest, isBestMove);

  return {
    moveIndex,
    san: playedMove.san ?? '?',
    color,
    playedEval: Math.round(evalAfterPlayed),
    bestEval:   Math.round(evalAfterBest),
    evalLoss,
    classification,
    bestMove: isBestMove ? null : (engineBest ?? null),
    isKeyMoment: false, // set by computeSummary
  };
}

export function computeSummary(analyzed: AnalyzedMove[]): GameSummary {
  const white = analyzed.filter(m => m.color === 'white');
  const black = analyzed.filter(m => m.color === 'black');

  const whiteCounts = emptyCounts();
  const blackCounts = emptyCounts();

  let whiteTotalLoss = 0;
  let blackTotalLoss = 0;

  for (const m of white) {
    whiteTotalLoss += m.evalLoss;
    const k = m.classification as keyof typeof whiteCounts;
    if (k in whiteCounts) whiteCounts[k]++;
  }
  for (const m of black) {
    blackTotalLoss += m.evalLoss;
    const k = m.classification as keyof typeof blackCounts;
    if (k in blackCounts) blackCounts[k]++;
  }

  const whiteAccuracy = white.length > 0 ? accuracyFromAvgLoss(whiteTotalLoss / white.length) : 100;
  const blackAccuracy = black.length > 0 ? accuracyFromAvgLoss(blackTotalLoss / black.length) : 100;

  // Key moments: top 2 biggest eval swings across all moves
  const sorted = [...analyzed].sort((a, b) => b.evalLoss - a.evalLoss);
  const keyMoveIndices = new Set(sorted.slice(0, 2).map(m => m.moveIndex));
  const keyMoments = analyzed
    .filter(m => keyMoveIndices.has(m.moveIndex))
    .map(m => ({ ...m, isKeyMoment: true }));

  // Mark key moments in the full array
  for (const m of analyzed) {
    if (keyMoveIndices.has(m.moveIndex)) m.isKeyMoment = true;
  }

  // Natural language narrative
  const narrative = buildNarrative(analyzed, whiteCounts, blackCounts, whiteAccuracy, blackAccuracy);

  return { whiteAccuracy, blackAccuracy, white: whiteCounts, black: blackCounts, keyMoments, narrative };
}

function buildNarrative(
  analyzed: AnalyzedMove[],
  wc: ReturnType<typeof emptyCounts>,
  bc: ReturnType<typeof emptyCounts>,
  wAcc: number,
  bAcc: number,
): string {
  const biggestBlunder = [...analyzed]
    .filter(m => m.classification === 'blunder')
    .sort((a, b) => b.evalLoss - a.evalLoss)[0];

  const betterColor   = wAcc >= bAcc ? 'White' : 'Black';
  const worseColor    = wAcc >= bAcc ? 'Black' : 'White';
  const betterAcc     = Math.max(wAcc, bAcc);
  const worseAcc      = Math.min(wAcc, bAcc);
  const blunderCount  = wc.blunder + bc.blunder;

  let text = `${betterColor} played more accurately (${betterAcc}% vs ${worseAcc}%).`;

  if (biggestBlunder) {
    const moveNum = Math.ceil(biggestBlunder.moveIndex / 2);
    text += ` The turning point was move ${moveNum} (${biggestBlunder.san}) by ${biggestBlunder.color === 'white' ? 'White' : 'Black'}, losing ${(biggestBlunder.evalLoss / 100).toFixed(1)} pawns.`;
  } else if (blunderCount === 0) {
    text += ' Both players avoided major blunders — a clean game.';
  }

  return text;
}
