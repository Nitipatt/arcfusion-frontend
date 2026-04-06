# ArcFusion Frontend

This repository contains the frontend application for ArcFusion, an AI-powered Data Analytics Workspace. It is built using modern web technologies to provide a dynamic and responsive user interface for conversational analytics.

## Comprehensive Architecture Overview

The frontend is a single-page application built with Next.js (App Router) and React. It serves as the primary gateway for users to interact with their data, offering dashboards, chat interfaces, and settings management.

### Key Technologies
- **Framework**: Next.js 14 (App Router)
- **State Management**: Zustand
- **Styling**: Tailwind CSS, Shadcn UI, Headless UI (Base UI)
- **Charting**: Apache ECharts (`echarts-for-react`)
- **Icons**: Lucide React
- **Testing**: Jest, React Testing Library

### Component Architecture
1. **App Router (`src/app`)**: Implements pages like `/dashboard`, `/stories`, `/credits`, `/login`, etc.
2. **Components (`src/components`)**: Modular UI components.
    - `charts/`: Wrapper components evaluating dynamic ECharts configurations.
    - `dashboard/`: Views and cards for the main interface.
    - `thread/`: Conversational nodes mapping AI answers.
    - `ui/`: Core reusable components based on Shadcn UI.
3. **State Management (`src/store`)**: Zustand stores handling contexts like user session (`authStore.ts`), confirmations (`confirmStore.ts`), and global settings.
4. **Hooks (`src/hooks`)**: Custom React hooks handling business logic (e.g., `useBookmarks`, `useConfirm`).
5. **API Layer (`src/lib`)**: Centralized HTTP fetch clients communicating with the primary Backend API.

### Data Flow & Implementation Strategy
- **Authentication Flow**: The frontend verifies active user sessions directly via proxying calls to the Backend API. Token logic is handled efficiently within API interceptors.
- **Real-Time Data Visualizations**: The application queries the backend for analytics insights, which retrieves the result JSON. The `echarts` configuration wrappers take the raw data and dynamically render various chart forms based on the data schema.
- **Server vs Client Components**: Adheres strictly to Next.js 14 paradigms, executing search parameters and heavy lifting inside Server Components wherever possible, while relying on Client Components (`"use client"`) for interactivity (hover states, charts, state management).

## How to Run It

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Local Development Setup
1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Variables**:
   Copy the example environment file or create `.env.local` to configure the API URL:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000/api
   ```

3. **Run the Development Server**:
   ```bash
   npm run dev
   ```
   The application will be accessible at `http://localhost:3000`.

4. **Build for Production**:
   ```bash
   npm run build
   npm run start
   ```
