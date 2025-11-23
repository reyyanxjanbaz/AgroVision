# Tasks: AgroVision Core Platform

**Input**: Design documents from `/specs/001-core-platform/`
**Prerequisites**: plan.md, spec.md, data-model.md
**Tests**: Tests are OPTIONAL - only include them if explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create project root structure (backend, frontend, database folders)
- [x] T002 Initialize backend project with `npm init` in backend/package.json
- [x] T003 Install backend dependencies (express, cors, dotenv, @supabase/supabase-js) in backend/package.json
- [x] T004 Initialize frontend project (React) in frontend/package.json
- [x] T005 Install frontend dependencies (tailwindcss, recharts, axios, lucide-react, react-router-dom) in frontend/package.json
- [x] T006 Configure Tailwind CSS in frontend/tailwind.config.js and frontend/src/index.css
- [x] T007 Create frontend folder structure (components, pages, services, context) in frontend/src/
- [x] T008 Create backend folder structure (routes, controllers, models, services) in backend/src/

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T009 Create initial database schema migration for all tables in database/migrations/001_initial_schema.sql
- [x] T010 Create seed data script in backend/scripts/seedData.js
- [x] T011 [P] Setup Supabase client configuration in backend/src/config/supabase.js
- [x] T012 [P] Setup Supabase client configuration in frontend/src/services/supabase.js
- [x] T013 Setup Express server entry point with middleware in backend/src/server.js
- [x] T014 [P] Create API service wrapper in frontend/src/services/api.js
- [x] T015 [P] Create Auth/Role Context provider in frontend/src/context/AuthContext.jsx
- [x] T016 [P] Create MainLayout component with Navbar shell in frontend/src/layouts/MainLayout.jsx
- [x] T017 Setup React Router with base routes in frontend/src/App.js

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

## Phase 3: User Story 1 - Dashboard & Navigation (Priority: P1) 🎯 MVP

**Goal**: Role-based dashboard allowing users to view relevant crop information.

**Independent Test**: Verify Dashboard loads crops and changes view based on selected role.

### Implementation for User Story 1

- [x] T018 [US1] Create Crop model/data access layer in backend/src/models/Crop.js
- [x] T019 [US1] Implement GET /api/crops endpoint in backend/src/routes/crops.js
- [x] T020 [US1] Create CropCard component in frontend/src/components/CropCard.jsx
- [x] T021 [US1] Implement Navbar with Role Selector in frontend/src/components/Navbar.jsx
- [x] T022 [US1] Create Dashboard page fetching crops in frontend/src/pages/Dashboard.jsx
- [x] T023 [US1] Integrate Dashboard route in frontend/src/App.js

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

## Phase 4: User Story 2 - Crop Detail & Charts (Priority: P1)

**Goal**: Detailed view of crop data including price history charts and influencing factors.

**Independent Test**: Verify Crop Detail page loads correct data and chart renders history.

### Implementation for User Story 2

- [x] T024 [US2] Create PriceHistory model in backend/src/models/PriceHistory.js
- [x] T025 [US2] Implement GET /api/crops/:id endpoint in backend/src/routes/crops.js
- [x] T026 [US2] Implement GET /api/crops/:id/prices endpoint in backend/src/routes/crops.js
- [x] T027 [US2] Implement GET /api/crops/:id/factors endpoint in backend/src/routes/crops.js
- [x] T028 [US2] Create PriceChart component using Recharts in frontend/src/components/PriceChart.jsx
- [x] T029 [US2] Create FactorCard component in frontend/src/components/FactorCard.jsx
- [x] T030 [US2] Create FactorsList component in frontend/src/components/FactorsList.jsx
- [x] T031 [US2] Create CropDetail page in frontend/src/pages/CropDetail.jsx
- [x] T032 [US2] Add navigation from Dashboard to CropDetail in frontend/src/components/CropCard.jsx

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

## Phase 5: User Story 3 - AI Chatbot (Priority: P2)

**Goal**: Context-aware AI assistant for market advice and data explanation.

**Independent Test**: Verify Chatbot opens and responds to queries using page context.

### Implementation for User Story 3

- [x] T033 [US3] Setup Anthropic client in backend/src/services/anthropic.js
- [x] T034 [US3] Implement POST /api/chatbot endpoint in backend/src/routes/chatbot.js
- [x] T035 [US3] Create usePageContext hook to capture current page data in frontend/src/hooks/usePageContext.js
- [x] T036 [US3] Create Chatbot UI component (floating button + modal) in frontend/src/components/Chatbot.jsx
- [x] T037 [US3] Integrate Chatbot into MainLayout in frontend/src/layouts/MainLayout.jsx

**Checkpoint**: All user stories should now be independently functional

## Phase 6: User Story 4 - Search Functionality (Priority: P2)

**Goal**: Global search for crops and regions.

**Independent Test**: Verify search bar filters results or navigates to crop pages.

### Implementation for User Story 4

- [x] T038 [US4] Update GET /api/crops to support search query params in backend/src/routes/crops.js
- [x] T039 [US4] Create SearchBar component in frontend/src/components/SearchBar.jsx
- [x] T040 [US4] Integrate SearchBar into Navbar in frontend/src/components/Navbar.jsx

## Phase 7: User Story 5 - Price Prediction (Priority: P3)

**Goal**: Display AI-predicted future prices.

**Independent Test**: Verify prediction card appears on Crop Detail page.

### Implementation for User Story 5

- [x] T041 [US5] Implement simple prediction algorithm service in backend/src/services/prediction.js
- [x] T042 [US5] Implement GET /api/crops/:id/prediction endpoint in backend/src/routes/crops.js
- [x] T043 [US5] Create PredictionCard component in frontend/src/components/PredictionCard.jsx
- [x] T044 [US5] Integrate PredictionCard into CropDetail page in frontend/src/pages/CropDetail.jsx

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T045 [P] Implement ErrorBoundary component in frontend/src/components/ErrorBoundary.jsx
- [x] T046 [P] Create LoadingSpinner component in frontend/src/components/LoadingSpinner.jsx
- [x] T047 [P] Add 404 Not Found page in frontend/src/pages/NotFound.jsx
- [x] T048 [P] Configure Vercel deployment settings in vercel.json
- [x] T049 [P] Configure Render deployment settings in render.yaml (optional)
- [x] T050 Final end-to-end testing and bug fixes

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Setup
- **User Stories (Phase 3-7)**: Depend on Foundational
  - US1 (Dashboard) is the base for navigation.
  - US2 (Detail) depends on US1 for navigation entry points.
  - US3 (Chatbot) can be built in parallel but needs Layout (Phase 2).
  - US4 (Search) depends on Navbar (US1).
  - US5 (Prediction) depends on CropDetail (US2).

### Parallel Opportunities

- Frontend and Backend setup tasks in Phase 1 & 2 can run in parallel.
- Once Phase 2 is done:
  - Developer A can work on US1 (Dashboard) -> US2 (Detail) -> US5 (Prediction).
  - Developer B can work on US3 (Chatbot).
  - Developer C can work on US4 (Search).

---

## Implementation Strategy

### MVP First (User Story 1 & 2)

1. Complete Setup & Foundational.
2. Implement Dashboard (US1) to show list of crops.
3. Implement Crop Detail (US2) to show charts.
4. **Release MVP**.

### Incremental Delivery

1. Add Chatbot (US3) for AI assistance.
2. Add Search (US4) for better navigation.
3. Add Predictions (US5) for advanced value.
