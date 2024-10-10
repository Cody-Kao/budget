package main

import (
	"mongodb-budget/server"
	"net/http"
)

func handler(w http.ResponseWriter, r *http.Request) {
	// Initialize the server (which contains all your routes)
	server := server.InitServer()

	// Serve the HTTP request using your server's handler
	server.Handler.ServeHTTP(w, r)
}

func main() {
	http.HandleFunc("/", handler)
}
