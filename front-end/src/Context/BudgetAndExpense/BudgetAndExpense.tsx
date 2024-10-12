import React, { ReactNode, useContext, useEffect, useState } from "react";
import { v4 as uuidV4 } from "uuid";

import FlashMsg from "../../Components/FlashMsg/FlashMsg.tsx";
import useLocalStorage from "../../hooks/useLocalStorage/useLocalStorage.ts";

export interface budgetObject {
  id: string;
  name: string;
  max: number;
}

export interface expenseObject {
  id: string;
  budgetID: string;
  amount: number;
  description: string;
  date: number;
}

export interface BudgetAndExpenseData {
  userName: string;
  updateUserName: (name: string) => void;
  budgets: budgetObject[];
  expenses: expenseObject[];
  isLoggedIn: boolean;
  LogIn: () => void;
  LogOut: () => void;
  getBudgetExpenses: (budgetID: string) => expenseObject[];
  isBudgetNameExist: (budgetName: string) => boolean;
  findBudgetFromBudgetID: (budget: string) => budgetObject;
  updateBudget: (budget: string, name: string, max: number) => void;
  updateExpense: (
    newBudgetID: string,
    id: string,
    name: string,
    amount: number
  ) => void;
  addBudget: (name: string, max: number) => void;
  addExpense: (budgetID: string, amount: number, description: string) => void;
  deleteBudget: (budgetID: string) => void;
  deleteExpense: (expenseID: string) => void;
}

export const UNCATEGORIZED_BUDGETID = "其他";

const BudgetContext = React.createContext<BudgetAndExpenseData | null>(null);

export function useBudget(): BudgetAndExpenseData | null {
  return useContext(BudgetContext);
}

// 這是名為"其他"的預設預算卡，但不會預設他的預算額度
const UncategorizedBudget: budgetObject = {
  id: UNCATEGORIZED_BUDGETID,
  name: UNCATEGORIZED_BUDGETID,
  max: 0,
};

