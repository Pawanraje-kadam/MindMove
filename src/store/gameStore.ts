import { create } from 'zustand';
import {
  GameState, GameConfig, GameMode, Difficulty, PieceColor,
  Move, Position, AppView, PieceType,
} from '../engine/types';
import {
  createInitialGameState, makeMove,
  getLegalMovesFromSquare, gameStateToFEN, fenToGameState,
  exportPGN, parsePGN, findMoveFromSAN, cloneGameState,
} from '../engine/board';
import { findBestMove, evaluatePosition } from '../engine/ai';
import { sounds } from '../utils/sounds';

interface GameStore {
  // App state
  view: AppView;
  setView: (view: AppView) => void;

  // Game state
  gameState: GameState;
  gameConfig: GameConfig;
  selectedSquare: Position | null;
  legalMoves: Move[];
  lastMove: Move | null;
  boardFlipped: boolean;
  showPromotionDialog: boolean;
  pendingPromotion: { from: Position; to: Position } | null;
  evaluation: number;
  isThinking: boolean;
  gameHistory: GameState[];
  historyIndex: number;
  savedGames: { name: string; pgn: string; date: string }[];
  showCoordinates: boolean;
  animatingMove: Move | null;

  // Actions
  newGame: (config?: Partial<GameConfig>) => void;
  selectSquare: (pos: Position) => void;
  executeMove: (move: Move) => void;
  handlePromotion: (pieceType: PieceType) => void;
  cancelPromotion: () => void;
  flipBoard: () => void;
  undoMove: () => void;
  redoMove: () => void;
  resign: () => void;
  offerDraw: () => void;
  importFEN: (fen: string) => void;
  exportFEN: () => string;
  importPGN: (pgn: string) => void;
  exportGamePGN: () => string;
  saveGame: (name: string) => void;
  loadGame: (index: number) => void;
  triggerAIMove: () => void;
  toggleCoordinates: () => void;
  goToMove: (index: number) => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  view: 'home',
  setView: (view) => set({ view }),

  gameState: createInitialGameState(),
  gameConfig: {
    mode: 'hvh' as GameMode,
    difficulty: 'intermediate' as Difficulty,
    playerColor: 'white' as PieceColor,
  },
  selectedSquare: null,
  legalMoves: [],
  lastMove: null,
  boardFlipped: false,
  showPromotionDialog: false,
  pendingPromotion: null,
  evaluation: 0,
  isThinking: false,
  gameHistory: [],
  historyIndex: -1,
  savedGames: [],
  showCoordinates: true,
  animatingMove: null,

  newGame: (config) => {
    const newConfig = config
      ? { ...get().gameConfig, ...config }
      : get().gameConfig;

    const newState = createInitialGameState();
    const flipped = newConfig.mode === 'hva' && newConfig.playerColor === 'black';

    set({
      gameState: newState,
      gameConfig: newConfig,
      selectedSquare: null,
      legalMoves: [],
      lastMove: null,
      boardFlipped: flipped,
      showPromotionDialog: false,
      pendingPromotion: null,
      evaluation: 0,
      isThinking: false,
      gameHistory: [cloneGameState(newState)],
      historyIndex: 0,
      animatingMove: null,
      view: 'play',
    });

    // If AI plays first
    if (newConfig.mode === 'hva' && newConfig.playerColor === 'black') {
      setTimeout(() => get().triggerAIMove(), 300);
    }
    if (newConfig.mode === 'ava') {
      setTimeout(() => get().triggerAIMove(), 300);
    }
  },

  selectSquare: (pos) => {
    const { gameState, selectedSquare, legalMoves, gameConfig } = get();

    if (gameState.isGameOver) return;

    // Check if it's player's turn
    if (gameConfig.mode === 'hva') {
      if (gameState.turn !== gameConfig.playerColor) return;
    }

    const piece = gameState.board[pos.row][pos.col];

    // If a piece is selected and clicking on a legal move target
    if (selectedSquare) {
      const move = legalMoves.find(m => m.to.row === pos.row && m.to.col === pos.col);
      if (move) {
        // Check for promotion
        if (move.piece.type === 'pawn' && (pos.row === 0 || pos.row === 7)) {
          set({ pendingPromotion: { from: selectedSquare, to: pos }, showPromotionDialog: true });
          return;
        }
        get().executeMove(move);
        return;
      }
    }

    // Select a new piece
    if (piece && piece.color === gameState.turn) {
      const moves = getLegalMovesFromSquare(gameState, pos);
      set({ selectedSquare: pos, legalMoves: moves });
    } else {
      set({ selectedSquare: null, legalMoves: [] });
    }
  },

  executeMove: (move) => {
    const { gameState, gameConfig, gameHistory, historyIndex } = get();

    set({ animatingMove: move });

    // Slight delay for animation
    setTimeout(() => {
      const newState = makeMove(gameState, move);
      const eval_ = evaluatePosition(newState);

      // Trim future history if we undid moves then made a new one
      const newHistory = [...gameHistory.slice(0, historyIndex + 1), cloneGameState(newState)];

      set({
        gameState: newState,
        selectedSquare: null,
        legalMoves: [],
        lastMove: move,
        evaluation: eval_,
        gameHistory: newHistory,
        historyIndex: newHistory.length - 1,
        animatingMove: null,
      });

      // Trigger AI if needed
      if (!newState.isGameOver) {
        if (gameConfig.mode === 'hva' && newState.turn !== gameConfig.playerColor) {
          setTimeout(() => get().triggerAIMove(), 200);
        }
        if (gameConfig.mode === 'ava') {
          setTimeout(() => get().triggerAIMove(), 500);
        }
      }
    }, 150);
  },

