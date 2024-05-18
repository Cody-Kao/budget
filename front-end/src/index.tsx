import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import BudgetAndExpenseContext from './Context/BudgetAndExpense/BudgetAndExpense';
import App from './App';
import { StrictMode } from 'react';

ReactDOM.createRoot(
  document.getElementById('root')!
).render(
  <StrictMode>
    <BudgetAndExpenseContext>
      <App />
    </BudgetAndExpenseContext>
  </StrictMode>
);

