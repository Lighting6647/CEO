# 🛡️ Antigravity Workspace Production Rules: Zero "AI Slop" & Production-Ready Standards

All AI coding assistants operating within this repository MUST strictly follow these 4 pillars:

## 1. Anti-AI Slop & UI/UX Design System
* **Curated Design Tokens:** Strictly avoid generic purple-blue gradient clichés. Use intentional color tokens (Slate/Zinc neutral base with cohesive brand accents), defined typography (Inter / Plus Jakarta Sans), and unified border-radius/spacing scales.
* **Micro-interactions:** Interactive elements must have hover, active, focus-visible states. Use loading skeleton screens and modern Toast alerts instead of primitive browser alerts.
* **Real Content Layout:** Zero "Lorem Ipsum" or mock strings. Use authentic domain-specific data to stress-test layout balance and wrapping.
* **Clean Code Structure:** Mandatory separation of concerns (Atomic/Feature-based components, hooks, services). No monolithic single-file code dumps.

## 2. Autonomous Testing & QA Pipeline
* **E2E & Component Test:** Run and verify all core flows with automated test runners (Playwright/Vitest/Jest).
* **Edge Cases Handling:** Implement input validation, Error Boundaries, and graceful network/API fallback states with retry capability.
* **Responsive Audit:** Verify mobile (375-430px), tablet (768-834px), and desktop (1280px+). Zero horizontal scroll leaks.
* **Zero Console Errors:** Zero runtime console errors, warnings, or hydration mismatches.

## 3. Deployment & Live Link Gatekeeper
* **Build Check:** `npm run build` must succeed 100% with zero TypeScript and zero Linter errors.
* **Auto Smoke Test:** Verify HTTP 200, DOM mount, and no 404/white-screen routing failures.

## 4. Interactive Feature Recommender (Mandatory Completion Protocol)
Whenever core tasks are finished and verified, summarize briefly and proactively recommend 2-3 high-value features (Security/Performance, UX/Engagement, Data/Operations), concluding with:
**"ต้องการให้เพิ่มฟังก์ชันใดใน 3 ข้อนี้ต่อทันทีเลยไหมครับ?"**
