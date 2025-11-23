# Quickstart: AgroVision Core Platform

**Feature**: Core Platform (001)

## Prerequisites

- Node.js v18+
- npm or yarn
- Git
- Supabase account
- API Keys:
  - `SUPABASE_URL` & `SUPABASE_ANON_KEY`
  - `ANTHROPIC_API_KEY` (for Chatbot)
  - `NEWS_API_KEY` (for News)
  - `OPENWEATHER_API_KEY` (for Factors)

## Setup

1.  **Clone the repository**

    ```bash
    git clone https://github.com/reyyanxjanbaz/AgroVision.git
    cd AgroVision
    ```

2.  **Install Dependencies**

    ```bash
    # Backend
    cd backend
    npm install

    # Frontend
    cd ../frontend
    npm install
    ```

3.  **Environment Configuration**
    Create `.env` in `backend/`:

    ```env
    PORT=3001
    SUPABASE_URL=your_supabase_url
    SUPABASE_KEY=your_supabase_service_role_key
    ANTHROPIC_API_KEY=your_key
    NEWS_API_KEY=your_key
    OPENWEATHER_API_KEY=your_key
    ```

    Create `.env` in `frontend/`:

    ```env
    REACT_APP_API_URL=http://localhost:3001/api
    ```

4.  **Database Setup**

    - Create a new Supabase project.
    - Run the migration scripts in `database/migrations/` via Supabase SQL Editor.
    - Run the seed script:
      ```bash
      cd backend
      npm run seed
      ```

5.  **Run Development Servers**

    ```bash
    # Terminal 1: Backend
    cd backend
    npm run dev

    # Terminal 2: Frontend
    cd frontend
    npm start
    ```

## Verification

- Frontend should be running at `http://localhost:3000`
- Backend API should be accessible at `http://localhost:3001/api/crops`
