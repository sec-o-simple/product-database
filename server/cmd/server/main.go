package main

import (
	"context"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"product-database-api/internal"
	"product-database-api/internal/database"
	"strings"
	"syscall"

	"github.com/go-fuego/fuego"
	"github.com/joho/godotenv"
)

// corsMiddleware creates a CORS middleware that checks allowed origins
func corsMiddleware(allowedOrigins []string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if len(allowedOrigins) > 0 {
				origin := r.Header.Get("Origin")
				allowedOrigin := ""

				// Check if the request origin is in the allowed origins list
				for _, allowed := range allowedOrigins {
					if origin == allowed || allowed == "*" {
						allowedOrigin = allowed
						break
					}
				}

				if allowedOrigin != "" {
					w.Header().Set("Access-Control-Allow-Origin", allowedOrigin)
					w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
					w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

					if r.Method == http.MethodOptions {
						w.WriteHeader(http.StatusOK)
						return
					}
				}
			}

			next.ServeHTTP(w, r)
		})
	}
}

func main() {
	godotenv.Load()

	db := database.Connect()

	corsOrigin := os.Getenv("CORS_ORIGIN")
	var allowedOrigins []string
	if corsOrigin != "" {
		allowedOrigins = strings.Split(corsOrigin, ",")
		for i, origin := range allowedOrigins {
			allowedOrigins[i] = strings.TrimSpace(origin)
		}
	}

	if len(allowedOrigins) == 0 {
		slog.Warn("CORS_ORIGIN environment variable is not set")
	}

	host := os.Getenv("HOST")
	if host == "" {
		host = "0.0.0.0"
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "9999"
	}

	addr := host + ":" + port

	env := os.Getenv("ENV")
	if env == "" {
		env = "development"
	}

	isProduction := env == "production"

	s := fuego.NewServer(
		fuego.WithAddr(addr),
		fuego.WithEngineOptions(
			fuego.WithOpenAPIConfig(fuego.OpenAPIConfig{
				JSONFilePath:     "../docs/openapi.json",
				PrettyFormatJSON: true,
				Disabled:         isProduction,
				DisableLocalSave: isProduction,
			}),
		),
		fuego.WithGlobalMiddlewares(corsMiddleware(allowedOrigins)),
	)

	database.AutoMigrate(db, internal.Models()...)

	repo := internal.NewRepository(db)
	svc := internal.NewService(repo)

	internal.RegisterRoutes(s, svc)

	go s.Run()
	slog.Info("Server is running", "addr", s.Addr)

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	_ = s.Shutdown(context.Background())
}
