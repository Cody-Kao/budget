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

    // Separate context for connecting, so that it will have more time to process instead of timeout
    connectCtx, connectCancel := context.WithTimeout(context.Background(), 10*time.Second)
    defer connectCancel()

    client, err := mongo.Connect(connectCtx, opts)
    if err != nil {
        log.Fatal("Error in Database Connecting:", err)
    }

    // Separate context for pinging
    pingCtx, pingCancel := context.WithTimeout(context.Background(), 2*time.Second)
    defer pingCancel()

    err = client.Ping(pingCtx, nil)
    if err != nil {
        log.Fatal("Error in Database Ping:", err)
    }

    fmt.Println("DB is pinged successfully!")
    return client
}

