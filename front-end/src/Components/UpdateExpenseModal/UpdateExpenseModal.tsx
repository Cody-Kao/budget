import React, {useRef, useState} from 'react'
import { Modal, Form, Button, InputGroup, Alert } from 'react-bootstrap'
import { useBudget } from '../../Context/BudgetAndExpense/BudgetAndExpense'

type UpdateExpenseModalProps = {
    prevBudgetID:string
    id:string 
    show:boolean 
    prevDescription:string 
    prevAmount:number
    handleClose:() => void
}

export default function UpdateExpenseModal({prevBudgetID, id, show, prevDescription, prevAmount, handleClose}:UpdateExpenseModalProps) {
    const { budgets, updateExpense, findBudgetFromBudgetID } = useBudget() || {};
    const [amountErrorMsg, setAmountErrorMsg] = useState<string>("");
    const [displayConfirmUpdateBudget, setDisplayConfirmUpdateBudget] = useState<boolean>(false)
    const [showFirstAlert, setShowFirstAlert] = useState<boolean>(false);

    const descriptionRef = useRef<HTMLInputElement>(null) // 在typescript裡面使用useRef要注意加上annotation
    const amountRef = useRef<HTMLInputElement>(null)
    const budgetRef = useRef<HTMLSelectElement>(null)

    const handleSubmit = (event: { currentTarget: any; preventDefault: () => void; stopPropagation: () => void; }) => {
        event.preventDefault();

        const description = descriptionRef.current!.value
        const amount = parseFloat(amountRef.current!.value)
        const newBudget = budgetRef.current!.value
        console.log(amount, description)
        
        if (!Number.isNaN(amount) && (amount <= 0 || amount !== Math.ceil(amount))) {
            setAmountErrorMsg("金額必須為正整數")
            return
        }

        if ((description === "" || description === prevDescription) && (Number.isNaN(amount) || amount === prevAmount) && newBudget === "") {
            setShowFirstAlert(true)
            return
        }
        
        setShowFirstAlert(false)
        setDisplayConfirmUpdateBudget(true)
    };

    function handleAmountValue(amount: number): void {
        if (amount && (amount < 0 || amount !== Math.ceil(amount))) {
            setAmountErrorMsg("金額必須為正整數")
        } else {
            setAmountErrorMsg("")
        }
    }

    // 因為要加上其他的功能 所以做了一個wrapper
    function handleCloseWrapper() {
        setShowFirstAlert(false)
        handleClose()
    }

    function handleConfirmUpdate() {
        // 更新花費
        const budgetName = budgetRef.current!.value || prevBudgetID
        const description = descriptionRef.current!.value || prevDescription
        const amount = parseFloat(amountRef.current!.value) || prevAmount

        updateExpense!(budgetName, id, description, amount)
        handleCloseWrapper()
    }

    return (
        <Modal show={show} onHide={handleCloseWrapper}>
            <Form noValidate onSubmit={handleSubmit}>
                <Modal.Header closeButton>
                    <Modal.Title>更新花費 -- <span className='fw-bold'>{prevDescription.length > 6 ? prevDescription.slice(0, 6)+"..." : prevDescription}</span></Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {showFirstAlert && (
                        <Alert variant="warning" onClose={() => setShowFirstAlert(false)} dismissible>
                            無法更新 因為沒有任何更動
                        </Alert>)
                    }
                    <Form.Group className='mb-3' controlId="name">
                        <Form.Label>新名稱</Form.Label>
                        <InputGroup hasValidation>
                            <Form.Control
                                type="text"
                                ref={descriptionRef}
                                aria-describedby="inputGroupPrepend"
                            />
                        </InputGroup>
                    </Form.Group>
                
                    <Form.Group className='mb-3' controlId='max'>
                        <Form.Label>新金額</Form.Label>
                        <InputGroup hasValidation>
                            <Form.Control 
                                ref={amountRef} type='number' min={0} step={1}
                                isInvalid={amountErrorMsg !== ""}
                                onChange={() => {handleAmountValue(parseFloat(amountRef.current!.value))}}/>
                            <Form.Control.Feedback type="invalid">
                                {amountErrorMsg}
                            </Form.Control.Feedback>
                        </InputGroup>
                    </Form.Group>

                    <Form.Group className='mb-3' controlId='budget'>
                        <Form.Label>是否移動至其他預算</Form.Label>
                        {/* 設定selected來決定下拉選單的defaultValue，不然就是以第一個option為主 */}
                        <Form.Select ref={budgetRef}>
                            {/* 預設第一個為"否"，表示不變更 */}
                            <option key={""} value="">否</option>
                            {
                                budgets?.map(budget => {
                                    if (budget.id !== prevBudgetID) {
                                        return (
                                        <option key={budget.id} value={budget.id}>
                                            {budget.name}
                                        </option>
                                        )
                                    } else {
                                        return null
                                    }
                                })
                            }
                        </Form.Select>
                    </Form.Group>

                    <div className="d-flex justify-content-end">
                        <Button variant='primary' type='submit'>更新</Button>
                    </div>
                    {/* confirm Modal for updating */}
                    <Modal show={displayConfirmUpdateBudget} onHide={() => setDisplayConfirmUpdateBudget(false)}>
                        <Modal.Header className='bg-light' closeButton>
                            <Modal.Title className='d-flex flex-start flex-wrap'>確認更新
                                </Modal.Title>
                        </Modal.Header>
                        <Modal.Body className='bg-light'>
                            {(prevDescription !== descriptionRef.current?.value && descriptionRef.current?.value.trim()) && <span className='fs-5'>{"名稱確定從"}<span className='fw-bold'>{`${prevDescription}`}</span>{"改成"}
                                <span className='fw-bold'>{descriptionRef.current?.value}</span><br /><br /></span>}
                            {amountRef.current?.value && prevAmount !== parseInt(amountRef.current?.value) && <span className='fs-5'>{"金額確定從"}<span className='fw-bold'>{`${prevAmount}`}</span>{"改成"}
                                <span className='fw-bold'>{amountRef.current?.value}</span><br /><br /></span>}
                            {budgetRef.current?.value !== "" && <span className='fs-5'>{"預算確定從"}<span className='fw-bold'>{`${findBudgetFromBudgetID!(prevBudgetID)?.name}`}</span>{"移動至"}
                                <span className='fw-bold'>{budgetRef.current?.value && findBudgetFromBudgetID!(budgetRef.current!.value).name}</span></span>}
                        
                        </Modal.Body>
                        <Modal.Footer className='bg-light'>
                            <Button variant="secondary" onClick={() => setDisplayConfirmUpdateBudget(false)}>取消</Button>
                            <Button variant="danger" onClick={() => handleConfirmUpdate()}>確定</Button>
                        </Modal.Footer>
                    </Modal>
                </Modal.Body>
            </Form>
        </Modal>
    )
}
