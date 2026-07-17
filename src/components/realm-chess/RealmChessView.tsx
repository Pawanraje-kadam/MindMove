import { useState, useEffect, useRef, useCallback } from 'react';
import { Chess } from 'chess.js';
import './realm-chess.css';

type Theme = 'fantasy' | 'classic';
type PieceChar = { char: string; name: string; cost?: number };

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

const PIECE_SETS: Record<Theme, Record<string, Record<string, PieceChar>>> = {
  fantasy: {
    w: {
      p: { char: '🧚', name: 'Fairy', cost: 100 },
      n: { char: '🦄', name: 'Unicorn', cost: 300 },
      b: { char: '🕊️', name: 'Holy Dove', cost: 400 },
      q: { char: '🧝‍♀️', name: 'Elf Queen', cost: 500 },
      r: { char: '🏰', name: 'Crystal Tower', cost: 600 },
      k: { char: '🧙‍♂️', name: 'Grand Magus', cost: 9999 },
    },
    b: {
      p: { char: '👺', name: 'Goblin' },
      n: { char: '🐺', name: 'Direwolf' },
      b: { char: '🦇', name: 'Giant Bat' },
      r: { char: '🌋', name: 'Volcano Lair' },
      q: { char: '🕷️', name: 'Spider Queen' },
      k: { char: '🧛‍♂️', name: 'Vampire Lord' },
    },
  },
  classic: {
    w: {
      p: { char: '♙', name: 'Pawn', cost: 100 },
      n: { char: '♘', name: 'Knight', cost: 300 },
      b: { char: '♗', name: 'Bishop', cost: 400 },
      q: { char: '♕', name: 'Queen', cost: 500 },
      r: { char: '♖', name: 'Rook', cost: 600 },
      k: { char: '♔', name: 'King', cost: 9999 },
    },
    b: {
      p: { char: '♟︎', name: 'Pawn' },
      n: { char: '♞', name: 'Knight' },
      b: { char: '♝', name: 'Bishop' },
      r: { char: '♜', name: 'Rook' },
      q: { char: '♛', name: 'Queen' },
      k: { char: '♚', name: 'King' },
    },
  },
};

const TRIVIA_QUESTIONS = [
  { q: "What has keys but can't open locks?", options: ['A piano', 'A map', 'A computer', 'A treasure chest'], a: 0 },
  { q: 'Which fantasy author created Middle-earth?', options: ['J.K. Rowling', 'George R.R. Martin', 'J.R.R. Tolkien', 'C.S. Lewis'], a: 2 },
  { q: 'What is the square root of 144?', options: ['10', '12', '14', '16'], a: 1 },
  { q: 'In Greek mythology, who flew too close to the sun?', options: ['Hercules', 'Perseus', 'Icarus', 'Achilles'], a: 2 },
  { q: 'What elemental breathing does Tanjiro use primarily at first?', options: ['Fire', 'Water', 'Wind', 'Lightning'], a: 1 },
  { q: 'Which planet is known as the Morning Star?', options: ['Mars', 'Venus', 'Jupiter', 'Mercury'], a: 1 },
  { q: 'How many strings does a standard guitar have?', options: ['4', '5', '6', '7'], a: 2 },
  { q: "What is the rarest blood type?", options: ['O Negative', 'B Positive', 'AB Negative', 'A Positive'], a: 2 },
  { q: 'Which chess piece can jump over other pieces?', options: ['Bishop', 'Rook', 'Queen', 'Knight'], a: 3 },
  { q: "What color is a polar bear's skin?", options: ['White', 'Pink', 'Black', 'Clear'], a: 2 },
  { q: 'What is the capital of Japan?', options: ['Seoul', 'Beijing', 'Tokyo', 'Bangkok'], a: 2 },
  { q: 'Who painted the Mona Lisa?', options: ['Van Gogh', 'Picasso', 'Da Vinci', 'Michelangelo'], a: 2 },
  { q: 'What is the hardest natural substance on Earth?', options: ['Gold', 'Iron', 'Diamond', 'Platinum'], a: 2 },
  { q: 'How many bones are in the adult human body?', options: ['196', '206', '216', '226'], a: 1 },
  { q: 'What is the chemical symbol for Gold?', options: ['Ag', 'Au', 'Go', 'Gd'], a: 1 },
  { q: 'Which mythical creature rises from its own ashes?', options: ['Dragon', 'Griffin', 'Phoenix', 'Chimera'], a: 2 },
  { q: 'What is the primary ingredient in hummus?', options: ['Lentils', 'Chickpeas', 'Black beans', 'Edamame'], a: 1 },
  { q: "In computer science, what does 'GUI' stand for?", options: ['General User Interface', 'Graphical User Interface', 'Global Unified Index', 'Graphic Usage Indicator'], a: 1 },
  { q: 'Which chess piece is worth approximately 3 points?', options: ['Pawn', 'Rook', 'Queen', 'Knight/Bishop'], a: 3 },
  { q: "What is the name of King Arthur's sword?", options: ['Glamdring', 'Sting', 'Excalibur', 'Frostmourne'], a: 2 },
];

const PIECE_VALUES: Record<string, number> = { p: 10, n: 30, b: 30, r: 50, q: 90, k: 900 };

function playTone(ctx: AudioContext | null, freq: number, dur = 0.1, vol = 0.07) {
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = freq;
    osc.type = 'triangle';
    gain.gain.value = vol;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + dur);
  } catch { /* ignore */ }
}

