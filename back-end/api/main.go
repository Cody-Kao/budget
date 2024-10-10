package main

import (
	"fmt"
	"log"
	"mongodb-budget/server"
)

func main() {
	server := server.InitServer()
	fmt.Println("Server is running on")
	log.Fatal(server.ListenAndServe())
}
