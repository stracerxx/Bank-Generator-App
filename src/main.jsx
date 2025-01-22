import React, { useState, useCallback } from 'react';
    import ReactDOM from 'react-dom/client';
    import { jsPDF } from 'jspdf';

    function App() {
      const [bankName, setBankName] = useState('');
      const [accountHolderName, setAccountHolderName] = useState('');
      const [accountNumber, setAccountNumber] = useState('');
      const [transactions, setTransactions] = useState([]);
      const [renderTrigger, setRenderTrigger] = useState(false);

      const handleInputChange = (e, setter) => {
        setter(e.target.value);
      };

      const handleAddTransaction = () => {
         setTransactions(prevTransactions => [
          ...prevTransactions,
          { date: '', description: '', type: 'debit', amount: '' },
        ]);
      };

      const handleGenerateStatement = () => {
        const doc = new jsPDF();
        doc.text('Bank Statement', 10, 10);
        doc.save('bank_statement.pdf');
      };

      const handleGenerateTransactions = useCallback(() => {
        const newTransactions = [];
        for (let i = 0; i < 5; i++) {
          newTransactions.push({
            date: '1/1/2024',
            description: 'Test Transaction',
            type: 'debit',
            amount: 100,
          });
        }
         setTransactions(newTransactions);
         setRenderTrigger(prev => !prev);
      }, [setTransactions, setRenderTrigger]);

      const handleTransactionChange = (index, field, value) => {
        const updatedTransactions = [...transactions];
        updatedTransactions[index][field] = value;
        setTransactions(updatedTransactions);
      };

      return (
        <div>
          <h1>Bank Statement Generator</h1>
          <div className="form-group">
            <label>Bank Name</label>
            <input
              type="text"
              value={bankName}
              onChange={(e) => handleInputChange(e, setBankName)}
            />
          </div>
          <div className="form-group">
            <label>Account Holder Name</label>
            <input
              type="text"
              value={accountHolderName}
              onChange={(e) => handleInputChange(e, setAccountHolderName)}
            />
          </div>
          <div className="form-group">
            <label>Account Number</label>
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => handleInputChange(e, setAccountNumber)}
            />
          </div>
          <div className="form-group">
            <label>Transactions</label>
            {transactions.map((transaction, index) => (
              <div key={index} style={{ marginBottom: '10px' }}>
                <input
                  type="text"
                  placeholder="Date"
                  value={transaction.date}
                  onChange={(e) => handleTransactionChange(index, 'date', e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Description"
                  value={transaction.description}
                  onChange={(e) => handleTransactionChange(index, 'description', e.target.value)}
                />
                <select
                  value={transaction.type}
                  onChange={(e) => handleTransactionChange(index, 'type', e.target.value)}
                >
                  <option value="debit">Debit</option>
                  <option value="credit">Credit</option>
                </select>
                <input
                  type="number"
                  placeholder="Amount"
                  value={transaction.amount}
                  onChange={(e) => handleTransactionChange(index, 'amount', e.target.value)}
                />
              </div>
            ))}
            <button type="button" onClick={handleAddTransaction}>
              Add Transaction
            </button>
          </div>
          <button onClick={handleGenerateTransactions}>Generate Transactions</button>
          <button onClick={handleGenerateStatement}>Generate Statement</button>
        </div>
      );
    }

    ReactDOM.createRoot(document.getElementById('root')).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    );
