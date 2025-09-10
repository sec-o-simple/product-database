APP      := server 
CMD_DIR  := ./cmd/server
BUILD    := ./bin/$(APP)
GO       ?= go

# ---------- phony targets ----------
.PHONY: help dev run test test-coverage test-verbose fmt lint build clean tools

help:
	@grep -E '^[a-zA-Z_-]+:.*?##' $(MAKEFILE_LIST) | \
	  awk 'BEGIN {FS = ":.*?##"} {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'

dev: tools       ## Start development server with hot reload
	air

run:             ## Run the application
	$(GO) run $(CMD_DIR)

test:            ## Run tests
	$(GO) test ./... -race

test-coverage:   ## Run tests with coverage report
	$(GO) test ./internal -race -coverprofile=coverage.out -covermode=atomic
	$(GO) tool cover -html=coverage.out -o coverage.html
	$(GO) tool cover -func=coverage.out

test-verbose:    ## Run tests with verbose output
	$(GO) test ./... -race -v

fmt:             ## Format code
	$(GO) fmt ./...

lint:            ## Run golangci-lint
	golangci-lint run

build:           ## Build the application
	$(GO) build -o $(BUILD) $(CMD_DIR)

clean:           ## Clean build artifacts
	rm -rf $(BUILD) coverage.out coverage.html

tools:           ## Install air & golangci-lint if missing
	@command -v air >/dev/null 2>&1 || { echo "installing air…"; \
		$(GO) install github.com/air-verse/air@latest ; }
	@command -v golangci-lint >/dev/null 2>&1 || { echo "installing golangci-lint…"; \
		$(GO) install github.com/golangci/golangci-lint/cmd/golangci-lint@latest ; }
