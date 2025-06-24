APP      := server 
CMD_DIR  := ./cmd/server
BUILD    := ./bin/$(APP)
GO       ?= go

# ---------- phony targets ----------
.PHONY: help dev run test fmt lint build clean tools

help:
	@grep -E '^[a-zA-Z_-]+:.*?##' $(MAKEFILE_LIST) | \
	  awk 'BEGIN {FS = ":.*?##"} {printf "\033[36m%-10s\033[0m %s\n", $$1, $$2}'

dev: tools
	air

run:
	$(GO) run $(CMD_DIR)

test:
	$(GO) test ./... -race

fmt:
	$(GO) fmt ./...

build:
	$(GO) build -o $(BUILD) $(CMD_DIR)

clean:
	rm -rf $(BUILD)

tools:      ## Install air & golangci-lint if missing
	@command -v air >/dev/null 2>&1 || { echo "installing air…"; \
		$(GO) install github.com/air-verse/air@latest ; }
