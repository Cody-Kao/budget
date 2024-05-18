import {useState, useEffect} from "react"

// retrieve data from localStorage
// 這裡傳入isLoggedIn而不用useBudget是因為，在執行這個函式時，context並沒有被建立，所以怎麼用useBudget都會是undefined
export default function useLocalStorage<T>(key: string, defaultValue: T, isLoggedIn:boolean): [T, React.Dispatch<React.SetStateAction<T>>] {
    const [value, setValue] = useState(() => {
        console.log("useLocalStorage")
        const storedValue = localStorage.getItem(key)
        if (storedValue != null) return JSON.parse(storedValue)
        
        if (typeof defaultValue === "function") {
            return defaultValue()
        } else {
            return defaultValue
        }
    })

    // 這用於說如果使用者登出之後，state不能還是原本登入的那個，要變回訪客的紀錄，所以去local storage後找回state
    useEffect(() => {
        console.log(isLoggedIn)
        if (!isLoggedIn) {
            console.log("登出後找回state")
            const storedValue = localStorage.getItem(key)
            if (storedValue != null) {
                setValue(JSON.parse(storedValue))
            } else {
                setValue([])
            }
        }
    }, [isLoggedIn])

    useEffect(() => {
        // 如果在log in的情況下是不會去動到localStorage的
        console.log(isLoggedIn)
        if (!isLoggedIn) {
            localStorage.setItem(key, JSON.stringify(value))
        }
    }, [key, value])



    return [value, setValue]
}