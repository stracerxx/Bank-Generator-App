import React, { useState } from 'react';
    import { jsPDF } from 'jspdf';

    function App() {
      const [bankName, setBankName] = useState('');
      const [bankLogo, setBankLogo] = useState(null);
      const [accountHolderName, setAccountHolderName] = useState('');
      const [accountNumber, setAccountNumber] = useState('');
      const [startDate, setStartDate] = useState('');
      const [endDate, setEndDate] = useState('');
      const [openingBalance, setOpeningBalance] = useState('');
      const [closingBalance, setClosingBalance] = useState('');
      const [transactions, setTransactions] = useState([]);
      const [currencySymbol, setCurrencySymbol] = useState('$');
      const [paperSize, setPaperSize] = useState('a4');
      const [showPreview, setShowPreview] = useState(false);
      const [watermark, setWatermark] = useState(false);
      const [bankAddress, setBankAddress] = useState('');

      const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setBankLogo(reader.result);
          };
          reader.readAsDataURL(file);
        }
      };

      const handleAddTransaction = () => {
        setTransactions([
          ...transactions,
          { date: '', description: '', type: 'debit', amount: '' },
        ]);
      };

      const handleTransactionChange = (index, field, value) => {
        const updatedTransactions = [...transactions];
        updatedTransactions[index][field] = value;
        setTransactions(updatedTransactions);
      };

      const handleRemoveTransaction = (index) => {
        const updatedTransactions = transactions.filter((_, i) => i !== index);
        setTransactions(updatedTransactions);
      };

      const handleGenerateStatement = () => {
        setShowPreview(true);
      };

      const handleGeneratePDF = () => {
        const doc = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: paperSize,
        });

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 10;
        let yPosition = margin;
        let pageNumber = 1;

        const addPageHeader = () => {
          if (bankLogo) {
            doc.addImage(bankLogo, 'PNG', margin, yPosition, 30, 15);
          }
          doc.setFontSize(18);
          doc.text(bankName, margin + 35, yPosition + 10);
          doc.setFontSize(12);
          doc.text(`Account Holder: ${accountHolderName}`, pageWidth - 80, yPosition + 10);
          doc.text(`Account Number: ${accountNumber}`, pageWidth - 80, yPosition + 16);
          yPosition += 25;
          doc.setFontSize(12);
          doc.text(`Statement Period: ${startDate} - ${endDate}`, margin, yPosition);
          yPosition += 10;
        };

        const addPageFooter = () => {
          doc.setFontSize(8);
          doc.text(
            'This statement is for entertainment and movie production purposes only.',
            margin,
            pageHeight - 10,
          );
          doc.text(`Page ${pageNumber} of 4`, pageWidth - margin - 20, pageHeight - 10);
        };

        addPageHeader();

        // Account Summary
        doc.setFontSize(14);
        doc.text('Account Summary', margin, yPosition);
        yPosition += 10;
        const summaryData = [
          { label: 'Beginning balance', value: openingBalance },
          {
            label: 'Deposits and other additions',
            value: transactions
              .filter((t) => t.type === 'credit')
              .reduce((sum, t) => sum + parseFloat(t.amount), 0)
              .toFixed(2),
          },
          {
            label: 'ATM and debit card subtractions',
            value: transactions
              .filter((t) => t.type === 'debit')
              .reduce((sum, t) => sum + parseFloat(t.amount), 0)
              .toFixed(2),
          },
          { label: 'Other subtractions', value: '0.00' },
          { label: 'Checks', value: '0.00' },
          { label: 'Service fees', value: '0.00' },
          { label: 'Ending balance', value: closingBalance },
        ];

        summaryData.forEach((item) => {
          if (yPosition > pageHeight - 40) {
            doc.addPage({
              orientation: 'portrait',
              unit: 'mm',
              format: paperSize,
            });
            yPosition = margin;
            addPageHeader();
            pageNumber++;
          }
          doc.setFontSize(12);
          doc.text(`${item.label}:`, margin, yPosition);
          doc.text(
            `${currencySymbol}${parseFloat(item.value).toFixed(2)}`,
            pageWidth - 80,
            yPosition,
          );
          yPosition += 7;
        });

        yPosition += 10;

        // Transaction Categories
        const categories = [
          {
            title: 'Deposits and other additions',
            type: 'credit',
          },
          {
            title: 'ATM and debit card subtractions',
            type: 'debit',
          },
          {
            title: 'Other subtractions',
            type: 'debit',
          },
          {
            title: 'Checks',
            type: 'debit',
          },
        ];

        categories.forEach((category) => {
          if (yPosition > pageHeight - 40) {
            doc.addPage({
              orientation: 'portrait',
              unit: 'mm',
              format: paperSize,
            });
            yPosition = margin;
            addPageHeader();
            pageNumber++;
          }
          doc.setFontSize(14);
          doc.text(category.title, margin, yPosition);
          yPosition += 10;

          const filteredTransactions = transactions.filter(
            (t) => t.type === category.type,
          );

          filteredTransactions.forEach((transaction) => {
            if (yPosition > pageHeight - 40) {
              doc.addPage({
                orientation: 'portrait',
                unit: 'mm',
                format: paperSize,
              });
              yPosition = margin;
              addPageHeader();
              pageNumber++;
            }
            doc.setFontSize(12);
            doc.text(transaction.date, margin, yPosition);
            doc.text(transaction.description, margin + 30, yPosition);
            doc.text(
              `${currencySymbol}${parseFloat(transaction.amount).toFixed(2)}`,
              pageWidth - 80,
              yPosition,
            );
            yPosition += 7;
          });
        });

        // Social Links
        if (pageNumber === 1) {
          yPosition += 10;
          doc.setFontSize(12);
          doc.text("Let's connect on Facebook, Twitter & Google+", margin, yPosition);
          yPosition += 10;
          doc.text('f /bankofamerica', margin, yPosition);
          yPosition += 7;
          doc.text('@bofa_tips', margin, yPosition);
          yPosition += 7;
          doc.text('+ bankofamerica', margin, yPosition);
        }

        addPageFooter();

        // Watermark
        if (watermark) {
          const watermarkText = 'FOR MOVIE PROP USE ONLY';
          const textWidth = doc.getTextWidth(watermarkText);
          const textHeight = doc.getTextDimensions(watermarkText).h;
          doc.setFontSize(30);
          doc.setTextColor(200, 0, 0);
          doc.text(
            watermarkText,
            pageWidth / 2 - textWidth / 2,
            pageHeight / 2 + textHeight / 2,
            { angle: -45 },
          );
        }

        doc.save('bank_statement.pdf');
      };

      const handleRandomizeTransactions = () => {
        const randomTransactions = [];
        const numTransactions = Math.floor(Math.random() * 10) + 5;
        const descriptions = [
          'Grocery Store',
          'Online Payment',
          'Salary Deposit',
          'Restaurant',
          'Gas Station',
          'ATM Withdrawal',
          'Utility Bill',
          'Rent Payment',
          'Shopping',
          'Transfer',
        ];

        for (let i = 0; i < numTransactions; i++) {
          const randomDate = `${Math.floor(Math.random() * 28) + 1}/${
            Math.floor(Math.random() * 12) + 1
          }/2024`;
          const randomDescription =
            descriptions[Math.floor(Math.random() * descriptions.length)];
          const randomType = Math.random() > 0.5 ? 'debit' : 'credit';
          const randomAmount = (Math.random() * 1000).toFixed(2);
          randomTransactions.push({
            date: randomDate,
            description: randomDescription,
            type: randomType,
            amount: randomAmount,
          });
        }
        setTransactions(randomTransactions);
      };

      return (
        <div className="container">
          <h1>Bank Statement Generator</h1>
          <div className="form-group">
            <label>Bank Name</label>
            <input
              type="text"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Bank Address</label>
            <input
              type="text"
              value={bankAddress}
              onChange={(e) => setBankAddress(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Bank Logo</label>
            <input type="file" accept="image/*" onChange={handleLogoUpload} />
          </div>
          <div className="form-group">
            <label>Account Holder Name</label>
            <input
              type="text"
              value={accountHolderName}
              onChange={(e) => setAccountHolderName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Account Number</label>
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Statement Start Date</label>
            <input
              type="text"
              placeholder="dd/mm/yyyy"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Statement End Date</label>
            <input
              type="text"
              placeholder="dd/mm/yyyy"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Opening Balance</label>
            <input
              type="number"
              value={openingBalance}
              onChange={(e) => setOpeningBalance(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Closing Balance</label>
            <input
              type="number"
              value={closingBalance}
              onChange={(e) => setClosingBalance(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Currency Symbol</label>
            <select
              value={currencySymbol}
              onChange={(e) => setCurrencySymbol(e.target.value)}
            >
              <option value="$">$</option>
              <option value="€">€</option>
              <option value="£">£</option>
            </select>
          </div>
          <div className="form-group">
            <label>Paper Size</label>
            <select
              value={paperSize}
              onChange={(e) => setPaperSize(e.target.value)}
            >
              <option value="a4">A4</option>
              <option value="letter">Letter</option>
            </select>
          </div>
          <div className="form-group">
            <label>Transactions</label>
            {transactions.map((transaction, index) => (
              <div key={index} style={{ marginBottom: '10px' }}>
                <input
                  type="text"
                  placeholder="Date"
                  value={transaction.date}
                  onChange={(e) =>
                    handleTransactionChange(index, 'date', e.target.value)
                  }
                />
                <input
                  type="text"
                  placeholder="Description"
                  value={transaction.description}
                  onChange={(e) =>
                    handleTransactionChange(index, 'description', e.target.value)
                  }
                />
                <select
                  value={transaction.type}
                  onChange={(e) =>
                    handleTransactionChange(index, 'type', e.target.value)
                  }
                >
                  <option value="debit">Debit</option>
                  <option value="credit">Credit</option>
                </select>
                <input
                  type="number"
                  placeholder="Amount"
                  value={transaction.amount}
                  onChange={(e) =>
                    handleTransactionChange(index, 'amount', e.target.value)
                  }
                />
                <button type="button" onClick={() => handleRemoveTransaction(index)}>
                  Remove
                </button>
              </div>
            ))}
            <button type="button" onClick={handleAddTransaction}>
              Add Transaction
            </button>
          </div>
          <div className="button-group">
            <button onClick={handleRandomizeTransactions}>
              Randomize Transactions
            </button>
            <button onClick={handleGenerateStatement}>Preview Statement</button>
            <button onClick={handleGeneratePDF}>Generate PDF</button>
            <label>
              <input
                type="checkbox"
                checked={watermark}
                onChange={() => setWatermark(!watermark)}
              />
              Add Watermark
            </label>
          </div>
          {showPreview && (
            <div className="statement-preview">
              {watermark && <div className="watermark">FOR MOVIE PROP USE ONLY</div>}
              <div className="statement-header">
                <div className="statement-header-left">
                  {bankLogo && <img src={bankLogo} alt="Bank Logo" />}
                  <p>{bankAddress}</p>
                  <p>
                    {accountHolderName}
                  </p>
                </div>
                <div className="statement-header-right">
                  <div className="statement-title">Your BofA Core Checking</div>
                  <p className="statement-account-number">
                    Account Number: {accountNumber}
                  </p>
                </div>
              </div>
              <p>
                for {startDate} to {endDate}
              </p>
              <div className="transaction-categories">
                <div className="transaction-category">
                  <h3>Deposits and other additions</h3>
                  <table className="statement-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Description</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions
                        .filter((t) => t.type === 'credit')
                        .map((transaction, index) => (
                          <tr key={index}>
                            <td>{transaction.date}</td>
                            <td>{transaction.description}</td>
                            <td>
                              {currencySymbol}
                              {parseFloat(transaction.amount).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
                <div className="transaction-category">
                  <h3>ATM and debit card subtractions</h3>
                  <table className="statement-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Description</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions
                        .filter((t) => t.type === 'debit')
                        .map((transaction, index) => (
                          <tr key={index}>
                            <td>{transaction.date}</td>
                            <td>{transaction.description}</td>
                            <td>
                              {currencySymbol}
                              {parseFloat(transaction.amount).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
                <div className="transaction-category">
                  <h3>Other subtractions</h3>
                  <table className="statement-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Description</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>N/A</td>
                        <td>N/A</td>
                        <td>{currencySymbol}0.00</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="transaction-category">
                  <h3>Checks</h3>
                  <table className="statement-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Description</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>N/A</td>
                        <td>N/A</td>
                        <td>{currencySymbol}0.00</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="statement-summary">
                <p>
                  Opening Balance: {currencySymbol}
                  {parseFloat(openingBalance).toFixed(2)}
                </p>
                <p>
                  Total Debits:{' '}
                  {currencySymbol}
                  {transactions
                    .filter((t) => t.type === 'debit')
                    .reduce((sum, t) => sum + parseFloat(t.amount), 0)
                    .toFixed(2)}
                </p>
                <p>
                  Total Credits:{' '}
                  {currencySymbol}
                  {transactions
                    .filter((t) => t.type === 'credit')
                    .reduce((sum, t) => sum + parseFloat(t.amount), 0)
                    .toFixed(2)}
                </p>
                <p>
                  Closing Balance: {currencySymbol}
                  {parseFloat(closingBalance).toFixed(2)}
                </p>
              </div>
              <div className="social-links">
                <p>Let's connect on Facebook, Twitter & Google+</p>
                <a href="https://www.facebook.com/bankofamerica">f /bankofamerica</a>
                <a href="https://twitter.com/bofa_tips">@bofa_tips</a>
                <a href="https://plus.google.com/bankofamerica">+ bankofamerica</a>
              </div>
              <div className="important-info">
                <p>
                  This statement is for entertainment and movie production purposes
                  only.
                </p>
              </div>
            </div>
          )}
        </div>
      );
    }

    export default App;
