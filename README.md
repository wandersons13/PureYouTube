## ⚡ PureYouTube

**Ultra-lightweight cinematic immersion and bloat-free performance.**

---

### 🎬 **Cinematic Experience**

- **Full-Viewport Cinema:** Automatically scales the player to **100% screen height**, pushing the header and details out of sight for total immersion.
- **Layout Stabilization:** Enforces a pitch-black background immediately to prevent "white flashes" and UI shifting during loading.

### 🚀 **Pure Performance**

- **Telemetry Neutralizer:** Disables YouTube's internal tracking (`ytcsi`, `ytStats`) by replacing them with empty functions, saving CPU cycles.
- **Ultra-Lightweight:** Zero dependencies. No heavy background scripts or complex request interceptions—just raw, optimized CSS and JS.

### 🧹 **Clutter-Free UI**

- **Aggressive Declutter:** Instantly hides ads, live chats, merch shelves, and distracting "glow" effects.
- **Smart Lifecycle:** Uses a `MutationObserver` to ensure the layout stays perfect during internal navigation without draining your battery.
