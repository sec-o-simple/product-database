package database

import (
	"log/slog"

	"gorm.io/gorm"
)

func AutoMigrate(db *gorm.DB, models ...interface{}) {
	if err := db.AutoMigrate(models...); err != nil {
		slog.Error("database migration failed", "err", err)
		panic(err)
	}
	slog.Info("database schema up-to-date")
}
