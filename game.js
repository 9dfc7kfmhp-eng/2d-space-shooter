// Game state
const gameState = {
    score: 0,
    health: 100,
    level: 1,
    isGameOver: false,
    isPaused: false
};

// Input handling
const keys = {};

// Audio setup
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// Sound effects using Web Audio API
const sounds = {
    // Player shooting sound - short laser pew
    playerShoot: () => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.1);

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    },

    // Enemy shooting sound - lower pitch
    enemyShoot: () => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.15);

        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.15);
    },

    // Explosion sound - multiple frequencies
    explosion: () => {
        const now = audioContext.currentTime;

        // Low rumble
        const bass = audioContext.createOscillator();
        const bassGain = audioContext.createGain();
        bass.connect(bassGain);
        bassGain.connect(audioContext.destination);
        bass.frequency.setValueAtTime(60, now);
        bass.frequency.exponentialRampToValueAtTime(30, now + 0.3);
        bassGain.gain.setValueAtTime(0.5, now);
        bassGain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        bass.start(now);
        bass.stop(now + 0.3);

        // Mid frequency crackle
        const mid = audioContext.createOscillator();
        const midGain = audioContext.createGain();
        mid.connect(midGain);
        midGain.connect(audioContext.destination);
        mid.type = 'sawtooth';
        mid.frequency.setValueAtTime(300, now);
        mid.frequency.exponentialRampToValueAtTime(50, now + 0.2);
        midGain.gain.setValueAtTime(0.3, now);
        midGain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        mid.start(now);
        mid.stop(now + 0.2);

        // White noise burst
        const bufferSize = audioContext.sampleRate * 0.15;
        const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        const noise = audioContext.createBufferSource();
        const noiseGain = audioContext.createGain();
        noise.buffer = buffer;
        noise.connect(noiseGain);
        noiseGain.connect(audioContext.destination);
        noiseGain.gain.setValueAtTime(0.3, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        noise.start(now);
    },

    // Player hit sound
    playerHit: () => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(150, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.2);

        gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
    }
};

