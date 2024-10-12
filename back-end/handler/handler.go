package handler

import (
	"encoding/json"
	"fmt"
	"mongodb-budget/DB"
	"net/http"
	"os"
	"strings"

	"github.com/gorilla/sessions"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"

	"mongodb-budget/Utils"
)

// var Store *sessions.CookieStore = sessions.NewCookieStore(securecookie.GenerateRandomKey(32), securecookie.GenerateRandomKey(32))
var Store *sessions.CookieStore = sessions.NewCookieStore([]byte("is-my-secret-key"), []byte("is-my-secret-key"))

type handlerWithDB struct {
	DB    *mongo.Client
	UColl *mongo.Collection // 儲存collection，這樣就不用每次都重找一次 users
	BColl *mongo.Collection // budgets collection
	EColl *mongo.Collection // expenses collection
}

type isLoggedInResponse struct {
	IsLoggedIn bool `json:"isLoggedIn"`
	UserName string `json:"userName"`
}

type signUpResponse struct {
	Type   bool   `json:"type"`
	Target string `json:"target"`
	Msg    string `json:"msg"`
}

type signInResponse struct {
	Type   bool   `json:"type"`
	Target string `json:"target"`
	Name string `json:"name"`
	Msg    string `json:"msg"`
}

// 這是給budget/expense CRUD統一用來回報錯誤或提示成功的
type CRUDResponse struct {
	LogIn bool   `json:"logIn"`
	Msg   string `json:"msg"`
}

// this is for sign up, creating a new user and save it to the db
type UserObject struct {
	Name     string `json:"name"`
	Account  string `json:"account"`
	Password string `json:"password"`
}

// this is for the sign in
type SignInObject struct {
	Account  string `json:"account"`
	Password string `json:"password"`
	Check    bool   `json:"check"`
}

type BudgetObject struct {
	ID     string `json:"id"`
	Name   string `json:"name"`
	Max    int    `json:"max"`
	UserID string `json:"userID"`
}

type ExpenseObject struct {
	ID          string `json:"id"`
	BudgetID    string `json:"budgetID"`
	Description string `json:"description"`
	Amount      int    `json:"amount"`
	Date        int    `json:"date"` // 單位是秒 所以是int
	UserID      string `json:"userID"`
}

type UpdateBudgetObject struct {
	BudgetID string
	Name     string
	Max      int
}

type UpdateExpenseObject struct {
	NewBudgetID string
	ID          string
	Description string
	Amount      int
}

type DeleteBudgetObject struct {
	BudgetID string
}

type DeleteExpenseObject struct {
	ExpenseID string
}

// middleware for Cors issue
func Cors(next http.Handler) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", os.Getenv("budget-manager-front-end-url"))
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		// 如果要讓fetch request去挾帶cookie就要設定這個
		w.Header().Set("Access-Control-Allow-Credentials", "true")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	}
}

// middleware to print out path name
func PrintPath(next http.Handler) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		fmt.Printf("enter path: %s\n", r.URL.Path)

		next.ServeHTTP(w, r)
	}
}

func Inithandler() handlerWithDB {
	DB := DB.InitDB()

	h := handlerWithDB{DB: DB}
	h.UColl = DB.Database("budget-typescript").Collection("users")
	h.BColl = DB.Database("budget-typescript").Collection("budgets")
	h.EColl = DB.Database("budget-typescript").Collection("expenses")

	return h
}

// just a testing endpoint
func (h *handlerWithDB) Home() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		session, err := Store.Get(r, "SID")
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		fmt.Println("is session new?", session.IsNew)
		if !session.IsNew {
			fmt.Println(session.Values)
		}
		session.Values["password"] = "123"
		session.Save(r, w)
		json.NewEncoder(w).Encode("Hello World")
	}
}

// 因為沒用到db，所以不用變成h的member function
func LogOut(w http.ResponseWriter, r *http.Request) {
	session, err := Store.Get(r, "SID")
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// 有可能直接在未登入或是沒有"記住我"的情況送request進來，所以直接return
	if session.IsNew {
		return
	}

	// Clear session data
	session.Values = nil

	// Set MaxAge to -1 to expire session immediately
	session.Options.MaxAge = -1

	// Save session to update client's cookie
	err = session.Save(r, w)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	fmt.Println("Log Out")
}

