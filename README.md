# Team Task Management System

A collaborative task management system built with Next.js 14, Express.js, TypeScript, and PostgreSQL.

## 🏗️ Architecture Overview

This project is structured as a **monorepo** with feature-based modules and uses npm workspaces for dependency management.

```
team-task-management-system/
├── apps/
│   ├── web/                    # Next.js 14 frontend (port 3000)
│   └── api/                    # Express.js backend (port 3003)
├── .env.example               # Environment variables template
├── package.json               # Root workspace configuration
└── README.md                  # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ with npm 9+
- PostgreSQL 15+
- Git

### Setup Instructions

1. **Clone and Install Dependencies**
   ```bash
   git clone <repository-url>
   cd team-task-management-system
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials and secrets
   ```

3. **Database Setup**
   ```bash
   # Create PostgreSQL database
   createdb task_management_db

   # Run migrations and seed
   npm run db:migrate
   npm run db:seed
   ```

4. **Start Development Servers**
   ```bash
   # Start both frontend and backend
   npm run dev

   # Or start individually
   npm run dev:api    # Express server on :3003
   npm run dev:web    # Next.js app on :3000
   ```

5. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3003
   - API Health Check: http://localhost:3003/health

## 📚 Tech Stack

### Frontend (`apps/web`)
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Validation**: Zod schemas
- **HTTP Client**: Fetch API with custom wrapper

### Backend (`apps/api`)
- **Framework**: Express.js + TypeScript
- **Database**: PostgreSQL 15+ with Prisma ORM
- **Authentication**: JWT with httpOnly cookies
- **Validation**: Zod schemas
- **Security**: Helmet, CORS, Rate Limiting

## 🗃️ Database Schema

Uses **soft deletion** pattern. Key entities: Users, Projects, Tasks, Comments, Labels, Activity Logs, Notifications.

### Test Accounts (from seed)
```
Admin:    admin@test.com    / password123
Member 1: member1@test.com  / password123
Member 2: member2@test.com  / password123
Viewer:   viewer@test.com   / password123
```

## 🛠️ Available Scripts

```bash
npm run dev          # Start both applications
npm run build        # Build both applications
npm run test         # Run all tests
npm run lint         # Lint all packages
npm run type-check   # TypeScript validation

# Database operations
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed with test data
npm run db:studio    # Open Prisma Studio
npm run db:reset     # Reset database (development only)
```

## 📖 Development Status

✅ **Completed**: Project scaffolding, database schema, basic routing, API proxy
🚧 **Next Steps**: Implement authentication module, then core CRUD features

## 📚 Documentation
- `.ai-dev/ai/AI_RULES.md` - Development rules and constraints
- `.ai-dev/ai/PROJECT_CONTEXT.md` - Project overview and context
- `.ai-dev/docs/ARCHITECTURE.md` - Complete system architecture
