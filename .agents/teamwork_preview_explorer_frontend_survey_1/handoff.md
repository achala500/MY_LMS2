# Frontend UI/UX Architecture & Client-Side Design Blueprint

**Project**: StudySync — Sri Lankan A/L Daily Study Tracking & Member Management Web Application  
**Agent**: teamwork_preview_explorer_frontend_survey_1  
**Working Directory**: `c:\Users\alwis\Documents\antigravity\dazzling-bardeen\.agents\teamwork_preview_explorer_frontend_survey_1\`  
**Date**: 2026-08-26  

---

## 1. Observation

### 1.1 Source Documents & Codebase Status
- **Authoritative Specifications (`ORIGINAL_REQUEST.md`)**:
  - Target Stack: Single-page application (SPA) deployed to **Firebase Hosting** using HTML5, CSS3, Tailwind CSS (CDN), Vanilla ES6+ JavaScript, Font Inter, Lucide icons, and Canvas/QR libraries.
  - Authentication: **Google Sign-In via Firebase Auth**; unique key = member Google email.
  - Visual Theme: Apple-inspired **Dark Mode** with deep navy/slate backgrounds, blue-purple accent gradients, glassmorphism (`backdrop-blur`), animated aurora mesh canvas/CSS background, and smooth micro-interactions.
  - Critical UX Rules:
    - **Zero `alert()` calls** — all notifications must use a custom animated toast notification system.
    - **No default HTML `<input type="range">` sliders** — custom dual-slider for focus (1-10) and productivity (1-10) with dynamic gradient fill, floating tooltips, and real-time score color shifts.
    - **Stream-aware subject rendering** — strictly 3 subjects per student (Bio: Bio + Chem + [Physics/Ag]; Maths: Combined Maths + Physics + [Chem/ICT]).
    - **Single submission per day lock** — if a daily log exists for today, the form switches to a read-only locked review state.
    - **Searchable school autocomplete** with 200+ Sri Lankan schools, fuzzy matching, keyboard navigation, and custom entry support.
    - **Apple Wallet-style Digital ID Card** with dynamic gradient, hologram accents, member details, chip graphic, QR code (encoding JSON payload + live verification URL), and **3x high-resolution PNG download**.
    - **Protected Admin Dashboard** with members table, filterable logs, group analytics, and streak leaderboard.
    - **Public ID Verification page/modal** (`#verify/SG-BIO-0001`).

- **Workspace Inspection**:
  - Current root directory `c:\Users\alwis\Documents\antigravity\dazzling-bardeen` contains only `.agents` and `.git`. The existing broken legacy Apps Script code is cataloged in `ORIGINAL_REQUEST.md` for anti-pattern avoidance and clean-slate rebuild.

---

## 2. Logic Chain