export default function BudgetAndExpenseContext({
  children,
}: {
  children: ReactNode;
}) {
  // user name
  const [userName, setUserName] = useState<string>("未登入使用者");
  function updateUserName(name: string) {
    console.log("updateUserName: ", name);
    setUserName(name);
  }

  const [showLogInAlert, setShowLogInAlert] = useState<boolean>(false);
  const [showFectDataAlert, setShowFetchDataAlert] = useState<boolean>(false);
  // 這個是專門展示所有對Budgets或Expenses CRUD的警告
  const [showPostAlert, setShowPostAlert] = useState<boolean>(false);
  const [showPostAlertMsg, setShowPostAlertMsg] = useState<string>("");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const apiURL = process.env.REACT_APP_API_TEST_URL;

  // 這是一個方便我們自訂錯誤訊息的wrapper，能加工CRUD的警告
  function displaysetShowPostAlert(msg: string) {
    setShowPostAlertMsg(msg);
    setShowPostAlert(true);
  }

  // 一載入就檢查是否logged in
  useEffect(() => {
    const checkLogInStatus = async () => {
      try {
        // credentials: "include" 讓fetch request去挾帶cookie
        const response = await fetch(`${apiURL}/isLoggedIn`, {
          credentials: "include",
        });
        const res = await response.json();
        console.log("checkLogInStatus:", res);
        if (res.isLoggedIn) {
          setIsLoggedIn(true);
          setUserName(res.userName);
        } else {
          setUserName("未登入使用者");
        }
      } catch (error) {
        setShowLogInAlert(true);
      }
    };
    checkLogInStatus();
  }, []);
  console.log("is logged in", isLoggedIn);

  useEffect(() => {
    if (isLoggedIn) {
      // then we fetch the budgets and expenses data from DB
      console.log("fetch budgets from DB");
      const getBudgets = async () => {
        try {
          const response = await fetch(`${apiURL}/getBudgets`, {
            credentials: "include",
          });
          if (!response.ok) {
            console.log("Failed to fetch budget data");
            setShowFetchDataAlert(true);
          }
          const data = await response.json();
          console.log("budgets from DB", data);
          if (data !== null) {
            setBudgets(data);
          } else {
            setBudgets([]);
          }
        } catch (error) {
          console.log("Catch error when fetch budgets data", error);
          setShowFetchDataAlert(true);
        }
      };
      getBudgets();
      const getExpenses = async () => {
        try {
          const response = await fetch(`${apiURL}/getExpenses`, {
            credentials: "include",
          });
          if (!response.ok) {
            console.log("Failed to fetch expenses data");
            setShowFetchDataAlert(true);
          }
          const data = await response.json();
          console.log("expenses from DB", data);
          if (data !== null) {
            setExpenses(data);
          } else {
            setExpenses([]);
          }
        } catch (error) {
          console.log("Catch error when fetch expenses data", error);
          setShowFetchDataAlert(true);
        }
      };
      getExpenses();
    }
  }, [isLoggedIn]);

  // 預設是訪客
  const [budgets, setBudgets] = useLocalStorage<budgetObject[]>(
    "budgets",
    [UncategorizedBudget],
    isLoggedIn
  );
  const [expenses, setExpenses] = useLocalStorage<expenseObject[]>(
    "expenses",
    [],
    isLoggedIn
  );

  function LogIn() {
    setIsLoggedIn(true);
  }

  function LogOut() {
    setIsLoggedIn(false);
    setUserName("未登入使用者");
    // remove the cookie called SID 雖然我們後端在登出的時候有清理過，但有些情況是我們需要手動清理
    /*
    例如說在憑證的加密更改之後還發送請求到後端，這時後端沒辦法抓到存在瀏覽器的"舊加密"憑證，
    我們必須手動清除之後讓使用者登出，使用者再登入時就會是新的加密憑證了
    */
    document.cookie = "SID=; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
  }

  function getBudgetExpenses(budgetID: string): expenseObject[] {
    return expenses.filter((expense) => expense.budgetID === budgetID);
  }

  function isBudgetNameExist(budgetName: string): boolean {
    return budgets.some((budget) => budget.name === budgetName);
  }

  function findBudgetFromBudgetID(budgetID: string): budgetObject {
    return budgets?.find((budget) => budget.id === budgetID) as budgetObject;
  }

  function addBudget(name: string, max: number): void {
    const id = uuidV4();
    const data: budgetObject = {
      id,
      name,
      max,
    };

    if (isLoggedIn) {
      const sendPost = async () => {
        try {
          const response = await fetch(`${apiURL}/createBudget`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(data),
          });
          const res = await response.json();
          // 如果session cookie錯誤或是過期，就登出
          if (res.logIn === false) {
            alert(res.msg);
            LogOut();
          } else {
            setBudgets((prevBudgets) => {
              name = name.trim();
              // 指派的變數對應的名稱相同就不用寫成 name: name, max: max，直接寫就好
              return [{ id, name, max }, ...prevBudgets];
            });
          }
        } catch (error) {
          console.log("fetch createBudget error", error);
          displaysetShowPostAlert(error as string);
        }
      };

      sendPost();
    } else {
      setBudgets((prevBudgets) => {
        name = name.trim();
        // 指派的變數對應的名稱相同就不用寫成 name: name, max: max，直接寫就好
        return [{ id, name, max }, ...prevBudgets];
      });
    }

    console.log("add budget");
  }

  function addExpense(
    budgetID: string,
    amount: number,
    description: string
  ): void {
    const id = uuidV4();
    const date = Date.now();
    const data: expenseObject = {
      id,
      budgetID,
      description,
      amount,
      date,
    };

    if (isLoggedIn) {
      const sendPost = async () => {
        try {
          const response = await fetch(`${apiURL}/createExpense`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(data),
          });
          const res = await response.json();

          if (res.logIn === false) {
            alert(res.msg);
            LogOut();
          } else {
            setExpenses((prevExpenses) => {
              description = description.trim();
              return [
                { budgetID, id, amount, description, date },
                ...prevExpenses,
              ];
            });
          }
        } catch (error) {
          console.log("fetch createExpense error", error);
          displaysetShowPostAlert(error as string);
        }
      };

      sendPost();
    } else {
      setExpenses((prevExpenses) => {
        description = description.trim();
        return [{ budgetID, id, amount, description, date }, ...prevExpenses];
      });
    }

    console.log("add expense");
  }

  function updateBudget(budgetID: string, name: string, max: number): void {
    if (isLoggedIn) {
      let data = {
        budgetID,
        name,
        max,
      };
      if (Number.isNaN(max)) data.max = -1; // 如果max不變的話，就改為-1，因為只要是負數到了後端都不採納變更

      const sendPost = async () => {
        try {
          const response = await fetch(`${apiURL}/updateBudget`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
            credentials: "include",
          });
          const res = await response.json();

          if (res.logIn === false) {
            alert(res.msg);
            LogOut();
          } else {
            setBudgets((prevBudgets) => {
              return prevBudgets.map((budget) => {
                if (budget.id === budgetID) {
                  if (name === "") {
                    return { ...budget, max };
                  } else if (Number.isNaN(max)) {
                    return { ...budget, name };
                  }
                  return { ...budget, name, max };
                } else {
                  return budget;
                }
              });
            });
          }
        } catch (error) {
          console.log("fetch updateBudget error", error);
          displaysetShowPostAlert(error as string);
        }
      };

      sendPost();
    } else {
      setBudgets((prevBudgets) => {
        return prevBudgets.map((budget) => {
          if (budget.id === budgetID) {
            if (name === "") {
              return { ...budget, max };
            } else if (Number.isNaN(max)) {
              return { ...budget, name };
            }
            return { ...budget, name, max };
          } else {
            return budget;
          }
        });
      });
    }
    console.log("update budget");
  }

  function updateExpense(
    newBudgetID: string,
    id: string,
    description: string,
    amount: number
  ) {
    if (isLoggedIn) {
      const sendPost = async () => {
        const data = {
          newBudgetID,
          id,
          description,
          amount,
        };
        try {
          const response = await fetch(`${apiURL}/updateExpense`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
            credentials: "include",
          });
          const res = await response.json();

          if (res.logIn === false) {
            alert(res.msg);
            LogOut();
          } else {
            setExpenses((preExpenses) =>
              preExpenses.map((preExpense) => {
                if (preExpense.id === id) {
                  return {
                    ...preExpense,
                    budgetID: newBudgetID,
                    description: description,
                    amount: amount,
                  };
                } else {
                  return preExpense;
                }
              })
            );
          }
        } catch (error) {
          console.log("fetch update expense error", error);
          displaysetShowPostAlert(error as string);
        }
      };

      sendPost();
    } else {
      setExpenses((preExpenses) =>
        preExpenses.map((preExpense) => {
          if (preExpense.id === id) {
            return {
              ...preExpense,
              budgetID: newBudgetID,
              description: description,
              amount: amount,
            };
          } else {
            return preExpense;
          }
        })
      );
    }

    console.log("update expense");
  }

  function deleteBudget(budgetID: string): void {
    if (isLoggedIn) {
      const sendPost = async () => {
        const data = {
          budgetID,
        };
        try {
          const response = await fetch(`${apiURL}/deleteBudget`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
            credentials: "include",
          });
          const res = await response.json();

          if (res.logIn === false) {
            alert(res.msg);
            LogOut();
          } else {
            setBudgets((preBudgets) => {
              return preBudgets.filter((budget) => budget.id !== budgetID);
            });

            setExpenses((preExpense) => {
              return preExpense.filter(
                (expense) => expense.budgetID !== budgetID
              );
            });
          }
        } catch (error) {
          console.log("fetch delete budget error", error);
          displaysetShowPostAlert(error as string);
        }
      };

      sendPost();
    } else {
      setBudgets((preBudgets) => {
        return preBudgets.filter((budget) => budget.id !== budgetID);
      });

      setExpenses((preExpense) => {
        return preExpense.filter((expense) => expense.budgetID !== budgetID);
      });
    }

    console.log("delete budget");
  }

  function deleteExpense(expenseID: string): void {
    if (isLoggedIn) {
      const sendPost = async () => {
        const data = {
          expenseID,
        };
        try {
          const response = await fetch(`${apiURL}/deleteExpense`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
            credentials: "include",
          });
          const res = await response.json();

          if (res.logIn === false) {
            alert(res.msg);
            LogOut();
          } else {
            setExpenses((preExpense) => {
              return preExpense.filter((expense) => expense.id !== expenseID);
            });
          }
        } catch (error) {
          console.log("fetch delete budget error", error);
          displaysetShowPostAlert(error as string);
        }
      };

      sendPost();
    } else {
      setExpenses((preExpense) => {
        return preExpense.filter((expense) => expense.id !== expenseID);
      });
    }

    console.log("delete expense");
  }

  return (
    // 如果日後要後端資料加載很久可以考慮加上spinner
    <BudgetContext.Provider
      value={{
        userName,
        budgets,
        expenses,
        isLoggedIn,
        updateUserName,
        LogIn,
        LogOut,
        getBudgetExpenses,
        isBudgetNameExist,
        findBudgetFromBudgetID,
        updateBudget,
        updateExpense,
        addExpense,
        addBudget,
        deleteBudget,
        deleteExpense,
      }}
    >
      <FlashMsg
        show={showLogInAlert}
        handleClose={() => {
          setShowLogInAlert(false);
        }}
        type={"error"}
        message={"網路連線或伺服器憑證錯誤! 無法登入"}
      />
      <FlashMsg
        show={showFectDataAlert}
        handleClose={() => {
          setShowFetchDataAlert(false);
        }}
        type={"error"}
        message={"無法取得伺服器資料，請檢查網路連線後重試"}
      />
      <FlashMsg
        show={showPostAlert}
        handleClose={() => {
          setShowPostAlert(false);
        }}
        type={"error"}
        message={showPostAlertMsg}
      />
      {children}
    </BudgetContext.Provider>
  );
}
