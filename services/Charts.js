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
            const transactionsForMonth = allTransactions.filter(t => {
                const transactionDate = new Date(t.date);
                return (transactionDate.getMonth() + 1) === month &&
                       transactionDate.getFullYear() === year;
            });

            let totalIncomes = 0;
            let totalExpenses = 0;

            console.log(`Total de transacciones encontradas para el mes ${month} del ${year}:`, transactionsForMonth.length);

            transactionsForMonth.forEach(transaction => {
                if (transaction.type === 'income') {
                    totalIncomes += transaction.amount;
                } else if (transaction.type === 'expense') {
                    totalExpenses += transaction.amount;
                }
            });

            console.log(`Total de ingresos para ${this._getMonthName(month - 1)} ${year}:`, totalIncomes.toFixed(2));
            console.log(`Total de egresos para ${this._getMonthName(month - 1)} ${year}:`, totalExpenses.toFixed(2));


            const monthName = this._getMonthName(month - 1);
            const chartTitle = `Ingresos vs. Egresos - ${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`;

            if (totalIncomes === 0 && totalExpenses === 0) {
                chartContainer.innerHTML = '<p class="no-chart-data-message">No hay ingresos ni egresos registrados para este mes/año.</p>';
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
                        tension: 0.5,
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

async genBudgetComparisonChart(targetElement, month, year) {
    if (this._chartInstances[`budget-comparison-${targetElement.id}`]) {
        this._chartInstances[`budget-comparison-${targetElement.id}`].destroy();
        delete this._chartInstances[`budget-comparison-${targetElement.id}`];
    }

    const canvas = document.createElement('canvas');
    canvas.id = `budgetComparisonChart-${targetElement.id}`;
    targetElement.innerHTML = '';
    targetElement.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    try {
        const budgets = await this._db.getBudgetsByMonthYear(month, year);
        const allTransactions = await this._db.getTransactions();
        const allCategories = await this._db.getCategories();
        const categoryMap = new Map(allCategories.map(cat => [cat.id, cat.name]));

        const labels = [];
        const estimatedData = [];
        const actualData = [];
        const backgroundColorsEstimated = [];
        const backgroundColorsActual = [];

        budgets.forEach(budget => {
            const categoryName = categoryMap.get(budget.categoryId);
            if (categoryName) {
                labels.push(categoryName);
                estimatedData.push(budget.amount);

                const actualExpenses = allTransactions
                    .filter(t => {
                        const transactionDate = new Date(t.date);
                        return t.type === 'expense' &&
                               t.categoryId === budget.categoryId &&
                               transactionDate.getMonth() + 1 === month &&
                               transactionDate.getFullYear() === year;
                    })
                    .reduce((sum, t) => sum + t.amount, 0);
                actualData.push(actualExpenses);

                const r = Math.floor(Math.random() * 150) + 100;
                const g = Math.floor(Math.random() * 150) + 100;
                const b = Math.floor(Math.random() * 150) + 100;

                backgroundColorsEstimated.push(`rgba(${r}, ${g}, ${b}, 0.6)`);
                backgroundColorsActual.push(`rgba(${r - 50}, ${g - 50}, ${b - 50}, 0.8)`);
            }
        });

        if (labels.length === 0) {
            targetElement.innerHTML = '<p class="no-chart-data-message">No hay datos de presupuesto para este mes/año.</p>';
            return;
        }

        const monthName = this._getMonthName(month - 1);
        const chartTitle = `Presupuesto vs. Gasto Real - ${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`;

        this._chartInstances[`budget-comparison-${targetElement.id}`] = new window.Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Estimado',
                        data: estimatedData,
                        backgroundColor: backgroundColorsEstimated,
                        borderColor: backgroundColorsEstimated.map(color => color.replace('0.6', '1')),
                        borderWidth: 1
                    },
                    {
                        label: 'Real',
                        data: actualData,
                        backgroundColor: backgroundColorsActual,
                        borderColor: backgroundColorsActual.map(color => color.replace('0.8', '1')),
                        borderWidth: 1
                    }
                ]
            },
            options: {
                maintainAspectRatio: false,
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
                        title: {
                            display: true,
                            text: 'Categoría'
                        }
                    }
                }
            }
        });

    } catch (error) {
        console.error('Error al cargar el gráfico de comparación de presupuestos:', error);
    }
}

    async genMonthlyExpenseProjection(targetElement, currentMonth, currentYear) {
        if (this._chartInstances[`expense-projection-${targetElement.id}`]) {
            this._chartInstances[`expense-projection-${targetElement.id}`].destroy();
            delete this._chartInstances[`expense-projection-${targetElement.id}`];
        }

        const canvas = document.createElement('canvas');
        canvas.id = `expenseProjectionChart-${targetElement.id}`;
        targetElement.innerHTML = '';
        targetElement.appendChild(canvas);
        const ctx = canvas.getContext('2d');

        try {
            const monthsToShow = 6;
            const labels = [];
            const estimatedTotals = [];
            const actualTotals = [];

            for (let i = -monthsToShow; i <= monthsToShow; i++) {
                const date = new Date(currentYear, currentMonth - 1 + i, 1);
                const month = date.getMonth() + 1;
                const year = date.getFullYear();
                labels.push(this._getMonthName(month - 1).charAt(0).toUpperCase() + this._getMonthName(month - 1).slice(1) + ' ' + year);

                const budgets = await this._db.getBudgetsByMonthYear(month, year);
                const totalEstimated = budgets.reduce((sum, b) => sum + b.amount, 0);
                estimatedTotals.push(totalEstimated);

                const transactions = await this._db.getTransactions();
                const actualExpenses = transactions
                    .filter(t => {
                        const transactionDate = new Date(t.date);
                        return t.type === 'expense' &&
                            transactionDate.getMonth() + 1 === month &&
                            transactionDate.getFullYear() === year;
                    })
                    .reduce((sum, t) => sum + t.amount, 0);
                actualTotals.push(actualExpenses);
            }

            if (labels.length === 0) {
                targetElement.innerHTML = '<p class="no-chart-data-message">No hay datos para la proyección de egresos.</p>';
                return;
            }

            this._chartInstances[`expense-projection-${targetElement.id}`] = new window.Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Egresos estimados',
                            data: estimatedTotals,
                            borderColor: 'rgb(75, 192, 192)',
                            backgroundColor: 'rgba(75, 192, 192, 0.2)',
                            fill: false,
                            tension: 0.1
                        },
                        {
                            label: 'Egresos reales',
                            data: actualTotals,
                            borderColor: 'rgb(255, 99, 132)',
                            backgroundColor: 'rgba(255, 99, 132, 0.2)',
                            fill: false,
                            tension: 0.1
                        }
                    ]
                },
                options: {
                    maintainAspectRatio: false,
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
                            text: 'Proyección mensual de egresos (estimados vs. reales)',
                            font: {
                                size: 14
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
                            title: {
                                display: true,
                                text: 'Mes y Año'
                            }
                        }
                    }
                }
            });

        } catch (error) {
            console.error('Error al cargar el gráfico de proyección de egresos:', error);
        }
    }

    async genExpensesComparativeBarChart(targetElement, currentMonth, currentYear) {
        const chartId = `expensesComparativeBarChart-${targetElement.id}`;
        if (this._chartInstances[chartId]) {
            this._chartInstances[chartId].destroy();
            delete this._chartInstances[chartId];
        }

        const canvas = document.createElement('canvas');
        canvas.id = chartId;
        
        let chartContainer = targetElement.querySelector('.expenses-comparative-chart-container');
        if (!chartContainer) {
            chartContainer = document.createElement('div');
            chartContainer.classList.add('expenses-comparative-chart-container');
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
            const allBudgets = await this._db.getBudgets();

            const monthLabels = [
                'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
                'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
            ];

            const realExpensesByMonth = new Array(12).fill(0);
            const estimatedExpensesByMonth = new Array(12).fill(0);

            allTransactions.filter(t => {
                const transactionDate = new Date(t.date);
                return t.type === 'expense' && transactionDate.getFullYear() === currentYear;
            }).forEach(expense => {
                const monthIndex = new Date(expense.date).getMonth();
                realExpensesByMonth[monthIndex] += expense.amount;
            });
            console.log('Egresos Reales por Mes (todos):', realExpensesByMonth);

            allBudgets.filter(b => b.year === currentYear)
            .forEach(budget => {
                const monthIndex = budget.month - 1;
                if (monthIndex >= 0 && monthIndex < 12) {
                    estimatedExpensesByMonth[monthIndex] += budget.amount;
                } else {
                    console.warn(`Presupuesto con mes inválido o ausente:`, budget);
                }
            });
            console.log('Egresos Estimados por mes (todos):', estimatedExpensesByMonth);

            const chartLabels = monthLabels;
            const chartRealExpenses = realExpensesByMonth;
            const chartEstimatedExpenses = estimatedExpensesByMonth;

            if (chartRealExpenses.every(val => val === 0) && chartEstimatedExpenses.every(val => val === 0)) {
                chartContainer.innerHTML = '<p class="no-chart-data-message">No hay datos de egresos para comparar este año.</p>';
                return;
            }
            
            const chartTitle = `Comparación de egresos (reales vs. estimados) - ${currentYear}`;

            this._chartInstances[chartId] = new window.Chart(ctx, {
                type: 'bar',
                data: {
                    labels: chartLabels,
                    datasets: [
                        {
                            label: 'Egresos reales',
                            data: chartRealExpenses,
                            backgroundColor: 'rgba(255, 99, 132, 0.8)',
                            borderColor: 'rgba(255, 99, 132, 1)',
                            borderWidth: 1,
                            borderRadius: 5,
                        },
                        {
                            label: 'Egresos estimados',
                            data: chartEstimatedExpenses,
                            backgroundColor: 'rgba(54, 162, 235, 0.8)',
                            borderColor: 'rgba(54, 162, 235, 1)',
                            borderWidth: 1,
                            borderRadius: 5, 
                        }
                    ]
                },
                options: {
                    maintainAspectRatio: false,
                    responsive: true,
                    indexAxis: 'y',
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
                            title: {
                                display: true,
                                text: 'Mes'
                            },
                            grid: {
                                display: false
                            }
                        }
                    }
                }
            });

        } catch (error) {
            console.error('Error al cargar los datos del gráfico de comparación de egresos:', error);
        }
    }
}