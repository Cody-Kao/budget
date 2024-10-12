import { Container, Stack, Button, Image, Modal } from "react-bootstrap";

import BudgetCard from "./Components/BudgetCard/BudgetCard";
import AddBudgetModal from "./Components/AddBudgetModal/AddBudgetModal";
import AddExpenseModal from "./Components/AddExpenseModal/AddExpenseModal";
import UncategorizedBudgetCard from "./Components/UncategorizedBudgetCard/UncategorizedBudgetCard";
import {
  useBudget,
  UNCATEGORIZED_BUDGETID,
} from "./Context/BudgetAndExpense/BudgetAndExpense";
import "./App.css";
import { useState } from "react";
import TotalBudgetAndExpense from "./Components/TotalBudgetAndExpense/TotalBudgetAndExpense";
import SignUpModal from "./Components/SingUpModal/SignUpModal";
import FlashMsg from "./Components/FlashMsg/FlashMsg";
import SignInModal from "./Components/SignInModal/SignInModal";

export default function App() {
  const [isAddBudgetModalOpen, setIsAddBudgetModalOpen] =
    useState<boolean>(false);
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] =
    useState<boolean>(false);
  const [defaultValueForAddExpenseModal, setDefaultValueForAddExpenseModal] =
    useState<string>("");
  const [isSignInOpen, setIsSignInOpen] = useState<boolean>(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState<boolean>(false);
  const [showSignUpSuccess, setShowSignUpSuccess] = useState<boolean>(false);
  const [showLogOutSuccess, setShowLogOutSuccess] = useState<boolean>(false);
  const [showLogOutFail, setShowLogOutFail] = useState<boolean>(false);
  const [displayConfirmLogOut, setDisplayConfirmLogOut] =
    useState<boolean>(false);
  const budgetContext = useBudget();
  const {
    userName,
    updateUserName,
    budgets,
    getBudgetExpenses,
    isLoggedIn,
    LogOut,
  } = budgetContext || {};
  const apiURL = process.env.REACT_APP_API_TEST_URL;
  console.log("userName from App.tsx: ", userName);
  function showAddExpenseModal(budgetName: string) {
    setIsAddExpenseModalOpen(true);
    setDefaultValueForAddExpenseModal(budgetName);
  }

  function handleConfirmLogOut() {
    const logOut = async () => {
      try {
        const response = await fetch(`${apiURL}/logOut`, {
          credentials: "include",
        });
        if (response.ok) {
          LogOut!();
          setShowLogOutSuccess(true);
        } else {
          setShowLogOutFail(true);
        }
      } catch (error) {
        console.log(error);
        setShowLogOutFail(true);
      } finally {
        setDisplayConfirmLogOut(false);
      }
    };
    logOut();
  }

  return (
    <>
      <Container className="my-4">
        {/* flash message for successful SignUp  */}
        <FlashMsg
          show={showSignUpSuccess}
          handleClose={() => {
            setShowSignUpSuccess(false);
          }}
          type="success"
          message="註冊成功!"
        />

        {/* flash message for successful LogOut  */}
        <FlashMsg
          show={showLogOutSuccess}
          handleClose={() => {
            setShowLogOutSuccess(false);
          }}
          type="success"
          message="登出成功!"
        />

        {/* flash message for not successful LogOut  */}
        <FlashMsg
          show={showLogOutFail}
          handleClose={() => {
            setShowLogOutFail(false);
          }}
          type="error"
          message="網路連線或伺服器錯誤 無法登出!"
        />

        <Stack direction="horizontal" className="mb-4" gap={2}>
          <h1 className="me-5 mb-0">預算</h1>
          <Button
            variant="primary"
            onClick={() => setIsAddBudgetModalOpen(true)}
          >
            新增預算
          </Button>
          <Button
            variant="outline-primary"
            onClick={() => {
              showAddExpenseModal(UNCATEGORIZED_BUDGETID);
            }}
          >
            新增花費
          </Button>

          <div
            className="ms-auto"
            style={{ display: "flex", alignItems: "center" }}
          >
            {isLoggedIn ? (
              <>
                <Button
                  variant="link"
                  style={{ textDecoration: "none" }}
                  onClick={() => setDisplayConfirmLogOut(true)}
                >
                  登出
                </Button>
                <Button
                  variant="link"
                  style={{ textDecoration: "none" }}
                  onClick={() => setIsSignUpOpen(true)}
                >
                  註冊新用戶
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="link"
                  style={{ textDecoration: "none" }}
                  onClick={() => setIsSignInOpen(true)}
                >
                  登入
                </Button>
                <Button
                  variant="link"
                  style={{ textDecoration: "none" }}
                  onClick={() => setIsSignUpOpen(true)}
                >
                  註冊
                </Button>
              </>
            )}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                marginLeft: "3rem",
              }}
            >
              <Image
                src="/images/profile.png"
                roundedCircle
                style={{
                  width: "3.5rem",
                  height: "3.5rem",
                  backgroundSize: "3.5rem ,3.5rem",
                }}
              />
              <span>{userName || "未登入使用者"}</span>
            </div>
          </div>

          {/* confirm Modal for log out */}
          <Modal
            show={displayConfirmLogOut}
            onHide={() => setDisplayConfirmLogOut(false)}
          >
            <Modal.Header className="bg-light" closeButton>
              <Modal.Title className="d-flex flex-start flex-wrap">
                登出
              </Modal.Title>
            </Modal.Header>
            <Modal.Body className="bg-light">確定登出嗎</Modal.Body>
            <Modal.Footer className="bg-light">
              <Button
                variant="secondary"
                onClick={() => setDisplayConfirmLogOut(false)}
              >
                取消
              </Button>
              <Button variant="danger" onClick={() => handleConfirmLogOut()}>
                確定
              </Button>
            </Modal.Footer>
          </Modal>

          {/* 登入Modal */}
          <SignInModal
            isSignInOpen={isSignInOpen}
            handleSignInClose={() => {
              setIsSignInOpen(false);
            }}
            updateUserName={updateUserName != null ? updateUserName : () => {}}
          />

          {/* 註冊Modal */}
          <SignUpModal
            isSignUpOpen={isSignUpOpen}
            handleSignUpClose={() => {
              setIsSignUpOpen(false);
            }}
            setShowSignUpSuccess={() => {
              setShowSignUpSuccess(true);
            }}
          />
        </Stack>
        <div className="cardArea">
          {/* 遍歷所有budgets去跑出budgetCard */}
          {budgets?.map((budget) => {
            if (budget.id === UNCATEGORIZED_BUDGETID) return null;
            // 算出該預算的所有目前花費，使用reduce遍歷expense array
            const amount = getBudgetExpenses!(budget.id).reduce(
              (total, expense) => {
                return total + expense.amount;
              },
              0
            );
            return (
              <BudgetCard
                key={budget.id}
                id={budget.id}
                name={budget.name}
                amount={amount}
                max={budget.max}
                gray={false}
                showAddExpenseModal={showAddExpenseModal}
              />
            );
          })}
          {budgets?.find((budget) => budget.id === UNCATEGORIZED_BUDGETID) && (
            <UncategorizedBudgetCard toggleModal={showAddExpenseModal} />
          )}

          <TotalBudgetAndExpense />
        </div>
      </Container>
      <AddBudgetModal
        show={isAddBudgetModalOpen}
        handleClose={() => setIsAddBudgetModalOpen(false)!}
      />
      <AddExpenseModal
        show={isAddExpenseModalOpen}
        handleClose={() => setIsAddExpenseModalOpen(false)!}
        defaultBudgetID={defaultValueForAddExpenseModal}
      />
    </>
  );
}
