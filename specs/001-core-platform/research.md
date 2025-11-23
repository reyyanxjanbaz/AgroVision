# Research & Decisions: AgroVision Core Platform

**Feature**: Core Platform (001)
**Date**: 2025-11-23

## 1. Price Prediction Algorithm

**Decision**: Implement a weighted linear regression model with seasonal adjustments.
**Rationale**: The user requested a "simple algorithm" initially. A pure linear regression might miss seasonal trends which are critical in agriculture.
**Implementation**:

- Base trend: Linear regression on last 30 days.
- Seasonal factor: Historical average for the current month (if available).
- Weather factor: Simple multiplier based on current weather condition (e.g., Rain = +2% for some crops, -2% for others).
  **Alternatives Considered**:
- _Machine Learning Model (TensorFlow.js)_: Too complex for MVP/Phase 1.
- _External Prediction API_: Costly and adds dependency.

## 2. Chatbot Context Awareness

**Decision**: Client-side context injection.
**Rationale**: The chatbot needs to know what the user is looking at to answer "Summarize this page".
**Implementation**:

- Frontend constructs a `context` object: `{ page: "CropDetail", crop: "Wheat", price: 240, factors: [...] }`.
- This object is sent as a system prompt or initial context message to the `/api/chatbot` endpoint.
- Backend appends this to the Claude API call.
  **Alternatives Considered**:
- _Backend Session State_: Harder to manage with REST API.
- _RAG (Retrieval Augmented Generation)_: Overkill for summarizing the _current_ page view.

## 3. Data Seeding Strategy

**Decision**: Custom Node.js seed script.
**Rationale**: Need to transform raw USDA CSV data into our Supabase schema structure.
**Implementation**:

- Place CSVs in `database/seeds/data/`.
- Script `database/seeds/seed.js` reads CSVs using `csv-parser`.
- Maps columns to `crops` and `price_history` tables.
- Uses Supabase client to batch insert.
  **Alternatives Considered**:
- _Manual Entry_: Too slow for price history.
- _SQL Import_: CSV structure might not match table structure exactly.

## 4. Charting Library

**Decision**: Recharts.
**Rationale**: Built for React, composable, supports responsive containers, and easy to customize for the "stock market" look requested.
**Alternatives Considered**:

- _Chart.js_: Good, but less "React-native" feel.
- _D3.js_: Too low-level, slower development.

## 5. State Management

**Decision**: React Context + Hooks.
**Rationale**: App scale (3 roles, ~8 crops) doesn't justify Redux.
**Implementation**:

- `AuthContext`: User role.
- `MarketContext`: Global market data/banner.
- `useCropData`: Hook for fetching crop details.
