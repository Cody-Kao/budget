import { useBudget } from "../../Context/BudgetAndExpense/BudgetAndExpense"
import BudgetCard from "../BudgetCard/BudgetCard"

export default function TotalBudgetAndExpense() {
    const {budgets, expenses} = useBudget() || {}
    const totalBudget= budgets?.reduce((total, budget) => total + budget.max, 0)
    const totalExpense = expenses?.reduce((total, expense) => total + expense.amount, 0)

    return (
        <BudgetCard id={"total"} name="總計" max={totalBudget!}
        amount={totalExpense!} gray={true} showButton={false}/>
    )
}