// Background Music System
const music = {
    isPlaying: false,
    isPaused: false,
    masterGain: null,
    bassGain: null,
    leadGain: null,
    padGain: null,
    arpGain: null,
    drumGain: null,
    loopTimeout: null,
    bpm: 170, // Faster tempo
    beatDuration: 60 / 170,

    // Extended melodic sequence with more notes
    melody: [
        // Pattern repeats every 16 beats - more complex
        { note: 'E4', start: 0, duration: 0.25 },
        { note: 'G4', start: 0.25, duration: 0.25 },
        { note: 'A4', start: 0.5, duration: 0.5 },
        { note: 'B4', start: 1, duration: 0.5 },
        { note: 'C5', start: 1.5, duration: 0.25 },
        { note: 'B4', start: 1.75, duration: 0.25 },
        { note: 'A4', start: 2, duration: 0.5 },
        { note: 'G4', start: 2.5, duration: 0.5 },
        { note: 'E4', start: 3, duration: 0.5 },
        { note: 'G4', start: 3.5, duration: 0.5 },

        { note: 'E4', start: 4, duration: 0.25 },
        { note: 'G4', start: 4.25, duration: 0.25 },
        { note: 'A4', start: 4.5, duration: 0.5 },
        { note: 'B4', start: 5, duration: 0.5 },
        { note: 'C5', start: 5.5, duration: 0.5 },
        { note: 'D5', start: 6, duration: 0.25 },
        { note: 'C5', start: 6.25, duration: 0.25 },
        { note: 'B4', start: 6.5, duration: 0.5 },
        { note: 'A4', start: 7, duration: 1 },

        { note: 'D4', start: 8, duration: 0.25 },
        { note: 'E4', start: 8.25, duration: 0.25 },
        { note: 'G4', start: 8.5, duration: 0.5 },
        { note: 'A4', start: 9, duration: 0.5 },
        { note: 'B4', start: 9.5, duration: 0.5 },
        { note: 'A4', start: 10, duration: 0.5 },
        { note: 'G4', start: 10.5, duration: 0.5 },
        { note: 'E4', start: 11, duration: 0.5 },
        { note: 'D4', start: 11.5, duration: 0.5 },

        { note: 'D4', start: 12, duration: 0.5 },
        { note: 'E4', start: 12.5, duration: 0.5 },
        { note: 'G4', start: 13, duration: 0.5 },
        { note: 'A4', start: 13.5, duration: 0.5 },
        { note: 'B4', start: 14, duration: 1 },
        { note: 'A4', start: 15, duration: 1 }
    ],

    // More rhythmic bass line
    bassLine: [
        { note: 'E2', start: 0, duration: 0.5 },
        { note: 'E2', start: 1, duration: 0.5 },
        { note: 'E2', start: 2, duration: 0.5 },
        { note: 'E2', start: 3, duration: 0.5 },
        { note: 'A2', start: 4, duration: 0.5 },
        { note: 'A2', start: 5, duration: 0.5 },
        { note: 'A2', start: 6, duration: 0.5 },
        { note: 'A2', start: 7, duration: 0.5 },
        { note: 'D2', start: 8, duration: 0.5 },
        { note: 'G2', start: 9, duration: 0.5 },
        { note: 'G2', start: 10, duration: 0.5 },
        { note: 'E2', start: 11, duration: 0.5 },
        { note: 'C2', start: 12, duration: 0.5 },
        { note: 'D2', start: 13, duration: 0.5 },
        { note: 'E2', start: 14, duration: 1 },
        { note: 'E2', start: 15, duration: 1 }
    ],

    // Arpeggio pattern for more complexity
    arpeggio: [
        { note: 'E5', start: 0, duration: 0.125 },
        { note: 'G5', start: 0.125, duration: 0.125 },
        { note: 'B5', start: 0.25, duration: 0.125 },
        { note: 'E5', start: 0.375, duration: 0.125 },
        { note: 'E5', start: 1, duration: 0.125 },
        { note: 'G5', start: 1.125, duration: 0.125 },
        { note: 'B5', start: 1.25, duration: 0.125 },
        { note: 'E5', start: 1.375, duration: 0.125 },

        { note: 'A5', start: 4, duration: 0.125 },
        { note: 'C5', start: 4.125, duration: 0.125 },
        { note: 'E5', start: 4.25, duration: 0.125 },
        { note: 'A5', start: 4.375, duration: 0.125 },
        { note: 'A5', start: 5, duration: 0.125 },
        { note: 'C5', start: 5.125, duration: 0.125 },
        { note: 'E5', start: 5.25, duration: 0.125 },
        { note: 'A5', start: 5.375, duration: 0.125 }
    ],

    // Note to frequency conversion - expanded
    noteToFreq: (note) => {
        const notes = {
            'C2': 65.41, 'D2': 73.42, 'E2': 82.41, 'G2': 98.00, 'A2': 110.00,
            'D4': 293.66, 'E4': 329.63, 'G4': 392.00, 'A4': 440.00,
            'B4': 493.88, 'C5': 523.25, 'D5': 587.33,
            'E5': 659.25, 'G5': 783.99, 'A5': 880.00, 'B5': 987.77
        };
        return notes[note] || 440;
    },

    init: function() {
        this.masterGain = audioContext.createGain();
        this.masterGain.gain.value = 0.15; // Lower volume to not overpower gameplay
        this.masterGain.connect(audioContext.destination);

        this.bassGain = audioContext.createGain();
        this.bassGain.gain.value = 0.4;
        this.bassGain.connect(this.masterGain);

        this.leadGain = audioContext.createGain();
        this.leadGain.gain.value = 0.3;
        this.leadGain.connect(this.masterGain);

        this.padGain = audioContext.createGain();
        this.padGain.gain.value = 0.15;
        this.padGain.connect(this.masterGain);

        this.arpGain = audioContext.createGain();
        this.arpGain.gain.value = 0.2;
        this.arpGain.connect(this.masterGain);

        this.drumGain = audioContext.createGain();
        this.drumGain.gain.value = 0.3;
        this.drumGain.connect(this.masterGain);
    },

    playNote: function(frequency, startTime, duration, gainNode, waveType = 'square') {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();

        osc.type = waveType;
        osc.frequency.value = frequency;

        osc.connect(gain);
        gain.connect(gainNode);

        // ADSR envelope
        const attackTime = 0.01;
        const releaseTime = 0.1;

        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(1, startTime + attackTime);
        gain.gain.setValueAtTime(1, startTime + duration - releaseTime);
        gain.gain.linearRampToValueAtTime(0, startTime + duration);

        osc.start(startTime);
        osc.stop(startTime + duration);
    },

    playDrum: function(frequency, startTime, duration) {
        // Kick and hi-hat simulation
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(frequency, startTime);
        osc.frequency.exponentialRampToValueAtTime(frequency * 0.01, startTime + duration);

        osc.connect(gain);
        gain.connect(this.drumGain);

        gain.gain.setValueAtTime(1, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

        osc.start(startTime);
        osc.stop(startTime + duration);
    },

    playSequence: function() {
        if (this.isPaused) return;

        const now = audioContext.currentTime;
        const loopDuration = 16 * this.beatDuration;

        // Play melody
        this.melody.forEach(note => {
            const startTime = now + (note.start * this.beatDuration);
            const duration = note.duration * this.beatDuration;
            this.playNote(this.noteToFreq(note.note), startTime, duration, this.leadGain, 'square');
        });

        // Play bass line
        this.bassLine.forEach(note => {
            const startTime = now + (note.start * this.beatDuration);
            const duration = note.duration * this.beatDuration;
            this.playNote(this.noteToFreq(note.note), startTime, duration, this.bassGain, 'sawtooth');
        });

        // Play arpeggio
        this.arpeggio.forEach(note => {
            const startTime = now + (note.start * this.beatDuration);
            const duration = note.duration * this.beatDuration;
            this.playNote(this.noteToFreq(note.note), startTime, duration, this.arpGain, 'triangle');
        });

        // Ambient pad (long sustained notes)
        const padNotes = ['E3', 'A3', 'D3'];
        const padFreqs = [164.81, 220.00, 146.83];
        padNotes.forEach((note, i) => {
            const freq = padFreqs[i];
            const startTime = now + (i * 5.33 * this.beatDuration);
            this.playNote(freq, startTime, 5.33 * this.beatDuration, this.padGain, 'sine');
        });

        // Drum pattern (kick on beats 1, 5, 9, 13; hi-hat on every other beat)
        for (let i = 0; i < 16; i++) {
            const startTime = now + (i * this.beatDuration);
            if (i % 4 === 0) {
                // Kick drum
                this.playDrum(150, startTime, 0.1);
            }
            if (i % 2 === 1) {
                // Hi-hat
                this.playDrum(8000, startTime, 0.05);
            }
        }

        // Schedule next loop
        this.loopTimeout = setTimeout(() => {
            if (this.isPlaying && !this.isPaused) {
                this.playSequence();
            }
        }, loopDuration * 1000);
    },

    start: function() {
        if (!this.masterGain) {
            this.init();
        }
        if (!this.isPlaying) {
            this.isPlaying = true;
            this.isPaused = false;
            this.playSequence();
        }
    },

    pause: function() {
        this.isPaused = true;
        if (this.loopTimeout) {
            clearTimeout(this.loopTimeout);
            this.loopTimeout = null;
        }
    },

    resume: function() {
        if (this.isPaused && this.isPlaying) {
            this.isPaused = false;
            this.playSequence();
        }
    },

    stop: function() {
        this.isPlaying = false;
        this.isPaused = false;
        if (this.loopTimeout) {
            clearTimeout(this.loopTimeout);
            this.loopTimeout = null;
        }
    },

    setVolume: function(volume) {
        if (this.masterGain) {
            this.masterGain.gain.value = volume;
        }
    }
};

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000011);

