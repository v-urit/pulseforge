.PHONY: help dev dev-backend dev-frontend build test lint migrate docker-up docker-down

help:
	@echo "PulseForge Engineering Tooling"
	@echo "  make dev           - Run full stack in local dev mode"
	@echo "  make dev-backend   - Run Go API server"
	@echo "  make dev-frontend  - Run Next.js frontend"
	@echo "  make build         - Build Go binaries and Next.js assets"
	@echo "  make test          - Run backend and frontend test suites"
	@echo "  make lint          - Run golangci-lint and eslint"
	@echo "  make docker-up     - Start all docker containers with healthchecks"
	@echo "  make docker-down   - Stop and tear down docker containers"
	@echo "  make migrate       - Run TimescaleDB / PostgreSQL migrations"

dev:
	@echo "Starting PulseForge services via docker compose..."
	docker compose up -d postgres redis
	@echo "Ready for local backend & frontend development."

dev-backend:
	cd backend && go run ./cmd/api

dev-worker:
	cd backend && go run ./cmd/worker

dev-frontend:
	cd frontend && pnpm dev

build:
	cd backend && go build ./...
	cd frontend && pnpm build

test:
	cd backend && go test -v ./...
	cd frontend && pnpm test --passWithNoTests

lint:
	cd backend && golangci-lint run
	cd frontend && pnpm lint

docker-up:
	docker compose up -d --build

docker-down:
	docker compose down -v

migrate:
	@echo "Running database migrations (Milestone 1)..."
