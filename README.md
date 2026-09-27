# 🎵 UChords

UChords is a lightweight web application for organizing song collections, managing playlists, and displaying chord sheets with built-in editing and performance tools.

Designed for musicians, worship teams, performers, and hobbyists, UChords provides an easy way to store and access songs directly in the browser without requiring a backend server.

---

## ✨ Features

### 🎼 Playlist Management
- Create playlists
- Rename playlists
- Delete playlists
- Drag-and-drop playlist reordering

### 🎵 Song Management
- Create songs with:
  - Song title
  - Artist
  - Country
  - Language
- Edit song metadata
- Delete songs
- Drag-and-drop song reordering

### 🎸 Chord Sheet Editor
- Store lyrics and chords together
- Inline chord notation using:

```text
[C]Amazing [G]grace
```

- Automatic chord highlighting
- Live editing support
- Safe content sanitization

### 📖 Performance Mode
- Auto-scroll lyrics and chords
- Adjustable scrolling speed
- Fullscreen viewing mode
- Zoom support for easier reading

### 🎨 User Experience
- Dark theme
- Light theme
- Responsive mobile-friendly layout
- Custom fonts and Material Icons

### 💾 Data Management
- Browser-based local storage
- Export playlists as JSON
- Import playlists from JSON
- No account required

### ⚡ Offline Support
- Progressive Web App (PWA) manifest
- Service Worker caching support
- Installable on supported devices

---

## 🏗️ Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript (ES Modules)
- LocalStorage API
- Service Workers
- Progressive Web App (PWA)

---

## 📂 Project Structure

```text
UChords/
│
├── index.html
├── manifest.json
├── service-worker.js
├── generate-manifest.py
│
├── static/
│   ├── css/
│   ├── js/
│   │   ├── components/
│   │   └── screens/
│   ├── assets/
│   │   ├── images/
│   │   └── fonts/
│
└── README.md
```

---

## 🚀 Getting Started

### Clone the Repository

```bash
git clone https://github.com/yourusername/UChords.git
cd UChords
```

### Run Locally

Because the project uses ES Modules, serve it through a local web server.

Using Python:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

---

## 🎸 Chord Format Example

Write songs using bracket notation:

```text
[C]Amazing [G]grace,
How [Am]sweet the [F]sound
```

UChords automatically separates and highlights chords while preserving lyric alignment.

---

## 💾 Data Format

Exported playlists are stored as JSON:

```json
{
  "playlists": [
    {
      "name": "Favorites",
      "songs": [
        {
          "name": "Amazing Grace",
          "artist": "Traditional",
          "country": "USA",
          "language": "English",
          "content": "[C]Amazing [G]grace"
        }
      ]
    }
  ]
}
```

---

## 📱 Progressive Web App

UChords can be installed on supported browsers and devices as a standalone application.

Features include:

- Home screen installation
- Offline asset caching
- Native-app-like experience

---

## 🔮 Future Improvements

- Search songs
- Song categories/tags
- Cloud synchronization
- Multi-device support
- Chord transposition
- PDF export
- Backup to cloud storage

---

## 📄 License

MIT License

---

## 👨‍💻 Author

**Ushinar Chatterjee**

Built with ❤️ for musicians and performers.