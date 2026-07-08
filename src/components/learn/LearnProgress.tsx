import { useMemo } from 'react';
import { useLearnStore } from '../../store/learnStore';
import { fischerPuzzles } from '../../data/fischerPuzzles';
import { useGameStore } from '../../store/gameStore';

const BADGE_INFO: Record<string, { label: string; desc: string }> = {
  'first-solve': { label: 'First Solve', desc: 'Solve your first puzzle' },
  'streak-5': { label: '5 Streak', desc: 'Achieve a 5-puzzle streak' },
  'streak-10': { label: '10 Streak', desc: 'Achieve a 10-puzzle streak' },
  'ch1-master': { label: 'Ch 1 Master', desc: 'Complete all Chapter 1 puzzles' },
  'ch2-master': { label: 'Ch 2 Master', desc: 'Complete all Chapter 2 puzzles' },
  'ch3-master': { label: 'Ch 3 Master', desc: 'Complete all Chapter 3 puzzles' },
  'ch4-master': { label: 'Ch 4 Master', desc: 'Complete all Chapter 4 puzzles' },
  'ch5-master': { label: 'Ch 5 Master', desc: 'Complete all Chapter 5 puzzles' },
  'all-chapters': { label: 'Grandmaster', desc: 'Complete all 5 chapters' },
  'solved-20': { label: '20 Solved', desc: 'Solve 20 puzzles' },
  'solved-40': { label: 'Completionist', desc: 'Solve all 40 puzzles' },
};

export default function LearnProgress() {
  const { puzzleProgress, progress, learnMode } = useLearnStore();
  const { setView, newGame } = useGameStore();

  const chapterData = useMemo(() => {
    return [1, 2, 3, 4, 5].map(ch => {
      const puzzles = fischerPuzzles.filter(p => p.chapter === ch);
      const solved = puzzleProgress.solvedPuzzles.filter(id => fischerPuzzles.find(p => p.id === id)?.chapter === ch).length;
      return { chapter: ch, total: puzzles.length, solved, pct: puzzles.length > 0 ? Math.round((solved / puzzles.length) * 100) : 0 };
    });
  }, [puzzleProgress.solvedPuzzles]);

  const totalSolved = puzzleProgress.solvedPuzzles.length;
  const totalPuzzles = fischerPuzzles.length;
  const overallPct = Math.round((totalSolved / totalPuzzles) * 100);
  const totalAttempts = Object.values(puzzleProgress.attemptedPuzzles).reduce((a, b) => a + b, 0);
  const accuracy = totalAttempts > 0 ? Math.round((totalSolved / totalAttempts) * 100) : 0;

  const badges = useMemo(() => {
    return puzzleProgress.badges.map(id => BADGE_INFO[id]).filter(Boolean);
  }, [puzzleProgress.badges]);

  const lessonProgress = useMemo(() => {
    const allFrames = progress.completedFrames.length;
    return allFrames;
  }, [progress.completedFrames]);

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '32px 40px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>
          Your Progress
        </h2>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 28 }}>
          Track your puzzle-solving journey through Fischer's curriculum
        </p>

        {/* stats cards */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 12, marginBottom: 28,
        }}>
          {[
            { label: 'Puzzles Solved', value: `${totalSolved}/${totalPuzzles}`, sub: `${overallPct}%` },
            { label: 'Current Streak', value: `${puzzleProgress.streak}`, sub: `Best: ${puzzleProgress.bestStreak}` },
            { label: 'Accuracy', value: `${accuracy}%`, sub: `${totalAttempts} attempts` },
            { label: 'Lesson Frames', value: `${lessonProgress}`, sub: 'completed' },
          ].map(card => (
            <div key={card.label} style={{
              padding: '16px 18px', borderRadius: 'var(--radius)',
              background: 'var(--raised)', border: '1px solid var(--border-subtle)',
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 6 }}>
                {card.label}
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)', marginBottom: 2 }}>
                {card.value}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {card.sub}
              </div>
            </div>
          ))}
        </div>

        {/* chapter progress */}
        <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>
          Chapter Progress
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
          {chapterData.map(ch => {
            const chapterNames: Record<number, string> = {
              1: 'Back Rank Checkmate Fundamentals',
              2: 'Clearing the Back Rank',
              3: 'Multi-Move Combinations',
              4: 'Trapping the King in the Center',
              5: 'Avoiding Stalemate While Winning',
            };
            return (
              <div key={ch.chapter} style={{
                padding: '12px 16px', borderRadius: 'var(--radius)',
                background: 'var(--raised)', border: '1px solid var(--border-subtle)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', marginRight: 8 }}>
                      Ch {ch.chapter}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
                      {chapterNames[ch.chapter]}
                    </span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: ch.pct === 100 ? 'var(--success)' : 'var(--text-muted)' }}>
                    {ch.solved}/{ch.total}
                  </span>
                </div>
                <div style={{ height: 4, background: 'var(--border-subtle)', borderRadius: 2 }}>
                  <div style={{
                    height: '100%', width: `${ch.pct}%`, borderRadius: 2,
                    background: ch.pct === 100 ? 'var(--success)' : 'var(--accent)',
                    transition: 'width 300ms var(--ease-out)',
                  }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* badges */}
        <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>
          Badges ({badges.length})
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 28 }}>
          {badges.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic' }}>
              Solve puzzles to earn badges
            </p>
          ) : (
            badges.map(badge => (
              <div key={badge.label} style={{
                padding: '8px 14px', borderRadius: 'var(--radius)',
                background: 'rgba(255,213,79,0.08)', border: '1px solid rgba(255,213,79,0.2)',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <span style={{ fontSize: 16 }}>🏅</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{badge.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{badge.desc}</div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* action buttons */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => useLearnStore.getState().setLearnMode('puzzles')}
            className="btn btn-primary"
          >
            Continue Puzzles
          </button>
          <button
            onClick={() => useLearnStore.getState().setLearnMode('lessons')}
            className="btn btn-secondary"
          >
            Continue Lessons
          </button>
          <button
            onClick={() => { setView('play'); newGame({ mode: 'hva', difficulty: 'intermediate', playerColor: 'white' }); }}
            className="btn btn-secondary"
          >
            Practice vs AI
          </button>
        </div>
      </div>
    </div>
  );
}
