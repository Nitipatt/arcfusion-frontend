# ArcFusion Frontend - Agent Notes

This document provides specialized guidelines and context for continuous development within the ArcFusion frontend architecture.

## Project Structure
- Application is built on Next.js App Router (`src/app`). Avoid using the old `pages/` directory pattern.
- Component styling uses Tailwind CSS classes with utility mergers like `clsx` and `tailwind-merge`.
- State sync between server and client typically relies on Next.js fetch cache and Zustand for client-side transient state.

## Core Services
- The frontend does not talk to external databases directly. It communicates exclusively with the ArcFusion Backend API defined by `NEXT_PUBLIC_API_URL`.
- Echarts expects a robust configuration object from the backend/langgraph. Dynamic rendering relies heavily on `src/components/charts/DynamicChart.tsx`.

## Coding Guidelines
- Ensure responsive design breakpoints (Tailwind `sm:`, `md:`, `lg:`) are applied thoroughly.
- Follow strict typing for props and API responses to maximize TypeScript advantages.
- Prioritize reusable Shadcn-based components found in `src/components/ui/` before building custom ones.