func checkSessionExpiredOrNotExist(r *http.Request) (string, error) {
	session, err := Store.Get(r, "SID")
	if err != nil {
		fmt.Println("session decode error in checkSessionExpiredOrNotExist", err.Error())
		return "", err
	}
	fmt.Println("session.Values:", session.Values)
	fmt.Println("check session checkSessionExpiredOrNotExist", session.IsNew)
	if session.Values["account"] == nil {
		return "", nil
	}
	return session.Values["account"].(string), nil
}

func (h *handlerWithDB) IsLoggedIn(w http.ResponseWriter, r *http.Request) {
	userAccount, err := checkSessionExpiredOrNotExist(r)
	fmt.Println("userAccount:", userAccount)
	if err != nil {
		fmt.Println("error ouccrs in isLoggedIn", err.Error())
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	w.Header().Set("Cotent-Type", "application/json")
	response := isLoggedInResponse{}
	if userAccount != "" {
		res := h.UColl.FindOne(r.Context(), bson.M{"account": userAccount})
		if res.Err() != nil {
			// 如果是除了ErrNoDocuments的其他錯誤就直接報錯
			if res.Err() != mongo.ErrNoDocuments {
				http.Error(w, res.Err().Error(), http.StatusInternalServerError)
				fmt.Println("database findOne error", res.Err().Error())
				return
			} else {
				// 報ErrNoDocuments代表查無此帳號
				json.NewEncoder(w).Encode(&response)
				return
			}
		}
		// decode user from db
		var user UserObject
		err = res.Decode(&user)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			fmt.Println("database decode error", err.Error())
			return
		}
		response = isLoggedInResponse{IsLoggedIn: true, UserName: user.Name}
	} 
	fmt.Println("response from IsLoggedIn:", response)
	json.NewEncoder(w).Encode(&response)
}

func (h *handlerWithDB) SignUp(w http.ResponseWriter, r *http.Request) {

	fmt.Println("call SignUp")
	var data UserObject
	err := json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		fmt.Println("decode error", err)
		return
	}

	fmt.Println("data received", data)
	w.Header().Set("Content-Type", "application/json")
	// 預設出錯 成功的話再改就好
	var response signUpResponse = signUpResponse{Type: false}

	// 檢查註冊資料是否有誤
	// 名稱為空白
	if data.Name == "" {
		response.Target = "name"
		response.Msg = "名稱不得為空"
		json.NewEncoder(w).Encode(&response)
		return
	}
	// 名稱超過10個字
	if len([]rune(data.Name)) > 10 {
		response.Target = "name"
		response.Msg = "名稱不得多於10個字"
		json.NewEncoder(w).Encode(&response)
		return
	}
	fmt.Println("name is valid")

	// 帳號為空白
	if data.Account == "" {
		response.Target = "account"
		response.Msg = "帳號不得為空"
		json.NewEncoder(w).Encode(&response)
		return
	}
	// 帳號重複
	res := h.UColl.FindOne(r.Context(), bson.M{"account": data.Account})
	if res.Err() != nil {
		// 如果是除了ErrNoDocuments的其他錯誤就直接報錯
		if res.Err() != mongo.ErrNoDocuments {
			http.Error(w, res.Err().Error(), http.StatusInternalServerError)
			fmt.Println("database findOne error", res.Err().Error())
			return
		}
	} else {
		// 沒報錯就代表有找到，也就是帳號重複了
		response.Target = "account"
		response.Msg = "帳號已被取用 請換一個"
		json.NewEncoder(w).Encode(&response)
		return
	}
	fmt.Println("account is valid")

	// 檢查密碼
	if data.Password == "" {
		response.Target = "password"
		response.Msg = "密碼不得為空"
		json.NewEncoder(w).Encode(&response)
		return
	}

	if Utils.ContainsNonEnglishOrNumber(data.Password) {
		response.Target = "password"
		response.Msg = "密碼只能包含英文字母和數字"
		json.NewEncoder(w).Encode(&response)
		return
	}

	if !Utils.ContainsLowerUpperCaseAndNumber(data.Password) {
		response.Target = "password"
		response.Msg = "密碼必須包含至少一個大寫、小寫英文字母和數字"
		json.NewEncoder(w).Encode(&response)
		return
	}
	fmt.Println("password is valid")

	// hash the password
	data.Password, err = Utils.HashPassword(data.Password)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		fmt.Println("hash password error", err)
		return
	}

	//store user into the database
	insertedRow, err := h.UColl.InsertOne(r.Context(), data)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		fmt.Println("insertOne error", err)
		return
	}
	fmt.Println("New User, inserted data id", insertedRow.InsertedID)

	// store a default budget into the database
	// 這裡要跟前端溝通好default budget的名稱跟ID，我都是用"其他"
	insertedRow, err = h.BColl.InsertOne(r.Context(), bson.M{"id": "其他", "name": "其他", "max": 0, "userID": data.Account})
	if err != nil {
		fmt.Println("default budget insertOne error", err)
		return
	}
	fmt.Println("New default budget, inserted data id", insertedRow.InsertedID)

	// set success response
	response.Type = true
	response.Msg = "註冊成功!"

	json.NewEncoder(w).Encode(&response)

}

