import { fischerPuzzles } from '../src/data/fischerPuzzles';
import { fenToGameState, generateLegalMoves, moveToUCI, makeMove } from '../src/engine/board';

let passed = 0;
let failed = 0;
let errors: string[] = [];

for (const puzzle of fischerPuzzles) {
  try {
    let state = fenToGameState(puzzle.fen);
    if (state.error) throw new Error(state.error);
    let failedMove: string | null = null;

    for (const uci of puzzle.correctMoves) {
      const legalMoves = generateLegalMoves(state);
      const match = legalMoves.find(m => moveToUCI(m) === uci);
      if (!match) {
        failedMove = uci;
        break;
      }
      state = makeMove(state, match);
    }

    if (failedMove) {
      failed++;
      errors.push(`${puzzle.id} (${puzzle.title}): missing move ${failedMove}`);
      console.log(`✗ ${puzzle.id}: missing ${failedMove}`);
    } else {
      passed++;
      console.log(`✓ ${puzzle.id}: ${puzzle.correctMoves.join(', ')}`);
    }
  } catch (e: any) {
    failed++;
    errors.push(`${puzzle.id}: ${e.message}`);
    console.log(`✗ ${puzzle.id}: ERROR - ${e.message}`);
  }
}

console.log(`\n${passed}/${fischerPuzzles.length} passed, ${failed} failed`);
if (errors.length > 0) {
  console.log('\nErrors:');
  errors.forEach(e => console.log(`  - ${e}`));
}
