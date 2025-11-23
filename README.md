# AgroVision

AgroVision is an AI-powered agricultural platform that provides real-time crop prices, market insights, and price predictions to help farmers and traders make informed decisions.

## Features

- **Real-time Dashboard**: View current market prices for various crops.
- **Price History**: Interactive charts showing price trends over time.
- **AI Predictions**: Machine learning-powered price forecasts.
- **Market Factors**: Analysis of factors affecting crop prices (weather, demand, supply).
- **AI Chatbot**: Intelligent assistant for agricultural queries.
- **News Feed**: Latest agricultural news and updates.

## Tech Stack

- **Frontend**: React, Tailwind CSS, Recharts, Lucide React
- **Backend**: Node.js, Express
- **Database**: Supabase (PostgreSQL)
- **AI**: OpenAI / GitHub Models (for Chatbot)

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Supabase account
- OpenAI API Key or GitHub Token (optional, for chatbot)
- NewsAPI Key (optional, for news)

## Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/AgroVision.git
   cd AgroVision
   ```

2. **Install dependencies**

   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Environment Configuration**

   Create `.env` in `backend/`:

   ```env
   PORT=5000
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_anon_key
   OPENAI_API_KEY=your_openai_or_github_token
   NEWS_API_KEY=your_news_api_key
   ```

   Create `.env` in `frontend/`:

   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   ```

4. **Database Setup**

   - Create a new project in Supabase.
   - Run the SQL scripts in `backend/src/db/schema.sql` and `backend/src/db/seeds.sql` in the Supabase SQL Editor.

5. **Run the Application**

   Start the backend server:

   ```bash
   cd backend
   npm start
   ```

   Start the frontend development server:

   ```bash
   cd frontend
   npm start
   ```

   Access the application at `http://localhost:3000`.

## License

MIT