func (h *handlerWithDB) SignIn(w http.ResponseWriter, r *http.Request) {
	fmt.Println("call SignIn")
	var data SignInObject
	err := json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		fmt.Println("decode error", err)
		return
	}

	fmt.Println("data received", data)
	w.Header().Set("Content-Type", "application/json")
	// 預設出錯 成功的話再改就好
	var response signInResponse = signInResponse{Type: false}

	// 檢查登入資料格式是否有誤

	// 帳號為空白
	if data.Account == "" {
		response.Target = "account"
		response.Msg = "帳號不得為空"
		json.NewEncoder(w).Encode(&response)
		return
	}

	// 檢查該帳號存不存在
	res := h.UColl.FindOne(r.Context(), bson.M{"account": data.Account})
	if res.Err() != nil {
		// 如果是除了ErrNoDocuments的其他錯誤就直接報錯
		if res.Err() != mongo.ErrNoDocuments {
			http.Error(w, res.Err().Error(), http.StatusInternalServerError)
			fmt.Println("database findOne error", res.Err().Error())
			return
		} else {
			// 報ErrNoDocuments代表查無此帳號
			response.Target = "account"
			response.Msg = "查無此帳號 請重新輸入"
			json.NewEncoder(w).Encode(&response)
			return
		}
	}
	fmt.Println("account is valid")

	// 檢查密碼
	if data.Password == "" {
		response.Target = "password"
		response.Msg = "密碼不得為空"
		json.NewEncoder(w).Encode(&response)
		return
	}

	if Utils.ContainsNonEnglishOrNumber(data.Password) {
		response.Target = "password"
		response.Msg = "密碼只能包含英文字母和數字"
		json.NewEncoder(w).Encode(&response)
		return
	}

	if !Utils.ContainsLowerUpperCaseAndNumber(data.Password) {
		response.Target = "password"
		response.Msg = "密碼必須包含至少一個大寫、小寫英文字母和數字"
		json.NewEncoder(w).Encode(&response)
		return
	}
	fmt.Println("password is valid")

	// 檢查該用戶的密碼是否正確 使用上面查找到的res(存在的使用者)
	var user UserObject
	err = res.Decode(&user)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		fmt.Println("database decode error", err.Error())
		return
	}

	if match := Utils.CheckPasswordHash(data.Password, user.Password); !match {
		response.Target = "password"
		response.Msg = "密碼錯誤!"
		json.NewEncoder(w).Encode(&response)
		return
	}

	fmt.Println("密碼輸入正確")

	fmt.Println("user log in", user)

	// 查看有沒有勾選"記住我" 有就發行一個持續30天的session，否則一個一次性的session
	if data.Check {
		fmt.Println("issue a persistent session")
		session, err := Store.Get(r, "SID")
		if err != nil {
			fmt.Println(err.Error(), http.StatusBadRequest)
			return
		}
		fmt.Println("is session new?", session.IsNew)
		session.Values["account"] = data.Account
		// Save session
		if err := session.Save(r, w); err != nil {
			fmt.Println("Error saving session:", err.Error())
		}
	} else {
		fmt.Println("issue a one-time session")
		session, err := Store.Get(r, "SID")
		if err != nil {
			fmt.Println(err.Error(), http.StatusBadRequest)
			return
		}
		fmt.Println("is session new?", session.IsNew)
		session.Values["account"] = data.Account
		session.Options.MaxAge = 0 // 0 means last until browser session ends
		// Save session
		if err := session.Save(r, w); err != nil {
			fmt.Println("Error saving session:", err.Error())
		}
	}

	fmt.Println("登入成功")

	// set success response
	response.Type = true
	response.Msg = "登入成功!"
	response.Name = user.Name

	// Encode response to JSON and write to response body
	if err := json.NewEncoder(w).Encode(&response); err != nil {
		fmt.Println("Error encoding JSON:", err.Error())
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}
}

