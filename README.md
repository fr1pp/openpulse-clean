# OpenPulse

A real-time remote patient health monitoring platform built as an honors project.

## Overview

OpenPulse is a dual-interface healthcare system designed for real-time vital sign monitoring. Healthcare professionals can oversee multiple patients through a clinical dashboard, while elderly patients can check their own health status through an accessible, simplified portal.

The platform monitors heart rate, blood pressure, SpO2, and temperature with historical trend analysis and clinical threshold coloring to help identify patient deterioration early.

## Tech Stack

| Layer     | Technologies                                                        |
| --------- | ------------------------------------------------------------------- |
| Frontend  | React 19, Vite 7, TypeScript, TanStack Router, Tailwind CSS v4, shadcn/ui, Recharts |
| Backend   | Express 5, Node.js, Socket.io, Drizzle ORM, SQLite (better-sqlite3) |
| Monorepo  | pnpm workspaces                                                     |

## Features

- **Real-time vital sign monitoring** with Socket.io streaming
- **Healthcare professional dashboard** with patient overview and clinical threshold coloring
- **Patient portal** with elderly-first accessible design (large text, high contrast, simplified navigation)
- **Historical trend charts** with configurable time ranges (6h, 24h, 7d, 30d)
- **Dual authentication system** -- email/password for professionals, 4-character code or QR scan for patients
- **Patient management** with CRUD operations and auto-generated access codes
- **Realistic vital signs simulator** with circadian variation, age-appropriate baselines, and clinical scenarios
- **Dark mode support** across both interfaces

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 10+

### Installation

```bash
pnpm install
```

### Running

```bash
pnpm dev
```

This starts both the client on `localhost:5173` and the server on `localhost:3001`. The database auto-creates and seeds with sample data on first run.

## Project Structure

```
client/    — React frontend (Vite + TanStack Router)
server/    — Express API + Socket.io + simulator engine
shared/    — Shared TypeScript types
```
