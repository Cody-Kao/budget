import {
  UNCATEGORIZED_BUDGETID,
  useBudget,
} from "../../Context/BudgetAndExpense/BudgetAndExpense";
import BudgetCard from "../BudgetCard/BudgetCard";

export default function UncategorizedBudgetCard({
  budgetName,
  toggleModal,
}: {
  budgetName: string;
  toggleModal: (budgetID: string) => void;
}) {
  const { getBudgetExpenses, budgets } = useBudget() || {};
  const max = budgets?.find(
    (budget) => budget.name === UNCATEGORIZED_BUDGETID
  )?.max;
  console.log(max);
  const amount = getBudgetExpenses!(UNCATEGORIZED_BUDGETID).reduce(
    (total, expense) => {
      return total + expense.amount;
    },
    0
  );

  console.log(UNCATEGORIZED_BUDGETID, "from UncategorizedBudgetCard");
  return (
    <BudgetCard
      id={UNCATEGORIZED_BUDGETID}
      amount={amount}
      max={max!}
      name={budgetName}
      gray={true}
      showAddExpenseModal={toggleModal}
    />
  );
}