// Camera setup (orthographic for 2D)
const aspect = window.innerWidth / window.innerHeight;
const frustumSize = 20;
const camera = new THREE.OrthographicCamera(
    frustumSize * aspect / -2,
    frustumSize * aspect / 2,
    frustumSize / 2,
    frustumSize / -2,
    0.1,
    1000
);
camera.position.z = 10;

// Renderer setup
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.domElement.id = 'game-canvas';
document.body.insertBefore(renderer.domElement, document.body.firstChild);

// Animated background with multiple layers
const backgroundLayers = [];

// Layer 1: Distant stars (slow moving)
const distantStarGeometry = new THREE.BufferGeometry();
const distantStarVertices = [];
const distantStarSizes = [];
for (let i = 0; i < 200; i++) {
    const x = (Math.random() - 0.5) * 100;
    const y = (Math.random() - 0.5) * 100;
    const z = -30 + Math.random() * -20;
    distantStarVertices.push(x, y, z);
    distantStarSizes.push(Math.random() * 0.15 + 0.05);
}
distantStarGeometry.setAttribute('position', new THREE.Float32BufferAttribute(distantStarVertices, 3));
distantStarGeometry.setAttribute('size', new THREE.Float32BufferAttribute(distantStarSizes, 1));
const distantStarMaterial = new THREE.PointsMaterial({
    color: 0x8888ff,
    size: 0.08,
    sizeAttenuation: false,
    transparent: true,
    opacity: 0.6
});
const distantStars = new THREE.Points(distantStarGeometry, distantStarMaterial);
scene.add(distantStars);
backgroundLayers.push({ mesh: distantStars, speed: 0.01 });

