import { useState, useCallback, useMemo } from 'react';
import { useLearnStore } from '../store/learnStore';
import { fischerPuzzles } from '../data/fischerPuzzles';
import PuzzleBoard from './learn/PuzzleBoard';

export default function PuzzlesView() {
  const {
    puzzleProgress, setPuzzleChapterFilter, setCurrentPuzzleIndex,
    attemptPuzzle, getCurrentPuzzle,
  } = useLearnStore();

  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [correctMoveUCI, setCorrectMoveUCI] = useState<string | undefined>(undefined);

  const currentPuzzle = getCurrentPuzzle();

  const chapters = useMemo(() => {
    const chs = new Set(fischerPuzzles.map(p => p.chapter));
    return [null as number | null, ...Array.from(chs).sort()];
  }, []);

  const isLastPuzzle = puzzleProgress.currentPuzzleIndex >= puzzleProgress.puzzleOrder.length - 1;
  const isFirstPuzzle = puzzleProgress.currentPuzzleIndex === 0;

  const handleMove = useCallback((uci: string, isCorrect: boolean) => {
    if (!currentPuzzle) return;
    setFeedback(isCorrect ? 'correct' : 'wrong');
    attemptPuzzle(currentPuzzle.id, isCorrect);
    if (isCorrect) {
      setShowExplanation(true);
      setShowHint(false);
    } else {
      setShowHint(true);
      setShowExplanation(false);
    }
  }, [currentPuzzle, attemptPuzzle]);

  const goNext = useCallback(() => {
    if (!isLastPuzzle) {
      setCurrentPuzzleIndex(puzzleProgress.currentPuzzleIndex + 1);
      setFeedback(null);
      setShowHint(false);
      setShowExplanation(false);
      setCorrectMoveUCI(undefined);
    }
  }, [isLastPuzzle, setCurrentPuzzleIndex, puzzleProgress.currentPuzzleIndex]);

  const goPrev = useCallback(() => {
    if (!isFirstPuzzle) {
      setCurrentPuzzleIndex(puzzleProgress.currentPuzzleIndex - 1);
      setFeedback(null);
      setShowHint(false);
      setShowExplanation(false);
      setCorrectMoveUCI(undefined);
    }
  }, [isFirstPuzzle, setCurrentPuzzleIndex, puzzleProgress.currentPuzzleIndex]);

  const handleShowAnswer = useCallback(() => {
    if (!currentPuzzle) return;
    setShowExplanation(true);
    setCorrectMoveUCI(currentPuzzle.correctMoves[0]);
    attemptPuzzle(currentPuzzle.id, false);
  }, [currentPuzzle, attemptPuzzle]);

  const handleChapterFilter = useCallback((ch: number | null) => {
    setPuzzleChapterFilter(ch);
    setFeedback(null);
    setShowHint(false);
    setShowExplanation(false);
    setCorrectMoveUCI(undefined);
  }, [setPuzzleChapterFilter]);

  if (!currentPuzzle) {
    return (
      <div className="home-container">
        <div className="text-center max-w-sm">
          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text)' }}>Puzzles</h2>
          <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
            No puzzles match the current filter.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="home-container">
      <div className="text-center max-w-lg">
        {/* header */}
        <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--text)' }}>Puzzles</h2>
        <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
          Fischer Tactics · {puzzleProgress.solvedPuzzles.length}/{fischerPuzzles.length} solved
          {puzzleProgress.streak > 0 && <> · 🔥 {puzzleProgress.streak} streak</>}
        </p>

        {/* chapter filter */}
        <div style={{ display: 'flex', gap: 4, justifyContent: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
          {chapters.map(ch => (
            <button
              key={ch === null ? 'all' : `ch${ch}`}
              onClick={() => handleChapterFilter(ch)}
              style={{
                padding: '4px 12px', borderRadius: 6, border: '1px solid var(--border)',
                background: puzzleProgress.currentChapterFilter === ch ? 'var(--accent)' : 'var(--elevated)',
                color: puzzleProgress.currentChapterFilter === ch ? '#000' : 'var(--text-secondary)',
                cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'inherit',
                transition: 'all 150ms var(--ease)',
              }}
            >
              {ch === null ? 'All Chapters' : `Chapter ${ch}`}
            </button>
          ))}
        </div>

        {/* board */}
        <div style={{
          display: 'flex', justifyContent: 'center', marginBottom: 16,
          maxWidth: 320, marginLeft: 'auto', marginRight: 'auto',
        }}>
          <PuzzleBoard
            fen={currentPuzzle.fen}
            turn={currentPuzzle.turn}
            correctMoves={currentPuzzle.correctMoves}
            onMove={handleMove}
            size={320}
            disabled={feedback === 'correct'}
            showCorrectMove={correctMoveUCI}
          />
        </div>

        <div style={{
          fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12,
        }}>
          {currentPuzzle.turn === 'white' ? 'White' : 'Black'} to move
          <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>
            {' · '}{currentPuzzle.title}
          </span>
        </div>

        {/* hint */}
        {!showExplanation && !showHint && (
          <button
            onClick={() => setShowHint(true)}
            style={{
              padding: '6px 14px', borderRadius: 6, border: '1px solid var(--border)',
              background: 'var(--elevated)', color: 'var(--text-muted)',
              cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'inherit',
              marginBottom: 16,
            }}
          >
            Show Hint
          </button>
        )}

        {showHint && !showExplanation && (
          <div style={{
            padding: '12px 16px', marginBottom: 16, borderRadius: 'var(--radius)',
            background: 'rgba(255,213,79,0.08)', border: '1px solid rgba(255,213,79,0.25)',
            fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, textAlign: 'left',
          }}>
            <span style={{ fontWeight: 700, color: 'var(--warning)' }}>Hint: </span>
            {currentPuzzle.hint}
          </div>
        )}

        {/* correct feedback */}
        {feedback === 'correct' && (
          <div style={{
            padding: '16px 20px', borderRadius: 'var(--radius)',
            background: 'rgba(124,179,66,0.10)', border: '1px solid rgba(124,179,66,0.25)',
            marginBottom: 20, textAlign: 'left',
          }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--success)', marginBottom: 4 }}>
              ✓ Correct!
            </div>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {currentPuzzle.explanation}
            </div>
          </div>
        )}

        {/* wrong feedback */}
        {feedback === 'wrong' && !showExplanation && (
          <div style={{
            padding: '16px 20px', borderRadius: 'var(--radius)',
            background: 'rgba(239,83,80,0.08)', border: '1px solid rgba(239,83,80,0.2)',
            marginBottom: 12, textAlign: 'left',
          }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--error)', marginBottom: 4 }}>
              ✗ Not quite
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Try again. Look for the tactical pattern.
            </div>
          </div>
        )}

        {feedback === 'wrong' && !showExplanation && (
          <div style={{ marginBottom: 20 }}>
            <button
              onClick={handleShowAnswer}
              style={{
                padding: '8px 16px', borderRadius: 6, border: '1px solid var(--border)',
                background: 'var(--elevated)', color: 'var(--text-muted)',
                cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'inherit',
              }}
            >
              Show Answer
            </button>
          </div>
        )}

        {showExplanation && feedback === 'wrong' && (
          <div style={{
            padding: '16px 20px', borderRadius: 'var(--radius)',
            background: 'var(--elevated)', border: '1px solid var(--border)',
            marginBottom: 20, textAlign: 'left',
          }}>
            <div style={{
              fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.08em', color: 'var(--accent)', marginBottom: 8,
            }}>
              Solution
            </div>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {currentPuzzle.explanation}
            </div>
            <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-muted)' }}>
              Correct move: {currentPuzzle.correctMoves.join(', ')}
            </div>
          </div>
        )}

        {/* navigation */}
        {feedback && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            paddingTop: 16, borderTop: '1px solid var(--border-subtle)',
            maxWidth: 400, margin: '0 auto',
          }}>
            <button
              onClick={goPrev}
              disabled={isFirstPuzzle}
              className="btn btn-sm"
              style={{
                opacity: isFirstPuzzle ? 0.3 : 1,
                background: 'var(--elevated)', color: 'var(--text-secondary)',
                border: '1px solid var(--border)', borderRadius: 'var(--radius)',
                padding: '8px 16px', cursor: isFirstPuzzle ? 'not-allowed' : 'pointer',
                fontWeight: 600, fontSize: 13, fontFamily: 'inherit',
              }}
            >
              ← Prev
            </button>

            <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>
              {puzzleProgress.currentPuzzleIndex + 1} / {puzzleProgress.puzzleOrder.length}
            </span>

            <button
              onClick={goNext}
              disabled={isLastPuzzle}
              className="btn btn-sm"
              style={{
                opacity: isLastPuzzle ? 0.3 : 1,
                background: 'var(--accent)', color: '#000',
                border: 'none', borderRadius: 'var(--radius)',
                padding: '8px 16px', cursor: isLastPuzzle ? 'not-allowed' : 'pointer',
                fontWeight: 700, fontSize: 13, fontFamily: 'inherit',
              }}
            >
              Next →
            </button>
          </div>
        )}

        {/* all done */}
        {isLastPuzzle && feedback === 'correct' && (
          <div style={{
            marginTop: 20, padding: '16px 20px', borderRadius: 'var(--radius)',
            background: 'rgba(124,179,66,0.10)', border: '1px solid rgba(124,179,66,0.25)',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--success)', marginBottom: 4 }}>
              All Puzzles Complete!
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              Try a different chapter filter for more.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