func (h *handlerWithDB) GetBudgets() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		session, err := Store.Get(r, "SID")
		if err != nil {
			fmt.Println("GetBudgets decode session error", err.Error())
			http.Error(w, "Decode session error", http.StatusInternalServerError)
		}

		account := session.Values["account"]
		fmt.Println("userID", account)
		cursor, err := h.BColl.Find(r.Context(), bson.M{"userID": account})
		if err != nil {
			fmt.Println("GetBudgets DB query error", err.Error())
			http.Error(w, "DB query error", http.StatusInternalServerError)
		}

		var data []BudgetObject
		err = cursor.All(r.Context(), &data)
		if err != nil {
			fmt.Println("GetBudgets cursor iterate and decode error", err.Error())
			http.Error(w, "cursor iterate and decode error", http.StatusInternalServerError)
		}
		fmt.Println("cursor", cursor, "data", data)
		w.Header().Set("Content-Type", "application/json")
		err = json.NewEncoder(w).Encode(&data)
		if err != nil {
			fmt.Println("GetBudgets json encoding error", err.Error())
			http.Error(w, "json encoding error", http.StatusInternalServerError)
		}
	}
}

func (h *handlerWithDB) GetExpenses() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		session, err := Store.Get(r, "SID")
		if err != nil {
			fmt.Println("GetExpenses decode session error", err.Error())
			http.Error(w, "Decode session error", http.StatusInternalServerError)
		}

		account := session.Values["account"]
		fmt.Println("userID", account)
		cursor, err := h.EColl.Find(r.Context(), bson.M{"userID": account})
		if err != nil {
			fmt.Println("GetExpenses DB query error", err.Error())
			http.Error(w, "DB query error", http.StatusInternalServerError)
		}

		var data []ExpenseObject
		err = cursor.All(r.Context(), &data)
		if err != nil {
			fmt.Println("GetExpenses cursor iterate and decode error", err.Error())
			http.Error(w, "cursor iterate and decode error", http.StatusInternalServerError)
		}

		w.Header().Set("Content-Type", "application/json")
		err = json.NewEncoder(w).Encode(&data)
		if err != nil {
			fmt.Println("GetExpenses json encoding error", err.Error())
			http.Error(w, "json encoding error", http.StatusInternalServerError)
		}
	}
}

func (h *handlerWithDB) CreatBudget() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")

		var response CRUDResponse
		SID, err := checkSessionExpiredOrNotExist(r)
		if err != nil {
			fmt.Println("憑證錯誤 請重新登入")
			response.Msg = "憑證錯誤 請重新登入"
			json.NewEncoder(w).Encode(&response)
			return
		}
		if SID == "" {
			// 通知front-end去log out並提醒使用者要重新登入
			fmt.Println("憑證錯誤 請重新登入")
			response.Msg = "憑證錯誤 請重新登入"
			json.NewEncoder(w).Encode(&response)
			return
		}

		var data BudgetObject
		if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
			fmt.Println("JSON資料型態轉換錯誤")
			http.Error(w, "JSON資料型態轉換錯誤", http.StatusBadRequest)
			return
		}

		// Print received data (for demonstration purposes)
		fmt.Printf("Received data: %+v\n", data)

		// 判斷資料正確性
		response.LogIn = true
		if strings.TrimSpace(data.ID) == "" {
			fmt.Println("預算ID不得為空")
			http.Error(w, "預算ID不得為空", http.StatusBadRequest)
			return
		}

		if strings.TrimSpace(data.Name) == "" {
			fmt.Println("名稱不得為空")
			http.Error(w, "名稱不得為空", http.StatusBadRequest)
			return
		}

		if len([]rune(strings.TrimSpace(data.Name))) > 12 {
			fmt.Println("名稱不得超過12個字元")
			http.Error(w, "名稱不得超過12個字元", http.StatusBadRequest)
			return
		}

		if data.Max < 0 {
			fmt.Println("上限額度必須為正整數")
			http.Error(w, "上限額度必須為正整數", http.StatusBadRequest)
			return
		}

		session, err := Store.Get(r, "SID")
		if err != nil {
			fmt.Println("憑證錯誤 請重新登入", err)
			response.LogIn = false
			json.NewEncoder(w).Encode(&response)
			return
		}

		res, err := h.BColl.InsertOne(r.Context(), bson.M{"id": data.ID, "name": data.Name, "max": data.Max, "userID": session.Values["account"]})
		if err != nil {
			fmt.Println("資料寫入錯誤 請稍後再試", err)
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		// 最後要記得送出成功的提示，因為前端會做response.json
		response.Msg = "成功新增預算"
		json.NewEncoder(w).Encode(&response)
		fmt.Println("data created successfully, id:", res.InsertedID)
	}
}

