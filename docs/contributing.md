# Contributing to Zeal

Welcome. Zeal is a learning-first open source project. The goal is clean, readable code that teaches — not just code that works.

---

## Before You Start

1. Read [`ARCHITECTURE.md`](./ARCHITECTURE.md) — understand how the services connect
2. Read [`CONVENTIONS.md`](./CONVENTIONS.md) — JSDoc rules, file naming, controller pattern
3. Read the doc for the area you're working in: [`AUTH.md`](./AUTH.md) or [`DATABASE.md`](./DATABASE.md)

PRs that skip the conventions will be asked to revise before merge.

---

## Getting the Project Running

### Prerequisites
- Docker + Docker Compose
- Node.js 20+ (for local tooling only — the app runs in Docker)

### Setup


# 1. Clone the repo
```
git clone https://github.com/your-username/zeal.git
```
# 2. Copy environment variables
```
cp .env.example .env
```
# 3. Start all services
```
docker compose up --build
```
# 4. Run migrations
docker compose exec node npm run migrate
```
The app is now running at `http://localhost`.
```
# Branch Naming

**[type]/[issue-number]-[short-description]**



When in doubt about where something goes — check [`ARCHITECTURE.md`](./ARCHITECTURE.md).
