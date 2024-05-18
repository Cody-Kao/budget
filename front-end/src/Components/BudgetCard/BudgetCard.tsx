import { Card, ProgressBar, Stack, Button, Modal } from "react-bootstrap"

import { currencyFormatter } from "../../utils"
import { useState } from "react"
import { useBudget } from "../../Context/BudgetAndExpense/BudgetAndExpense"
import ViewExpensesModal from "../ViewExpensesModal/ViewExpensesModal"
import PieChart from "../PieChart/PieChart"

export interface BudgetProps {
  id: string,
  name: string,
  amount: number,
  max: number,
  gray: boolean,
  showAddExpenseModal?:(budgetID: string) => void
  showButton?:boolean
}

export default function BudgetCard( {id, name, amount, max, gray, showAddExpenseModal, showButton}: BudgetProps) {
  const [confirmDeleteBudgetId, setConfirmDeleteBudgetId] = useState<string>("")
  const [isViewExpenseModalOpen, setIsViewExpenseModalOpen] = useState<boolean>(false)
  const [isPieChartOpen, setIsPieChartOpen] = useState<boolean>(false)
  const {deleteBudget} = useBudget() || {}

  function handleConfirmDelete(budgetID: string): void {
    deleteBudget!(budgetID)
    setConfirmDeleteBudgetId("")
  }

  // 設定整個Card的背景色
  const ClassNames: string[] = []
  if (amount > max) {
    ClassNames.push("bg-danger", "bg-opacity-10")
  } else if (gray) {
    ClassNames.push("bg-light")
  }

  return (
    <>
    <Card className={ClassNames.join(" ")} style={{boxSizing:"border-box"}}>
      <Card.Body className="p-4 d-flex flex-column justify-content-between" style={{minHeight:"190px", maxHeight:"190px"}}>
        {
          id !== "total" && (
            <button type="button" className="btn-close position-absolute top-0 end-0" 
            aria-label="Close" onClick={() => setConfirmDeleteBudgetId(id)}></button>
          )
        }
        <Modal show={confirmDeleteBudgetId === id} onHide={() => setConfirmDeleteBudgetId("")}>
            <Modal.Header className='bg-light' closeButton>
                <Modal.Title>確認刪除--<span className='fw-bold'>{name.length > 5 ? (name.slice(0, 5) + "...") : name}</span></Modal.Title>
            </Modal.Header>
            <Modal.Body className='bg-light'>
                確定要刪除整筆預算嗎? 包括其中的所有花費! 刪除後無法復原喔
            </Modal.Body>
            <Modal.Footer className='bg-light'>
                <Button variant="secondary" onClick={() => setConfirmDeleteBudgetId("")}>取消</Button>
                <Button variant="danger" onClick={() => handleConfirmDelete(id)}>確定</Button>
            </Modal.Footer>
        </Modal>
        <Card.Title className="d-flex justify-content-between align-items-baseline fw-normal mb-3">
          <div className="me-2 fw-bold">{name}</div>
          <div className="d-flex align-items-baseline">
            <span style={{color:`var(${getColor(amount, max)})`}}>{currencyFormatter.format(amount)}</span>
            {
              // 如果沒有設定budget，就不會顯示budget，只會顯示amount
              max>0 && (<span className="text-muted fs-6 ms-1">
              / {currencyFormatter.format(max)}
            </span>)
            }
          </div>
        </Card.Title>
        {
          // 如果budget為0，就不會顯示progress bar
          max>0 && (<ProgressBar className="rounded-pill" variant={getVariant(amount, max)}
          min={0} max={max} now={amount} />)
        }
        
        <Stack direction="horizontal" gap={2} className="mt-4">
          {
            showButton === false ? 
            <Button variant="outline-primary" className="ms-auto" 
            onClick={() => setIsPieChartOpen(true)}>檢視圖表</Button> :
            <Button variant="outline-primary" className="ms-auto" 
            onClick={() => showAddExpenseModal!(id)}>新增花費</Button>
          }
          <Button variant="outline-secondary" onClick={() => setIsViewExpenseModalOpen(true)}>細項</Button>
        </Stack>
      </Card.Body>
    </Card>
    <ViewExpensesModal show={isViewExpenseModalOpen} budgetID={id} handleClose={() => setIsViewExpenseModalOpen(false)!}/>
    <PieChart show={isPieChartOpen} handleClose={()=>setIsPieChartOpen(false)}/>
    </>
  )
}

// 判斷amount跟max之間的大小決定文字和progressBar的顏色
function getColor(amount: number, max: number): string {
  if (amount > 0 && amount > max) return "--bs-danger"
  return "--bs-emphasis-color"
}

function getVariant(amount: number, max: number): string {
  const ratio = amount / max

  if (ratio < 0.5) return "success"
  if (ratio < 0.8) return "warning"
  return "danger"
}