  handlePromotion: (pieceType) => {
    const { pendingPromotion, legalMoves } = get();
    if (!pendingPromotion) return;

    const move = legalMoves.find(m =>
      m.to.row === pendingPromotion.to.row &&
      m.to.col === pendingPromotion.to.col &&
      m.promotion === pieceType
    );

    set({ showPromotionDialog: false, pendingPromotion: null });

    if (move) {
      get().executeMove(move);
    }
  },

  cancelPromotion: () => {
    set({ showPromotionDialog: false, pendingPromotion: null, selectedSquare: null, legalMoves: [] });
  },

  flipBoard: () => set(s => ({ boardFlipped: !s.boardFlipped })),

  undoMove: () => {
    const { gameHistory, historyIndex } = get();
    if (historyIndex <= 0) return;

    const prevIndex = historyIndex - 1;
    const prevState = cloneGameState(gameHistory[prevIndex]);

    set({
      gameState: prevState,
      historyIndex: prevIndex,
      selectedSquare: null,
      legalMoves: [],
      lastMove: prevIndex > 0 ? prevState.moveHistory[prevState.moveHistory.length - 1] || null : null,
      evaluation: evaluatePosition(prevState),
    });
  },

  redoMove: () => {
    const { gameHistory, historyIndex } = get();
    if (historyIndex >= gameHistory.length - 1) return;

    const nextIndex = historyIndex + 1;
    const nextState = cloneGameState(gameHistory[nextIndex]);

    set({
      gameState: nextState,
      historyIndex: nextIndex,
      selectedSquare: null,
      legalMoves: [],
      lastMove: nextState.moveHistory[nextState.moveHistory.length - 1] || null,
      evaluation: evaluatePosition(nextState),
    });
  },

  resign: () => {
    const { gameState } = get();
    if (gameState.isGameOver) return;

    const newState = cloneGameState(gameState);
    newState.isGameOver = true;
    newState.winner = gameState.turn === 'white' ? 'black' : 'white';
    set({ gameState: newState });
  },

  offerDraw: () => {
    const { gameState, gameConfig } = get();
    if (gameState.isGameOver) return;

    // In HvH, instant draw. In HvA, AI accepts if position is roughly equal
    if (gameConfig.mode === 'hvh') {
      const newState = cloneGameState(gameState);
      newState.isGameOver = true;
      newState.isDraw = true;
      newState.drawReason = 'agreement';
      set({ gameState: newState });
    } else {
      const eval_ = evaluatePosition(gameState);
      if (Math.abs(eval_) < 0.5) {
        const newState = cloneGameState(gameState);
        newState.isGameOver = true;
        newState.isDraw = true;
        newState.drawReason = 'agreement';
        set({ gameState: newState });
      }
    }
  },

  importFEN: (fen) => {
    try {
      const state = fenToGameState(fen);
      set({
        gameState: state,
        selectedSquare: null,
        legalMoves: [],
        lastMove: null,
        evaluation: evaluatePosition(state),
        gameHistory: [cloneGameState(state)],
        historyIndex: 0,
        view: 'play',
      });
    } catch (e) {
      console.error('Invalid FEN:', e);
    }
  },

  exportFEN: () => {
    return gameStateToFEN(get().gameState);
  },

  importPGN: (pgn) => {
    try {
      const sanMoves = parsePGN(pgn);
      let state = createInitialGameState();

      for (const san of sanMoves) {
        const move = findMoveFromSAN(state, san);
        if (!move) break;
        state = makeMove(state, move);
      }

      set({
        gameState: state,
        selectedSquare: null,
        legalMoves: [],
        lastMove: state.moveHistory.length > 0 ? state.moveHistory[state.moveHistory.length - 1] : null,
        evaluation: evaluatePosition(state),
        gameHistory: [cloneGameState(state)],
        historyIndex: 0,
        view: 'play',
      });
    } catch (e) {
      console.error('Invalid PGN:', e);
    }
  },

  exportGamePGN: () => {
    return exportPGN(get().gameState);
  },

  saveGame: (name) => {
    const pgn = exportPGN(get().gameState);
    const savedGames = [...get().savedGames, {
      name,
      pgn,
      date: new Date().toISOString(),
    }];
    set({ savedGames });
    try {
      localStorage.setItem('indochess_saved', JSON.stringify(savedGames));
    } catch {}
  },

  loadGame: (index) => {
    const { savedGames } = get();
    if (index < 0 || index >= savedGames.length) return;
    get().importPGN(savedGames[index].pgn);
  },

  triggerAIMove: () => {
    const { gameState, gameConfig } = get();
    if (gameState.isGameOver) return;

    set({ isThinking: true });

    // Use setTimeout to not block UI
    setTimeout(() => {
      const move = findBestMove(gameState, gameConfig.difficulty);
      set({ isThinking: false });
      if (move) {
        // Play sound for AI move
        if (move.captured) sounds.capture();
        else if (move.isCastle) sounds.castle();
        else sounds.move();
        if (move.isCheck) setTimeout(() => sounds.check(), 100);
        
        get().executeMove(move);
      }
    }, 50);
  },

  toggleCoordinates: () => set(s => ({ showCoordinates: !s.showCoordinates })),

  goToMove: (index) => {
    const { gameHistory } = get();
    if (index < 0 || index >= gameHistory.length) return;

    const state = cloneGameState(gameHistory[index]);
    set({
      gameState: state,
      historyIndex: index,
      selectedSquare: null,
      legalMoves: [],
      lastMove: index > 0 ? state.moveHistory[state.moveHistory.length - 1] || null : null,
      evaluation: evaluatePosition(state),
    });
  },
}));