func (h *handlerWithDB) CreateExpense() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		var response CRUDResponse
		SID, err := checkSessionExpiredOrNotExist(r)
		if err != nil {
			// 通知front-end去log out並提醒使用者要重新登入
			fmt.Println("憑證錯誤 請重新登入")
			response.Msg = "憑證錯誤 請重新登入"
			json.NewEncoder(w).Encode(&response)
			return
		}
		if SID == "" {
			// 通知front-end去log out並提醒使用者要重新登入
			fmt.Println("憑證錯誤 請重新登入")
			response.Msg = "憑證錯誤 請重新登入"
			json.NewEncoder(w).Encode(&response)
			return
		}

		var data ExpenseObject
		if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
			fmt.Println("JSON資料型態轉換錯誤")
			http.Error(w, "JSON資料型態轉換錯誤", http.StatusBadRequest)
			return
		}

		// Print received data (for demonstration purposes)
		fmt.Printf("Received data: %+v\n", data)

		// 檢查data有沒有違規
		response.LogIn = true

		if strings.TrimSpace(data.ID) == "" {
			fmt.Println("花費ID不得為空")
			http.Error(w, "花費ID不得為空", http.StatusBadRequest)
			return
		}

		if strings.TrimSpace(data.BudgetID) == "" {
			fmt.Println("預算分類不得為空")
			http.Error(w, "預算分類不得為空", http.StatusBadRequest)
			return
		}

		if strings.TrimSpace(data.Description) == "" {
			fmt.Println("預算描述不得為空")
			http.Error(w, "預算描述不得為空", http.StatusBadRequest)
			return
		}

		if data.Amount < 0 {
			fmt.Println("預算金額必須為正整數")
			http.Error(w, "預算金額必須為正整數", http.StatusBadRequest)
			return
		}

		session, err := Store.Get(r, "SID")

		if err != nil {
			fmt.Println("憑證錯誤 請重新登入", err)
			response.LogIn = false
			json.NewEncoder(w).Encode(&response)
			return
		}

		res, err := h.EColl.InsertOne(r.Context(), bson.M{"id": data.ID, "budgetID": data.BudgetID,
			"description": data.Description, "amount": data.Amount, "date": data.Date, "userID": session.Values["account"]})
		if err != nil {
			fmt.Println("資料寫入錯誤 請稍後再試", err)
			http.Error(w, "資料寫入錯誤 請稍後再試", http.StatusBadRequest)
			return
		}

		response.Msg = "成功新增花費"
		json.NewEncoder(w).Encode(&response)
		fmt.Println("data created successfully, id:", res.InsertedID)
	}
}

