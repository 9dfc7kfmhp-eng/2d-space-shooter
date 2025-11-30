# 2D Space Shooter

Ein browserbasiertes 2D-Space-Shooter-Spiel, gebaut mit Three.js und der Web Audio API.

## Features

### Gameplay
- **Spieler-Raumschiff**: Detailliertes Kampf-Jäger-Design in grün
- **Gegner-Raumschiffe**: Alien-Saucer-Design mit verschiedenen Schwierigkeitsstufen
- **Progressive Schwierigkeit**: Level steigt mit jedem 10. besiegten Gegner
- **Gesundheitssystem**: 100 HP mit visueller Anzeige
- **Punktesystem**: Score-Tracking mit Level-Multiplikator

### Visuelle Effekte
- **Mehrstufiger Parallax-Hintergrund**: 3 Ebenen von Sternen mit unterschiedlichen Geschwindigkeiten
- **Nebula-Wolken**: Atmosphärische Weltraum-Effekte mit pulsierender Transparenz
- **Partikel-Explosionen**: 20-Partikel-Explosionen bei Zerstörung
- **Animierter Hintergrund**: Kontinuierliche Bewegung und subtile Farbänderungen
- **Detaillierte Raumschiff-Modelle**: Multi-Mesh-Designs mit Flügeln, Cockpit und Triebwerken

### Audio
- **Hintergrundmusik**: Dynamischer 5-Layer-Synthesizer mit:
  - Lead-Melodie (Square-Wave)
  - Basslinie (Sawtooth-Wave)
  - Arpeggio (Triangle-Wave)
  - Ambient Pad (Sine-Wave)
  - Drum-Pattern (Kick + Hi-Hat)
  - 170 BPM Tempo
- **Soundeffekte**:
  - Spieler-Schuss (hochfrequenter Laser)
  - Gegner-Schuss (tiefer, bedrohlich)
  - Explosionen (mehrschichtig: Bass-Rumble, Crackle, White-Noise)
  - Spieler-Treffer (Schmerz-Sound)

### Steuerung
- **Bewegung**: WASD oder Pfeiltasten
- **Schießen**: Leertaste
- **Pause**: P oder ESC

## Installation

Keine Installation erforderlich! Einfach die `index.html` Datei in einem modernen Browser öffnen.

```bash
# Repository klonen
git clone [your-repository-url]
cd 2d-space-shooter

# Datei im Browser öffnen
open index.html
```

## Technische Details

### Technologie-Stack
- **Three.js r128**: 3D-Engine für 2D-Gameplay
- **Web Audio API**: Prozedurale Soundgenerierung
- **Vanilla JavaScript**: Keine Build-Tools erforderlich

### Architektur
- **Zwei-Datei-Struktur**: `index.html` und `game.js`
- **Keine Abhängigkeiten**: Three.js wird via CDN geladen
- **Kein Build-Prozess**: Läuft direkt im Browser

### Performance
- Orthographische Kamera für 2D-Rendering
- Effiziente Partikel-Systeme
- Optimierte Kollisionserkennung (Circle-Based)

## Browser-Kompatibilität

Funktioniert in allen modernen Browsern:
- Chrome/Edge (empfohlen)
- Firefox
- Safari

**Hinweis**: Audio startet automatisch beim ersten Tastendruck (Browser-Autoplay-Richtlinie).

## Spielanleitung

1. Öffne `index.html` im Browser
2. Drücke eine beliebige Taste um die Musik zu starten
3. Bewege dein Raumschiff mit WASD oder Pfeiltasten
4. Schieße mit der Leertaste auf feindliche Raumschiffe
5. Weiche feindlichen Schüssen aus
6. Sammle Punkte und erreiche höhere Level
7. Versuche so lange wie möglich zu überleben!

## Entwicklung

Dieses Spiel wurde komplett mit prozeduralen Techniken entwickelt:
- Alle Sounds sind synthetisch generiert (keine Audio-Dateien)
- Alle Grafiken sind programmatisch erstellt (keine Image-Dateien)
- Musik wird in Echtzeit komponiert und gespielt

## Lizenz

MIT License - Frei verwendbar für private und kommerzielle Projekte.

## Credits

Entwickelt mit Claude Code (Anthropic)
