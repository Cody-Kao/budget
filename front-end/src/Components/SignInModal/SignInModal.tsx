import React, { FormEvent, useRef, useState } from "react";
import { Modal, Form, InputGroup, Button, Alert } from "react-bootstrap";
import Spinner from "../Spinner/Spinner";
import { useBudget } from "../../Context/BudgetAndExpense/BudgetAndExpense";

type SignInModalProps = {
  isSignInOpen: boolean;
  handleSignInClose: () => void;
};

export default function SignInModal({
  isSignInOpen,
  handleSignInClose,
}: SignInModalProps) {
  const [accountErrorMsg, setAccountErrorMsg] = useState<string>("");
  const [passwordErrorMsg, setPasswordErrorMsg] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const accountRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const checkRef = useRef<HTMLInputElement>(null);
  const apiURL = process.env.REACT_APP_API_URL;
  const { LogIn } = useBudget() || {};

  // 因為在關閉事件之中不只是要關閉Modal，也要把alert清掉，所以用一個wrapper function來一次做兩件事情
  function handleSignInCloseWrapper() {
    setShowAlert(false);
    handleSignInClose();
  }

  function handleAccountChange() {
    const account = accountRef.current?.value;
    if (account!.length === 0) {
      setAccountErrorMsg("帳號不得為空");
      return;
    }

    setAccountErrorMsg("");
  }

  function handlePasswordChange() {
    const password = passwordRef.current?.value;

    // Check if password is empty
    if (!password) {
      setPasswordErrorMsg("密碼不得為空");
      return;
    }

    // Check if password contains non-English letters and numbers
    if (/[^A-Za-z0-9]/.test(password)) {
      setPasswordErrorMsg("密碼只能包含英文字母和數字");
      return;
    }

    // Regular expression to validate password
    const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])[A-Za-z0-9]+$/;

    // Check if password matches the regex
    if (!passwordRegex.test(password)) {
      setPasswordErrorMsg("密碼必須包含至少一個大寫英文字母和數字");
      return;
    }

    // Password meets all requirements
    setPasswordErrorMsg("");
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    setIsLoading(true);
    e.preventDefault();
    e.stopPropagation();

    const account = accountRef.current?.value;
    const password = passwordRef.current?.value;
    const check = checkRef.current?.checked;

    if (account!.length === 0) {
      setAccountErrorMsg("帳號不得為空");
      setIsLoading(false);
      return;
    }

    if (password!.length === 0) {
      setPasswordErrorMsg("密碼不得為空");
      setIsLoading(false);
      return;
    }

    const data = {
      account,
      password,
      check,
    };
    console.log(data);

    const send = async () => {
      try {
        const response = await fetch(`${apiURL}/signIn`, {
          method: "POST",
          credentials: "include", // 讓fetch request挾帶cookie，也可以讓server set cookie
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
        const responseData = await response.json();

        // type === true means success, false otherwise
        if (responseData.type) {
          // 加入成功的提示
          console.log(responseData.msg);
          // 關閉登入Modal
          handleSignInClose();
          LogIn!();
        } else {
          // 查看是哪個環節出問題
          switch (responseData.target) {
            case "account":
              setAccountErrorMsg(responseData.msg);
              break;
            case "password":
              setPasswordErrorMsg(responseData.msg);
              break;
          }
        }
      } catch (error) {
        console.log(error);
        setShowAlert(true);
      } finally {
        setIsLoading(false);
      }
    };
    send();
  }

  return (
    <Modal show={isSignInOpen} onHide={() => handleSignInCloseWrapper()}>
      <Form noValidate onSubmit={(e) => handleSubmit(e)}>
        <Modal.Header closeButton>
          <Modal.Title>登入</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {showAlert && (
            <Alert
              variant="danger"
              onClose={() => setShowAlert(false)}
              dismissible
            >
              網路連線或伺服器問題，請檢查後重試
            </Alert>
          )}
          <Form.Group className="mb-3" controlId="name">
            <Form.Label className="fw-bold">帳號</Form.Label>
            <InputGroup hasValidation>
              <Form.Control
                type="text"
                ref={accountRef}
                aria-describedby="inputGroupPrepend"
                required
                isInvalid={accountErrorMsg !== ""}
                onChange={() => {
                  handleAccountChange();
                }}
              />
              <Form.Control.Feedback type="invalid">
                {accountErrorMsg}
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
          <Form.Group className="mb-3" controlId="name">
            <Form.Label className="fw-bold">密碼</Form.Label>
            <InputGroup hasValidation>
              <Form.Control
                type="text"
                ref={passwordRef}
                aria-describedby="inputGroupPrepend"
                required
                isInvalid={passwordErrorMsg !== ""}
                onChange={() => {
                  handlePasswordChange();
                }}
              />
              <Form.Control.Feedback type="invalid">
                {passwordErrorMsg}
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
          <Form.Group className="mb-3" controlId="checkBox">
            <Form.Check // prettier-ignore
              ref={checkRef}
              type={"checkbox"}
              label={"記住我"}
            />
          </Form.Group>
          <div className="d-flex justify-content-end">
            {isLoading ? (
              <Spinner />
            ) : (
              <Button variant="primary" type="submit">
                登入
              </Button>
            )}
          </div>
        </Modal.Body>
      </Form>
    </Modal>
  );
}
