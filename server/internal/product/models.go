package product

import "gorm.io/gorm"

type Product struct {
	gorm.Model
	Name string
}

func Models() []interface{} {
	return []interface{}{
		&Product{},
	}
}
