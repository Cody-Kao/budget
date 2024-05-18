import React, {FormEvent, useRef, useState} from 'react'
import { Modal, Form, Button } from 'react-bootstrap'
import { useBudget } from '../../Context/BudgetAndExpense/BudgetAndExpense'

interface expenseModalProps {
    show: boolean,
    handleClose:() => React.Dispatch<React.SetStateAction<boolean>>,
    defaultBudgetID: string
}

export default function AddExpenseModal({show, handleClose, defaultBudgetID}: expenseModalProps) {
    const budgetContext = useBudget();
    const { budgets, addExpense } = budgetContext || {};  

    const descriptionRef = useRef<HTMLInputElement>(null) // 在typescript裡面使用useRef要注意加上annotation
    const amountRef = useRef<HTMLInputElement>(null)
    const budgetRef = useRef<HTMLSelectElement>(null)

    const [invalidDescriptionMsg, setInvalidDescriptionMsg] = useState<string>("")
    const [invalidAmountMsg, setInvalidAmountMsg] = useState<string>("")
    const [invalidBudgetIDMsg, setInvalidBudgetIDMsg] = useState<string>("")

    function checkDescription() {
        const description = descriptionRef.current!.value;
        if (description === "") {
            setInvalidDescriptionMsg("不得為空")
        } else {
            setInvalidDescriptionMsg("")
        }
    }

    function checkAmount() {
        const amount = parseFloat(amountRef.current!.value);
        if (!Number.isNaN(amount) && (amount <= 0 || amount !== Math.ceil(amount))) {
            setInvalidAmountMsg("必須為正整數")
            return
        } else {
            setInvalidAmountMsg("")
        }
    }

    function handleSubmit(e:FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const budgetID = budgetRef.current!.value;
        const amount = parseFloat(amountRef.current!.value);
        const description = descriptionRef.current!.value;
        if (description === "") {
            setInvalidDescriptionMsg("不得為空")
            return
        }

        if (!Number.isNaN(amount) && (amount <= 0 || amount !== Math.ceil(amount))) {
            setInvalidAmountMsg("必須為正整數")
            return
        }

        if (budgetID === "" || budgetID === undefined) {
            setInvalidBudgetIDMsg("必須選擇一個預算分類")
            return
        }

        addExpense!(
            budgetID,
            Math.round(amount),
            description
        );
        
        setInvalidDescriptionMsg("")
        setInvalidAmountMsg("")
        setInvalidBudgetIDMsg("")
        handleClose()
    }

    return (
        <Modal show={show} onHide={handleClose}>
            <Form noValidate onSubmit={handleSubmit}>
                <Modal.Header closeButton>
                    <Modal.Title>新增花費</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group className='mb-3' controlId='description'>
                        <Form.Label>描述</Form.Label>
                        <Form.Control 
                            ref={descriptionRef} 
                            type='text' required 
                            isInvalid={invalidDescriptionMsg !== ""}
                            onChange={checkDescription}
                        />
                        <Form.Control.Feedback type="invalid">{invalidDescriptionMsg}</Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group className='mb-3' controlId='amount'>
                        <Form.Label>金額</Form.Label>
                        <Form.Control  
                            ref={amountRef} type='number' 
                            required 
                            min={0} step={1}
                            isInvalid={invalidAmountMsg !== ""}
                            onChange={checkAmount}
                        />
                        <Form.Control.Feedback type="invalid">{invalidAmountMsg}</Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group className='mb-3' controlId='budget'>
                        <Form.Label>預算分類</Form.Label>
                        {/* 設定selected來決定下拉選單的defaultValue，不然就是以第一個option為主 */}
                        <Form.Select ref={budgetRef} defaultValue={defaultBudgetID} isInvalid={invalidBudgetIDMsg !== ""}>
                            {
                                budgets?.map(budget => 
                                    <option key={budget.id} value={budget.id}>
                                        {budget.name}
                                    </option>
                                )
                            }
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">{invalidBudgetIDMsg}</Form.Control.Feedback>
                    </Form.Group>
                    <div className="d-flex justify-content-end">
                        <Button variant='primary' type='submit'>新增</Button>
                    </div>
                </Modal.Body>
            </Form>
        </Modal>
    )
}