// Layer 2: Mid-distance stars (medium speed)
const midStarGeometry = new THREE.BufferGeometry();
const midStarVertices = [];
for (let i = 0; i < 300; i++) {
    const x = (Math.random() - 0.5) * 100;
    const y = (Math.random() - 0.5) * 100;
    const z = -10 + Math.random() * -15;
    midStarVertices.push(x, y, z);
}
midStarGeometry.setAttribute('position', new THREE.Float32BufferAttribute(midStarVertices, 3));
const midStarMaterial = new THREE.PointsMaterial({
    color: 0xaaaaff,
    size: 0.12,
    sizeAttenuation: false,
    transparent: true,
    opacity: 0.8
});
const midStars = new THREE.Points(midStarGeometry, midStarMaterial);
scene.add(midStars);
backgroundLayers.push({ mesh: midStars, speed: 0.02 });

// Layer 3: Close stars (faster)
const starGeometry = new THREE.BufferGeometry();
const starVertices = [];
for (let i = 0; i < 400; i++) {
    const x = (Math.random() - 0.5) * 100;
    const y = (Math.random() - 0.5) * 100;
    const z = (Math.random() - 0.5) * 20;
    starVertices.push(x, y, z);
}
starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
const starMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.15,
    sizeAttenuation: false
});
const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);
backgroundLayers.push({ mesh: stars, speed: 0.03 });

// Nebula clouds (subtle background atmosphere)
const nebulaClouds = [];
for (let i = 0; i < 5; i++) {
    const cloudGeometry = new THREE.CircleGeometry(8 + Math.random() * 5, 32);
    const cloudMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(0.6 + Math.random() * 0.2, 0.5, 0.3),
        transparent: true,
        opacity: 0.05 + Math.random() * 0.05,
        side: THREE.DoubleSide
    });
    const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);
    cloud.position.set(
        (Math.random() - 0.5) * 60,
        (Math.random() - 0.5) * 60,
        -40 + Math.random() * -20
    );
    cloud.userData.speed = 0.005 + Math.random() * 0.01;
    cloud.userData.rotationSpeed = (Math.random() - 0.5) * 0.0005;
    scene.add(cloud);
    nebulaClouds.push(cloud);
}

// Player ship - advanced fighter design
const player = new THREE.Group();

// Main body (elongated hexagon)
const bodyGeometry = new THREE.BufferGeometry();
const bodyVertices = new Float32Array([
    // Front triangle
    0, 0.6, 0,
    -0.15, 0.3, 0,
    0.15, 0.3, 0,
    // Mid section
    0, 0.6, 0,
    0.15, 0.3, 0,
    0.2, -0.2, 0,

    0, 0.6, 0,
    0.2, -0.2, 0,
    -0.2, -0.2, 0,

    0, 0.6, 0,
    -0.2, -0.2, 0,
    -0.15, 0.3, 0,
    // Bottom section
    -0.2, -0.2, 0,
    0.2, -0.2, 0,
    0, -0.4, 0
]);
bodyGeometry.setAttribute('position', new THREE.BufferAttribute(bodyVertices, 3));
const bodyMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide });
const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
player.add(body);

