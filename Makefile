.PHONY: help up down build logs test test-backend test-frontend lint health db-backup db-restore clean

help:
	@echo "ResolveIT Enterprise Helpdesk Commands:"
	@echo "  make up             Start all services using Docker Compose"
	@echo "  make down           Stop and tear down containers"
	@echo "  make build          Rebuild container images"
	@echo "  make logs           View live tail logs from containers"
	@echo "  make test           Run all backend and frontend tests"
	@echo "  make test-backend   Run backend JUnit 5 & Testcontainers tests"
	@echo "  make test-frontend  Run frontend Vitest & type checks"
	@echo "  make lint           Run TypeScript and linter checks"
	@echo "  make health         Check Spring Boot Actuator health status"
	@echo "  make db-backup      Create timestamped PostgreSQL backup dump"
	@echo "  make db-restore     Restore database from latest backup"

up:
	docker compose up -d

down:
	docker compose down

build:
	docker compose build

logs:
	docker compose logs -f

test: test-backend test-frontend

test-backend:
	cd backend && ./mvnw clean test verify

test-frontend:
	npm run lint && npm run build

lint:
	npm run lint

health:
	@curl -s http://localhost:8080/actuator/health | grep -q "UP" && echo "Status: HEALTHY (UP)" || echo "Status: DOWN or STARTING"

db-backup:
	@bash scripts/db-backup.sh

db-restore:
	@bash scripts/db-restore.sh

clean:
	docker compose down -v
	rm -rf dist backend/target
