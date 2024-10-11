import React, { FormEvent, useRef, useState } from "react";
import { Modal, Form, InputGroup, Button, Alert } from "react-bootstrap";
import Spinner from "../Spinner/Spinner";

type SignUpModalProps = {
  isSignUpOpen: boolean;
  handleSignUpClose: () => void;
  setShowSignUpSuccess: () => void;
};

export default function SignUpModal({
  isSignUpOpen,
  handleSignUpClose,
  setShowSignUpSuccess,
}: SignUpModalProps) {
  const [nameErrorMsg, setNameErrorMsg] = useState<string>("");
  const [accountErrorMsg, setAccountErrorMsg] = useState<string>("");
  const [passwordErrorMsg, setPasswordErrorMsg] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const accountRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const apiURL = process.env.REACT_APP_API_URL;

  function handleSignUpCloseWrapper() {
    setShowAlert(false);
    handleSignUpClose();
  }

  function handleNameChange() {
    const name = nameRef.current?.value;
    if (name!.length === 0) {
      setNameErrorMsg("名稱不得為空");
      return;
    }

    if (name!.length > 10) {
      setNameErrorMsg("名稱不得多於10個字");
      return;
    }

    setNameErrorMsg("");
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
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]+$/;

    // Check if password matches the regex
    if (!passwordRegex.test(password)) {
      setPasswordErrorMsg("密碼必須包含至少一個大寫、小寫英文字母和數字");
      return;
    }

    // Password meets all requirements
    setPasswordErrorMsg("");
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    setIsLoading(true);
    e.preventDefault();
    e.stopPropagation();

    const name = nameRef.current?.value;
    const account = accountRef.current?.value;
    const password = passwordRef.current?.value;
    if (name!.length === 0) {
      setNameErrorMsg("名稱不得為空");
      setIsLoading(false);
      return;
    }

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
      name,
      account,
      password,
    };

    const send = async () => {
      try {
        const response = await fetch(`${apiURL}/signUp`, {
          method: "POSt",
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
          // 關閉註冊Modal
          handleSignUpClose();
          // 顯示註冊成功
          setShowSignUpSuccess();
        } else {
          // 查看是哪個環節出問題
          switch (responseData.target) {
            case "name":
              setNameErrorMsg(responseData.msg);
              break;
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
    <Modal show={isSignUpOpen} onHide={() => handleSignUpCloseWrapper()}>
      <Form noValidate onSubmit={(e) => handleSubmit(e)}>
        <Modal.Header closeButton>
          <Modal.Title>註冊</Modal.Title>
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
            <Form.Label className="fw-bold">使用者名稱</Form.Label>
            <InputGroup hasValidation>
              <Form.Control
                type="text"
                ref={nameRef}
                aria-describedby="inputGroupPrepend"
                required
                isInvalid={nameErrorMsg !== ""}
                onChange={() => {
                  handleNameChange();
                }}
              />
              <Form.Control.Feedback type="invalid">
                {nameErrorMsg}
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
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
          <div className="d-flex justify-content-end">
            {isLoading ? (
              <Spinner />
            ) : (
              <Button variant="primary" type="submit">
                註冊
              </Button>
            )}
          </div>
        </Modal.Body>
      </Form>
    </Modal>
  );
}
