---
description: "Task list for AgroVision Core Platform implementation"
---

# Tasks: AgroVision Core Platform

**Input**: Design documents from `/specs/001-core-platform/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Tests are OPTIONAL - only included if explicitly requested.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create project structure (frontend/backend split) per implementation plan
- [ ] T002 Initialize React frontend with Tailwind CSS in `frontend/`
- [ ] T003 Initialize Express backend in `backend/`
- [ ] T004 [P] Configure Supabase client in `backend/src/config/supabase.js` and `frontend/src/services/supabase.js`
- [ ] T005 [P] Configure environment variables (.env) for both frontend and backend

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T006 Setup database schema (crops, price_history, factors, news) in `database/migrations/001_initial_schema.sql`
- [ ] T007 Create seed script for USDA data in `backend/src/utils/seedData.js`
- [ ] T008 [P] Implement basic Express server with CORS and error handling in `backend/src/server.js`
- [ ] T009 [P] Create shared API client (Axios instance) in `frontend/src/services/api.js`
- [ ] T010 [P] Create React Context for Auth/Role management in `frontend/src/context/AuthContext.jsx`
- [ ] T011 [P] Create basic Layout component with Navbar in `frontend/src/layouts/MainLayout.jsx`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Dashboard & Navigation (Priority: P1) 🎯 MVP

**Goal**: Role-based dashboard with crop overview

**Independent Test**: Verify dashboard content changes based on selected role (Farmer/Merchant/Customer)

### Implementation for User Story 1

- [ ] T012 [P] [US1] Create Crop model/service in `backend/src/models/Crop.js`
- [ ] T013 [P] [US1] Implement GET /api/crops endpoint in `backend/src/routes/crops.js`
- [ ] T014 [US1] Create CropCard component in `frontend/src/components/CropCard.jsx`
- [ ] T015 [US1] Create Dashboard page in `frontend/src/pages/Dashboard.jsx`
- [ ] T016 [US1] Implement Role Selector in `frontend/src/components/Navbar.jsx`
- [ ] T017 [US1] Integrate API and Role Context in Dashboard to filter/display crops

**Checkpoint**: User Story 1 fully functional

---

## Phase 4: User Story 2 - Crop Detail & Charts (Priority: P1)

**Goal**: Detailed crop view with interactive price history chart

**Independent Test**: Verify chart renders and updates with time/region filters

### Implementation for User Story 2

- [ ] T018 [P] [US2] Create PriceHistory model/service in `backend/src/models/PriceHistory.js`
- [ ] T019 [P] [US2] Implement GET /api/crops/:id and /api/crops/:id/prices in `backend/src/routes/crops.js`
- [ ] T020 [P] [US2] Implement GET /api/crops/:id/factors in `backend/src/routes/factors.js`
- [ ] T021 [US2] Create PriceChart component (Recharts) in `frontend/src/components/PriceChart.jsx`
- [ ] T022 [US2] Create FactorCard component in `frontend/src/components/FactorCard.jsx`
- [ ] T023 [US2] Create CropDetail page in `frontend/src/pages/CropDetail.jsx`
- [ ] T024 [US2] Implement time period and region filters in CropDetail page

**Checkpoint**: User Stories 1 & 2 functional

---

## Phase 5: User Story 3 - AI Chatbot (Priority: P2)

**Goal**: Context-aware AI assistant

**Independent Test**: Verify chatbot opens and responds to "Summarize this page"

### Implementation for User Story 3

- [ ] T025 [P] [US3] Implement POST /api/chatbot endpoint (Anthropic integration) in `backend/src/routes/chatbot.js`
- [ ] T026 [P] [US3] Create Chatbot UI component (Floating Action Button + Modal) in `frontend/src/components/Chatbot.jsx`
- [ ] T027 [US3] Implement context injection logic (capture current page data) in `frontend/src/hooks/usePageContext.js`
- [ ] T028 [US3] Integrate Chatbot component into `frontend/src/layouts/MainLayout.jsx`

**Checkpoint**: User Stories 1, 2 & 3 functional

---

## Phase 6: User Story 4 - Search Functionality (Priority: P2)

**Goal**: Global search for crops

**Independent Test**: Verify search bar returns correct results and navigates to detail page

### Implementation for User Story 4

- [ ] T029 [P] [US4] Implement search logic (or new endpoint) in `backend/src/routes/crops.js`
- [ ] T030 [US4] Create SearchBar component with autocomplete in `frontend/src/components/SearchBar.jsx`
- [ ] T031 [US4] Integrate SearchBar into `frontend/src/components/Navbar.jsx`

**Checkpoint**: User Stories 1-4 functional

---

## Phase 7: User Story 5 - Price Prediction (Priority: P3)

**Goal**: AI-powered price forecasting

**Independent Test**: Verify prediction badge appears on Crop Detail page

### Implementation for User Story 5

- [ ] T032 [P] [US5] Implement prediction algorithm (linear regression) in `backend/src/services/predictionService.js`
- [ ] T033 [P] [US5] Implement GET /api/crops/:id/prediction endpoint in `backend/src/routes/prediction.js`
- [ ] T034 [US5] Create PredictionPanel component in `frontend/src/components/PredictionPanel.jsx`
- [ ] T035 [US5] Integrate PredictionPanel into `frontend/src/pages/CropDetail.jsx`

**Checkpoint**: All user stories functional

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T036 [P] Implement News integration (NewsAPI) in `backend/src/routes/news.js` and `frontend/src/components/NewsSection.jsx`
- [ ] T037 [P] Add loading skeletons and error boundaries across all pages
- [ ] T038 [P] Optimize responsive design for mobile (check breakpoints)
- [ ] T039 [P] Final UI polish (gradients, glassmorphism, animations)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup. BLOCKS all user stories.
- **User Stories (Phase 3+)**: All depend on Foundational.
  - US1 (Dashboard) is the MVP base.
  - US2 (Detail) extends US1.
  - US3 (Chatbot) and US4 (Search) can be built in parallel with US2.
  - US5 (Prediction) is an enhancement to US2.

### Parallel Opportunities

- Frontend and Backend tasks within each phase can often run in parallel.
- US3 (Chatbot) and US4 (Search) are largely independent of the core crop data flow and can be parallelized.

## Implementation Strategy

### MVP First (User Story 1)

1. Complete Setup & Foundation.
2. Build Dashboard with hardcoded or seeded data.
3. Verify Role switching works.

### Incremental Delivery

1. Add Crop Detail (US2) to make the dashboard items clickable.
2. Add Chatbot (US3) for "wow" factor.
3. Add Search (US4) for usability.
4. Add Prediction (US5) for value-add.
