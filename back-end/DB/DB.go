package DB

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

//const uri string = "mongodb://localhost:27017" // this is for testing; os.Getenv("mongoDB_uri") is for production

func InitDB() *mongo.Client {
	serverAPI := options.ServerAPI(options.ServerAPIVersion1) // default stable API
	opts := options.Client().ApplyURI(os.Getenv("mongoDB_uri")).SetServerAPIOptions(serverAPI)

	ctx, cancel := context.WithTimeout(context.Background(), 1*time.Second)
	client, err := mongo.Connect(ctx, opts)
	if err != nil {
		log.Fatal("Error in Database Connecting:", err)
	}

	defer cancel()

	err = client.Ping(ctx, nil)
	if err != nil {
		log.Fatal("Error in Database Ping:", err)
	}

	fmt.Println("DB is pinged successfully!")

	return client
}
