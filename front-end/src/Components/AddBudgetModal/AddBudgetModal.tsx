import React, {useRef, useState} from 'react'
import { Modal, Form, Button, InputGroup, Alert } from 'react-bootstrap'
import { useBudget } from '../../Context/BudgetAndExpense/BudgetAndExpense'

export default function AddBudgetModal({show, handleClose}:{show:boolean, handleClose:() => React.Dispatch<React.SetStateAction<boolean>>}) {
    /*
        addBudget might not exist on the object returned by useBudget(), as it could potentially be null. 
        To handle this, you need to provide TypeScript with a way to guarantee that addBudget exists 
        when you access it.
    */
    const { addBudget, isBudgetNameExist } = useBudget() || {};
    const [nameError, setNameError] = useState<boolean>(false);
    const [amountError, setAmountError] = useState<boolean>(false);
    const [showFirstAlert, setShowFirstAlert] = useState<boolean>(false);
    const [showSecondAlert, setShowSecondAlert] = useState<boolean>(false);

    const handleSubmit = (event: { currentTarget: any; preventDefault: () => void; stopPropagation: () => void; }) => {
        event.preventDefault();
        /*
            TypeScript is correctly identifying that addBudget could potentially be undefined at runtime.
            This can occur if the context value returned by useBudget() is null
            or if the addBudget function is not defined within the context.
        */
        const name = nameRef.current!.value;
        const max = maxRef.current!.value;
        if (name.trim() === "") {
            setShowFirstAlert(true)
            return 
        }
        if (name.trim().length > 12) {
            setNameError(true)
            return
        }

        if ( isBudgetNameExist!(name.trim()) || name.trim() === "總計") {
            setShowSecondAlert(true)
            return
        }

        if (parseInt(max) < 0 || parseInt(max) !== Math.ceil(parseFloat(max))) {
            setAmountError(true)
            return
        }

        addBudget!(name.trim(), parseInt(max));

        setShowFirstAlert(false)
        setShowSecondAlert(false)
        setNameError(false)
        setAmountError(false)
        handleClose()
    };

    function handleNameLength(name: string): void {
        if (name.length > 12) {
            setNameError(true)
        } else {
            setNameError(false)
        }
    }

    function handleMaxValue(max: number): void {
        if ( max < 0 || max !== Math.ceil(max)) {
            setAmountError(true)
        } else {
            setAmountError(false)
        }
    }

    const nameRef = useRef<HTMLInputElement>(null) // 在typescript裡面使用useRef要注意加上annotation
    const maxRef = useRef<HTMLInputElement>(null)

    return (
        <Modal show={show} onHide={handleClose}>
            <Form onSubmit={handleSubmit}>
                <Modal.Header closeButton>
                    <Modal.Title>新增預算</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {showFirstAlert && (
                        <Alert variant="danger" onClose={() => setShowFirstAlert(false)} dismissible>
                            名稱不得為空
                        </Alert>)
                    }
                    {showSecondAlert && (
                        <Alert variant="danger" onClose={() => setShowSecondAlert(false)} dismissible>
                            名稱不得重複且不得為<span className='fw-bold'>{"總計"}</span>
                        </Alert>)
                    }
                    <Form.Group className='mb-3' controlId="name">
                        <Form.Label>名稱</Form.Label>
                        <InputGroup hasValidation>
                            <Form.Control
                                type="text"
                                ref={nameRef}
                                aria-describedby="inputGroupPrepend"
                                required
                                isInvalid={nameError}
                                onChange={() => {handleNameLength(nameRef.current!.value)}}
                            />
                            <Form.Control.Feedback type="invalid">
                                名稱不得超過12個字元
                            </Form.Control.Feedback>
                        </InputGroup>
                    </Form.Group>
                
                    <Form.Group className='mb-3' controlId='max'>
                        <Form.Label>額度</Form.Label>
                        <InputGroup hasValidation>
                            <Form.Control 
                                ref={maxRef} type='number' required min={0} step={1}
                                isInvalid={amountError}
                                onChange={() => {handleMaxValue(parseFloat(maxRef.current!.value))}}/>
                            <Form.Control.Feedback type="invalid">
                                金額只限正整數
                            </Form.Control.Feedback>
                        </InputGroup>
                    </Form.Group>
                    <div className="d-flex justify-content-end">
                        <Button variant='primary' type='submit'>新增</Button>
                    </div>
                </Modal.Body>
            </Form>
        </Modal>
    )
}