// Left wing
const leftWingGeometry = new THREE.BufferGeometry();
const leftWingVertices = new Float32Array([
    -0.2, 0.1, 0,
    -0.5, -0.1, 0,
    -0.2, -0.3, 0
]);
leftWingGeometry.setAttribute('position', new THREE.BufferAttribute(leftWingVertices, 3));
const wingMaterial = new THREE.MeshBasicMaterial({ color: 0x00cc00, side: THREE.DoubleSide });
const leftWing = new THREE.Mesh(leftWingGeometry, wingMaterial);
player.add(leftWing);

// Right wing
const rightWingGeometry = new THREE.BufferGeometry();
const rightWingVertices = new Float32Array([
    0.2, 0.1, 0,
    0.2, -0.3, 0,
    0.5, -0.1, 0
]);
rightWingGeometry.setAttribute('position', new THREE.BufferAttribute(rightWingVertices, 3));
const rightWing = new THREE.Mesh(rightWingGeometry, wingMaterial);
player.add(rightWing);

// Cockpit (bright green)
const cockpitGeometry = new THREE.BufferGeometry();
const cockpitVertices = new Float32Array([
    0, 0.45, 0,
    -0.08, 0.25, 0,
    0.08, 0.25, 0
]);
cockpitGeometry.setAttribute('position', new THREE.BufferAttribute(cockpitVertices, 3));
const cockpitMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffff, side: THREE.DoubleSide });
const cockpit = new THREE.Mesh(cockpitGeometry, cockpitMaterial);
player.add(cockpit);

// Engine glow (left)
const leftEngineGeometry = new THREE.CircleGeometry(0.08, 8);
const engineMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffff });
const leftEngine = new THREE.Mesh(leftEngineGeometry, engineMaterial);
leftEngine.position.set(-0.15, -0.35, 0);
player.add(leftEngine);

// Engine glow (right)
const rightEngine = new THREE.Mesh(leftEngineGeometry, engineMaterial);
rightEngine.position.set(0.15, -0.35, 0);
player.add(rightEngine);

player.position.y = -7;
scene.add(player);

// Player properties
const playerSpeed = 0.15;
const playerBounds = {
    x: frustumSize * aspect / 2 - 0.5,
    y: frustumSize / 2 - 0.5
};

// Bullets
const bullets = [];
const bulletSpeed = 0.3;
const bulletCooldown = 200; // ms
let lastBulletTime = 0;

function createBullet(x, y, isPlayerBullet = true) {
    const geometry = new THREE.BoxGeometry(0.1, 0.4, 0.1);
    const material = new THREE.MeshBasicMaterial({
        color: isPlayerBullet ? 0x00ffff : 0xff0000
    });
    const bullet = new THREE.Mesh(geometry, material);
    bullet.position.set(x, y, 0);
    bullet.userData.isPlayerBullet = isPlayerBullet;
    bullet.userData.speed = isPlayerBullet ? bulletSpeed : -bulletSpeed;
    scene.add(bullet);
    bullets.push(bullet);

    // Play shooting sound
    if (isPlayerBullet) {
        sounds.playerShoot();
    } else {
        sounds.enemyShoot();
    }

    return bullet;
}

// Enemies
const enemies = [];
const enemySpeed = 0.05;
let enemySpawnRate = 1000; // ms
let lastEnemySpawn = 0;

