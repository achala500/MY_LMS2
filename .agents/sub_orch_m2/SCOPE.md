# Scope: Milestone 2 - Data Layer, Auth & API Client

## Architecture
- Typed API Client (src/lib/api.ts): 100% genuine Apps Script integration using HTTP POST with Content-Type: text/plain;charset=utf-8 to https://script.google.com/macros/s/AKfycbwA5AQwT7cOipModhNXrWBQOOTkvv_RVHRkuxpS6iFyu_t_n6x0wo1YDkKemzC0cGPO/exec
- Firebase Auth Provider (src/context/AuthContext.tsx & src/lib/auth.ts): Google Sign-In popup with window.firebase compat SDK, auth state observer onAuthStateChanged, persistence, and alwisachalaanurada@gmail.com admin resolution
- Global App Context (src/context/AppContext.tsx): User profile, daily logs history, current today log, optimistic state, refresh triggers
- School Dataset (src/lib/schools.ts): Complete Sri Lankan schools list with province and district indexing
- Client-side Canvas Image Compression & Utilities (src/lib/utils.ts): JPEG downscaling <400KB, streak calculation, stream subject resolver
- Type Definitions (src/types/api.ts, src/types/member.ts, src/types/logs.ts)
- Custom Not Found Page (src/app/not-found.tsx)

## Feature Inventory Scope
- Feature 5: Firebase Auth Compat Provider
- Feature 6: Typed Google Apps Script API Client
- Feature 7: Global App State Management
- Feature 8: Sri Lankan Schools Dataset
- Feature 9: Client-Side Image Compression
- Feature 10: Date & Streak Domain Utilities

## Interface Contracts
- All ApiClient methods: checkUser, registerUser, submitDailyLog, getStudentHistory, verifyMember, getAdminData, adminUpdateMember
- AuthContext: user, member, loading, isAdmin, signInWithGoogle, signInWithEmail, signOut, refreshMember
- Zero mock/demo data, 100% live Google Sheets and Firebase auth integration
