package main

import (
	"encoding/json"
	"log"
	"net/http"
)

// Message is a simple struct for our API response.
type Message struct {
	Vendor string `json:"text"`
}

func vendorsHandler(w http.ResponseWriter, r *http.Request) {
	response := Message{Vendor: "1"}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func main() {
	http.HandleFunc("/api/vendors", vendorsHandler)

	port := "8080"
	log.Printf("Starting Go server on http://localhost:%s\n", port)
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatalf("Server failed: %s", err)
	}
}