function createEnemy() {
    const enemy = new THREE.Group();

    // Main body - alien saucer design
    const bodyGeometry = new THREE.BufferGeometry();
    const bodyVertices = new Float32Array([
        // Top pyramid
        0, 0.5, 0,
        -0.25, 0.2, 0,
        0.25, 0.2, 0,
        // Wide middle section
        -0.25, 0.2, 0,
        -0.4, 0, 0,
        0, 0, 0,

        0.25, 0.2, 0,
        0, 0, 0,
        0.4, 0, 0,

        -0.25, 0.2, 0,
        0, 0, 0,
        0.25, 0.2, 0,
        // Bottom section
        -0.4, 0, 0,
        0.4, 0, 0,
        0, -0.3, 0,

        -0.4, 0, 0,
        0, -0.3, 0,
        -0.25, -0.15, 0,

        0.4, 0, 0,
        0.25, -0.15, 0,
        0, -0.3, 0
    ]);
    bodyGeometry.setAttribute('position', new THREE.BufferAttribute(bodyVertices, 3));
    const bodyMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    enemy.add(body);

    // Dark red armor plates
    const armorGeometry = new THREE.BufferGeometry();
    const armorVertices = new Float32Array([
        -0.15, 0.1, 0,
        -0.25, -0.05, 0,
        -0.05, -0.05, 0,

        0.15, 0.1, 0,
        0.05, -0.05, 0,
        0.25, -0.05, 0
    ]);
    armorGeometry.setAttribute('position', new THREE.BufferAttribute(armorVertices, 3));
    const armorMaterial = new THREE.MeshBasicMaterial({ color: 0xaa0000, side: THREE.DoubleSide });
    const armor = new THREE.Mesh(armorGeometry, armorMaterial);
    enemy.add(armor);

    // Cockpit/eye (glowing orange)
    const cockpitGeometry = new THREE.CircleGeometry(0.12, 6);
    const cockpitMaterial = new THREE.MeshBasicMaterial({ color: 0xff6600 });
    const cockpit = new THREE.Mesh(cockpitGeometry, cockpitMaterial);
    cockpit.position.set(0, 0.3, 0);
    enemy.add(cockpit);

    // Weapon ports (left and right)
    const weaponGeometry = new THREE.CircleGeometry(0.06, 6);
    const weaponMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });

    const leftWeapon = new THREE.Mesh(weaponGeometry, weaponMaterial);
    leftWeapon.position.set(-0.3, -0.1, 0);
    enemy.add(leftWeapon);

    const rightWeapon = new THREE.Mesh(weaponGeometry, weaponMaterial);
    rightWeapon.position.set(0.3, -0.1, 0);
    enemy.add(rightWeapon);

    // Random spawn position at top
    const x = (Math.random() - 0.5) * (frustumSize * aspect - 1);
    enemy.position.set(x, frustumSize / 2 + 1, 0);

    enemy.userData.health = 1 + Math.floor(gameState.level / 3);
    enemy.userData.lastShot = Date.now();
    enemy.userData.shootCooldown = 2000 + Math.random() * 1000;

    scene.add(enemy);
    enemies.push(enemy);
}

// Explosions
const explosions = [];

function createExplosion(x, y, color = 0xffaa00) {
    const particleCount = 20;
    const particles = [];

    // Play explosion sound
    sounds.explosion();

    for (let i = 0; i < particleCount; i++) {
        const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
        const material = new THREE.MeshBasicMaterial({ color });
        const particle = new THREE.Mesh(geometry, material);
        particle.position.set(x, y, 0);

        const angle = (Math.PI * 2 * i) / particleCount;
        const speed = 0.1 + Math.random() * 0.1;
        particle.userData.velocity = {
            x: Math.cos(angle) * speed,
            y: Math.sin(angle) * speed
        };
        particle.userData.life = 30;

        scene.add(particle);
        particles.push(particle);
    }

    explosions.push(particles);
}

// Collision detection
function checkCollision(obj1, obj2, radius1 = 0.3, radius2 = 0.3) {
    const dx = obj1.position.x - obj2.position.x;
    const dy = obj1.position.y - obj2.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < (radius1 + radius2);
}

// Update UI
function updateUI() {
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('health').textContent = Math.max(0, gameState.health);
    document.getElementById('level').textContent = gameState.level;
}

// Game over
function gameOver() {
    gameState.isGameOver = true;
    document.getElementById('final-score').textContent = gameState.score;
    document.getElementById('game-over').style.display = 'block';

    // Lower music volume on game over
    music.setVolume(0.05);
}

