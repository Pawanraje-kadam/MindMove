import { useMemo } from 'react';
import { useLearnStore } from '../../store/learnStore';
import { learnContent } from '../../data/learnContent';
import type { LearnSection, LearnChapter } from '../../engine/types';

function getSectionProgress(section: LearnSection, completedFrames: string[]): number {
  if (section.frames.length === 0) return 0;
  const done = section.frames.filter(f => completedFrames.includes(f.id)).length;
  return Math.round((done / section.frames.length) * 100);
}

function getChapterProgress(chapter: LearnChapter, completedFrames: string[]): number {
  const allFrames = chapter.sections.flatMap(s => s.frames);
  if (allFrames.length === 0) return 0;
  const done = allFrames.filter(f => completedFrames.includes(f.id)).length;
  return Math.round((done / allFrames.length) * 100);
}

export default function LearnSidebar() {
  const { progress, setCurrentChapter, setCurrentSection, setCurrentFrame } = useLearnStore();

  const chapters = useMemo(() => learnContent, []);

  return (
    <div style={{
      width: 280, display: 'flex', flexDirection: 'column', height: '100%',
      background: 'var(--raised)', borderRight: '1px solid var(--border-subtle)',
    }}>
      {/* header */}
      <div style={{
        padding: '16px 18px', borderBottom: '1px solid var(--border-subtle)',
        background: 'linear-gradient(180deg, var(--elevated) 0%, var(--raised) 100%)',
      }}>
        <h3 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>
          Curriculum
        </h3>
      </div>

      {/* chapters */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {chapters.map(chapter => {
          const chapterActive = progress.currentChapterId === chapter.id;
          const cp = getChapterProgress(chapter, progress.completedFrames);

          return (
            <div key={chapter.id} style={{ marginBottom: 4 }}>
              {/* chapter header */}
              <button
                onClick={() => setCurrentChapter(chapter.id)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '12px 18px', border: 'none', background: chapterActive ? 'var(--accent-subtle)' : 'transparent',
                  cursor: 'pointer', transition: 'all 150ms var(--ease)',
                  color: chapterActive ? 'var(--accent)' : 'var(--text)',
                  fontWeight: chapterActive ? 700 : 600,
                  fontSize: 14, textAlign: 'left',
                  borderLeft: chapterActive ? '3px solid var(--accent)' : '3px solid transparent',
                }}
              >
                <span style={{ flex: 1 }}>{chapter.title}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>
                  {cp}%
                </span>
              </button>

              {/* progress bar */}
              <div style={{ height: 2, background: 'var(--border-subtle)', margin: '0 18px 4px' }}>
                <div style={{
                  height: '100%', width: `${cp}%`, background: 'var(--accent)',
                  borderRadius: 1, transition: 'width 300ms var(--ease-out)',
                }} />
              </div>

              {/* sections */}
              {chapterActive && chapter.sections.map(section => {
                const secActive = progress.currentSectionId === section.id;
                const sp = getSectionProgress(section, progress.completedFrames);

                return (
                  <button
                    key={section.id}
                    onClick={() => {
                      setCurrentSection(section.id);
                      setCurrentFrame(0);
                    }}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                      padding: '10px 18px 10px 36px', border: 'none',
                      background: secActive ? 'var(--accent-subtle)' : 'transparent',
                      cursor: 'pointer', transition: 'all 150ms var(--ease)',
                      color: secActive ? 'var(--text)' : 'var(--text-secondary)',
                      fontSize: 13, fontWeight: secActive ? 600 : 500,
                      textAlign: 'left', opacity: secActive ? 1 : 0.85,
                    }}
                  >
                    {/* circle indicator */}
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                      background: sp === 100 ? 'var(--success)' : secActive ? 'var(--accent)' : 'var(--border-strong)',
                    }} />
                    <span style={{ flex: 1 }}>{section.title}</span>
                    {sp === 100 && (
                      <span style={{ fontSize: 10, color: 'var(--success)', fontWeight: 700 }}>Done</span>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* footer */}
      <div style={{
        padding: '12px 18px', borderTop: '1px solid var(--border-subtle)',
        fontSize: 11, color: 'var(--text-muted)', display: 'flex', gap: 8,
      }}>
        <span>{progress.completedFrames.length} frames completed</span>
      </div>
    </div>
  );
}
