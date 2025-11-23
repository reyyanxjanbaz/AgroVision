# Implementation Plan: AgroVision Core Platform

**Branch**: `main` | **Date**: 2025-11-23 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-core-platform/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

AgroVision is a modern agricultural intelligence platform featuring role-based dashboards (Farmer, Merchant, Customer), real-time crop price analytics with interactive charts, AI-powered price predictions, and a contextual AI chatbot. The system uses a React frontend with Tailwind CSS and an Express.js backend connected to Supabase (PostgreSQL).

## Technical Context

**Language/Version**: Node.js (v18+), React (v18+)
**Primary Dependencies**:

- Frontend: React Router, Tailwind CSS, Recharts, Axios, Lucide React
- Backend: Express.js, Supabase JS Client, Anthropic SDK, Date-fns
  **Storage**: Supabase (PostgreSQL)
  **Testing**: Jest, React Testing Library (Frontend), Supertest (Backend)
  **Target Platform**: Web (Vercel for Frontend, Render for Backend)
  **Project Type**: Web application (Frontend + Backend)
  **Performance Goals**: FCP < 1.5s, API response < 200ms, Chatbot response < 2s
  **Constraints**: Mobile-first design, NewsAPI free tier limits (100 req/day)
  **Scale/Scope**: MVP with ~6-8 crops, 3 user roles, initial seed data from USDA

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- **Speed First**: Plan targets <1.5s FCP and <200ms API response, aligning with the <2s load time principle.
- **Data Clarity**: Uses Recharts for visualization and clear factor cards.
- **Mobile-First**: Explicit mobile breakpoints (0-640px) and responsive design in requirements.
- **AI-Powered**: Includes AI Chatbot and Price Prediction features.
- **Multi-Stakeholder**: Role selector implementation covers Farmer, Merchant, and Customer views.
- **Trust Through Transparency**: Data sources (USDA, OpenWeatherMap) will be displayed.

## Project Structure

### Documentation (this feature)

```text
specs/001-core-platform/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── config/          # Environment and DB config
│   ├── controllers/     # Request handlers
│   ├── models/          # Database interactions (Supabase)
│   ├── routes/          # API route definitions
│   ├── services/        # Business logic (AI, External APIs)
│   └── utils/           # Helpers (Seeding, Formatting)
└── tests/

frontend/
├── src/
│   ├── assets/
│   ├── components/      # Reusable UI components
│   ├── context/         # React Context (Auth, Role)
│   ├── hooks/           # Custom hooks
│   ├── layouts/         # Page layouts
│   ├── pages/           # Route components
│   ├── services/        # API client
│   └── utils/
└── tests/

database/
├── seeds/               # CSV data and seed scripts
└── migrations/          # SQL schema definitions
```

**Structure Decision**: Split into `frontend` and `backend` directories to support separate deployment targets (Vercel/Render) and clear separation of concerns. `database` folder added for seed management.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
| --------- | ---------- | ------------------------------------ |
| None      | N/A        | N/A                                  |
