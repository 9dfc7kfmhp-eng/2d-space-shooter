# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a browser-based 2D Space Shooter game built with Three.js and the Web Audio API. The game runs entirely client-side with no build process required - simply open `index.html` in a modern browser.

## Running the Game

Open `index.html` directly in a web browser (Chrome, Firefox, Safari, Edge). No build step or local server is required.

**Controls:**
- Movement: WASD or Arrow Keys
- Shoot: Spacebar
- Pause: P or ESC

## Architecture

### Two-File Structure

**`index.html`** - Single-page application containing:
- All CSS styling (embedded in `<style>` tags)
- UI overlays: score/health display, pause menu, game over screen
- Three.js CDN import (r128)
- Script tag for `game.js`

**`game.js`** - Entire game logic in vanilla JavaScript:
- No module system (uses global THREE from CDN)
- All code runs in global scope with no classes
- Structured as a collection of objects and functions

### Core Systems

**Game State Management**
- Single `gameState` object holds score, health, level, pause/game-over flags
- State updates flow through `updateUI()` function that syncs to DOM

**Audio System Architecture**
- Shared `audioContext` (Web Audio API) for all audio
- Two distinct audio systems:
  1. **Sound Effects** (`sounds` object): One-shot procedural sounds (player shoot, enemy shoot, explosion, player hit)
  2. **Background Music** (`music` object): Continuous looping synthesizer with 5 layers (lead melody, bass, arpeggio, pad, drums) at 170 BPM

**Music System Details**
- Music plays in 16-beat loops scheduled via `audioContext.currentTime`
- Pause/resume properly stops/restarts scheduling (not just volume changes)
- All sounds are procedurally generated - no audio files needed

**Visual Systems**
- Three.js orthographic camera for 2D gameplay in 3D engine
- Multi-layer parallax background (3 star layers + nebula clouds)
- Entities built as `THREE.Group` with multiple meshes for detail

**Entity Structure**
- **Player**: Group with body (hexagon), wings, cockpit, engine glows
- **Enemies**: Group with body (saucer), armor plates, cockpit/eye, weapon ports
- Both use custom BufferGeometry with manually defined vertices
- Stored in global arrays: `bullets[]`, `enemies[]`, `explosions[]`

**Game Loop**
- Single `animate()` function called via `requestAnimationFrame`
- Checks pause/game-over state before updating
- Updates background animation, player movement, bullets, enemies, explosions
- No delta-time calculations - uses fixed timestep assumptions

**Collision Detection**
- Simple circle-based: `checkCollision(obj1, obj2, radius1, radius2)`
- Checks distance between positions against sum of radii

### Key Implementation Patterns

**Procedural Audio Generation**
- All sounds use oscillators + gain envelopes
- ADSR (Attack-Decay-Sustain-Release) implemented via `linearRampToValueAtTime`
- Explosions layer multiple frequencies (bass rumble + crackle + white noise)

**Sprite-Like 3D Objects**
- Everything uses `THREE.BufferGeometry` with manual vertex arrays
- Custom triangular shapes for ships (not primitives)
- Z-position used for layering, not depth

**Progressive Difficulty**
- Enemy spawn rate decreases over time
- Enemy health scales with level
- Level increments every 10 enemies spawned

**Background Animation**
- Each layer has `.userData.speed` for parallax
- Wrap-around when objects scroll off-screen
- Nebula opacity pulses using `Math.sin(Date.now())`

## Important Notes

**Browser Audio Context**
- Music auto-starts on first keypress (browser autoplay policy compliance)
- Uses single shared `audioContext` for all audio

**Three.js Version**
- Locked to r128 from CDN (not latest)
- Uses older API patterns (e.g., `THREE.BufferAttribute` instead of typed arrays in some places)

**No Error Handling**
- Game assumes Three.js loads successfully
- No fallbacks for Web Audio API unavailability

**Performance Considerations**
- Particle explosions create 20 individual meshes each
- No object pooling - objects created/destroyed frequently
- Background has 900+ stars total across layers
