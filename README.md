# CRM System

## Prerequisites
- Docker & Docker Compose
- Node.js 20+

## Setup

1. **Start Infrastructure**
   ```bash
   docker-compose up -d
   ```

2. **Backend Setup**
   ```bash
   cd server
   npm install
   npx prisma generate
   npx prisma migrate dev --name init
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd client
   npm install
   npm run dev
   ```

## Architecture
- **Frontend**: React, Tailwind, Vite
- **Backend**: Express, Prisma, PostgreSQL
