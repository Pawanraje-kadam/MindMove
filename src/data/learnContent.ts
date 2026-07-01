import { LearnChapter } from '../engine/types';

export const learnContent: LearnChapter[] = [
  {
    id: 'ch1',
    title: 'Elements of Checkmate',
    description: 'Understanding the fundamental patterns of checkmate',
    order: 1,
    sections: [
      {
        id: 'ch1-sec1',
        title: 'The Back-Rank Mates',
        description: 'When the king is trapped by its own pawns',
        order: 1,
        frames: [
          {
            id: 'ch1-sec1-f1',
            fen: '6k1/5ppp/8/8/8/8/5PPP/R5K1 w - - 0 1',
            turn: 'white',
            instruction: 'Study the position carefully.',
            question: 'White to move. How can White deliver checkmate in one move?',
            type: 'multiple-choice',
            choices: [
              { id: 'a', text: 'Ra8#', isCorrect: true },
              { id: 'b', text: 'Rb1', isCorrect: false },
              { id: 'c', text: 'Kf2', isCorrect: false },
              { id: 'd', text: 'Ra6', isCorrect: false },
            ],
            explanation:
              'The rook moves to a8, delivering check to the black king. Black\'s own pawns on f7, g7, and h7 block all escape squares, and the rook attacks f8 and h8 on the back rank. This is the classic back-rank mate pattern.',
          },
          {
            id: 'ch1-sec1-f2',
            fen: '6k1/5ppp/8/8/8/5Q2/5PPP/6K1 w - - 0 1',
            turn: 'white',
            instruction: 'A powerful piece can also deliver back-rank mate.',
            question: 'White to move. How does White checkmate?',
            type: 'multiple-choice',
            choices: [
              { id: 'a', text: 'Qb7', isCorrect: false },
              { id: 'b', text: 'Qf8#', isCorrect: true },
              { id: 'c', text: 'Qc6', isCorrect: false },
              { id: 'd', text: 'Qe4', isCorrect: false },
            ],
            explanation:
              'The queen moves to f8, checking the king. The queen attacks g8 (check), covers f8 and h8 along the 8th rank, and also attacks f7 along the file and g7 on the diagonal. None of the king\'s escape squares are safe.',
          },
          {
            id: 'ch1-sec1-f3',
            fen: '5r1k/5ppp/8/8/8/8/5PPP/5RK1 w - - 0 1',
            turn: 'white',
            instruction: 'Sometimes the defender must be eliminated.',
            question: 'White to move. What is the winning move?',
            type: 'multiple-choice',
            choices: [
              { id: 'a', text: 'Rxf8#', isCorrect: true },
              { id: 'b', text: 'Rg1', isCorrect: false },
              { id: 'c', text: 'Kg2', isCorrect: false },
              { id: 'd', text: 'Rf2', isCorrect: false },
            ],
            explanation:
              'White captures the rook on f8 with checkmate! The black rook was the only piece that could potentially block a back-rank check. By capturing it, White delivers mate — the king on h8 is trapped by its own pawns and the rook on f8 attacks both g8 and h8.',
          },
          {
            id: 'ch1-sec1-f4',
            fen: '6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1',
            turn: 'white',
            instruction: 'Any rook on the back rank can deliver this mate.',
            question: 'White to move. How does White checkmate?',
            type: 'multiple-choice',
            choices: [
              { id: 'a', text: 'Re1', isCorrect: false },
              { id: 'b', text: 'Rd8#', isCorrect: true },
              { id: 'c', text: 'Rd7', isCorrect: false },
              { id: 'd', text: 'Kf2', isCorrect: false },
            ],
            explanation:
              'White plays Rd8#. The concept is the same as Frame 1 — once a rook reaches the 8th rank with the black king trapped behind its own pawn shield, it\'s checkmate. The distance from the king doesn\'t matter for a rook.',
          },
          {
            id: 'ch1-sec1-f5',
            fen: '6k1/5p1p/5Pp1/8/8/8/5PPP/5RK1 w - - 0 1',
            turn: 'white',
            instruction: 'One escape square may still be open.',
            question: 'White to move. Is Rf8# checkmate? Why or why not?',
            type: 'multiple-choice',
            choices: [
              { id: 'a', text: 'Yes — rook checks, pawns block everything', isCorrect: false },
              { id: 'b', text: 'No — Black can escape to g7', isCorrect: true },
              { id: 'c', text: 'No — Black can block with a piece', isCorrect: false },
              { id: 'd', text: 'Yes — rook controls all escape squares', isCorrect: false },
            ],
            explanation:
              'Rf8+ is NOT checkmate because the g7 square is open! Unlike the previous frames where pawns were on f7, g7, and h7, here only f7 and h7 have pawns. The g7 square is empty and allows the king to escape. In this position, White would need to cover g7 first (with the bishop or queen) before delivering mate.',
          },
          {
            id: 'ch1-sec1-f6',
            fen: 'r1b1k2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQR1K1 w - - 0 1',
            turn: 'white',
            instruction: 'Recognize the vulnerability in a real-game position.',
            question: 'White to move. What tactical opportunity is available?',
            type: 'multiple-choice',
            choices: [
              { id: 'a', text: 'White is better — no immediate tactic', isCorrect: false },
              { id: 'b', text: 'Rxd7 Bxd7? Qd5! threatening mate', isCorrect: false },
              { id: 'c', text: 'Bxf7+ Rxf7? Qd5! threatening back-rank mate', isCorrect: true },
              { id: 'd', text: 'Ne4 threatening fork on d6', isCorrect: false },
            ],
            explanation:
              'White can play Bxf7+! If Black recaptures with Rxf7 (instead of Kxf7), White plays Qd5!, threatening both the rook on a8 and Qxf7# — a back-rank mate! Black must lose material. This shows how back-rank weaknesses can be exploited in realistic positions.',
          },
          {
            id: 'ch1-sec1-f7',
            fen: 'r1b2rk1/pppp1ppp/2n5/2b1P3/4P1P1/2N5/PP2qP1P/R1BQR1K1 w - - 0 1',
            turn: 'white',
            instruction: 'The back rank can be a fatal weakness even with pieces still on the board.',
            question: 'Black just played Qe2, threatening Qxf1#. What should White do?',
            type: 'multiple-choice',
            choices: [
              { id: 'a', text: 'Rxe2 — eliminates the threat', isCorrect: false },
              { id: 'b', text: 'Resign — the mate threat is unstoppable', isCorrect: false },
              { id: 'c', text: 'Rf1 — blocks the queen\'s access', isCorrect: true },
              { id: 'd', text: 'g3 — creates luft for the king', isCorrect: false },
            ],
            explanation:
              'White must play Rf1, blocking the queen\'s attack on f1. The back rank was vulnerable because White\'s king had no luft (an escape square). Rule of thumb: if your king is on the back rank with blocked pawns, always consider whether the opponent can threaten checkmate there.',
          },
          {
            id: 'ch1-sec1-f8',
            fen: 'r3r1k1/pppq1ppp/2np1n2/2b1p1B1/2B1P3/2NP1N2/PPP2PPP/R2QR1K1 w - - 0 1',
            turn: 'white',
            instruction: 'A classic back-rank combination.',
            question: 'White to move. How can White force a win?',
            type: 'multiple-choice',
            choices: [
              { id: 'a', text: 'Qd5 — threatening mate and the rook', isCorrect: false },
              { id: 'b', text: 'Bxf7+ Kxf7 Ng5+ forking king and queen', isCorrect: false },
              { id: 'c', text: 'Rxd6! Qxd6? Bxf7+! Kxf7? Qxd6 winning', isCorrect: false },
              { id: 'd', text: 'Bxf7+! Kxf7? Ng5+ Kg8 Qb3+ Kh8 Qf7 with mate threat', isCorrect: true },
            ],
            explanation:
              'Bxf7+! is the winning blow. If Black takes with the king (Kxf7), Ng5+ forces Kg8, then Qb3+ Kh8 and Qf7 threatens Qf8#. Black must give up major material to stop the mate. This combination exploits the king\'s confinement behind its own pawns on a semi-open board.',
          },
        ],
      },
      {
        id: 'ch1-sec2',
        title: 'Defending the Back Rank',
        description: 'How to protect against back-rank mates',
        order: 2,
        frames: [
          {
            id: 'ch1-sec2-f1',
            fen: 'r1bq1rk1/pppp1ppp/2n2n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQR1K1 w - - 0 1',
            turn: 'white',
            instruction: 'Creating luft — giving the king breathing room.',
            question: 'White\'s king is potentially vulnerable on g1. What simple preventive move should White consider?',
            type: 'multiple-choice',
            choices: [
              { id: 'a', text: 'h3 — creating an escape square on h2', isCorrect: true },
              { id: 'b', text: 'Kh1 — moving the king away', isCorrect: false },
              { id: 'c', text: 'Rfe1 — connecting rooks', isCorrect: false },
              { id: 'd', text: 'Bg5 — pinning the knight', isCorrect: false },
            ],
            explanation:
              'Playing h3 (or h4) creates luft — an escape square for the king on h2. This is a common preventive measure against back-rank mate threats. Whenever you castled and your pawns haven\'t moved, consider whether the opponent might threaten back-rank mate.',
          },
          {
            id: 'ch1-sec2-f2',
            fen: '6k1/5ppp/8/8/8/8/5PPP/R5K1 b - - 0 1',
            turn: 'black',
            instruction: 'Black\'s turn — identify the danger.',
            question: 'Black to move. White threatens Ra8#. How can Black prevent it?',
            type: 'multiple-choice',
            choices: [
              { id: 'a', text: 'g6 — creating luft on g7', isCorrect: true },
              { id: 'b', text: 'Kf8 — moving the king', isCorrect: false },
              { id: 'c', text: 'h6 — creating luft on h7', isCorrect: false },
              { id: 'd', text: 'There is no escape — Black is lost', isCorrect: false },
            ],
            explanation:
              'Black can play g6, creating an escape square on g7. Now if White plays Ra8+, Black\'s king escapes to g7. Always look for the option of pushing a pawn to give your king an escape square when facing back-rank threats.',
          },
        ],
      },
    ],
  },
];
