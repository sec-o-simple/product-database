package main

import (
	"context"
	"log/slog"
	"os"
	"os/signal"
	"product-database-api/internal/database"
	"product-database-api/internal/product"
	"syscall"

	"github.com/go-fuego/fuego"
)

func main() {
	db := database.Connect()
	s := fuego.NewServer()

	database.AutoMigrate(db, product.Models()...)

	prodRepo := product.NewRepository(db)
	prodSvc := product.NewService(prodRepo)

	product.RegisterRoutes(s, prodSvc)

	go s.Run()
	slog.Info("Server is running", "addr", s.Addr)

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	_ = s.Shutdown(context.Background())
}
