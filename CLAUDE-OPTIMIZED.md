# CLAUDE.md - Space Shooter Game

> **Token-Optimized Version** - Generic best practices moved to `~/.claude/context/`

---

## Project Overview

**Name:** 2D Space Shooter
**Type:** Browser Game
**Tech Stack:** Vanilla JavaScript, Three.js r128, Web Audio API

**Description:**
Client-side 2D space shooter with procedural audio and parallax background. No build process required.

**Key Features:**
- Procedurally generated audio (music + sound effects)
- Multi-layer parallax starfield
- Progressive difficulty scaling
- Custom 3D ship geometries

---

## Running the Project

### Quick Start
\`\`\`bash
# Open directly in browser (no server needed)
open index.html

# Or with local server (for development)
python -m http.server 8000
# Visit http://localhost:8000
\`\`\`

**Controls:**
- Movement: WASD or Arrow Keys
- Shoot: Spacebar
- Pause: P or ESC

---

## Project Structure

\`\`\`
project/
├── index.html    # Single-page app (HTML + CSS)
└── game.js       # Entire game logic (vanilla JS)
\`\`\`

**Key Files:**
- \`index.html\` - UI overlays, CSS styling, Three.js CDN import
- \`game.js\` - Global scope code (no modules/classes), all game logic

---

## Architecture

### High-Level Design
\`\`\`
index.html
  ├── <style> tags (all CSS)
  ├── UI overlays (score, health, pause menu)
  └── <script src="game.js">

game.js (global scope)
  ├── gameState object (score, health, level, flags)
  ├── sounds object (one-shot SFX)
  ├── music object (5-layer synthesizer)
  ├── bullets[], enemies[], explosions[] arrays
  └── animate() loop (requestAnimationFrame)
\`\`\`

### Core Systems

**1. Audio System**
- **Shared audioContext** (Web Audio API)
- **Sound Effects** (\`sounds\` object): Player shoot, enemy shoot, explosion, player hit
- **Background Music** (\`music\` object):
  - 5 layers: lead melody, bass, arpeggio, pad, drums
  - 170 BPM, 16-beat loops
  - Scheduled via \`audioContext.currentTime\`
  - Pause properly stops scheduling (not just volume)
- All audio is **procedurally generated** (no audio files)

**2. Game State**
- **Single \`gameState\` object** holds all mutable state
- Updates flow through \`updateUI()\` function → syncs to DOM
- Fields: score, health, level, paused, gameOver

**3. Visual System**
- **Three.js orthographic camera** for 2D in 3D engine
- **Parallax background**: 3 star layers + nebula clouds (900+ stars total)
- **Entity structure**: \`THREE.Group\` with multiple meshes
  - Player: body (hexagon), wings, cockpit, engine glows
  - Enemies: body (saucer), armor plates, cockpit/eye, weapon ports
- Custom \`BufferGeometry\` with manual vertex arrays (not primitives)

**4. Game Loop**
- **\`animate()\` function** called via \`requestAnimationFrame\`
- Checks pause/game-over state before updating
- Updates: background animation, player movement, bullets, enemies, explosions
- **No delta-time** calculations (assumes fixed 60fps)

**5. Collision Detection**
- **Circle-based**: \`checkCollision(obj1, obj2, radius1, radius2)\`
- Compares distance between positions vs. sum of radii

---

## Important Project-Specific Conventions

### Audio Scheduling Pattern
\`\`\`javascript
// Music uses scheduled loops, NOT continuous playback
function scheduleNextBeat(currentBeat, startTime) {
  const beatTime = startTime + (currentBeat * 60/170); // 170 BPM
  oscillator.start(beatTime);
  oscillator.stop(beatTime + duration);
}
\`\`\`

**Critical:**
- Pause must STOP scheduling new beats (not mute volume)
- Resume must restart from current \`audioContext.currentTime\`

### Entity Creation Pattern
\`\`\`javascript
// All entities are THREE.Group with custom geometry
const entity = new THREE.Group();
const bodyGeometry = new THREE.BufferGeometry();
bodyGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
const bodyMesh = new THREE.Mesh(bodyGeometry, material);
entity.add(bodyMesh);
scene.add(entity);
\`\`\`

### State Updates
\`\`\`javascript
// ALWAYS update gameState first, then call updateUI()
gameState.score += 10;
updateUI();  // Syncs to DOM
\`\`\`

---

## Critical Constraints

**Browser Compatibility:**
- Requires Web Audio API (Chrome, Firefox, Safari, Edge)
- Three.js r128 locked (not latest)

**Performance:**
- Particle explosions create 20 meshes each (no pooling)
- Background has 900+ stars (performance bottleneck on low-end devices)
- No error handling for Three.js load failure

**Audio Policy:**
- Music auto-starts on first keypress (browser autoplay compliance)
- Uses single shared \`audioContext\` for all sounds

---

## Common Tasks

### Adding New Sound Effect
\`\`\`javascript
sounds.newSound = function() {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.frequency.value = 440; // A4 note
  oscillator.type = 'sine';

  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.2);

  oscillator.connect(gainNode).connect(audioContext.destination);
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.2);
};
\`\`\`

### Modifying Difficulty
\`\`\`javascript
// game.js line ~85-90
const spawnRate = Math.max(500, 2000 - gameState.level * 100); // Decrease spawn time
const enemyHealth = 1 + Math.floor(gameState.level / 3); // Increase health
\`\`\`

### Adding New Enemy Type
1. Create geometry in \`createEnemy()\` function
2. Add to \`enemies[]\` array
3. Update collision detection in \`animate()\`

---

## Known Issues

- [ ] No object pooling (creates/destroys many objects)
- [ ] Background stars cause FPS drops (900+ objects)
- [ ] No fallback if Web Audio API unavailable
- [ ] Assumes 60fps (no delta-time for frame-rate independence)

---

## Related Documentation

- Three.js r128 Docs: https://threejs.org/docs/index.html#manual/en/introduction/Creating-a-scene
- Web Audio API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API

---

**Last Updated:** 2025-12-06
