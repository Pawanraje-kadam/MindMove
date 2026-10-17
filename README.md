# MindMove

MindMove is a sleek, modern chess application built with React, TypeScript, and Vite. It combines a premium interface with practical chess features including local multiplayer, AI play, board analysis, puzzles, learning content, and a custom chess engine tuned for fast, stylish gameplay.

## Overview

MindMove delivers a polished chess experience for players of all levels. You can:

- Play local 2-player matches
- Challenge a computer opponent in multiple difficulty levels
- Watch AI vs AI games
- Analyze positions and move history
- Explore puzzle and learning modes
- Customize settings and time controls
- Review engine evaluation and move information

## Features

- Modern chess UI with responsive layout
- Human-vs-human, human-vs-AI, and AI-vs-AI modes
- Multiple difficulty presets for the AI
- Time controls including unlimited, 1+0, 3+0, 5+0, 10+0, and 15+5
- Player color selection for AI games
- Move list and captured pieces tracking
- Position evaluation bar and graph
- Analysis tools for reviewing games
- Puzzle and learning views
- Custom engine logic with evaluation and opening book support

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Zustand for state management
- Chess.js for chess rules and move generation
- Custom chess engine utilities for evaluation and AI decisions

## Project Structure

```text
MindMove/
├── public/
│   ├── book.bin
│   └── weights.bin
├── scripts/
├── src/
│   ├── assets/
│   ├── components/
│   ├── data/
│   ├── design/
│   ├── engine/
│   ├── hooks/
│   ├── store/
│   ├── styles/
│   ├── utils/
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── .gitignore
├── index.html
├── LICENSE
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm

### Installation

```bash
npm install
```

### Run locally

```bash
npm run dev
```

This starts the Vite development server. Open the local URL shown in the terminal to play the game.

### Production build

```bash
npm run build
```

To preview the production build:

```bash
npm run preview
```

## Available Scripts

```bash
npm run dev      # start Vite dev server
npm run build    # create production build
npm run preview  # preview production build locally
```

## Gameplay Notes

The app includes a variety of chess workflows:

- Quick play from the home screen
- AI difficulty selection from beginner to master-level strength
- Local match mode with no AI
- Analysis mode for studying moves and evaluations
- Educational sections for learning and puzzle solving

## Engine and AI

The engine layer under `src/engine` includes chess logic, evaluation, analysis, and AI-related functionality. The project integrates:

- board state and move handling
- evaluation scoring
- opening book references
- NNUE-inspired evaluation support
- game analysis helpers

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Credits

Built for a polished, modern chess experience with a focus on gameplay, strategy, and clean UX.

## Contributing

Contributions are welcome. If you want to improve the chess engine, add new features, or refine the interface, feel free to fork the project and open a pull request.

## Project Summary

MindMove is designed to feel premium and fast while staying practical for real chess play and analysis. It blends a polished interface with a feature-rich chess experience in a single React app.
