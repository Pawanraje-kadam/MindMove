import { create } from 'zustand';
import { learnContent } from '../data/learnContent';
import type { LearnProgress } from '../engine/types';

const STORAGE_KEY = 'mm_learn_progress';

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

interface LearnStore {
  progress: LearnProgress;
  setCurrentChapter: (id: string) => void;
  setCurrentSection: (id: string) => void;
  setCurrentFrame: (index: number) => void;
  completeFrame: (frameId: string) => void;
  isFrameCompleted: (frameId: string) => boolean;
  goNextFrame: () => void;
  goPrevFrame: () => void;
  resetProgress: () => void;
}

export const useLearnStore = create<LearnStore>((set, get) => ({
  progress: loadProgress(),

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
}));
