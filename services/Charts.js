export class Charts {
    _db = null;
    _chartInstances = {};

    constructor(db) {
        if (!(db)) {
            throw new Error('Charts: Se requiere una instancia válida de IndexedDB. 📊');
        }
        this._db = db;
    }

    _getMonthName(monthIndex) {
        const date = new Date(2000, monthIndex);
        return date.toLocaleString('es-ES', { month: 'long' });
    }

    async genExpensesByMonthCategory(targetElement, month, year) {
        if (this._chartInstances[`expenses-${targetElement.id}`]) {
            this._chartInstances[`expenses-${targetElement.id}`].destroy();
            delete this._chartInstances[`expenses-${targetElement.id}`];
        }

        const canvas = document.createElement('canvas');
        canvas.id = `expensesPieChart-${targetElement.id}`;
        canvas.style.maxWidth = '100%';
        canvas.style.maxHeight = '300px';
        
        let chartContainer = targetElement.querySelector('.expenses-chart-container');
        if (!chartContainer) {
            chartContainer = document.createElement('div');
            chartContainer.classList.add('expenses-chart-container');
            targetElement.appendChild(chartContainer);
        }
        chartContainer.innerHTML = '';
        chartContainer.appendChild(canvas);

        const ctx = canvas.getContext('2d');

        try {
            const allTransactions = await this._db.getTransactions();
            const allCategories = await this._db.getCategories();
            const categoryMap = new Map(allCategories.map(cat => [cat.id, cat.name]));

            const filteredExpenses = allTransactions.filter(t => {
                const transactionDate = new Date(t.date);
                return transactionDate.getMonth() + 1 === month &&
                       transactionDate.getFullYear() === year &&
                       t.type === 'expense';
            });

            const expensesByCategory = {};
            filteredExpenses.forEach(expense => {
                const categoryName = categoryMap.get(expense.categoryId);
                if (expensesByCategory[categoryName]) {
                    expensesByCategory[categoryName] += expense.amount;
                } else {
                    expensesByCategory[categoryName] = expense.amount;
                }
            });

            const labels = Object.keys(expensesByCategory);
            const data = Object.values(expensesByCategory);

            const backgroundColors = labels.map(() => {
                const r = Math.floor(Math.random() * 200) + 50;
                const g = Math.floor(Math.random() * 200) + 50;
                const b = Math.floor(Math.random() * 200) + 50;
                return `rgba(${r}, ${g}, ${b}, 0.8)`;
            });

            if (labels.length === 0) {
                chartContainer.innerHTML = '<p class="no-chart-data-message">No hay egresos registrados para este mes.</p>';
                return;
            }

            const monthName = this._getMonthName(month - 1); 
            const chartTitle = `Egresos - ${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`;

            this._chartInstances[`expenses-${targetElement.id}`] = new window.Chart(ctx, {
                type: 'pie',
                data: {
                    labels: labels,
                    datasets: [{
                        data: data,
                        backgroundColor: backgroundColors
                    }]
                },
                options: {
                    plugins: {
                        legend: {
                            position: 'top',
                            labels: {
                                font: {
                                    size: 12
                                }
                            }
                        },
                        title: {
                            display: true,
                            text: chartTitle,
                            font: {
                                size: 14
                            }
                        }
                    }
                }
            });

        } catch (error) {
            console.error('Error al cargar los datos del gráfico de egresos:', error);
        }
    }

    async genIncomesByMonthCategory(targetElement, month, year) {
        if (this._chartInstances[`incomes-${targetElement.id}`]) {
            this._chartInstances[`incomes-${targetElement.id}`].destroy();
            delete this._chartInstances[`incomes-${targetElement.id}`];
        }

        const canvas = document.createElement('canvas');
        canvas.id = `incomesPieChart-${targetElement.id}`;
        canvas.style.maxWidth = '100%';
        canvas.style.maxHeight = '300px';

        let chartContainer = targetElement.querySelector('.incomes-chart-container');
        if (!chartContainer) {
            chartContainer = document.createElement('div');
            chartContainer.classList.add('incomes-chart-container');
            targetElement.appendChild(chartContainer);
        }
        chartContainer.innerHTML = '';
        chartContainer.appendChild(canvas);

        const ctx = canvas.getContext('2d');

        try {
            const allTransactions = await this._db.getTransactions();
            const allCategories = await this._db.getCategories();
            const categoryMap = new Map(allCategories.map(cat => [cat.id, cat.name]));

            const filteredIncomes = allTransactions.filter(t => {
                const transactionDate = new Date(t.date);
                return transactionDate.getMonth() + 1 === month && 
                       transactionDate.getFullYear() === year &&
                       t.type === 'income';
            });

            const incomesByCategory = {};
            filteredIncomes.forEach(income => {
                const categoryName = categoryMap.get(income.categoryId);
                if (incomesByCategory[categoryName]) {
                    incomesByCategory[categoryName] += income.amount;
                } else {
                    incomesByCategory[categoryName] = income.amount;
                }
            });

            const labels = Object.keys(incomesByCategory);
            const data = Object.values(incomesByCategory);

            const backgroundColors = labels.map(() => {
                const r = Math.floor(Math.random() * 200) + 50;
                const g = Math.floor(Math.random() * 200) + 50;
                const b = Math.floor(Math.random() * 200) + 50;
                return `rgba(${r}, ${g}, ${b}, 0.8)`;
            });

            if (labels.length === 0) {
                chartContainer.innerHTML = '<p class="no-chart-data-message">No hay ingresos registrados para este mes.</p>';
                return;
            }

            const monthName = this._getMonthName(month - 1);
            const chartTitle = `Ingresos - ${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`;

            this._chartInstances[`incomes-${targetElement.id}`] = new window.Chart(ctx, {
                type: 'pie',
                data: {
                    labels: labels,
                    datasets: [{
                        data: data,
                        backgroundColor: backgroundColors
                    }]
                },
                options: {
                    plugins: {
                        legend: {
                            position: 'top',
                            labels: {
                                font: {
                                    size: 12
                                }
                            }
                        },
                        title: {
                            display: true,
                            text: chartTitle,
                            font: {
                                size: 14
                            }
                        }
                    }
                }
            });

        } catch (error) {
            console.error('Error al cargar los datos del gráfico de ingresos:', error);
        }
    }
}