function minimax(chess: InstanceType<typeof Chess>, depth: number, alpha: number, beta: number, isMax: boolean): number {
  if (depth === 0 || chess.game_over()) {
    let total = 0;
    const board = chess.board();
    for (let r = 0; r < 8; r++) {
      for (let f = 0; f < 8; f++) {
        const piece = board[r][f];
        if (!piece) continue;
        let val = PIECE_VALUES[piece.type] || 0;
        if (piece.type === 'p') val += (piece.color === 'w' ? 7 - r : r) * 0.5;
        else if (piece.type === 'n' || piece.type === 'b') {
          val -= (Math.abs(3.5 - r) + Math.abs(3.5 - f)) * 0.2;
        }
        if (piece.color === 'b') total += val;
        else total -= val;
      }
    }
    return total;
  }
  const moves = chess.moves();
  if (isMax) {
    let maxEval = -Infinity;
    for (const move of moves) {
      chess.move(move);
      const value = minimax(chess, depth - 1, alpha, beta, false);
      chess.undo();
      maxEval = Math.max(maxEval, value);
      alpha = Math.max(alpha, value);
      if (beta <= alpha) break;
    }
    return maxEval;
  }
  let minEval = Infinity;
  for (const move of moves) {
    chess.move(move);
    const value = minimax(chess, depth - 1, alpha, beta, true);
    chess.undo();
    minEval = Math.min(minEval, value);
    beta = Math.min(beta, value);
    if (beta <= alpha) break;
  }
  return minEval;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = Math.max(0, seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function RealmChessView() {
  const chessRef = useRef<InstanceType<typeof Chess>>(new Chess());
  const audioCtxRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const actionTokenRef = useRef(0);
  const [theme, setTheme] = useState<Theme>('fantasy');
  const [playerScore, setPlayerScore] = useState(100);
  const [aiScore, setAiScore] = useState(0);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [gameActive, setGameActive] = useState(true);
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [statusMsg, setStatusMsg] = useState('Let the battle begin! Use clicks or drag pieces to move.');
  const [statusError, setStatusError] = useState(false);
  const [capturedLight, setCapturedLight] = useState<string[]>([]);
  const [capturedDark, setCapturedDark] = useState<string[]>([]);
  const [undoUses, setUndoUses] = useState(0);
  const [showHelp, setShowHelp] = useState(true);
  const [showSummon, setShowSummon] = useState(false);
  const [showTrivia, setShowTrivia] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);
  const [gameOverTitle, setGameOverTitle] = useState('');
  const [gameOverMsg, setGameOverMsg] = useState('');
  const [aiThinking, setAiThinking] = useState(false);
  const [isSummoningMode, setIsSummoningMode] = useState(false);
  const [pieceToSummon, setPieceToSummon] = useState<{ type: string; cost: number } | null>(null);
  const [playerClock, setPlayerClock] = useState(300);
  const [aiClock, setAiClock] = useState(300);
  const [triviaData, setTriviaData] = useState<{ q: string; options: string[]; a: number; lostPiece: string } | null>(null);
  const [triviaFeedback, setTriviaFeedback] = useState<{ msg: string; correct: boolean } | null>(null);
  const [boardKey, setBoardKey] = useState(0);
  const pendingTriviaRef = useRef<string[]>([]);
  const aiMovesRemainingRef = useRef(0);

  const MAX_UNDOS = 3;

  const triggerUpdate = useCallback(() => setBoardKey(k => k + 1), []);

  const setGameTurn = useCallback((color: 'w' | 'b'): boolean => {
    const chess = chessRef.current;
    const parts = chess.fen().split(' ');
    parts[1] = color;
    parts[2] = '-';
    parts[3] = '-';
    return chess.load(parts.join(' '));
  }, []);

  const updateStatus = useCallback((msg: string, err = false) => {
    setStatusMsg(msg);
    setStatusError(err);
  }, []);

  const finishAITurn = useCallback(() => {
    if (!gameActive) return;
    pendingTriviaRef.current = [];
    aiMovesRemainingRef.current = 0;
    setIsPlayerTurn(true);
    setGameTurn('w');
    setAiThinking(false);
    updateStatus('Your move lands successfully.');
    triggerUpdate();
  }, [gameActive, setGameTurn, updateStatus, triggerUpdate]);

  const finishAISequence = useCallback((token: number) => {
    if (token !== actionTokenRef.current) return;
    setAiThinking(false);
    if (pendingTriviaRef.current.length > 0) {
      const pieceName = pendingTriviaRef.current.shift()!;
      updateStatus(`Darkness claimed your ${pieceName}!`, true);
      setTimeout(() => {
        if (token === actionTokenRef.current) {
          const q = TRIVIA_QUESTIONS[Math.floor(Math.random() * TRIVIA_QUESTIONS.length)];
          setTriviaData({ ...q, lostPiece: pieceName });
          setShowTrivia(true);
          setTriviaFeedback(null);
        }
      }, 500);
    } else {
      finishAITurn();
    }
  }, [finishAITurn, updateStatus]);

  const showGameOverFn = useCallback((playerWon: boolean | null, customMsg?: string) => {
    setGameActive(false);
    setShowSummon(false);
    setShowTrivia(false);
    setShowHelp(false);
    setGameOverTitle(customMsg ? 'Draw!' : playerWon ? 'Victory!' : 'Checkmate!');
    setGameOverMsg(customMsg || (playerWon ? 'You have banished the Dark Realm!' : 'The Dark Realm has consumed the light.'));
    if (playerWon) setPlayerScore(s => s + 1000);
    setShowGameOver(true);
    setAiThinking(false);
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  const checkGameState = useCallback(() => {
    const chess = chessRef.current;
    if (chess.in_checkmate()) {
      const winner = chess.turn() === 'w' ? 'Dark Realm' : 'Light Realm';
      showGameOverFn(winner === 'Light Realm');
      return;
    }
    if (chess.in_draw() || chess.in_stalemate() || chess.in_threefold_repetition()) {
      showGameOverFn(null, "It's a draw!");
      return;
    }
    if (chess.in_check()) {
      updateStatus('Check!', true);
    }
  }, [showGameOverFn, updateStatus]);

  const performAnimatedMove = useCallback((from: string, to: string, cb: () => void) => {
    const pieceEl = document.querySelector(`#${from} .rc-piece`) as HTMLElement | null;
    const targetSquare = document.getElementById(to);
    if (!pieceEl || !targetSquare) { cb(); return; }
    const sourceRect = pieceEl.getBoundingClientRect();
    const targetRect = targetSquare.getBoundingClientRect();
    const dx = targetRect.left - sourceRect.left;
    const dy = targetRect.top - sourceRect.top;
    pieceEl.style.position = 'relative';
    pieceEl.style.zIndex = '50';
    pieceEl.style.transition = 'transform 0.3s ease-in-out';
    pieceEl.style.transform = `translate(${dx}px, ${dy}px)`;
    setTimeout(() => {
      pieceEl.style.transform = '';
      pieceEl.style.transition = '';
      pieceEl.style.position = '';
      pieceEl.style.zIndex = '';
      cb();
    }, 300);
  }, []);

  const executeAIMoveLogic = useCallback((token: number) => {
    if (token !== actionTokenRef.current) return;
    const chess = chessRef.current;
    if (chess.turn() !== 'b' && !setGameTurn('b')) {
      updateStatus('Turn state recovered. Your move.', true);
      finishAITurn();
      return;
    }
    const moves = chess.moves({ verbose: true });
    if (!moves.length) {
      setAiThinking(false);
      checkGameState();
      finishAISequence(token);
      return;
    }
    moves.sort(() => Math.random() - 0.5);
    let bestMove: { from: string; to: string; promotion?: string } | null = null;
    let bestValue = -Infinity;
    const depth = 2;
    for (const move of moves) {
      const candidate: { from: string; to: string; promotion?: string } = { from: move.from, to: move.to };
      if (move.flags.includes('p')) candidate.promotion = 'q';
      const tested = chess.move(candidate);
      if (!tested) continue;
      const value = minimax(chess, depth - 1, -Infinity, Infinity, false);
      chess.undo();
      if (value > bestValue) { bestValue = value; bestMove = candidate; }
    }
    if (!bestMove) {
      const move = moves[0];
      bestMove = { from: move.from, to: move.to };
      if (move.flags.includes('p')) bestMove.promotion = 'q';
    }
    const result = chess.move(bestMove);
    if (!result) {
      setAiThinking(false);
      updateStatus('The Dark Realm lost its path. Turn restored.', true);
      finishAITurn();
      return;
    }
    setLastMove({ from: result.from, to: result.to });
    if (audioCtxRef.current) playTone(audioCtxRef.current, 520, 0.08, 0.07);
    if (result.captured) {
      const capturedCost = PIECE_SETS.fantasy.w[result.captured]?.cost || 100;
      setAiScore(s => Math.max(0, s + capturedCost));
      setCapturedLight(prev => [...prev, result.captured]);
      pendingTriviaRef.current.push(PIECE_SETS.fantasy.w[result.captured]?.name || result.captured);
      if (audioCtxRef.current) { playTone(audioCtxRef.current, 330, 0.1, 0.1); playTone(audioCtxRef.current, 660, 0.06, 0.05); }
    }
    setAiThinking(false);
    performAnimatedMove(result.from, result.to, () => {
      if (token !== actionTokenRef.current) return;
      triggerUpdate();
      checkGameState();
      aiMovesRemainingRef.current -= 1;
      if (!gameActive) return;
      if (aiMovesRemainingRef.current > 0) {
        if (!setGameTurn('b')) {
          updateStatus('Second move cancelled because the position became invalid.', true);
          aiMovesRemainingRef.current = 0;
          finishAISequence(token);
          return;
        }
        updateStatus('Dark Magic: second move!', true);
        setAiThinking(true);
        setTimeout(() => executeAIMoveLogic(token), 650);
      } else {
        finishAISequence(token);
      }
    });
  }, [gameActive, setGameTurn, checkGameState, finishAISequence, finishAITurn, performAnimatedMove, triggerUpdate, updateStatus]);

  const executeRealitySwitch = useCallback(() => {
    const chess = chessRef.current;
    updateStatus('REALITY SHIFT! The armies have been swapped!', true);
    const board = chess.board();
    const oldWhite: string[] = [];
    const oldBlack: string[] = [];
    for (let r = 0; r < 8; r++) {
      for (let f = 0; f < 8; f++) {
        const piece = board[r][f];
        if (piece && piece.type !== 'k') {
          if (piece.color === 'w') oldWhite.push(piece.type);
          if (piece.color === 'b') oldBlack.push(piece.type);
        }
      }
    }
    chess.clear();
    chess.put({ type: 'k', color: 'w' }, 'e1' as any);
    chess.put({ type: 'k', color: 'b' }, 'e8' as any);
    const placePieces = (pieces: string[], color: 'w' | 'b') => {
      const backRank = color === 'w' ? '1' : '8';
      const pawnRank = color === 'w' ? '2' : '7';
      const pawns = pieces.filter(t => t === 'p');
      const officers = pieces.filter(t => t !== 'p');
      let backFiles = [...FILES].sort(() => Math.random() - 0.5).filter(f => f !== 'e');
      let pawnFiles = [...FILES].sort(() => Math.random() - 0.5);
      officers.forEach(type => {
        const file = backFiles.pop() || pawnFiles.pop()!;
        let square = `${file}${backRank}` as any;
        if (chess.get(square)) square = `${FILES[Math.floor(Math.random() * 8)]}${color === 'w' ? '3' : '6'}` as any;
        chess.put({ type: type as any, color }, square);
      });
      pawns.forEach(() => {
        const file = pawnFiles.pop() || FILES[Math.floor(Math.random() * 8)];
        let square = `${file}${pawnRank}` as any;
        while (chess.get(square)) square = `${FILES[Math.floor(Math.random() * 8)]}${color === 'w' ? '3' : '6'}` as any;
        chess.put({ type: 'p', color }, square);
      });
    };
    placePieces(oldWhite, 'b');
    placePieces(oldBlack, 'w');
    const fen = chess.fen().split(' ');
    fen[1] = 'w'; fen[2] = '-'; fen[3] = '-';
    chess.load(fen.join(' '));
    setCapturedLight(prev => { const temp = [...capturedDark]; setCapturedDark([...prev]); return temp; });
    triggerUpdate();
  }, [capturedDark, triggerUpdate, updateStatus]);

  const makeAIMove = useCallback((token: number) => {
    if (token !== actionTokenRef.current) return;
    setAiThinking(true);
    if (aiScore >= 1500) {
      setAiScore(s => s - 1500);
      aiMovesRemainingRef.current = 0;
      executeRealitySwitch();
      setTimeout(() => finishAISequence(token), 1050);
      return;
    }
    if (aiScore >= 500) {
      let total = 0;
      const board = chessRef.current.board();
      for (let r = 0; r < 8; r++) for (let f = 0; f < 8; f++) {
        const piece = board[r][f];
        if (!piece) continue;
        const val = PIECE_VALUES[piece.type] || 0;
        if (piece.color === 'b') total += val; else total -= val;
      }
      const useDouble = total < 0 || Math.random() < 0.45;
      if (useDouble) {
        setAiScore(s => s - 500);
        aiMovesRemainingRef.current = 2;
        updateStatus('Dark Magic: Time bends — two moves!', true);
      }
    }
    executeAIMoveLogic(token);
  }, [aiScore, executeAIMoveLogic, executeRealitySwitch, finishAISequence, updateStatus]);

  const triggerAITurn = useCallback(() => {
    if (!gameActive) return;
    setIsSummoningMode(false);
    setPieceToSummon(null);
    setSelectedSquare(null);
    setIsPlayerTurn(false);
    aiMovesRemainingRef.current = 1;
    pendingTriviaRef.current = [];
    const token = ++actionTokenRef.current;
    setAiThinking(true);
    setShowSummon(false);
    updateStatus('Dark Realm plots...', true);
    setTimeout(() => {
      if (token !== actionTokenRef.current) return;
      makeAIMove(token);
    }, 100);
  }, [gameActive, makeAIMove, updateStatus]);

  const attemptPlayerMove = useCallback((from: string, to: string) => {
    if (!gameActive || !isPlayerTurn) return;
    const chess = chessRef.current;
    const piece = chess.get(from);
    if (!piece || piece.color !== 'w') { setSelectedSquare(null); triggerUpdate(); return; }
    const moveParams: any = { from, to };
    if (piece.type === 'p' && (to[1] === '8' || to[1] === '1')) moveParams.promotion = 'q';
    const moveResult = chess.move(moveParams);
    if (!moveResult) { setSelectedSquare(null); triggerUpdate(); return; }
    setIsPlayerTurn(false);
    setSelectedSquare(null);
    setLastMove({ from: moveResult.from, to: moveResult.to });
    if (audioCtxRef.current) playTone(audioCtxRef.current, 520, 0.08, 0.07);
    if (moveResult.captured) {
      setCapturedDark(prev => [...prev, moveResult.captured]);
      setPlayerScore(s => s + 50);
      updateStatus(`You defeated a ${PIECE_SETS.fantasy.b[moveResult.captured]?.name || moveResult.captured}! +50 Magic`);
      if (audioCtxRef.current) { playTone(audioCtxRef.current, 330, 0.1, 0.1); playTone(audioCtxRef.current, 660, 0.06, 0.05); }
    } else {
      updateStatus('Your move lands successfully.');
    }
    triggerUpdate();
    checkGameState();
    if (gameActive) triggerAITurn();
  }, [gameActive, isPlayerTurn, checkGameState, triggerAITurn, triggerUpdate, updateStatus]);

  const handleSquareClick = useCallback((squareId: string) => {
    if (!gameActive) return;
    if (isSummoningMode && pieceToSummon) {
      const rank = parseInt(squareId[1], 10);
      if (!chessRef.current.get(squareId) && rank <= 4 && !(pieceToSummon.type === 'p' && rank === 1)) {
        const chess = chessRef.current;
        const placed = chess.put({ type: pieceToSummon.type, color: 'w' } as any, squareId as any);
        if (placed) {
          setPlayerScore(s => s - pieceToSummon.cost);
          setIsSummoningMode(false);
          setPieceToSummon(null);
          setSelectedSquare(null);
          updateStatus(`Summoned ${PIECE_SETS.fantasy.w[pieceToSummon.type]?.name}! Summoning uses your turn.`);
          triggerUpdate();
          if (!setGameTurn('b')) {
            chess.remove(squareId as any);
            setPlayerScore(s => s + pieceToSummon.cost);
            triggerUpdate();
            updateStatus('Summoning would create an invalid chess position, so it was cancelled.', true);
            return;
          }
          triggerAITurn();
          return;
        }
      }
      setIsSummoningMode(false);
      setPieceToSummon(null);
      setSelectedSquare(null);
      triggerUpdate();
      updateStatus('Summoning cancelled. Invalid square.', true);
      return;
    }
    const piece = chessRef.current.get(squareId);
    if (piece && piece.color === 'w') {
      setSelectedSquare(squareId);
      triggerUpdate();
      return;
    }
    if (selectedSquare) {
      attemptPlayerMove(selectedSquare, squareId);
    }
  }, [gameActive, isSummoningMode, pieceToSummon, selectedSquare, attemptPlayerMove, setGameTurn, triggerAITurn, triggerUpdate, updateStatus]);

  const handleDragStart = useCallback((e: React.DragEvent, squareId: string) => {
    e.dataTransfer.setData('text/plain', squareId);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetSquare: string) => {
    e.preventDefault();
    const fromSquare = e.dataTransfer.getData('text/plain');
    if (fromSquare) attemptPlayerMove(fromSquare, targetSquare);
  }, [attemptPlayerMove]);

  const undoMove = useCallback(() => {
    if (!gameActive) return;
    if (undoUses >= MAX_UNDOS) { updateStatus('No undo uses remaining.', true); return; }
    const chess = chessRef.current;
    const history = chess.history();
    if (history.length === 0) { updateStatus('Nothing to undo.', true); return; }
    if (history.length > 1 && history.length % 2 === 0) chess.undo();
    chess.undo();
    setUndoUses(u => u + 1);
    setIsPlayerTurn(true);
    aiMovesRemainingRef.current = 0;
    pendingTriviaRef.current = [];
    setSelectedSquare(null);
    const verbose = chess.history({ verbose: true });
    const last = verbose.length > 0 ? verbose[verbose.length - 1] : null;
    setLastMove(last ? { from: last.from, to: last.to } : null);
    setGameTurn('w');
    updateStatus(`Undo used. ${MAX_UNDOS - undoUses - 1} left.`);
    triggerUpdate();
  }, [gameActive, undoUses, setGameTurn, triggerUpdate, updateStatus]);

  const openSummonModal = useCallback(() => {
    if (!isPlayerTurn || !gameActive) return;
    setShowSummon(true);
  }, [isPlayerTurn, gameActive]);

  const startSummoning = useCallback((type: string, cost: number) => {
    setShowSummon(false);
    setIsSummoningMode(true);
    setPieceToSummon({ type, cost });
    setSelectedSquare(null);
    updateStatus(`Select a glowing square to summon ${PIECE_SETS.fantasy.w[type]?.name} (-${cost} pts)`);
    triggerUpdate();
  }, [triggerUpdate, updateStatus]);

  const resetGame = useCallback(() => {
    chessRef.current.reset();
    actionTokenRef.current++;
    setSelectedSquare(null);
    setLastMove(null);
    setPlayerScore(100);
    setAiScore(0);
    aiMovesRemainingRef.current = 0;
    pendingTriviaRef.current = [];
    setIsPlayerTurn(true);
    setGameActive(true);
    setIsSummoningMode(false);
    setPieceToSummon(null);
    setCapturedLight([]);
    setCapturedDark([]);
    setUndoUses(0);
    setPlayerClock(300);
    setAiClock(300);
    setTheme('fantasy');
    setShowGameOver(false);
    setShowSummon(false);
    setShowTrivia(false);
    setAiThinking(false);
    updateStatus('Let the battle begin! Use clicks or drag pieces to move.');
    if (audioCtxRef.current) {
      try { audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)(); } catch { /* ignore */ }
    }
    triggerUpdate();
  }, [triggerUpdate, updateStatus]);

  const handleTriviaAnswer = useCallback((selected: number, correct: number) => {
    setTriviaFeedback(selected === correct
      ? { msg: 'Correct! +150 Magic Points!', correct: true }
      : { msg: 'Incorrect. The magic fades.', correct: false });
    if (selected === correct) setPlayerScore(s => s + 150);
    setTimeout(() => {
      setShowTrivia(false);
      setTriviaFeedback(null);
      if (pendingTriviaRef.current.length > 0) {
        const q = TRIVIA_QUESTIONS[Math.floor(Math.random() * TRIVIA_QUESTIONS.length)];
        const pieceName = pendingTriviaRef.current.shift()!;
        setTriviaData({ ...q, lostPiece: pieceName });
        setShowTrivia(true);
      } else {
        finishAITurn();
      }
    }, 2200);
  }, [finishAITurn]);

  // Timer
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      if (!gameActive) return;
      setPlayerClock(prev => {
        setAiClock(prevAi => {
          const activeSide = isPlayerTurn ? 'white' : 'black';
          if (activeSide === 'white') {
            if (prev <= 1) { setGameActive(false); showGameOverFn(false, 'Your time expired.'); return prevAi; }
            return prevAi;
          } else {
            if (prevAi <= 1) { setGameActive(false); showGameOverFn(true, 'AI time expired.'); return prev; }
            return prevAi - 1;
          }
        });
        const activeSide = isPlayerTurn ? 'white' : 'black';
        if (activeSide === 'white') {
          if (prev <= 1) return 0;
          return prev - 1;
        }
        return prev;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [gameActive, isPlayerTurn, showGameOverFn]);

  // Init audio context
  useEffect(() => {
    try { audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)(); } catch { /* ignore */ }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const chess = chessRef.current;
  const board = chess.board();
  const pieceSet = PIECE_SETS[theme];

  const highlightMoves = (squareId: string): { [key: string]: 'selected' | 'move' | 'capture' } => {
    const highlights: { [key: string]: 'selected' | 'move' | 'capture' } = {};
    if (selectedSquare === squareId) highlights[squareId] = 'selected';
    if (selectedSquare) {
      const moves = chess.moves({ square: selectedSquare, verbose: true });
      for (const move of moves) {
        if (move.to === squareId && selectedSquare !== squareId) {
          highlights[squareId] = move.flags.includes('c') ? 'capture' : 'move';
        }
      }
    }
    return highlights;
  };

  const isSummonHighlight = (squareId: string): boolean => {
    if (!isSummoningMode || !pieceToSummon) return false;
    const rank = parseInt(squareId[1], 10);
    if (chess.get(squareId)) return false;
    if (rank > 4) return false;
    if (pieceToSummon.type === 'p' && rank === 1) return false;
    return true;
  };

  const renderMoveHistory = () => {
    const history = chess.history({ verbose: true });
    const moves: React.ReactNode[] = [];
    for (let i = 0; i < history.length; i += 2) {
      const whiteMove = history[i];
      const blackMove = history[i + 1];
      const moveNumber = Math.floor(i / 2) + 1;
      moves.push(
        <li key={i} style={{ color: '#e2e8f0', fontSize: '0.95rem', padding: '0.4rem 0.45rem', borderRadius: 18, background: 'rgba(255,255,255,0.04)' }}>
          <span style={{ fontWeight: 600, color: '#94a3b8' }}>{moveNumber}.</span>{' '}
          <span>{whiteMove?.san}</span>{' '}
          {blackMove && <span style={{ color: '#cbd5e1' }}>{blackMove.san}</span>}
        </li>
      );
    }
    return moves;
  };

  const handleNewGame = () => {
    resetGame();
    setShowHelp(true);
  };

  return (
    <div className="rc-root" style={{ fontFamily: "'Lora', serif", color: '#e2e8f0', overflowX: 'hidden', width: '100%', minHeight: '100%' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Lora:ital@0;1&display=swap');`}</style>

      <div style={{ width: '100%', maxWidth: 1152, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16, padding: 8 }}>
        {/* Header */}
        <header style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16, background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(51,65,85,0.6)', borderRadius: 24, padding: 16, boxShadow: '0 20px 60px rgba(15,23,42,0.45)' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
            <div>
              <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', fontWeight: 700, background: 'linear-gradient(to right, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontFamily: "'Cinzel', serif", margin: 0 }}>Realm Chess</h1>
              <p style={{ fontSize: 12, color: '#94a3b8', fontStyle: 'italic', margin: 0 }}>The Trivia Trials — chess meets fantasy strategy</p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="rc-btn" onClick={() => setShowHelp(true)}>Help</button>
              <button className="rc-btn" onClick={() => setTheme(t => t === 'fantasy' ? 'classic' : 'fantasy')}>
                {theme === 'fantasy' ? 'Classic Theme' : 'Fantasy Theme'}
              </button>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12, textAlign: 'center' }}>
            <div className="rc-panel"><p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#34d399' }}>Light Magic</p><p style={{ fontSize: 'clamp(1.2rem, 2.5vw, 2rem)', fontWeight: 700, color: '#fbbf24', fontFamily: "'Cinzel', serif", margin: 0 }}>{playerScore}</p></div>
            <div className="rc-panel"><p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8' }}>Player Clock</p><p style={{ fontSize: 'clamp(1rem, 2vw, 1.5rem)', fontWeight: 700, color: '#f1f5f9', margin: 0 }}>{formatTime(playerClock)}</p></div>
            <div className="rc-panel"><p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#a5b4fc' }}>Turn</p><p style={{ fontSize: 'clamp(0.9rem, 2vw, 1.3rem)', fontWeight: 700, color: isPlayerTurn ? '#a5b4fc' : '#f87171', margin: 0 }}>{isPlayerTurn ? 'Your Move' : 'Dark Turn'}</p></div>
            <div className="rc-panel"><p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#f87171' }}>Dark Magic</p><p style={{ fontSize: 'clamp(1.2rem, 2.5vw, 2rem)', fontWeight: 700, color: '#f43f5e', fontFamily: "'Cinzel', serif", margin: 0 }}>{aiScore}</p></div>
            <div className="rc-panel"><p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8' }}>AI Clock</p><p style={{ fontSize: 'clamp(1rem, 2vw, 1.5rem)', fontWeight: 700, color: '#f1f5f9', margin: 0 }}>{formatTime(aiClock)}</p></div>
          </div>
        </header>

        {/* Main content */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
          {/* Left sidebar */}
          <section style={{ flex: '0 0 auto', width: '100%', maxWidth: 288 }}>
            <div className="rc-panel" style={{ padding: 16 }}>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.18em', margin: '0 0 12px' }}>Actions</h2>
              <button className="rc-btn rc-btn-full" onClick={openSummonModal} disabled={!isPlayerTurn || !gameActive}>✨ Summon Ally</button>
              <button className="rc-btn rc-btn-full" onClick={undoMove} disabled={!gameActive}>↩️ Undo Move</button>
              <div style={{ borderRadius: 24, border: '1px solid rgba(51,65,85,0.6)', background: 'rgba(2,6,23,0.9)', padding: 16, fontSize: 14, color: '#cbd5e1', marginTop: 8 }}>
                <p style={{ fontWeight: 600, color: '#f1f5f9', margin: 0 }}>Undo uses left</p>
                <p style={{ fontSize: 20, fontWeight: 700, color: '#fbbf24', margin: 0 }}>{MAX_UNDOS - undoUses}</p>
              </div>
            </div>
            <div className="rc-panel" style={{ padding: 16, marginTop: 16 }}>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.18em', margin: '0 0 8px' }}>Move History</h2>
              <ol style={{ listStyle: 'decimal', paddingLeft: 20, maxHeight: 384, overflowY: 'auto' }}>{renderMoveHistory()}</ol>
            </div>
          </section>

          {/* Board */}
          <main style={{ flex: 1, minWidth: 280, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <div className="rc-board-wrapper" style={{ position: 'relative', width: '100%', maxWidth: 640 }}>
              <div className={`rc-board ${theme === 'classic' ? 'rc-theme-classic' : ''}`}>
                {RANKS.map((rank, ri) =>
                  FILES.map((file, fi) => {
                    const squareId = `${file}${rank}`;
                    const piece = board[ri][fi];
                    const hl = highlightMoves(squareId);
                    const isLastMove = lastMove && (lastMove.from === squareId || lastMove.to === squareId);
                    const isSummons = isSummonHighlight(squareId);
                    let className = 'rc-square';
                    if ((ri + fi) % 2 === 0) className += ' rc-light'; else className += ' rc-dark';
                    if (hl[squareId] === 'selected') className += ' rc-selected';
                    if (hl[squareId] === 'move') className += ' rc-highlight-move';
                    if (hl[squareId] === 'capture') className += ' rc-highlight-capture';
                    if (isLastMove) className += ' rc-highlight-last';
                    if (isSummons) className += ' rc-highlight-summon';
                    return (
                      <div key={squareId} id={squareId} className={className}
                        onClick={() => handleSquareClick(squareId)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => handleDrop(e, squareId)}>
                        {piece && (
                          <span className="rc-piece"
                            draggable={piece.color === 'w' && isPlayerTurn && gameActive}
                            onDragStart={(e) => handleDragStart(e, squareId)}
                            title={pieceSet[piece.color][piece.type]?.name}>
                            {pieceSet[piece.color][piece.type]?.char}
                          </span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
              {aiThinking && (
                <div className="rc-ai-overlay">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span className="rc-loader" />
                    <span style={{ fontSize: 16, fontWeight: 600, color: '#c7d2fe' }}>Dark Realm plots...</span>
                  </div>
                </div>
              )}
            </div>
            <div className={`rc-status-box ${statusError ? 'rc-status-error' : 'rc-status-ok'}`}>{statusMsg}</div>
          </main>

          {/* Right sidebar */}
          <aside style={{ flex: '0 0 auto', width: '100%', maxWidth: 288 }}>
            <div className="rc-panel" style={{ padding: 16 }}>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.18em', margin: '0 0 12px' }}>Graveyards</h2>
              <div style={{ fontSize: 14, color: '#cbd5e1', marginTop: 8 }}>Captured Light</div>
              <div className="rc-graveyard">{capturedLight.map((type, i) => <span key={`l${i}`} title={PIECE_SETS.fantasy.w[type]?.name}>{PIECE_SETS.fantasy.w[type]?.char}</span>)}</div>
              <div style={{ fontSize: 14, color: '#cbd5e1', marginTop: 16 }}>Captured Dark</div>
              <div className="rc-graveyard">{capturedDark.map((type, i) => <span key={`d${i}`} title={PIECE_SETS.fantasy.b[type]?.name}>{PIECE_SETS.fantasy.b[type]?.char}</span>)}</div>
            </div>
          </aside>
        </div>
      </div>

      {/* Summon Modal */}
      {showSummon && (
        <div className="rc-modal-overlay" onClick={() => setShowSummon(false)}>
          <div className="rc-modal" onClick={e => e.stopPropagation()}>
            <div className="rc-modal-header">
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: '#fff', margin: 0 }}>Summoning Portal</h3>
                <p style={{ fontSize: 14, color: '#cbd5e1', margin: 0 }}>Spend Magic Points to summon an ally onto your ranks.</p>
              </div>
              <button className="rc-modal-close" onClick={() => setShowSummon(false)}>×</button>
            </div>
            <div style={{ padding: 16 }}>
              <p style={{ color: '#cbd5e1', fontSize: 14, margin: '0 0 12px' }}>Available Magic: <span style={{ fontWeight: 700, color: '#fbbf24' }}>{playerScore}</span></p>
              {['p', 'n', 'b', 'r', 'q'].map(type => {
                const data = PIECE_SETS.fantasy.w[type];
                const canAfford = playerScore >= (data.cost || 0);
                return (
                  <div key={type} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderRadius: 16, border: `1px solid ${canAfford ? '#6366f1' : '#475569'}`, background: canAfford ? 'rgba(51,65,85,0.7)' : 'rgba(30,41,59,0.9)', marginBottom: 12, opacity: canAfford ? 1 : 0.6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 30 }}>{data.char}</span>
                      <div style={{ textAlign: 'left' }}>
                        <p style={{ fontWeight: 700, color: '#fff', margin: 0 }}>{data.name}</p>
                        <p style={{ color: '#fbbf24', fontSize: 14, margin: 0 }}>{data.cost} pts</p>
                      </div>
                    </div>
                    <button className="rc-btn" disabled={!canAfford} onClick={() => canAfford && startSummoning(type, data.cost || 0)}>Summon</button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Trivia Modal */}
      {showTrivia && triviaData && (
        <div className="rc-modal-overlay">
          <div className="rc-modal" style={{ maxWidth: 540 }}>
            <div className="rc-modal-header">
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: '#fff', margin: 0 }}>A Champion Falls!</h3>
                <p style={{ fontSize: 14, color: '#cbd5e1', margin: 0 }}>Answer the trivia to reclaim Magic Points.</p>
              </div>
              <button className="rc-modal-close" onClick={() => { setShowTrivia(false); finishAITurn(); }}>×</button>
            </div>
            <div style={{ padding: 16 }}>
              <div style={{ fontSize: 16, color: '#f1f5f9' }}>
                You lost your <b>{triviaData.lostPiece}</b>!<br />
                <span style={{ fontSize: 12, display: 'block', color: '#a5b4fc', marginTop: 8 }}>Answer correctly for +150 Magic Points.</span><br /><br />
                {triviaData.q}
              </div>
              <div style={{ display: 'grid', gap: 12, marginTop: 16 }}>
                {triviaData.options.map((opt, i) => (
                  <button key={i} className="rc-trivia-btn" onClick={() => handleTriviaAnswer(i, triviaData.a)}
                    style={{
                      background: triviaFeedback
                        ? i === triviaData.a ? '#059669' : i === (triviaData.options.indexOf(triviaData.options[triviaFeedback.correct ? triviaData.a : -1])) ? '#e11d48' : 'rgba(51,65,85,0.7)'
                        : 'rgba(51,65,85,0.7)',
                    }}
                    disabled={!!triviaFeedback}>
                    {opt}
                  </button>
                ))}
              </div>
              {triviaFeedback && (
                <div style={{ textAlign: 'center', fontWeight: 700, fontSize: 14, padding: 12, borderRadius: 16, marginTop: 12, background: triviaFeedback.correct ? 'rgba(6,95,70,0.5)' : 'rgba(136,19,55,0.5)', color: triviaFeedback.correct ? '#34d399' : '#f87171' }}>
                  {triviaFeedback.msg}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Game Over Modal */}
      {showGameOver && (
        <div className="rc-modal-overlay">
          <div className="rc-modal" style={{ maxWidth: 448, textAlign: 'center' }}>
            <h3 style={{ fontSize: 30, fontWeight: 700, color: '#fbbf24', fontFamily: "'Cinzel', serif" }}>{gameOverTitle}</h3>
            <p style={{ marginTop: 12, color: '#e2e8f0' }}>{gameOverMsg}</p>
            <p style={{ marginTop: 16, color: '#cbd5e1' }}>Final Score: <span style={{ fontWeight: 700, color: '#fbbf24' }}>{playerScore}</span></p>
            <button className="rc-btn" style={{ marginTop: 24, padding: '12px 24px', fontSize: 16 }} onClick={handleNewGame}>Play Again</button>
          </div>
        </div>
      )}

      {/* Help Modal */}
      {showHelp && (
        <div className="rc-modal-overlay" onClick={() => setShowHelp(false)}>
          <div className="rc-modal" style={{ maxWidth: 640, maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div className="rc-modal-header">
              <div>
                <h3 style={{ fontSize: 24, fontWeight: 700, color: '#fff', margin: 0 }}>Realm Chess Guide</h3>
                <p style={{ fontSize: 14, color: '#cbd5e1', margin: 0 }}>Learn the rules, special mechanics, and controls.</p>
              </div>
              <button className="rc-modal-close" onClick={() => setShowHelp(false)}>×</button>
            </div>
            <div style={{ padding: 16, color: '#e2e8f0', fontSize: 14, lineHeight: 1.7 }}>
              <p>Use clicks or drag pieces to move. White is your side, Black is the AI.</p>
              <p><b style={{ color: '#fff' }}>Summon Allies:</b> Spend Light Magic points to place an extra piece on your side. Summoning uses your turn.</p>
              <p><b style={{ color: '#fff' }}>Trivia Trials:</b> When the AI captures one of your pieces, you will be asked a trivia question. Correct answers restore Magic Points.</p>
              <p><b style={{ color: '#fff' }}>AI Abilities:</b> As the AI collects points, it may take an extra move or trigger Reality Shift to swap armies.</p>
              <p><b style={{ color: '#fff' }}>Undo:</b> You can undo up to three times per game.</p>
              <p><b style={{ color: '#fff' }}>Themes:</b> Switch between Fantasy and Classic board visuals using the theme button.</p>
              <p><b style={{ color: '#fff' }}>Clocks:</b> Each side has 5 minutes. If a side runs out of time, the game ends.</p>
            </div>
            <div style={{ padding: 16, borderTop: '1px solid rgba(51,65,85,0.4)', textAlign: 'right' }}>
              <button className="rc-btn" onClick={() => setShowHelp(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
