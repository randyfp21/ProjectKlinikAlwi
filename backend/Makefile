.PHONY: run build test migrate docker-up docker-down

run:
	@echo "Starting Klinik Alwi HMS Backend..."
	go run cmd/api/main.go

build:
	@echo "Building binary..."
	go build -o bin/klinik_alwi_api cmd/api/main.go

test:
	@echo "Running tests..."
	go test -v ./...

docker-up:
	docker-compose up -d --build

docker-down:
	docker-compose down