func (h *handlerWithDB) UpdateBudget() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		var response CRUDResponse
		SID, err := checkSessionExpiredOrNotExist(r)
		if err != nil {
			// 通知front-end去log out並提醒使用者要重新登入
			fmt.Println("憑證錯誤 請重新登入")
			response.Msg = "憑證錯誤 請重新登入"
			json.NewEncoder(w).Encode(&response)
			return
		}
		if SID == "" {
			// 通知front-end去log out並提醒使用者要重新登入
			fmt.Println("憑證錯誤 請重新登入")
			response.Msg = "憑證錯誤 請重新登入"
			json.NewEncoder(w).Encode(&response)
			return
		}

		var data UpdateBudgetObject
		if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
			fmt.Println("JSON資料型態轉換錯誤")
			http.Error(w, "JSON資料型態轉換錯誤", http.StatusBadRequest)
			return
		}

		// Print received data (for demonstration purposes)
		fmt.Printf("Received data: %+v\n", data)

		// 檢查data有沒有違規
		response.LogIn = true

		if strings.TrimSpace(data.BudgetID) == "" {
			fmt.Println("預算ID不得為空")
			http.Error(w, "預算ID不得為空", http.StatusBadRequest)
			return
		}

		if len(strings.TrimSpace(data.Name)) > 12 {
			fmt.Println("預算名稱不得超過12個字元")
			http.Error(w, "預算名稱不得超過12個字元", http.StatusBadRequest)
			return
		}

		if strings.TrimSpace(data.Name) == "總計" {
			fmt.Println("預算名稱不得為總計")
			http.Error(w, "預算名稱不得為總計", http.StatusBadRequest)
			return
		}

		var res *mongo.UpdateResult
		if strings.TrimSpace(data.Name) == "" && data.Max == -1 { // 都不更新
			fmt.Println("budget資料不用更新~")
		} else if strings.TrimSpace(data.Name) == "" { // 名稱空白就不更新名稱
			fmt.Println("只更新金額")
			res, err = h.BColl.UpdateOne(r.Context(), bson.M{"userID": SID, "id": data.BudgetID}, bson.M{"$set": bson.M{"max": data.Max}})
		} else if data.Max < 0 { // max金額小於0就不更新金額
			fmt.Println("只更新名稱")
			res, err = h.BColl.UpdateOne(r.Context(), bson.M{"userID": SID, "id": data.BudgetID}, bson.M{"$set": bson.M{"name": data.Name}})
		} else {
			fmt.Println("更新名稱、金額")
			res, err = h.BColl.UpdateOne(r.Context(), bson.M{"userID": SID, "id": data.BudgetID}, bson.M{"$set": bson.M{"name": data.Name, "max": data.Max}})
		}

		if err != nil {
			fmt.Println("資料寫入錯誤 請稍後再試", err)
			http.Error(w, "資料寫入錯誤 請稍後再試", http.StatusBadRequest)
			return
		}

		response.Msg = "成功更新預算"
		json.NewEncoder(w).Encode(&response)

		fmt.Println("更新row數量:", res.ModifiedCount)
	}
}

func (h *handlerWithDB) UpdateExpense() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		var response CRUDResponse
		SID, err := checkSessionExpiredOrNotExist(r)
		if err != nil {
			// 通知front-end去log out並提醒使用者要重新登入
			fmt.Println("憑證錯誤 請重新登入")
			response.Msg = "憑證錯誤 請重新登入"
			json.NewEncoder(w).Encode(&response)
			return
		}
		if SID == "" {
			// 通知front-end去log out並提醒使用者要重新登入
			fmt.Println("憑證錯誤 請重新登入")
			response.Msg = "憑證錯誤 請重新登入"
			json.NewEncoder(w).Encode(&response)
			return
		}

		var data UpdateExpenseObject
		if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
			fmt.Println("JSON資料型態轉換錯誤")
			http.Error(w, "JSON資料型態轉換錯誤", http.StatusBadRequest)
			return
		}

		// Print received data (for demonstration purposes)
		fmt.Printf("Received data: %+v\n", data)

		// 檢查data有沒有違規
		response.LogIn = true

		if strings.TrimSpace(data.NewBudgetID) == "" {
			fmt.Println("新預算ID不得為空")
			http.Error(w, "新預算ID不得為空", http.StatusBadRequest)
			return
		}

		if strings.TrimSpace(data.ID) == "" {
			fmt.Println("預算ID不得為空")
			http.Error(w, "預算ID不得為空", http.StatusBadRequest)
			return
		}

		if strings.TrimSpace(data.Description) == "" {
			fmt.Println("花費描述不得為空")
			http.Error(w, "花費描述不得為空", http.StatusBadRequest)
			return
		}

		if data.Amount <= 0 {
			fmt.Println("花費金額必須為正整數")
			http.Error(w, "花費金額必須為正整數", http.StatusBadRequest)
			return
		}

		var res *mongo.UpdateResult
		res, err = h.EColl.UpdateOne(r.Context(), bson.M{"userID": SID, "id": data.ID}, bson.M{"$set": bson.M{"budgetID": data.NewBudgetID, "description": data.Description, "amount": data.Amount}})

		if err != nil {
			fmt.Println("資料寫入錯誤 請稍後再試", err)
			http.Error(w, "資料寫入錯誤 請稍後再試", http.StatusBadRequest)
			return
		}

		response.Msg = "成功更新花費"
		json.NewEncoder(w).Encode(&response)

		fmt.Println("更新row數量:", res.ModifiedCount)
	}
}

