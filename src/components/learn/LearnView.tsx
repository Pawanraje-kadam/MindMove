import { useMemo, useState, useCallback } from 'react';
import { useGameStore } from '../../store/gameStore';
import { useLearnStore } from '../../store/learnStore';
import { learnContent } from '../../data/learnContent';
import LearnSidebar from './LearnSidebar';
import MiniBoard from './MiniBoard';
import LearnProgress from './LearnProgress';

export default function LearnView() {
  const { setView, newGame } = useGameStore();
  const {
    progress, setCurrentSection, setCurrentFrame,
    completeFrame, goNextFrame, goPrevFrame, isFrameCompleted,
    learnMode, setLearnMode,
  } = useLearnStore();

  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);

  const chapter = useMemo(
    () => learnContent.find(c => c.id === progress.currentChapterId),
    [progress.currentChapterId],
  );

  const section = useMemo(
    () => chapter?.sections.find(s => s.id === progress.currentSectionId),
    [chapter, progress.currentSectionId],
  );

  const frame = useMemo(
    () => section?.frames[progress.currentFrameIndex] ?? null,
    [section, progress.currentFrameIndex],
  );

  const sectionIndex = useMemo(
    () => (chapter?.sections ?? []).findIndex(s => s.id === progress.currentSectionId),
    [chapter, progress.currentSectionId],
  );

  const totalFrames = section?.frames.length ?? 0;

  const allDone = useMemo(
    () => frame && isFrameCompleted(frame.id),
    [frame, isFrameCompleted],
  );

  const handleChoice = useCallback((choiceId: string, isCorrect: boolean) => {
    if (showAnswer) return;
    setSelectedChoice(choiceId);
    setShowAnswer(true);
    if (frame && isCorrect) {
      completeFrame(frame.id);
    }
  }, [showAnswer, frame, completeFrame]);

  const handleNext = useCallback(() => {
    setSelectedChoice(null);
    setShowAnswer(false);
    goNextFrame();
  }, [goNextFrame]);

  const handlePrev = useCallback(() => {
    setSelectedChoice(null);
    setShowAnswer(false);
    goPrevFrame();
  }, [goPrevFrame]);

  const handleNavSection = useCallback((sectionId: string) => {
    setSelectedChoice(null);
    setShowAnswer(false);
    setCurrentSection(sectionId);
    setCurrentFrame(0);
  }, [setCurrentSection, setCurrentFrame]);

  // ── Progress mode ───────────────────────────────────────────
  if (learnMode === 'progress') {
    return (
      <div style={{ display: 'flex', height: '100%', width: '100%' }}>
        <LearnSidebar />
        <LearnProgress />
      </div>
    );
  }

  // ── Empty state ──────────────────────────────────────────────
  if (!chapter || !section || !frame) {
    return (
      <div style={{ display: 'flex', height: '100%', width: '100%' }}>
        <LearnSidebar />
        <div className="home-container" style={{ flex: 1 }}>
          <div className="text-center max-w-sm">
            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text)' }}>Learn</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
              No content available
            </p>
            <div className="flex flex-col gap-3 max-w-xs mx-auto">
              {chapter && (
                <button
                  onClick={() => chapter.sections.length > 0 && handleNavSection(chapter.sections[0].id)}
                  className="btn btn-primary btn-lg w-full"
                >
                  Start First Section
                </button>
              )}
              <button onClick={() => setView('home')} className="btn btn-secondary w-full">
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Lessons mode (existing quiz UI) ──────────────────────────
  return (
    <div style={{ display: 'flex', height: '100%', width: '100%' }}>
      <LearnSidebar />

      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden',
        background: 'radial-gradient(ellipse at 50% 0%, var(--raised) 0%, var(--bg) 60%, var(--void) 100%)',
      }}>
        {/* header bar with mode tabs */}
        <div style={{
          padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 12,
          borderBottom: '1px solid var(--border-subtle)', background: 'var(--raised)', flexShrink: 0,
          flexWrap: 'wrap',
        }}>
          {/* mode tabs */}
          <div style={{ display: 'flex', gap: 2, background: 'var(--bg)', borderRadius: 8, padding: 2 }}>
            {([
              { key: 'lessons' as const, label: 'Lessons' },
              { key: 'progress' as const, label: 'Progress' },
            ]).map(tab => (
              <button
                key={tab.key}
                onClick={() => setLearnMode(tab.key)}
                style={{
                  padding: '6px 14px', borderRadius: 6, border: 'none',
                  background: learnMode === tab.key ? 'var(--elevated)' : 'transparent',
                  color: learnMode === tab.key ? 'var(--text)' : 'var(--text-muted)',
                  cursor: 'pointer', fontSize: 12, fontWeight: 700, fontFamily: 'inherit',
                  transition: 'all 150ms var(--ease)',
                  boxShadow: learnMode === tab.key ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>
              {section.title}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
              {chapter.title} · Section {sectionIndex + 1} of {chapter.sections.length}
            </div>
          </div>

          <button
            onClick={() => { setView('play'); newGame({ mode: 'hva', difficulty: 'intermediate', playerColor: 'white' }); }}
            className="btn btn-sm btn-primary"
          >
            Practice
          </button>
        </div>

        {/* scrolling content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px' }}>
          <div style={{ maxWidth: 640, margin: '0 auto' }}>
            <div style={{
              display: 'flex', justifyContent: 'center', marginBottom: 24,
              maxWidth: 320, marginLeft: 'auto', marginRight: 'auto',
            }}>
              <MiniBoard fen={frame.fen} turn={frame.turn} size={320} />
            </div>

            <div style={{
              padding: '12px 16px', marginBottom: 16, borderRadius: 'var(--radius)',
              background: 'var(--accent-subtle)', border: '1px solid var(--accent-glow)',
              fontSize: 13, color: 'var(--accent)', fontWeight: 600, lineHeight: 1.5,
            }}>
              {frame.instruction}
            </div>

            <p style={{
              fontSize: 15, fontWeight: 600, color: 'var(--text)',
              marginBottom: 20, lineHeight: 1.5,
            }}>
              {frame.question}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
              {frame.choices.map(choice => {
                const isSelected = selectedChoice === choice.id;
                const isCorrectChoice = choice.isCorrect;

                let bg = 'var(--elevated)';
                let border = 'var(--border)';
                let textColor = 'var(--text-secondary)';

                if (showAnswer) {
                  if (isCorrectChoice) {
                    bg = 'rgba(124,179,66,0.12)';
                    border = 'var(--success)';
                    textColor = 'var(--success)';
                  } else if (isSelected && !isCorrectChoice) {
                    bg = 'rgba(239,83,80,0.12)';
                    border = 'var(--error)';
                    textColor = 'var(--error)';
                  }
                } else if (isSelected) {
                  bg = 'var(--surface)';
                  border = 'var(--accent)';
                  textColor = 'var(--text)';
                }

                return (
                  <button
                    key={choice.id}
                    onClick={() => handleChoice(choice.id, choice.isCorrect)}
                    disabled={showAnswer}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '14px 18px', borderRadius: 'var(--radius)',
                      background: bg, border: `2px solid ${border}`,
                      cursor: showAnswer ? 'default' : 'pointer',
                      transition: 'all 150ms var(--ease)',
                      textAlign: 'left', fontSize: 14, fontWeight: 500,
                      color: textColor, fontFamily: 'inherit',
                    }}
                  >
                    <span style={{
                      width: 28, height: 28, borderRadius: '50%', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      fontSize: 13, fontWeight: 700,
                      background: showAnswer && isCorrectChoice ? 'var(--success)' : isSelected ? 'var(--accent)' : 'var(--bg)',
                      color: showAnswer && isCorrectChoice ? '#000' : isSelected ? '#000' : 'var(--text-muted)',
                    }}>
                      {showAnswer && isCorrectChoice ? '✓' : String.fromCharCode(65 + frame.choices.indexOf(choice))}
                    </span>
                    <span>{choice.text}</span>
                  </button>
                );
              })}
            </div>

            {showAnswer && (
              <div style={{
                padding: '16px 20px', borderRadius: 'var(--radius)',
                background: 'var(--elevated)', border: '1px solid var(--border)',
                marginBottom: 24,
              }}>
                <div style={{
                  fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: '0.08em', color: 'var(--accent)', marginBottom: 8,
                }}>
                  Explanation
                </div>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {frame.explanation}
                </p>
              </div>
            )}

            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              paddingTop: 16, borderTop: '1px solid var(--border-subtle)',
            }}>
              <button
                onClick={handlePrev}
                disabled={progress.currentFrameIndex === 0}
                className="btn btn-sm"
                style={{
                  opacity: progress.currentFrameIndex === 0 ? 0.3 : 1,
                  background: 'var(--elevated)', color: 'var(--text-secondary)',
                  border: '1px solid var(--border)', borderRadius: 'var(--radius)',
                  padding: '8px 16px', cursor: progress.currentFrameIndex === 0 ? 'not-allowed' : 'pointer',
                  fontWeight: 600, fontSize: 13, fontFamily: 'inherit',
                }}
              >
                ← Prev
              </button>

              <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>
                {progress.currentFrameIndex + 1} / {totalFrames}
              </span>

              <button
                onClick={handleNext}
                disabled={progress.currentFrameIndex >= totalFrames - 1}
                className="btn btn-sm"
                style={{
                  opacity: progress.currentFrameIndex >= totalFrames - 1 ? 0.3 : 1,
                  background: 'var(--accent)', color: '#000',
                  border: 'none', borderRadius: 'var(--radius)',
                  padding: '8px 16px', cursor: progress.currentFrameIndex >= totalFrames - 1 ? 'not-allowed' : 'pointer',
                  fontWeight: 700, fontSize: 13, fontFamily: 'inherit',
                }}
              >
                Next →
              </button>
            </div>

            {progress.currentFrameIndex >= totalFrames - 1 && showAnswer && (
              <div style={{
                marginTop: 20, padding: '16px 20px', borderRadius: 'var(--radius)',
                background: 'rgba(124,179,66,0.10)', border: '1px solid rgba(124,179,66,0.25)',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--success)', marginBottom: 4 }}>
                  Section Complete!
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
                  {allDone ? 'All frames completed.' : 'You\'ve reached the end of this section.'}
                </div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                  {sectionIndex < (chapter?.sections ?? []).length - 1 && (
                    <button
                      onClick={() => {
                        const nextSection = chapter?.sections[sectionIndex + 1];
                        if (nextSection) handleNavSection(nextSection.id);
                      }}
                      className="btn btn-sm btn-primary"
                    >
                      Next Section
                    </button>
                  )}
                  {sectionIndex >= (chapter?.sections ?? []).length - 1 && (
                    <button onClick={() => setView('play')} className="btn btn-sm btn-secondary">
                      Practice What You Learned
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
