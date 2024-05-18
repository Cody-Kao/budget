import React, { useState } from 'react'
import { Modal, Button, Stack } from 'react-bootstrap'
import SettingsIcon from '@mui/icons-material/Settings';
import DeleteIcon from '@mui/icons-material/Delete';

import { expenseObject, useBudget } from '../../Context/BudgetAndExpense/BudgetAndExpense'
import { currencyFormatter, dateFormatter } from '../../utils';

import UpdateBudgetModal from '../UpdateBudgetModal/UpdateBudgetModal';

import "./index.css"
import UpdateExpenseModal from '../UpdateExpenseModal/UpdateExpenseModal';


export default function ViewExpensesModal({show, budgetID, handleClose}:{show:boolean, budgetID:string, handleClose:() => React.Dispatch<React.SetStateAction<boolean>>}) {
    const budgetContext = useBudget();
    const { expenses ,getBudgetExpenses, findBudgetFromBudgetID, deleteExpense } = budgetContext || {};  
    
    const [sortByDate, setSortByDate] = useState<boolean>(false) // 預設按照日期排列
    const [sortAcsending, setSortAcsending] = useState<boolean>(false) // 預設由大到小(晚到早)

    // state of setting the display of the window for updating budget
    const [confirmUpdateBudget, setConfirmUpdateBudget] = useState<boolean>(false);
    // state of setting the display of the window for deleting expenses
    const [confirmDeleteExpenseId, setConfirmDeleteExpenseId] = useState<string | null>(null);

    // 控制更新花費的Modal
    const [updateExpenseID, setUpdateExpenseID] = useState<string>("")

    const budget = findBudgetFromBudgetID!(budgetID)

    let totalExpenses: expenseObject[];

    if (budgetID !== "total") {
        totalExpenses = getBudgetExpenses!(budgetID);
    } else {
        totalExpenses = expenses as expenseObject[];
    }

    if (sortByDate) {
        if (sortAcsending) {
            totalExpenses = totalExpenses?.sort((a, b) => a.date - b.date)
        } else {
            totalExpenses = totalExpenses?.sort((a, b) => b.date - a.date)
        }
    } else {
        if (sortAcsending) {
            totalExpenses = totalExpenses?.sort((a, b) => a.amount - b.amount)
        } else {
            totalExpenses = totalExpenses?.sort((a, b) => b.amount - a.amount)
        }
    }

    // Function to handle confirm delete
    const handleConfirmDelete = (expenseId: string) => {
        // Perform deletion action here
        deleteExpense!(expenseId);
        // Close the confirmation modal
        setConfirmDeleteExpenseId(null);
    }

    const handleToggle = () => {
        setSortByDate(prevMode => !prevMode);
    };

    const handleSrot = () => {
        setSortAcsending(prevMode => !prevMode);
    };

    return (
        
        <Modal show={show} onHide={handleClose} dialogClassName="my-modal">
            {/* dialogClassName 這個才能真正的設定class到Modal上 */}
            <Modal.Header closeButton>
                <Modal.Title className='d-flex position-relative'>
                    <Stack direction="horizontal" gap={2}>
                        {(budget !== undefined && <div className='text-wrap fw-bold' style={{width:"18rem"}}>{budget?.name}</div>) || <div className='fw-bold'>總額</div>}
                        {budgetID !== "total" && (
                            <Button style={{marginLeft:"60px"}} onClick={() => {setConfirmUpdateBudget(true)}} variant='outline-primary'>
                            Update
                            </Button>
                        )}
                        <UpdateBudgetModal
                            id={budgetID}
                            show={confirmUpdateBudget}
                            prevBudgetName={budget?.name}
                            prevBudgetMax={budget?.max}
                            handleClose={() => setConfirmUpdateBudget(false)!}
                        />
                        <div>
                        <input
                            type="checkbox"
                            id="toggle"
                            className="toggleCheckbox"
                            checked={sortByDate}
                            onChange={handleToggle}
                        />
                        <label htmlFor="toggle" className={(sortByDate ? 'toggleContainer left' : 'toggleContainer right') + (budgetID === "total" ? " toggleContainerForTotal" : "")}>
                            <div id="date">日期</div>
                            <div id="amount">金額</div>
                            <label htmlFor="sortCheck" className={sortAcsending ? "sortAscendingLabel" : "sortdescendingLabel"}></label>
                            <input type="checkbox" checked={sortAcsending} id="sortCheck" style={{display:"none"}} onChange={()=>{handleSrot()}}></input>
                        </label>
                        </div>
                        
                    </Stack>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {totalExpenses?.length === 0 ? <div style={{textAlign:"center", fontSize:"1.2rem"}}>目前沒有花費喔~</div> :
                    <Stack direction='vertical' gap={3}>
                            {
                                totalExpenses?.map((expense) => {
                                    const budgetName = findBudgetFromBudgetID!(expense.budgetID)?.name;
                                    return (
                                        <div key={expense.id}>
                                            <Stack direction='horizontal' gap={2}>
                                                <div className="me-auto fs-5">{expense.description}</div>
                                                <div className='fw-light'>{dateFormatter(expense.date)}</div>
                                                <div className="fs-5">{currencyFormatter.format(expense.amount)}</div>
                                                {budgetID !== "total" ? 
                                                <>
                                                {/* 刪除預算、更新預算按紐 */}
                                                <Button onClick={() => setUpdateExpenseID(expense.id)} size="sm"
                                                variant='outline-primary' ><SettingsIcon fontSize='small' /></Button>
                                                <Button onClick={() => setConfirmDeleteExpenseId(expense.id)} size="sm"
                                                variant='outline-danger'><DeleteIcon fontSize='small'/></Button>
                                                </> : 
                                                <span className='badge bg-secondary'>{budgetName?.length <= 4 ? budgetName : (budgetName?.slice(0, 3) + "...")}</span>
                                                }
                                            </Stack>
                                            <hr className='border border-primary mb-auto'/> {/* Horizontal line */}

                                            {/* 更新Expense Modal */}
                                            <UpdateExpenseModal prevBudgetID={budgetID} id={expense.id} show={updateExpenseID === expense.id} prevDescription={expense.description} prevAmount={expense.amount} handleClose={()=>{setUpdateExpenseID("")}}/>

                                            {/* Confirmation dialog for delete */}
                                            <Modal show={confirmDeleteExpenseId === expense.id} onHide={() => setConfirmDeleteExpenseId(null)}>
                                                <Modal.Header className='bg-light' closeButton>
                                                    <Modal.Title>確認刪除--<span className='fw-bold'>{expense.description.length > 5 ? (expense.description.slice(0, 5) + "...") : expense.description}</span></Modal.Title>
                                                </Modal.Header>
                                                <Modal.Body className='bg-light'>
                                                    確定要刪除該筆花費嗎? 刪除後無法復原喔
                                                </Modal.Body>
                                                <Modal.Footer className='bg-light'>
                                                    <Button variant="secondary" onClick={() => setConfirmDeleteExpenseId(null)}>取消</Button>
                                                    <Button variant="danger" onClick={() => handleConfirmDelete(expense.id)}>確定</Button>
                                                </Modal.Footer>
                                            </Modal>
                                        </div>
                                    )
                                })
                            }
                    </Stack>
                }
            </Modal.Body>
        </Modal>
    )
}
