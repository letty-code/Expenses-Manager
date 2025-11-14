
    class ExpenseManager {
      constructor() {
        this.income = 0;
        this.expenses = [];
        this.init();
      }

      init() {
        this.loadData();
        this.attachEventListeners();
        this.updateUI();
      }

      attachEventListeners() {
        document.getElementById('setIncomeBtn').addEventListener('click', () => this.setIncome());
        document.getElementById('addCategoryBtn').addEventListener('click', () => this.addCategory());
        document.getElementById('calculateBtn').addEventListener('click', () => this.calculate());
        document.getElementById('resetBtn').addEventListener('click', () => this.reset());
        document.getElementById('incomeInput').addEventListener('input', () => this.saveData());
      }

      setIncome() {
        const input = document.getElementById('incomeInput');
        const value = parseFloat(input.value);
        
        if (isNaN(value) || value <= 0) {
          this.showNotification('Please enter a valid income amount', 'warning');
          return;
        }

        this.income = value;
        this.saveData();
        this.updateStats();
        this.showNotification('Income updated successfully! 🎉', 'success');
      }

      addCategory() {
        const select = document.getElementById('categorySelect');
        const category = select.value;

        if (!category) {
          this.showNotification('Please select a category', 'warning');
          return;
        }

        if (this.expenses.find(e => e.name === category)) {
          this.showNotification('Category already exists', 'warning');
          return;
        }

        this.expenses.push({
          id: Date.now(),
          name: category,
          amount: 0
        });

        this.saveData();
        this.renderExpenses();
        select.value = '';
        this.showNotification('Category added! ✨', 'success');
      }

      renderExpenses() {
        const container = document.getElementById('expense-list');
        
        if (this.expenses.length === 0) {
          container.innerHTML = `
            <div class="empty-state">
              <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="3" y="3" width="18" height="18" rx="2" stroke-width="2"/>
                <line x1="9" y1="9" x2="15" y2="9" stroke-width="2" stroke-linecap="round"/>
                <line x1="9" y1="13" x2="15" y2="13" stroke-width="2" stroke-linecap="round"/>
                <line x1="9" y1="17" x2="12" y2="17" stroke-width="2" stroke-linecap="round"/>
              </svg>
              <h4>No expenses yet</h4>
              <p>Start tracking by adding a category above</p>
            </div>
          `;
          return;
        }

        container.innerHTML = this.expenses.map(expense => `
          <div class="expense-item">
            <div class="expense-header">
              <div class="expense-name">${expense.name}</div>
              <button class="delete-btn" onclick="expenseManager.deleteExpense(${expense.id})">Delete</button>
            </div>
            <div class="input-group mb-3">
              <input 
                type="number" 
                class="form-control" 
                placeholder="Enter amount"
                value="${expense.amount || ''}"
                onchange="expenseManager.updateExpenseAmount(${expense.id}, this.value)"
              />
              <span class="input-group-text">$</span>
            </div>
            <div class="d-flex align-items-center gap-3">
              <div class="progress flex-grow-1">
                <div class="progress-bar" id="progress-${expense.id}"></div>
              </div>
              <span class="percent-text" id="percent-${expense.id}">0%</span>
            </div>
          </div>
        `).join('');
      }

      updateExpenseAmount(id, value) {
        const expense = this.expenses.find(e => e.id === id);
        if (expense) {
                    expense.amount = parseFloat(value) || 0;
          this.saveData();
          this.updateUI();
        }
      }

      deleteExpense(id) {
        this.expenses = this.expenses.filter(e => e.id !== id);
        this.saveData();
        this.renderExpenses();
        this.updateUI();
        this.showNotification('Expense deleted successfully', 'danger');
      }

      calculate() {
        const totalExpenses = this.expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
        if (this.income <= 0) {
          this.showNotification('Please set your income first', 'warning');
          return;
        }

        const percentUsed = Math.min((totalExpenses / this.income) * 100, 100);
        this.updateCircle(percentUsed);
        this.updateStats();

        this.showNotification('Calculation complete ✅', 'success');
      }

      updateCircle(percent) {
        const circle = document.getElementById('progressCircle');
        const radius = 100;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (percent / 100) * circumference;
        circle.style.strokeDasharray = circumference;
        circle.style.strokeDashoffset = offset;

        document.getElementById('circlePercent').textContent = `${percent.toFixed(1)}%`;
      }

      updateStats() {
        const totalExpenses = this.expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
        const remaining = this.income - totalExpenses;
        const percent = this.income > 0 ? (totalExpenses / this.income) * 100 : 0;

        document.getElementById('stat-income').textContent = `$${this.income.toFixed(2)}`;
        document.getElementById('stat-expenses').textContent = `$${totalExpenses.toFixed(2)}`;
        document.getElementById('stat-remaining').textContent = `$${remaining.toFixed(2)}`;
        document.getElementById('stat-percent').textContent = `${percent.toFixed(1)}%`;
        document.getElementById('remainingAmount').textContent = `$${remaining.toFixed(2)} Remaining`;

        this.expenses.forEach(exp => {
          const percentItem = this.income > 0 ? (exp.amount / this.income) * 100 : 0;
          const bar = document.getElementById(`progress-${exp.id}`);
          const text = document.getElementById(`percent-${exp.id}`);
          if (bar && text) {
            bar.style.width = `${percentItem}%`;
            text.textContent = `${percentItem.toFixed(1)}%`;

            bar.classList.remove('warning', 'danger');
            if (percentItem > 50 && percentItem <= 75) bar.classList.add('warning');
            if (percentItem > 75) bar.classList.add('danger');
          }
        });
      }

      updateUI() {
        this.renderExpenses();
        this.updateStats();
      }

      saveData() {
        localStorage.setItem('expenseData', JSON.stringify({
          income: this.income,
          expenses: this.expenses
        }));
      }

      loadData() {
        const saved = localStorage.getItem('expenseData');
        if (saved) {
          const data = JSON.parse(saved);
          this.income = data.income || 0;
          this.expenses = data.expenses || [];
        }
      }

      reset() {
        localStorage.removeItem('expenseData');
        this.income = 0;
        this.expenses = [];
        this.updateUI();
        this.updateCircle(0);
        this.showNotification('All data reset 🧹', 'danger');
      }

      showNotification(message, type = 'success') {
        const notif = document.createElement('div');
        notif.className = `notification ${type}`;
        notif.innerHTML = `<strong>${message}</strong>`;
        document.body.appendChild(notif);
        setTimeout(() => notif.remove(), 3000);
      }
    }

    const expenseManager = new ExpenseManager();
    window.expenseManager = expenseManager;
 