// Reset game
function resetGame() {
    gameState.score = 0;
    gameState.health = 100;
    gameState.level = 1;
    gameState.isGameOver = false;

    // Clear enemies
    enemies.forEach(enemy => scene.remove(enemy));
    enemies.length = 0;

    // Clear bullets
    bullets.forEach(bullet => scene.remove(bullet));
    bullets.length = 0;

    // Clear explosions
    explosions.forEach(particles => {
        particles.forEach(p => scene.remove(p));
    });
    explosions.length = 0;

    // Reset player position
    player.position.set(0, -7, 0);

    // Reset spawn rate
    enemySpawnRate = 1000;

    // Restore music volume
    music.setVolume(0.15);

    document.getElementById('game-over').style.display = 'none';
    updateUI();
}

// Pause functionality
function togglePause() {
    if (gameState.isGameOver) return;

    gameState.isPaused = !gameState.isPaused;
    document.getElementById('pause-overlay').style.display = gameState.isPaused ? 'block' : 'none';

    // Pause/resume music properly
    if (gameState.isPaused) {
        music.pause();
    } else {
        music.resume();
    }

    // Update lastTime when unpausing to prevent time jump
    if (!gameState.isPaused) {
        lastTime = Date.now();
        lastEnemySpawn = Date.now();
    }
}

// Event listeners
let musicStarted = false;

document.addEventListener('keydown', (e) => {
    // Start music on first keypress (browser requirement)
    if (!musicStarted) {
        musicStarted = true;
        music.start();
    }

    // Pause toggle (P or ESC)
    if ((e.key.toLowerCase() === 'p' || e.key === 'Escape') && !gameState.isGameOver) {
        e.preventDefault();
        togglePause();
        return;
    }

    // Don't process other inputs when paused
    if (gameState.isPaused) return;

    keys[e.key.toLowerCase()] = true;

    // Shooting
    if (e.key === ' ' && !gameState.isGameOver) {
        e.preventDefault();
        const now = Date.now();
        if (now - lastBulletTime > bulletCooldown) {
            createBullet(player.position.x, player.position.y + 0.5);
            lastBulletTime = now;
        }
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
});

document.getElementById('restart').addEventListener('click', resetGame);

// Window resize
window.addEventListener('resize', () => {
    const aspect = window.innerWidth / window.innerHeight;
    camera.left = frustumSize * aspect / -2;
    camera.right = frustumSize * aspect / 2;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);

    playerBounds.x = frustumSize * aspect / 2 - 0.5;
});

// Animation loop
let lastTime = Date.now();

