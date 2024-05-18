package server

import (
	"net/http"
	"time"

	"mongodb-budget/handler"

	"github.com/gorilla/mux"
)

type Middleware func(http.Handler) http.HandlerFunc

func chainMiddleware(middlewares ...Middleware) Middleware {
	return func(next http.Handler) http.HandlerFunc {
		for i := 0; i < len(middlewares); i++ {
			next = middlewares[i](next)
		}

		return next.ServeHTTP
	}
}

// chained middleware
var ChainedMiddleware = chainMiddleware(handler.PrintPath, handler.Cors)

func InitServer() *http.Server {
	h := handler.Inithandler()
	mux := mux.NewRouter()
	mux.HandleFunc("/", h.Home())
	mux.HandleFunc("/isLoggedIn", h.IsLoggedIn)
	mux.HandleFunc("/getBudgets", h.GetBudgets())
	mux.HandleFunc("/getExpenses", h.GetExpenses())
	mux.HandleFunc("/signUp", h.SignUp)
	mux.HandleFunc("/signIn", h.SignIn)
	mux.HandleFunc("/logOut", handler.LogOut)
	mux.HandleFunc("/createBudget", h.CreatBudget())
	mux.HandleFunc("/createExpense", h.CreateExpense())
	mux.HandleFunc("/updateBudget", h.UpdateBudget())
	mux.HandleFunc("/updateExpense", h.UpdateExpense())
	mux.HandleFunc("/deleteBudget", h.DeleteBudget())
	mux.HandleFunc("/deleteExpense", h.DeleteExpense())

	return &http.Server{
		Addr:         ":5000",
		Handler:      ChainedMiddleware(mux), // 直接對router套用middleware，讓所有handler都套用
		ReadTimeout:  time.Second * 5,
		WriteTimeout: time.Second * 5,
	}
}
