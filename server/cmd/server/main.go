package main

import (
	"context"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"product-database-api/internal"
	"product-database-api/internal/database"
	"syscall"

	"github.com/go-fuego/fuego"
	"github.com/joho/godotenv"
)

func main() {
	godotenv.Load()

	db := database.Connect()

	corsOrigin := os.Getenv("CORS_ORIGIN")

	if corsOrigin == "" {
		slog.Warn("CORS_ORIGIN environment variable is not set")
	}

	s := fuego.NewServer(
		fuego.WithEngineOptions(
			fuego.WithOpenAPIConfig(fuego.OpenAPIConfig{
				JSONFilePath:     "../docs/openapi.json",
				PrettyFormatJSON: true,
			}),
		),
		fuego.WithGlobalMiddlewares(func(next http.Handler) http.Handler {
			return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				// if options then return ok
				if corsOrigin != "" {
					w.Header().Set("Access-Control-Allow-Origin", corsOrigin)
					w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
					w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

					if r.Method == http.MethodOptions {
						w.WriteHeader(http.StatusOK)
						return
					}
				}

				next.ServeHTTP(w, r)
			})
		}),
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
