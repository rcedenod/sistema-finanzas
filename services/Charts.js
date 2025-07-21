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
        
        let chartContainer = targetElement.querySelector('.expenses-chart-container');
        if (!chartContainer) {
            chartContainer = document.createElement('div');
            chartContainer.classList.add('expenses-chart-container');
            chartContainer.style.width = '100%';
            chartContainer.style.height = '100%';
            chartContainer.style.display = 'flex';
            chartContainer.style.justifyContent = 'center';
            chartContainer.style.alignItems = 'center';

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

        let chartContainer = targetElement.querySelector('.incomes-chart-container');
        if (!chartContainer) {
            chartContainer = document.createElement('div');
            chartContainer.classList.add('incomes-chart-container');
            chartContainer.style.width = '100%';
            chartContainer.style.height = '100%';
            chartContainer.style.display = 'flex';
            chartContainer.style.justifyContent = 'center';
            chartContainer.style.alignItems = 'center';
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

    async genIncomeExpenseBarChart(targetElement, month, year) {
        const chartId = `incomeExpenseBarChart-${targetElement.id}`;
        if (this._chartInstances[chartId]) {
            this._chartInstances[chartId].destroy();
            delete this._chartInstances[chartId];
        }

        const canvas = document.createElement('canvas');
        canvas.id = chartId;
        
        let chartContainer = targetElement.querySelector('.income-expense-chart-container');
        if (!chartContainer) {
            chartContainer = document.createElement('div');
            chartContainer.classList.add('income-expense-chart-container');
            chartContainer.style.width = '100%';
            chartContainer.style.height = '100%';
            chartContainer.style.display = 'flex';
            chartContainer.style.justifyContent = 'center';
            chartContainer.style.alignItems = 'center';

            targetElement.appendChild(chartContainer);
        }
        chartContainer.innerHTML = '';
        chartContainer.appendChild(canvas);

        const ctx = canvas.getContext('2d');

        try {
            const allTransactions = await this._db.getTransactions();
            const currentYear = new Date().getFullYear(); // Usar el año actual para el filtro

            const transactionsForMonth = allTransactions.filter(t => {
                const transactionDate = new Date(t.date);
                return (transactionDate.getMonth() + 1) === month &&
                       transactionDate.getFullYear() === currentYear;
            });

            let totalIncomes = 0;
            let totalExpenses = 0;

            console.log(`📊 Total de transacciones encontradas para el mes ${month} del ${year}:`, transactionsForMonth.length);

            transactionsForMonth.forEach(transaction => {
                if (transaction.type === 'income') {
                    totalIncomes += transaction.amount;
                } else if (transaction.type === 'expense') {
                    totalExpenses += transaction.amount;
                }
            });

            console.log(`💰 Total de Ingresos para ${this._getMonthName(month - 1)} ${year}:`, totalIncomes.toFixed(2));
            console.log(`💸 Total de Egresos para ${this._getMonthName(month - 1)} ${year}:`, totalExpenses.toFixed(2));


            const monthName = this._getMonthName(month - 1);
            const chartTitle = `Ingresos vs. Egresos - ${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`;

            if (totalIncomes === 0 && totalExpenses === 0) {
                chartContainer.innerHTML = '<p class="no-chart-data-message">No hay ingresos ni egresos registrados para este mes.</p>';
                return;
            }

            this._chartInstances[chartId] = new window.Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['Ingresos', 'Egresos'],
                    datasets: [{
                        label: `En ${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`,
                        data: [totalIncomes, totalExpenses],
                        backgroundColor: [
                            'rgba(75, 192, 192, 0.8)',
                            'rgba(255, 99, 132, 0.8)'
                        ],
                        borderColor: [
                            'rgba(75, 192, 192, 1)',
                            'rgba(255, 99, 132, 1)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        },
                        title: {
                            display: true,
                            text: chartTitle,
                            font: {
                                size: 16
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Monto (Bs.)'
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            }
                        }
                    }
                }
            });

        } catch (error) {
            console.error('Error al cargar los datos del gráfico de ingresos vs. egresos:', error);
        }
    }


    async genBalanceEvolutionLineChart(targetElement, currentYear) {
        const chartId = `balanceEvolutionLineChart-${targetElement.id}`;
        if (this._chartInstances[chartId]) {
            this._chartInstances[chartId].destroy();
            delete this._chartInstances[chartId];
        }

        const canvas = document.createElement('canvas');
        canvas.id = chartId;
        
        let chartContainer = targetElement.querySelector('.balance-evolution-chart-container');
        if (!chartContainer) {
            chartContainer = document.createElement('div');
            chartContainer.classList.add('balance-evolution-chart-container');
            chartContainer.style.width = '100%';
            chartContainer.style.height = '100%';
            chartContainer.style.display = 'flex';
            chartContainer.style.justifyContent = 'center';
            chartContainer.style.alignItems = 'center';

            targetElement.appendChild(chartContainer);
        }
        chartContainer.innerHTML = '';
        chartContainer.appendChild(canvas);

        const ctx = canvas.getContext('2d');

        try {
            const allTransactions = await this._db.getTransactions();
            const monthlyBalances = new Array(12).fill(0); 

            allTransactions.forEach(transaction => {
                const transactionDate = new Date(transaction.date);
                if (transactionDate.getFullYear() === currentYear) {
                    const monthIndex = transactionDate.getMonth();
                    if (transaction.type === 'income') {
                        monthlyBalances[monthIndex] += transaction.amount;
                    } else if (transaction.type === 'expense') {
                        monthlyBalances[monthIndex] -= transaction.amount;
                    }
                }
            });

            const monthLabels = [
                'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
                'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
            ];
            
            const currentMonthIndex = new Date().getMonth();
            const visibleMonthLabels = monthLabels.slice(0, currentMonthIndex + 1);
            const visibleMonthlyBalances = monthlyBalances.slice(0, currentMonthIndex + 1);

            if (visibleMonthlyBalances.every(balance => balance === 0)) {
                chartContainer.innerHTML = '<p class="no-chart-data-message">No hay datos de balance para mostrar este año.</p>';
                return;
            }

            this._chartInstances[chartId] = new window.Chart(ctx, {
                type: 'line',
                data: {
                    labels: visibleMonthLabels,
                    datasets: [{
                        label: 'Balance mensual',
                        data: visibleMonthlyBalances,
                        borderColor: 'rgba(54, 162, 235, 1)',
                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                        tension: 0.3,
                        fill: true,
                        pointBackgroundColor: 'rgba(54, 162, 235, 1)',
                        pointBorderColor: '#fff',
                    }]
                },
                options: {
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: false,
                            title: {
                                display: true,
                                text: 'Balance (Bs.)'
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Mes'
                            }
                        }
                    }
                }
            });

        } catch (error) {
            console.error('Error al cargar los datos del gráfico de evolución del balance:', error);
        }
    }
}