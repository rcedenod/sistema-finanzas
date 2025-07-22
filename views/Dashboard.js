import { Select } from '../../components/Select.js';

export class Dashboard {
    _container = null;
    _db = null;
    _charts = null;
    _cssPath = './views/styles/Dashboard.css';
    _recentTransactionsListContainer = null;
    _categories = [];
    _graph2Area = null;
    _balanceEvolutionArea = null;
    _monthSelect = null;
    _currentMonth = null;
    _expensesIncomesArea = null;

    constructor(dashboardView, db, charts) {
        if (!(dashboardView instanceof HTMLElement)) {
            throw new Error('Dashboard: el dashboardView debe ser un elemento HTML válido.');
        }
        if (!db) {
            console.warn('Dashboard: la instancia de IndexedDB no fue proporcionada.');
        }
        if (!charts) {
            console.warn('Dashboard: la instancia de Charts no fue proporcionada.');
        }
        this._container = dashboardView;
        this._db = db;
        this._charts = charts;
        this._loadCSS(this._cssPath);

        this._currentMonth = new Date().getMonth() + 1;

        document.addEventListener('transactionsUpdated', async () => {
            console.log('transactionsUpdated event received in Dashboard, refreshing data.');
            await this.loadRecentTransactions();
            await this.renderCharts();
        });
    }

    _loadCSS(path) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = path;
        document.head.appendChild(link);
    }

    async render() {
        this._container.innerHTML = '';

        const dashboardView = document.createElement('div');
        dashboardView.classList.add('dashboardView');

        const headerArea = document.createElement('div');
        headerArea.classList.add('header');
        headerArea.innerHTML = '<h2>Bienvenido a su resumen de finanzas</h2>';
        dashboardView.appendChild(headerArea);

        const recentTransactionsArea = document.createElement('div');
        recentTransactionsArea.classList.add('recent-transactions');
        const recentTransactionsTitle = document.createElement('h3');
        recentTransactionsTitle.textContent = 'Transacciones del mes';
        recentTransactionsArea.appendChild(recentTransactionsTitle);

        this._recentTransactionsListContainer = document.createElement('ul');
        this._recentTransactionsListContainer.classList.add('transactions-list');
        recentTransactionsArea.appendChild(this._recentTransactionsListContainer);
        dashboardView.appendChild(recentTransactionsArea);

        this._expensesIncomesArea = document.createElement('div');
        this._expensesIncomesArea.classList.add('expenses-incomes');
        dashboardView.appendChild(this._expensesIncomesArea);

        const asideArea = document.createElement('div');
        asideArea.classList.add('aside');
        dashboardView.appendChild(asideArea);

        const monthSelectorContainer = document.createElement('div');
        monthSelectorContainer.classList.add('month-selector-container');
        asideArea.appendChild(monthSelectorContainer);

        const monthOptions = [];
        const monthNames = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];

        monthNames.forEach((name, index) => {
            monthOptions.push({ value: (index + 1).toString(), text: name });
        });

        const monthSelectWrapper = document.createElement('div');
        monthSelectWrapper.classList.add('month-select-wrapper');
        this._monthSelect = new Select(monthSelectWrapper, {
            items: monthOptions,
            selectedValue: this._currentMonth.toString(),
            styles: { width: '100%' },
            onChange: (event) => this._handleMonthChange(event.target.value)
        });
        monthSelectorContainer.appendChild(this._monthSelect.render());

        this._balanceEvolutionArea = document.createElement('div');
        this._balanceEvolutionArea.classList.add('balance-evolution');
        dashboardView.appendChild(this._balanceEvolutionArea);

        const graph2Area = document.createElement('div');
        graph2Area.classList.add('graph2');
        dashboardView.appendChild(graph2Area);
        this._graph2Area = graph2Area;

        this._container.appendChild(dashboardView);

        await this.loadCategories();
        await this.loadRecentTransactions();
        await this.renderCharts();

        return dashboardView;
    }

    _handleMonthChange(selectedValue) {
        this._currentMonth = parseInt(selectedValue, 10);
        console.log(`Mes seleccionado: ${this._currentMonth}`);
        this.loadRecentTransactions();
        this.renderCharts();
    }

    async loadCategories() {
        try {
            this._categories = await this._db.getCategories();
        } catch (error) {
            console.error('Error al cargar categorías en Dashboard:', error);
        }
    }

    async loadRecentTransactions() {
        if (!this._recentTransactionsListContainer || !this._db || this._currentMonth === null) {
            console.warn('Dashboard: Contenedor de transacciones, DB o mes no disponibles para cargar recientes.');
            return;
        }

        this._recentTransactionsListContainer.innerHTML = '';

        try {
            const allTransactions = await this._db.getTransactions();
            const currentYear = new Date().getFullYear();

            const transactionsForSelectedMonth = allTransactions.filter(transaction => {
                const transactionDate = new Date(transaction.date);
                return (transactionDate.getMonth() + 1) === this._currentMonth &&
                       transactionDate.getFullYear() === currentYear;
            });

            transactionsForSelectedMonth.sort((a, b) => new Date(b.date) - new Date(a.date));

            if (transactionsForSelectedMonth.length === 0) {
                const noTransactionsMessage = document.createElement('li');
                noTransactionsMessage.textContent = 'No hay transacciones para el mes seleccionado.';
                noTransactionsMessage.classList.add('no-transactions-message');
                this._recentTransactionsListContainer.appendChild(noTransactionsMessage);
                return;
            }

            transactionsForSelectedMonth.forEach(transaction => {
                const listItem = document.createElement('li');
                listItem.classList.add('transaction-item');
                listItem.classList.add(transaction.type === 'income' ? 'income-item' : 'expense-item');

                const categoryName = this._categories.find(cat => cat.id === transaction.categoryId)?.name || 'Desconocida';

                const transactionDateTime = new Date(transaction.date);
                const formattedDate = transactionDateTime.toLocaleDateString('es-ES');
                const formattedTime = transactionDateTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

                let dateDisplay = `${formattedDate} ${formattedTime}`;
                if (transaction.isEdited) {
                    dateDisplay += ' (editado)';
                }

                listItem.innerHTML = `
                    <div class="transaction-details">
                        <span class="transaction-type">${transaction.type === 'income' ? 'Ingreso' : 'Egreso'}</span>
                        <span class="transaction-amount">Bs. ${transaction.amount.toFixed(2)}</span>
                        <span class="transaction-date">${dateDisplay}</span>
                        <span class="transaction-category">Categoría: ${categoryName}</span>
                        <p class="transaction-description">${transaction.description || 'Sin descripción'}</p>
                    </div>
                `;
                this._recentTransactionsListContainer.appendChild(listItem);
            });
        } catch (error) {
            console.error('Error al cargar transacciones del mes en Dashboard:', error);
            const errorMessage = document.createElement('li');
            errorMessage.textContent = 'Error al cargar transacciones del mes.';
            errorMessage.classList.add('no-transactions-message');
            this._recentTransactionsListContainer.appendChild(errorMessage);
        }
    }

    async renderCharts() {
        if (this._charts && this._expensesIncomesArea && this._currentMonth !== null) {
            const currentYear = new Date().getFullYear();

            await this._charts.genIncomeExpenseBarChart(this._expensesIncomesArea, this._currentMonth, currentYear);
            
            if (this._balanceEvolutionArea) {
                await this._charts.genBalanceEvolutionLineChart(this._balanceEvolutionArea, currentYear);
            }
        }
    }
}