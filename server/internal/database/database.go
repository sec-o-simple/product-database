package database

import (
	"os"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func Connect() *gorm.DB {
	dbPath := os.Getenv("DATABASE_PATH")

	if dbPath == "" {
		panic("DATABASE_PATH environment variable is not set")
	}

	db, err := gorm.Open(sqlite.Open(dbPath), &gorm.Config{})
	if err != nil {
		panic("failed to connect database: " + err.Error())
	}

	return db
}