func (h *handlerWithDB) DeleteBudget() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		var response CRUDResponse
		SID, err := checkSessionExpiredOrNotExist(r)
		if err != nil {
			// 通知front-end去log out並提醒使用者要重新登入
			fmt.Println("憑證錯誤 請重新登入")
			response.Msg = "憑證錯誤 請重新登入"
			json.NewEncoder(w).Encode(&response)
			return
		}
		if SID == "" {
			// 通知front-end去log out並提醒使用者要重新登入
			fmt.Println("憑證錯誤 請重新登入")
			response.Msg = "憑證錯誤 請重新登入"
			json.NewEncoder(w).Encode(&response)
			return
		}

		var data DeleteBudgetObject
		if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
			fmt.Println("JSON資料型態轉換錯誤")
			http.Error(w, "JSON資料型態轉換錯誤", http.StatusBadRequest)
			return
		}

		// Print received data (for demonstration purposes)
		fmt.Printf("Received data: %+v\n", data)

		// 檢查data有沒有違規
		response.LogIn = true

		if strings.TrimSpace(data.BudgetID) == "" {
			fmt.Println("預算ID不得為空")
			http.Error(w, "預算ID不得為空", http.StatusBadRequest)
			return
		}

		// 先移除所有相關花費
		var res *mongo.DeleteResult
		res, err = h.EColl.DeleteMany(r.Context(), bson.M{"userID": SID, "budgetID": data.BudgetID})
		if err != nil {
			fmt.Println("資料寫入錯誤 請稍後再試", err)
			http.Error(w, "資料寫入錯誤 請稍後再試", http.StatusBadRequest)
			return
		}
		fmt.Println("deleted expenses number:", res.DeletedCount)

		// 再移除該筆預算
		res, err = h.BColl.DeleteOne(r.Context(), bson.M{"userID": SID, "id": data.BudgetID})
		if err != nil {
			fmt.Println("資料寫入錯誤 請稍後再試", err)
			http.Error(w, "資料寫入錯誤 請稍後再試", http.StatusBadRequest)
			return
		}
		fmt.Println("deleted budget number:", res.DeletedCount)

		response.Msg = "成功刪除預算"
		json.NewEncoder(w).Encode(&response)
	}
}

func (h *handlerWithDB) DeleteExpense() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		var response CRUDResponse
		SID, err := checkSessionExpiredOrNotExist(r)
		if err != nil {
			// 通知front-end去log out並提醒使用者要重新登入
			fmt.Println("憑證錯誤 請重新登入")
			response.Msg = "憑證錯誤 請重新登入"
			json.NewEncoder(w).Encode(&response)
			return
		}
		if SID == "" {
			// 通知front-end去log out並提醒使用者要重新登入
			fmt.Println("憑證錯誤 請重新登入")
			response.Msg = "憑證錯誤 請重新登入"
			json.NewEncoder(w).Encode(&response)
			return
		}

		var data DeleteExpenseObject
		if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
			fmt.Println("JSON資料型態轉換錯誤")
			http.Error(w, "JSON資料型態轉換錯誤", http.StatusBadRequest)
			return
		}

		// Print received data (for demonstration purposes)
		fmt.Printf("Received data: %+v\n", data)

		// 檢查data有沒有違規
		response.LogIn = true

		if strings.TrimSpace(data.ExpenseID) == "" {
			fmt.Println("花費ID不得為空")
			http.Error(w, "花費ID不得為空", http.StatusBadRequest)
			return
		}

		// 移除該筆花費
		var res *mongo.DeleteResult
		res, err = h.EColl.DeleteOne(r.Context(), bson.M{"userID": SID, "id": data.ExpenseID})
		if err != nil {
			fmt.Println("資料寫入錯誤 請稍後再試", err)
			http.Error(w, "資料寫入錯誤 請稍後再試", http.StatusBadRequest)
			return
		}
		fmt.Println("deleted expense number:", res.DeletedCount)

		response.Msg = "成功刪除花費"
		json.NewEncoder(w).Encode(&response)
	}
}
