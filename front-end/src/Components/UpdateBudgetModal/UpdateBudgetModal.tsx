import React, {useRef, useState} from 'react'
import { Modal, Form, Button, InputGroup, Alert } from 'react-bootstrap'
import { useBudget } from '../../Context/BudgetAndExpense/BudgetAndExpense'

export default function UpdateBudgetModal({id, show, prevBudgetName, prevBudgetMax, handleClose}:{id:string, show:boolean,  prevBudgetName:string, prevBudgetMax: number, handleClose:() => React.Dispatch<React.SetStateAction<boolean>>}) {
    const { updateBudget, isBudgetNameExist } = useBudget() || {};
    const [nameError, setNameError] = useState<boolean>(false);
    const [maxError, setMaxError] = useState<boolean>(false);
    const [displayConfirmUpdateBudget, setDisplayConfirmUpdateBudget] = useState<boolean>(false)
    const [showFirstAlert, setShowFirstAlert] = useState<boolean>(false);
    const [showSecondAlert, setShowSecondAlert] = useState<boolean>(false);

    const handleSubmit = (event: { currentTarget: any; preventDefault: () => void; stopPropagation: () => void; }) => {
        event.preventDefault();
        const form = event.currentTarget;
        console.log(form.checkValidity())
        if (form.checkValidity() === false) {
            event.stopPropagation();
            return
        }

        const name = nameRef.current!.value;
        const max = maxRef.current!.value;

        if ((name.trim() === "" && max === "") || (prevBudgetName === name && prevBudgetMax === parseInt(max))) {
            setShowFirstAlert(true)
            return
        }

        if (isBudgetNameExist!(name.trim()) || name.trim() === "總計") {
            setShowSecondAlert(true)
            return
        }

        if (name.length > 12) {
            setNameError(true)
            return
        }

        if (max !== "" && (parseFloat(max) < 0 || parseFloat(max) !== Math.ceil(parseFloat(max)))) {
            setMaxError(true)
            return
        }
        
        setNameError(false)
        setMaxError(false)
        setDisplayConfirmUpdateBudget(true)
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
            setMaxError(true)
        } else {
            setMaxError(false)
        }
    }

    function handleCloseWrapper() {
        setShowFirstAlert(false)
        setShowSecondAlert(false)
        handleClose()
    }

    function handleConfirmUpdate() {
        updateBudget!(id, nameRef.current!.value, parseInt(maxRef.current!.value))
        handleCloseWrapper()
    }

    const nameRef = useRef<HTMLInputElement>(null) // 在typescript裡面使用useRef要注意加上annotation
    const maxRef = useRef<HTMLInputElement>(null)

    return (
        <Modal show={show} onHide={handleCloseWrapper}>
            <Form onSubmit={handleSubmit}>
                <Modal.Header closeButton>
                    <Modal.Title>更新預算</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {showFirstAlert && (
                        <Alert variant="warning" onClose={() => setShowFirstAlert(false)} dismissible>
                            名稱和最高預算額度都沒更動
                        </Alert>)
                    }
                    {showSecondAlert && (
                        <Alert variant="danger" onClose={() => setShowSecondAlert(false)} dismissible>
                            名稱不得重複且不得為<span className='fw-bold'>{"總計"}</span>
                        </Alert>)
                    }
                    <Form.Group className='mb-3' controlId="name">
                        <Form.Label>新名稱</Form.Label>
                        <InputGroup hasValidation>
                            <Form.Control
                                type="text"
                                ref={nameRef}
                                aria-describedby="inputGroupPrepend"
                                isInvalid={nameError}
                                onChange={() => {handleNameLength(nameRef.current!.value)}}
                            />
                            <Form.Control.Feedback type="invalid">
                                名稱不得超過12個字元
                            </Form.Control.Feedback>
                        </InputGroup>
                    </Form.Group>
                
                    <Form.Group className='mb-3' controlId='max'>
                        <Form.Label>新額度</Form.Label>
                        <InputGroup hasValidation>
                            <Form.Control 
                                ref={maxRef} type='number' min={0} step={1}
                                isInvalid={maxError}
                                onChange={() => {handleMaxValue(parseInt(maxRef.current!.value))}}/>
                            <Form.Control.Feedback type="invalid">
                                金額只限正整數
                            </Form.Control.Feedback>
                        </InputGroup>
                    </Form.Group>
                    <div className="d-flex justify-content-end">
                        <Button variant='primary' type='submit'>更新</Button>
                    </div>
                    {/* confirm window for updating */}
                    <Modal show={displayConfirmUpdateBudget} onHide={() => setDisplayConfirmUpdateBudget(false)}>
                        <Modal.Header className='bg-light' closeButton>
                            <Modal.Title className='d-flex flex-start flex-wrap'>確認更新--
                                </Modal.Title>
                        </Modal.Header>
                        <Modal.Body className='bg-light'>
                            {(prevBudgetName !== nameRef.current?.value && nameRef.current?.value.trim()) && <span className='fs-5'>{"名稱確定從"}<span className='fw-bold'>{`${prevBudgetName}`}</span>{"改成"}
                                <span className='fw-bold'>{nameRef.current?.value}</span><br /><br /></span>}
                            {maxRef.current?.value && prevBudgetMax !== parseInt(maxRef.current?.value) && <span className='fs-5'>{"金額確定從"}<span className='fw-bold'>{`${prevBudgetMax}`}</span>{"改成"}
                                <span className='fw-bold'>{maxRef.current?.value}</span></span>}
                        
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
