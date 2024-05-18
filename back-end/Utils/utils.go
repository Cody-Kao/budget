package Utils

import (
	"regexp"
	"unicode"

	"golang.org/x/crypto/bcrypt"
)

func ContainsNonEnglishOrNumber(password string) bool {
	// Regular expression to match non-English and non-number characters
	regex := regexp.MustCompile(`[^A-Za-z0-9]`)

	// Check if the password contains a non-English or non-number character
	return regex.MatchString(password)
}

func ContainsLowerUpperCaseAndNumber(password string) bool {
	var hasLower, hasUpper, hasNumber bool

	for _, char := range password {
		switch {
		case unicode.IsLower(char):
			hasLower = true
		case unicode.IsUpper(char):
			hasUpper = true
		case unicode.IsNumber(char):
			hasNumber = true
		}
	}

	return hasLower && hasUpper && hasNumber
}

func HashPassword(password string) (string, error) {
	// Generate a bcrypt hash of the password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(hashedPassword), nil
}

// CheckPasswordHash checks if the given password matches its hashed version
func CheckPasswordHash(password, hash string) bool {
	// Compare the hashed password with the plaintext password
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}
