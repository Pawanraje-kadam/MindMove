import { create } from 'zustand';
import { learnContent } from '../data/learnContent';
import { fischerPuzzles } from '../data/fischerPuzzles';
import type { LearnProgress, PuzzleProgress } from '../engine/types';

const STORAGE_KEY = 'mm_learn_progress';
const PUZZLE_KEY = 'mm_puzzle_progress';

function loadProgress(): LearnProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore corrupt data */ }
  return {
    completedFrames: [],
    currentChapterId: learnContent[0]?.id || '',
    currentSectionId: learnContent[0]?.sections[0]?.id || '',
    currentFrameIndex: 0,
  };
}

function saveProgress(p: LearnProgress) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); } catch {}
}

function loadPuzzleProgress(): PuzzleProgress {
  try {
    const raw = localStorage.getItem(PUZZLE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  const defaultOrder = fischerPuzzles.map(p => p.id);
  return {
    solvedPuzzles: [],
    attemptedPuzzles: {},
    streak: 0,
    bestStreak: 0,
    chapterStats: {},
    badges: [],
    currentChapterFilter: null,
    currentPuzzleIndex: 0,
    puzzleOrder: defaultOrder,
  };
}

function savePuzzleProgress(p: PuzzleProgress) {
  try { localStorage.setItem(PUZZLE_KEY, JSON.stringify(p)); } catch {}
}

const BADGE_DEFS = [
  { id: 'first-solve', label: 'First Solve', check: (pp: PuzzleProgress) => pp.solvedPuzzles.length >= 1 },
  { id: 'streak-5', label: '5 Streak', check: (pp: PuzzleProgress) => pp.bestStreak >= 5 },
  { id: 'streak-10', label: '10 Streak', check: (pp: PuzzleProgress) => pp.bestStreak >= 10 },
  { id: 'ch1-master', label: 'Chapter 1 Complete', check: (pp: PuzzleProgress) => (pp.chapterStats[1]?.solved || 0) >= 8 },
  { id: 'ch2-master', label: 'Chapter 2 Complete', check: (pp: PuzzleProgress) => (pp.chapterStats[2]?.solved || 0) >= 8 },
  { id: 'ch3-master', label: 'Chapter 3 Complete', check: (pp: PuzzleProgress) => (pp.chapterStats[3]?.solved || 0) >= 8 },
  { id: 'ch4-master', label: 'Chapter 4 Complete', check: (pp: PuzzleProgress) => (pp.chapterStats[4]?.solved || 0) >= 8 },
  { id: 'ch5-master', label: 'Chapter 5 Complete', check: (pp: PuzzleProgress) => (pp.chapterStats[5]?.solved || 0) >= 8 },
  { id: 'all-chapters', label: 'All Chapters', check: (pp: PuzzleProgress) =>
    [1,2,3,4,5].every(ch => (pp.chapterStats[ch]?.solved || 0) >= 8) },
  { id: 'solved-20', label: '20 Puzzles', check: (pp: PuzzleProgress) => pp.solvedPuzzles.length >= 20 },
  { id: 'solved-40', label: 'All 40 Puzzles', check: (pp: PuzzleProgress) => pp.solvedPuzzles.length >= 40 },
];

function computeBadges(pp: PuzzleProgress): string[] {
  const earned = pp.badges.slice();
  for (const def of BADGE_DEFS) {
    if (!earned.includes(def.id) && def.check(pp)) earned.push(def.id);
  }
  return earned;
}

function getFilteredOrder(filter: number | null): string[] {
  if (filter === null) return fischerPuzzles.map(p => p.id);
  return fischerPuzzles.filter(p => p.chapter === filter).map(p => p.id);
}

interface LearnStore {
  progress: LearnProgress;
  puzzleProgress: PuzzleProgress;
  learnMode: 'lessons' | 'puzzles' | 'progress';
  setLearnMode: (mode: 'lessons' | 'puzzles' | 'progress') => void;
  setCurrentChapter: (id: string) => void;
  setCurrentSection: (id: string) => void;
  setCurrentFrame: (index: number) => void;
  completeFrame: (frameId: string) => void;
  isFrameCompleted: (frameId: string) => boolean;
  goNextFrame: () => void;
  goPrevFrame: () => void;
  resetProgress: () => void;
  setPuzzleChapterFilter: (ch: number | null) => void;
  setCurrentPuzzleIndex: (idx: number) => void;
  attemptPuzzle: (puzzleId: string, success: boolean) => void;
  getPuzzleForIndex: (idx: number) => typeof fischerPuzzles[0] | null;
  getCurrentPuzzle: () => typeof fischerPuzzles[0] | null;
  getPuzzleProgress: (puzzleId: string) => { solved: boolean; attempts: number };
  getChapterStats: (chapter: number) => { solved: number; total: number; pct: number };
}

export const useLearnStore = create<LearnStore>((set, get) => ({
  progress: loadProgress(),
  puzzleProgress: loadPuzzleProgress(),
  learnMode: 'lessons',

  setLearnMode: (mode) => set({ learnMode: mode }),

  setCurrentChapter: (id) => {
    const chapter = learnContent.find(c => c.id === id);
    if (!chapter) return;
    set(s => ({
      progress: {
        ...s.progress,
        currentChapterId: id,
        currentSectionId: chapter.sections[0]?.id || s.progress.currentSectionId,
        currentFrameIndex: 0,
      },
    }));
    saveProgress(get().progress);
  },

  setCurrentSection: (id) => {
    set(s => ({
      progress: { ...s.progress, currentSectionId: id, currentFrameIndex: 0 },
    }));
    saveProgress(get().progress);
  },

  setCurrentFrame: (index) => {
    set(s => ({
      progress: { ...s.progress, currentFrameIndex: index },
    }));
    saveProgress(get().progress);
  },

  completeFrame: (frameId) => {
    set(s => {
      if (s.progress.completedFrames.includes(frameId)) return s;
      return {
        progress: {
          ...s.progress,
          completedFrames: [...s.progress.completedFrames, frameId],
        },
      };
    });
    saveProgress(get().progress);
  },

  isFrameCompleted: (frameId) => {
    return get().progress.completedFrames.includes(frameId);
  },

  goNextFrame: () => {
    const { progress } = get();
    const chapter = learnContent.find(c => c.id === progress.currentChapterId);
    if (!chapter) return;
    const section = chapter.sections.find(s => s.id === progress.currentSectionId);
    if (!section) return;
    const next = progress.currentFrameIndex + 1;
    if (next < section.frames.length) {
      get().setCurrentFrame(next);
    }
  },

  goPrevFrame: () => {
    const prev = get().progress.currentFrameIndex - 1;
    if (prev >= 0) {
      get().setCurrentFrame(prev);
    }
  },

  resetProgress: () => {
    const fresh: LearnProgress = {
      completedFrames: [],
      currentChapterId: learnContent[0]?.id || '',
      currentSectionId: learnContent[0]?.sections[0]?.id || '',
      currentFrameIndex: 0,
    };
    set({ progress: fresh });
    saveProgress(fresh);
  },

  // ── Puzzle actions ──────────────────────────────────────────
  setPuzzleChapterFilter: (ch) => {
    const order = getFilteredOrder(ch);
    set(s => ({
      puzzleProgress: {
        ...s.puzzleProgress,
        currentChapterFilter: ch,
        puzzleOrder: order,
        currentPuzzleIndex: 0,
      },
    }));
    savePuzzleProgress(get().puzzleProgress);
  },

  setCurrentPuzzleIndex: (idx) => {
    set(s => ({
      puzzleProgress: { ...s.puzzleProgress, currentPuzzleIndex: idx },
    }));
    savePuzzleProgress(get().puzzleProgress);
  },

  attemptPuzzle: (puzzleId, success) => {
    const puzzle = fischerPuzzles.find(p => p.id === puzzleId);
    if (!puzzle) return;
    set(s => {
      const pp = s.puzzleProgress;
      const attempts = (pp.attemptedPuzzles[puzzleId] || 0) + 1;
      const newAttempted = { ...pp.attemptedPuzzles, [puzzleId]: attempts };
      const alreadySolved = pp.solvedPuzzles.includes(puzzleId);
      const newSolved = alreadySolved ? pp.solvedPuzzles : success ? [...pp.solvedPuzzles, puzzleId] : pp.solvedPuzzles;
      const newStreak = success ? pp.streak + 1 : 0;
      const newBestStreak = Math.max(pp.bestStreak, newStreak);
      const newChapterStats = { ...pp.chapterStats };
      const ch = puzzle.chapter;
      const cur = newChapterStats[ch] || { solved: 0, total: 8 };
      const newSolvedCount = success && !alreadySolved ? cur.solved + 1 : cur.solved;
      if (newSolvedCount !== cur.solved) {
        newChapterStats[ch] = { solved: newSolvedCount, total: 8 };
      }
      if (!newChapterStats[ch]) {
        newChapterStats[ch] = { solved: 0, total: 8 };
      }
      const newPp: PuzzleProgress = {
        ...pp,
        solvedPuzzles: newSolved,
        attemptedPuzzles: newAttempted,
        streak: newStreak,
        bestStreak: newBestStreak,
        chapterStats: newChapterStats,
      };
      newPp.badges = computeBadges(newPp);
      return { puzzleProgress: newPp };
    });
    savePuzzleProgress(get().puzzleProgress);
  },

  getPuzzleForIndex: (idx) => {
    const { puzzleProgress } = get();
    const id = puzzleProgress.puzzleOrder[idx];
    if (!id) return null;
    return fischerPuzzles.find(p => p.id === id) || null;
  },

  getCurrentPuzzle: () => {
    const { puzzleProgress } = get();
    return get().getPuzzleForIndex(puzzleProgress.currentPuzzleIndex);
  },

  getPuzzleProgress: (puzzleId) => {
    const { puzzleProgress } = get();
    return {
      solved: puzzleProgress.solvedPuzzles.includes(puzzleId),
      attempts: puzzleProgress.attemptedPuzzles[puzzleId] || 0,
    };
  },

  getChapterStats: (chapter) => {
    const { puzzleProgress } = get();
    const st = puzzleProgress.chapterStats[chapter];
    const total = fischerPuzzles.filter(p => p.chapter === chapter).length;
    const solved = st?.solved || 0;
    return { solved, total, pct: total > 0 ? Math.round((solved / total) * 100) : 0 };
  },
}));