function animate() {
    requestAnimationFrame(animate);

    if (gameState.isGameOver || gameState.isPaused) {
        renderer.render(scene, camera);
        return;
    }

    const now = Date.now();
    const deltaTime = now - lastTime;
    lastTime = now;

    // Animate background layers (parallax scrolling)
    backgroundLayers.forEach(layer => {
        layer.mesh.position.y -= layer.speed;

        // Reset position when scrolled too far
        if (layer.mesh.position.y < -20) {
            layer.mesh.position.y = 0;
        }

        // Subtle rotation for depth
        layer.mesh.rotation.z += 0.0001;
    });

    // Animate nebula clouds
    nebulaClouds.forEach(cloud => {
        cloud.position.y -= cloud.userData.speed;
        cloud.rotation.z += cloud.userData.rotationSpeed;

        // Slowly pulse opacity for atmospheric effect
        const pulseSpeed = 0.001;
        const baseOpacity = 0.05;
        cloud.material.opacity = baseOpacity + Math.sin(Date.now() * pulseSpeed + cloud.position.x) * 0.03;

        // Reset position when scrolled off screen
        if (cloud.position.y < -40) {
            cloud.position.y = 40;
            cloud.position.x = (Math.random() - 0.5) * 60;
        }
    });

    // Subtle background color pulsing (very gentle, not distracting)
    const timeOffset = now * 0.0002;
    const r = 0.0 + Math.sin(timeOffset * 0.3) * 0.005;
    const g = 0.0 + Math.sin(timeOffset * 0.5) * 0.005;
    const b = 0.067 + Math.sin(timeOffset * 0.7) * 0.015;
    scene.background.setRGB(r, g, b);

    // Player movement
    if (keys['a'] || keys['arrowleft']) {
        player.position.x = Math.max(-playerBounds.x, player.position.x - playerSpeed);
    }
    if (keys['d'] || keys['arrowright']) {
        player.position.x = Math.min(playerBounds.x, player.position.x + playerSpeed);
    }
    if (keys['w'] || keys['arrowup']) {
        player.position.y = Math.min(playerBounds.y, player.position.y + playerSpeed);
    }
    if (keys['s'] || keys['arrowdown']) {
        player.position.y = Math.max(-playerBounds.y, player.position.y - playerSpeed);
    }

    // Update bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        bullet.position.y += bullet.userData.speed;

        // Remove off-screen bullets
        if (bullet.position.y > frustumSize / 2 + 2 || bullet.position.y < -frustumSize / 2 - 2) {
            scene.remove(bullet);
            bullets.splice(i, 1);
        }
    }

    // Spawn enemies
    if (now - lastEnemySpawn > enemySpawnRate) {
        createEnemy();
        lastEnemySpawn = now;

        // Increase difficulty every 10 enemies
        if (enemies.length % 10 === 0) {
            gameState.level++;
            enemySpawnRate = Math.max(300, enemySpawnRate - 50);
            updateUI();
        }
    }

    // Update enemies
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        enemy.position.y -= enemySpeed * (1 + gameState.level * 0.1);
        enemy.rotation.z += 0.02;

        // Enemy shooting
        if (now - enemy.userData.lastShot > enemy.userData.shootCooldown) {
            createBullet(enemy.position.x, enemy.position.y - 0.5, false);
            enemy.userData.lastShot = now;
        }

        // Check collision with player
        if (checkCollision(enemy, player)) {
            gameState.health -= 20;
            updateUI();
            sounds.playerHit();
            createExplosion(enemy.position.x, enemy.position.y, 0xff0000);
            scene.remove(enemy);
            enemies.splice(i, 1);

            if (gameState.health <= 0) {
                gameOver();
            }
            continue;
        }

        // Remove off-screen enemies
        if (enemy.position.y < -frustumSize / 2 - 2) {
            scene.remove(enemy);
            enemies.splice(i, 1);
        }
    }

    // Check bullet collisions
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];

        if (bullet.userData.isPlayerBullet) {
            // Check collision with enemies
            for (let j = enemies.length - 1; j >= 0; j--) {
                const enemy = enemies[j];
                if (checkCollision(bullet, enemy, 0.2, 0.3)) {
                    enemy.userData.health--;

                    scene.remove(bullet);
                    bullets.splice(i, 1);

                    if (enemy.userData.health <= 0) {
                        gameState.score += 10 * gameState.level;
                        updateUI();
                        createExplosion(enemy.position.x, enemy.position.y);
                        scene.remove(enemy);
                        enemies.splice(j, 1);
                    }
                    break;
                }
            }
        } else {
            // Enemy bullet - check collision with player
            if (checkCollision(bullet, player, 0.2, 0.3)) {
                gameState.health -= 10;
                updateUI();
                sounds.playerHit();
                createExplosion(bullet.position.x, bullet.position.y, 0x00ffff);
                scene.remove(bullet);
                bullets.splice(i, 1);

                if (gameState.health <= 0) {
                    gameOver();
                }
            }
        }
    }

    // Update explosions
    for (let i = explosions.length - 1; i >= 0; i--) {
        const particles = explosions[i];
        let allDead = true;

        for (let j = particles.length - 1; j >= 0; j--) {
            const particle = particles[j];
            particle.userData.life--;

            if (particle.userData.life <= 0) {
                scene.remove(particle);
                particles.splice(j, 1);
            } else {
                allDead = false;
                particle.position.x += particle.userData.velocity.x;
                particle.position.y += particle.userData.velocity.y;
                particle.material.opacity = particle.userData.life / 30;
                particle.material.transparent = true;
            }
        }

        if (allDead) {
            explosions.splice(i, 1);
        }
    }

    renderer.render(scene, camera);
}

// Start game
updateUI();
animate();