### 2.1 Complete Frontend Architectural Blueprint

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 StudySync Frontend SPA                                  │
│                 (Vanilla ES6+ Modules / Tailwind CSS CDN / Font Inter)                  │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                  Presentation Layer                                    │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐  │
│  │ Aurora Background Engine (Canvas 2D / CSS GPU-Accelerated Mesh Orbs)             │  │
│  │ Toast Notification Manager (Singleton Stack, Zero alert(), Auto-Dismiss)         │  │
│  └──────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                        │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐  │
│  │ View Router (Hash Router: #landing, #register, #dashboard, #admin, #verify)       │  │
│  ├─────────────────┬──────────────────┬─────────────────┬────────────────┬──────────┤  │
│  │ Landing / Auth  │ Registration     │ Student         │ Admin          │ Public   │  │
│  │ Hero & G-Sign-In│ Modal / Step     │ Dashboard       │ Dashboard      │ ID Card  │  │
│  │ Demo Mode Bar   │ Stream & School  │ Bento Stats     │ Member Manager │ Verified │  │
│  │ Feature Grid    │ Auto-filled Info │ Daily Form (3x) │ Log Inspector  │ Badge &  │  │
│  │                 │                  │ ID Card Preview │ Analytics      │ Details  │  │
│  └─────────────────┴──────────────────┴─────────────────┴────────────────┴──────────┘  │
│                                                                                        │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐  │
│  │ Custom Interactive Components                                                    │  │
│  │ ├─ Gradient Sliders (1-10 Focus/Productivity, Dynamic Glow, Value Badge)        │  │
│  │ ├─ School Autocomplete (250+ SL Schools, Fuzzy Search, Keyboard Nav)             │  │
│  │ ├─ Photo Compression Pipeline (Canvas 2D JPEG max 1600px -> base64)             │  │
│  │ └─ Digital ID Card Generator & 3x High-Res Canvas Exporter (with QR Engine)       │  │
│  └──────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                        │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐  │
│  │ State & Data Layer                                                               │  │
│  │ ├─ AppState (Reactive Pub/Sub Store with LocalStorage Persistence)               │  │
│  │ ├─ FirebaseAuthService (GoogleAuthProvider + Local Mock Mode Fallback)           │  │
│  │ └─ ApiClient (Google Apps Script Web App REST API + Mock Backend Adapter)        │  │
│  └──────────────────────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### 2.2 Apple-Inspired Dark Mode Aesthetic & Design Tokens

#### A. Color Palette Tokens
- **Canvas Base**: `bg-[#07090E]` (deep midnight obsidian)
- **Layer 1 Surface**: `bg-[#0D111A]/80` (dark navy slate)
- **Layer 2 Card (Glassmorphism)**: `bg-[#131B2A]/60` with `backdrop-blur-xl` and `border border-white/[0.08]`
- **Layer 3 Elevated Modal/Dropdown**: `bg-[#182236]/90` with `backdrop-blur-2xl` and `border border-white/[0.15]`
- **Primary Accent Gradient**: `from-[#6366F1] via-[#8B5CF6] to-[#D946EF]` (Electric Indigo -> Vivid Violet -> Fuchsia)
- **Secondary Cyan Gradient**: `from-[#06B6D4] to-[#3B82F6]` (Cyber Cyan -> Ocean Blue)
- **Success Glow**: `from-[#10B981] to-[#059669]` (Emerald Green)
- **Warning Glow**: `from-[#F59E0B] to-[#D97706]` (Amber Gold)
- **Danger Glow**: `from-[#EF4444] to-[#DC2626]` (Rose Red)
- **Text Hierarchy**:
  - `text-white` (Primary headers, high-emphasis text)
  - `text-slate-200` (Secondary headers, active labels)
  - `text-slate-400` (Body text, subtext, inactive icons)
  - `text-slate-500` (Placeholders, disabled metadata)

#### B. Dynamic Aurora Mesh Background Engine
To ensure silky 60fps performance across mobile phones, tablets, and low-spec laptops:
- **CSS Mesh Layer**: 3 fixed, blur-filtered radial gradient orbs positioned at top-left, center-right, and bottom-left with subtle CSS keyframe float animations (`animation: auroraFloat 18s ease-in-out infinite alternate`).
- **Canvas Noise Layer**: Ultra-lightweight 1-bit procedural grain canvas overlay at 2% opacity to eliminate 8-bit banding on dark OLED displays.
- **Glassmorphism CSS Utility Classes**:
  ```css
  .glass-panel {
    background: rgba(15, 23, 42, 0.65);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
  }
  .glass-card-hover {
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .glass-card-hover:hover {
    transform: translateY(-2px);
    border-color: rgba(99, 102, 241, 0.35);
    box-shadow: 0 12px 40px -10px rgba(99, 102, 241, 0.2);
  }
  ```

---

### 2.3 Custom Interactive Components Architecture

#### A. Custom Gradient Sliders (Focus & Productivity 1-10)
Standard HTML range inputs look generic and lack engagement. The custom slider is built with pure HTML/CSS/JS touch/mouse drag handlers:
- **Visual Spec**:
  - Track height: 10px rounded pill with inset shadow `inset 0 2px 4px rgba(0,0,0,0.5)`.
  - Dynamic Track Gradient: Fill width matches `((value - 1) / 9) * 100%`.
  - Color Range:
    - Score 1–3: Red-to-Orange (`#EF4444` → `#F97316`) — Status: "Distracted / Struggling"
    - Score 4–6: Yellow-to-Emerald (`#EAB308` → `#10B981`) — Status: "Moderate / Steady"
    - Score 7–8: Emerald-to-Cyan (`#10B981` → `#06B6D4`) — Status: "High Focus / Productive"
    - Score 9–10: Cyan-to-Purple (`#06B6D4` → `#8B5CF6` → `#EC4899`) — Status: "Deep Flow State 🔥"
  - Thumb: 24px circular glass orb with white center dot, matching outer glowing halo (`box-shadow: 0 0 14px <currentColor>`).
  - Floating Value Badge: Positioned directly above thumb, displaying current number `[ 8 ]` and qualitative text label.
  - Interactive Feedback:
    - Touch & Mouse pointer event listeners (`pointerdown`, `pointermove`, `pointerup`, `pointercancel`) with `setPointerCapture`.
    - Keyboard accessibility: `ArrowLeft`, `ArrowRight`, `Home`, `End` keys increment/decrement value.
    - Haptic feedback: `if (navigator.vibrate) navigator.vibrate(8);` on value step change.

#### B. Toast Notification System (Zero `alert()` Calls)
- **Singleton Architecture**: `Toast.show({ message, type: 'success'|'error'|'warning'|'info', title, duration: 4000 })`.
- **DOM Container**: Fixed `#toast-container` anchored at `top-5 right-5` (desktop) and `top-4 inset-x-4` (mobile) with `z-index: 9999`.
- **Card Anatomy**:
  - Glass card with colored left accent border and matching glow.
  - Status Icon (Checkmark, ShieldAlert, AlertTriangle, Info).
  - Title (e.g. "Daily Log Saved!", "Authentication Error").
  - Message text with clean line wrapping.
  - Animated bottom progress countdown bar showing remaining display time.
  - Manual dismiss "×" button.
- **Queue & Stacking**: Multiple toasts stack vertically with smooth slide-in (`translate-y-0 opacity-100 scale-100`) and slide-out exit transitions.
- **Audit Safeguard**: `window.alert = (msg) => Toast.warning(msg, "Alert");` to catch any accidental alert calls in third-party libraries.

#### C. Sri Lankan Schools Autocomplete Dropdown
- **Dataset**: Embedded dataset of **260+ Sri Lankan National & Provincial Schools** spanning Western, Central, Southern, Northern, Eastern, North Western, North Central, Uva, and Sabaragamuwa provinces.
  - Includes prominent institutions: Royal College Colombo, Ananda College, Visakha Vidyalaya, Nalanda College, Devi Balika Vidyalaya, Sirimavo Bandaranaike Vidyalaya, St. Joseph's College, St. Peter's College, St. Thomas' College Mount Lavinia, Ladies' College, Bishop's College, Musaeus College, Dharmaraja College Kandy, Kingswood College, Mahamaya Girls' College, High School Kandy, Trinity College, Richmond College Galle, Mahinda College, Southlands College, Maliyadeva College Kurunegala, Jaffna Hindu College, Jaffna Central College, Hartley College Point Pedro, St. Patrick's College Jaffna, Rahula College Matara, Sujatha Vidyalaya Matara, Badulla Central College, Bandarawela Central College, Kegalu Vidyalaya, Ratnapura Ferguson High School, etc.
- **Interaction Logic**:
  - Input field with search icon and clear button.
  - Debounced input filtering (matches name, district, or town).
  - Highlights matched characters using `<mark class="bg-indigo-500/30 text-indigo-300 rounded px-0.5">`.
  - Displays School Name + District Badge (`[Colombo]`, `[Kandy]`, `[Galle]`).
  - Full Keyboard Navigation: `ArrowDown` to highlight item, `ArrowUp` to navigate up, `Enter` to select, `Escape` to close.
  - Custom School Fallback: If no school matches, shows "Can't find your school? Use: '[typed text]'" allowing seamless custom entry without blocking submission.

---

### 2.4 Views & Routing Architecture

StudySync uses a lightweight, hash-based client router (`#landing`, `#register`, `#dashboard`, `#admin`, `#verify/:id`) that renders views dynamically into `#app-root` without page refreshes.

#### 1. Landing & Auth View (`#landing`)
- **Hero Section**: "StudySync: Sri Lanka A/L Study Accountability & Master Analytics".
- **Visual Showcase**: Live mockup preview of the Apple Wallet ID card and interactive slider preview.
- **Google Sign-In CTA**:
  - Primary button: "Sign in with Google" with official Google SVG badge and glowing hover outline.
  - Fallback / Dev Testing Bar: "Quick Demo Mode" dropdown allowing 1-click login as:
    1. `student.bio@studysync.lk` (Registered Bio student, 7-day streak)
    2. `student.maths@studysync.lk` (Registered Maths student, 3-day streak)
    3. `new.student@gmail.com` (Unregistered user to test registration flow)
    4. `admin@studysync.lk` (Admin account)
- **Features Section**: Bento grid showcasing Stream-Aware logging, Apple Wallet ID, Streak tracking, and Google Drive proof storage.

#### 2. Registration Modal / Step View (`#register`)
- Activated automatically on first login if `apiClient.checkUser(email)` returns `isRegistered: false`.
- **Form Layout**:
  - Header: Google Avatar + "Welcome to StudySync, [Name]! Complete your 1-time A/L profile".
  - Field 1: **Full Name** (text input, pre-filled from Google profile, editable).
  - Field 2: **Email Address** (read-only input with lock icon, pre-filled from Google Sign-In).
  - Field 3: **Gender** (custom select: Male / Female / Other).
  - Field 4: **Telegram Username** (text input with fixed `@` prefix and auto-trim).
  - Field 5: **School** (searchable autocomplete input with Sri Lankan schools dataset).
  - Field 6: **A/L Stream** (Visual toggle cards):
    - Option A: *Biological Science* (Icon: DNA / Microscope)
    - Option B: *Physical Science (Maths)* (Icon: Infinity / Atom)
  - Field 7: **Optional Subject** (dynamically updates based on Stream):
    - If Bio: Choice between **Physics** or **Agriculture**
    - If Maths: Choice between **Chemistry** or **ICT**
  - CTA Button: "Create My Account & Generate ID Card" (triggers sequential ID generation `SG-BIO-0001` or `SG-MATH-0001`).

#### 3. Student Dashboard (`#dashboard`)
- **Header**: StudySync Brand, Live Date, Streak Pill (`🔥 7 Days`), User Avatar & Logout.
- **Profile & ID Pass Section**:
  - Digital ID Card Preview (interactive 3D tilt on hover).
  - Primary Action Button: "Download Digital ID (3x High-Res PNG)" with instant canvas rendering.
  - Secondary Action: "Flip to QR Verification".
- **Personal Analytics Bento Grid**:
  - **Streak Card**: Current streak count, longest streak record, flame animation.
  - **Total Hours Studied**: Cumulative hours logged + Weekly study goal progress ring.
  - **Subject Hours Breakdown**: 3 interactive progress bars displaying distribution among the 3 subjects.
  - **Focus & Productivity Averages**: Visual radial meters displaying overall focus (e.g. `8.2/10`) and productivity (e.g. `7.8/10`).
- **Daily Study Logging Section**:
  - Embedded Stream-Aware Daily Form (see Section 2.5).
  - If today's log is already submitted: Replaced with a sleek "Today's Study Submitted ✅" banner and read-only summary card with photo thumbnail.
- **Past Study History Section**:
  - Collapsible/paginated cards of previous logs.
  - Shows Date, Subject 1/2/3 Hours, Dual Slider Scores, Notes reflection, and clickable Proof Photo preview modal.

#### 4. Stream-Aware Daily Study Form Architecture
- **Automatic Subject Detection**:
  - Checks student's stream and optional subject:
    - **Bio + Physics**: [Biology, Chemistry, Physics]
    - **Bio + Ag**: [Biology, Chemistry, Agriculture]
    - **Maths + Chem**: [Combined Maths, Physics, Chemistry]
    - **Maths + ICT**: [Combined Maths, Physics, ICT]
- **Subject Input Card Anatomy (Repeated for each of the 3 subjects)**:
  - Subject Title with distinct colored icon badge (e.g. Bio = Emerald, Chem = Amber, Maths = Indigo, Physics = Cyan, ICT = Violet, Ag = Lime).
  - Study Time Input: Decimal hours input (step `0.25` or `0.5`, e.g. `2.5 hrs` = 2 hrs 30 mins) with quick-add buttons (`+30m`, `+1h`, `+2h`).
  - Focus Level: Custom gradient slider (1-10).
  - Productivity Level: Custom gradient slider (1-10).
- **General Fields**:
  - Date Picker (defaults to today's date `YYYY-MM-DD`, cannot pick future dates).
  - Telegram Username (pre-filled from profile, editable).
  - Notes & Reflections (Textarea for topics covered, revision notes, past paper years).
  - Photo Proof File Uploader:
    - Drag & drop zone with file type validation (`image/jpeg, image/png, image/webp`).
    - Client-side image compression: Reads image into HTML5 Canvas, resizes to max dimension 1600px, compresses to JPEG quality 0.75, and generates base64 data URL.
    - Live thumbnail preview with remove/replace button.
- **Submission Rules**:
  - Client validates: at least one subject has > 0 hours, all sliders are between 1 and 10, valid date.
  - Sends payload to backend `action=submitDailyLog`.
  - On success: Plays celebratory micro-animation, displays success Toast, updates `AppState`, and transitions the form into read-only mode for today.

#### 5. Admin Dashboard (`#admin`)
- **Access Control**: Protected by email whitelist check (`user.email === ADMIN_EMAIL` or member of admin list). Unauthorized users see a glassmorphic "Access Denied (403)" screen with button to return to Student Dashboard.
- **Tabbed Interface**:
  - **Tab 1: Group Overview & Analytics**:
    - Metric Cards: Total Registered Members, Total Study Hours Logged, Average Daily Hours, Logs Submitted Today.
    - Streak Leaderboard: Top 10 students ranked by current streak with Gold/Silver/Bronze crown badges.
    - Stream Distribution: Pie/Bar breakdown of Bio vs. Maths members.
  - **Tab 2: Members Directory**:
    - Full table listing: Study ID, Full Name, Email, School, Stream, Optional Subject, Registration Date, Status (`Active`/`Inactive`).
    - Real-time search filter by Name, ID, School, or Stream.
    - Export Members as CSV button.
  - **Tab 3: Daily Logs Inspector**:
    - Searchable, filterable log records table.
    - Filter by Date Range, Stream, or specific Student ID.
    - Columns: Date, Student ID, Email, Subject 1-3 Hours & Scores, Notes, Proof Photo Link (clicking opens modal with full-size photo preview).
    - Export Logs as CSV button.

#### 6. Public ID Card Verification Page (`#verify/:studyId`)
- Publicly accessible without authentication.
- URL format: `https://studysync-al.web.app/#verify/SG-BIO-0001` or `?verify=SG-BIO-0001`.
- Directly decodes embedded QR verification parameter or calls `apiClient.verifyMember(studyId)`.
- **Verification UI**:
  - Large animated green verified badge: `🛡️ VERIFIED OFFICIAL MEMBER`.
  - Member Name, Unique Study ID (`SG-BIO-0001`), School, Stream, Registration Date.
  - Active Status Indicator (`● ACTIVE`).
  - Holographic anti-counterfeit animated watermark with live server timestamp to prevent static screenshot forgery.

---

### 2.5 Apple Wallet Digital ID Card & 3x Canvas Export Pipeline

```
┌────────────────────────────────────────────────────────────────────────┐
│                        STUDYSYNC OFFICIAL PASS                         │
│  ┌───────────────────────┐                               ┌──────────┐  │
│  │ ⚡ STUDYSYNC A/L       │                               │ ● ACTIVE │  │
│  └───────────────────────┘                               └──────────┘  │
│                                                                        │
│  ┌──────────┐                                                          │
│  │ [EMV     │      KASUN PERERA                                        │
│  │  CHIP]   │      Royal College, Colombo                              │
│  │  )))     │                                                          │
│  └──────────┘      SG-BIO-0042                                         │
│                    BIOLOGICAL SCIENCE • PHYSICS                        │
│                                                                        │
│  ┌───────────────────────────────────────────────┐  ┌───────────────┐  │
│  │ ISSUED: 2026-08-26                            │  │  ┌─────────┐  │  │
│  │ VERIFY: studysync-al.web.app/#verify/SG-BIO-..│  │  │ QR CODE │  │  │
│  │ AUTH: SRI LANKA ADVANCED LEVEL STUDY GROUP    │  │  └─────────┘  │  │
│  └───────────────────────────────────────────────┘  └───────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

#### A. Card Specifications & Visual Hierarchy
- **Aspect Ratio**: Standard ISO/IEC 7810 ID-1 card ratio (85.60mm × 53.98mm ≈ 1.586 : 1).
- **CSS Display Size**: 480px × 302px (responsive scale on mobile).
- **Export Render Size**: **1440px × 906px (3x High-DPI Scale, ~300 DPI)** for razor-sharp physical printing and Apple Wallet crispness.
- **Card Layers**:
  1. Base Background: Rich multi-stop gradient (`#0A0E1A` → `#1E1B4B` → `#311042` with 45° angle).
  2. Mesh Glass Highlights: Subtle curved radial gradient representing overhead studio lighting.
  3. Security Micro-Pattern: Diagonal 0.5px line raster with anti-copy micro-text "STUDYSYNC SRI LANKA A/L".
  4. Metallic Gold Chip: Realistic 6-pin contact smart card chip rendering with brushed metallic texture.
  5. Monospace Study ID: `SG-BIO-0001` rendered in `Courier New` / `SF Mono` with soft cyan outer glow.
  6. Holographic Pass Seal: Gradient border badge with iridescent reflection.
  7. High-Contrast QR Code: 200px square QR code with rounded corners on pure white translucent backing.

#### B. QR Code Data Payload
The QR code encodes both structured offline JSON and a live verification URL:
```json
{
  "app": "StudySync",
  "id": "SG-BIO-0042",
  "name": "Kasun Perera",
  "stream": "Biological Science",
  "subject": "Physics",
  "school": "Royal College",
  "verify": "https://studysync-al.web.app/#verify/SG-BIO-0042"
}
```
Scanning with standard smartphone cameras automatically opens the verification URL; scanning with verification scanners reads the complete offline cryptographic record.

#### C. High-Resolution 3x Canvas Export Pipeline
To prevent CSS font rasterization artifacts and cross-browser rendering discrepancies, the ID card export uses a **Pure HTML5 Canvas 2D Rendering Engine**:
```javascript
export async function generateHighResIdCardBlob(memberData, scaleFactor = 3) {
  const width = 480 * scaleFactor;  // 1440px
  const height = 302 * scaleFactor; // 906px
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // 1. Draw rounded card boundary with clipping
  const radius = 24 * scaleFactor;
  ctx.save();
  drawRoundedRect(ctx, 0, 0, width, height, radius);
  ctx.clip();

  // 2. Draw Multi-Stop Metallic Background Gradient
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#0B0F19');
  bgGrad.addColorStop(0.4, '#1E1B4B');
  bgGrad.addColorStop(0.8, '#2E1065');
  bgGrad.addColorStop(1, '#0F172A');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // 3. Draw Holographic Mesh Wave & Security Micro-Grid
  drawSecurityMesh(ctx, width, height, scaleFactor);

  // 4. Draw Gold EMV Chip Graphic
  drawEmvChip(ctx, 40 * scaleFactor, 100 * scaleFactor, scaleFactor);

  // 5. Draw Typography with Crisp Anti-Aliasing
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `bold ${24 * scaleFactor}px Inter, sans-serif`;
  ctx.fillText(memberData.name.toUpperCase(), 40 * scaleFactor, 195 * scaleFactor);

  ctx.fillStyle = '#94A3B8';
  ctx.font = `${14 * scaleFactor}px Inter, sans-serif`;
  ctx.fillText(memberData.school, 40 * scaleFactor, 220 * scaleFactor);

  ctx.fillStyle = '#38BDF8';
  ctx.font = `bold ${20 * scaleFactor}px "Courier New", monospace`;
  ctx.fillText(memberData.studyId, 40 * scaleFactor, 260 * scaleFactor);

  // 6. Draw QR Code directly from generated matrix
  const qrCanvas = await generateQrCanvas(memberData);
  ctx.drawImage(qrCanvas, width - (150 * scaleFactor), height - (150 * scaleFactor), 110 * scaleFactor, 110 * scaleFactor);

  ctx.restore();

  // 7. Export to PNG Blob
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/png', 1.0);
  });
}
```

---

### 2.6 Client State Management & API Integration

#### A. Reactive State Store (`AppState`)
A lightweight, dependency-free pub/sub store manages the application state:
```javascript
export const AppState = {
  state: {
    user: null,         // Firebase user { uid, email, displayName, photoURL }
    member: null,       // Registered member profile { studyId, name, email, school, stream, ... }
    todayLog: null,     // Today's log entry if submitted { exists: true, data: {...} }
    history: [],        // Array of past daily logs
    adminData: null,    // Admin data { members: [], logs: [], analytics: {} }
    route: 'landing',   // Current route: 'landing' | 'register' | 'dashboard' | 'admin' | 'verify'
    isMockMode: false,  // True when running in local mock preview mode
    isLoading: false
  },
  listeners: [],
  subscribe(fn) { this.listeners.push(fn); },
  set(patch) {
    this.state = { ...this.state, ...patch };
    this.listeners.forEach(fn => fn(this.state));
  }
};
```

#### B. Firebase Authentication & Mock Fallback Architecture
- **Production Mode**: Uses official Firebase JS SDK v10 (compat/modular via CDN) initialized with `firebaseConfig`.
  - `signInWithPopup(auth, new GoogleAuthProvider())` triggers the Google Sign-In popup.
  - `onAuthStateChanged` syncs Firebase Auth with `AppState`.
- **Seamless Local Mock Mode**:
  - If running on `localhost`, `127.0.0.1`, or when Firebase credentials are not yet configured, the app seamlessly provides a **Mock Auth Controller**.
  - Provides instant login buttons for testing all student roles and admin roles with realistic pre-populated data.

#### C. Unified API Client (`ApiClient`)
Connects the frontend to the Google Apps Script Web App backend or local mock adapter:
- Endpoints handled:
  - `checkUser(email)`: Checks if user is registered, returns member profile and today's log status.
  - `registerUser(payload)`: Submits new member data, returns generated Study ID (`SG-BIO-0001`).
  - `submitDailyLog(payload)`: Uploads compressed photo and appends log row.
  - `getStudentHistory(studyId, email)`: Fetches past study history.
  - `getAdminData(adminEmail)`: Fetches complete members list, logs, and analytics.
  - `verifyMember(studyId)`: Returns public verification details.

---

## 3. Caveats

1. **Google Apps Script CORS / Redirect Behavior**: Google Apps Script web apps return a 302 redirect to `script.googleusercontent.com` upon execution. Standard `fetch()` calls must follow redirects (`redirect: 'follow'`) and send JSON stringified payloads in `POST` requests. The `ApiClient` must encapsulate this transparently.
2. **Camera Photo File Size on Mobile Devices**: Modern mobile phone cameras produce 5MB–15MB photos (4000×3000px). Uploading raw uncompressed images over mobile data to Google Drive will cause latency and Apps Script execution timeouts. The client-side canvas compression pipeline (resizing to max 1600px, JPEG 0.75) is essential to reduce payload size to < 400KB before base64 encoding.
3. **High-Res ID Card Font Rendering**: When rendering the 3x high-resolution ID card on HTML5 Canvas, web fonts (`Inter`) must be fully loaded (`document.fonts.ready`) before executing canvas draw commands to prevent fallback font rendering.

---

## 4. Conclusion

The surveyed frontend architecture delivers an Apple-grade, high-performance, dark-mode web application that satisfies all functional and non-functional requirements in `ORIGINAL_REQUEST.md`.

### Core Architectural Decisions Summary:
1. **Visual Engine**: Apple dark mode theme with midnight base (`#07090E`), glassmorphism cards (`backdrop-blur-xl`), animated aurora background, and Inter font typography.
2. **Interactive Controls**: Custom dual gradient sliders (1-10) for focus and productivity with dynamic color shifts and qualitative badges.
3. **Notification Engine**: Standalone Toast Notification System with zero `alert()` calls.
4. **Data Input UX**: Searchable school autocomplete with 260+ Sri Lankan schools, keyboard navigation, and custom entry support.
5. **Stream Integrity**: Dynamic stream-aware daily logging form showing strictly the 3 relevant subjects based on student registration.
6. **Digital Pass**: Apple Wallet-style gradient ID card with dual-purpose QR code and pixel-perfect 3x high-resolution PNG canvas export.
7. **Client State & Dual Runtime**: Reactive `AppState` store supporting both live Firebase Auth + Google Apps Script and instant local mock preview mode.

---

## 5. Verification Method

To verify the frontend implementation:

1. **Alert Elimination Audit**:
   ```bash
   grep -rn "alert(" src/ public/
   # Expected result: Zero matches (Toast notification system used exclusively)
   ```
2. **School Autocomplete Dataset Count**:
   - Inspect `schools.json` / `schoolsData.js` and verify array length is >= 200 items.
3. **Dual Slider Interaction Test**:
   - Move sliders from 1 to 10; verify color shifts dynamically from Red (1-3) -> Yellow/Green (4-6) -> Emerald/Cyan (7-8) -> Cyan/Purple (9-10).
4. **Stream-Aware Subject Filtering Test**:
   - Login as Biological Science (Physics) -> Verify form displays Biology, Chemistry, Physics.
   - Login as Biological Science (Ag) -> Verify form displays Biology, Chemistry, Agriculture.
   - Login as Physical Science (Chemistry) -> Verify form displays Combined Maths, Physics, Chemistry.
   - Login as Physical Science (ICT) -> Verify form displays Combined Maths, Physics, ICT.
5. **Single Submission Lock Test**:
   - Submit a daily log for today -> Refresh page / re-open form -> Verify form displays "Today's Study Submitted" read-only summary card and disables duplicate submissions.
6. **ID Card 3x Resolution Export Test**:
   - Click "Download ID Card" -> Verify downloaded PNG has dimensions `1440 × 906` px with crisp vector-like text and scannable QR code.
7. **Public Verification Route Test**:
   - Navigate to `#verify/SG-BIO-0001` -> Verify green `VERIFIED OFFICIAL MEMBER` badge, name, school, and active status are displayed without login.
