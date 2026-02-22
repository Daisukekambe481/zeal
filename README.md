# Zeal

A self-hosted productivity app built for developers who want to stay in flow state.

![Tech Stack](https://img.shields.io/badge/Node.js-20-green) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue) ![Docker](https://img.shields.io/badge/Docker-Compose-blue) ![Vanilla JS](https://img.shields.io/badge/Frontend-Vanilla%20JS-yellow)

---

## What is Zeal?

Zeal brings your tasks, timer, calendar, and resources into one clean dashboard — no subscriptions, no tracking, no bloat. You run it on your own machine. Your data stays yours.

It's built with a Node.js backend, PostgreSQL database, and a zero-dependency Vanilla JS frontend. One command gets it running.

---

## What can you do with it?

- Organize work into **projects** and track them from a single dashboard
- Move tasks through a **kanban board** — Todo, Doing, Done
- Run a **Pomodoro timer** linked to a project and see how much time you've spent
- Schedule **calendar events** per project
- Attach **resources** (links, files) to projects in organized folders
- Everything behind a **secure login** — your data, your instance

---

## Requirements

- [Docker](https://www.docker.com/) + Docker Compose
- That's it

---

## Run it locally

```bash
# 1. Clone
git clone https://github.com/Daisukekambe481/zeal.git
cd zeal

# 2. Set up environment
cp .env.example .env
# Open .env and fill in your values — instructions are inside the file

# 3. Start
docker compose up --build

# 4. First time only — set up the database
docker compose exec node npm run migrate
```

Open `http://localhost` in your browser. Register an account and start using it.

---

## Built with

| | |
|--|--|
| Backend | Node.js + Express |
| Database | PostgreSQL + Drizzle ORM |
| Frontend | Vanilla JS |
| Auth | JWT + bcrypt |
| Infrastructure | Docker + Nginx |

---

## Status

🚧 Currently in development — not ready for production use yet.
Follow the [project board](../../projects) to track progress.

---

## License

[MIT](./LICENSE) — free to use, modify, and self-host.