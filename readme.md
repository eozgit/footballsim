# footballsim

A modernized, TypeScript-first engine for simulating professional football matches.

This project is a high-performance fork of the original [footballSimulationEngine](https://github.com/GallagherAiden/footballSimulationEngine). It has been rebuilt with a focus on strict type safety, modular architecture, and modern developer tooling.

---

## ⚽ Live Demo & Visualization

While the engine is headless by design, you can see it in action via the official demo application:
👉 **[footballsim-demo](https://github.com/eozgit/footballsim-demo)**

---

## 🚀 Key Modernizations

- **Strict TypeScript:** Completely ported to TypeScript with `NodeNext` module resolution for enterprise-grade safety.

- **High-Performance Physics:** Refined ball movement, trajectory calculations, and player collision logic.

- **Advanced AI Intent:** Sophisticated decision-making trees for player movement, tackling, and attacking threats.

- **Developer Experience:** Fully integrated with `Vitest` for testing and `ESLint` with `SonarJS` for deep code analysis.

- **Automated Releases:** Continuous delivery pipeline using `Semantic Release`.

---

## 📦 Installation

```bash
npm install footballsim

```

---

## 🛠️ Basic Usage

The engine is designed to be integrated into any Node.js environment. You simply initialize a game with team and pitch configurations, then iterate through match steps.

```typescript
import { initiateGame, playIteration } from 'footballsim';

// 1. Setup your match
const matchDetails = initiateGame(team1, team2, pitchConfig);

// 2. Run the simulation loop
while (!matchDetails.matchFinished) {
  const currentStep = playIteration(matchDetails);
  console.log(`Current Score: ${currentStep.score[0]} - ${currentStep.score[1]}`);
}
```

---

## 🏗️ Technical Architecture

The engine follows a modular "Intent-Action-Physics" flow:

1.  **Intent Logic:** Players analyze their surroundings and decide on an action (pass, shoot, move).

2.  **Action Handler:** Validates and executes the chosen intent based on player stats and game state.

3.  **Physics Engine:** Resolves the final movement of the ball and players on the pitch, handling boundaries and collisions.

---

## 🧪 Development & Quality

We maintain high standards for engine reliability:

- **Unit Testing:** Over 500+ tests covering everything from offside logic to freekick positioning.

- **Coverage:** Full transparency on logic and type coverage.

- **Architecture Integrity:** Automated dependency cruising to prevent circular logic.

```bash
# Run the test suite
npm test

# Generate coverage reports
npm run coverage:all

```

---

## 📜 License

This project is licensed under the **ISC License**.
Originally forked from [GallagherAiden/footballSimulationEngine](https://github.com/GallagherAiden/footballSimulationEngine).
