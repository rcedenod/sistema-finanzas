import { Input } from '../components/Input.js';
import { Select } from '../components/Select.js';
import { Button } from '../components/Button.js';

export class Budgets {
    _container = null;
    _db = null;
    _charts = null;
    _categories = [];
    _budgets = [];
    _cssPath = './views/styles/Budgets.css';

    _budgetMonthSelect = null;
    _budgetYearInput = null;
    _budgetCategorySelect = null;
    _budgetAmountInput = null;
    _saveBudgetButton = null;

    _budgetsListContainer = null;
    _currentEditingBudgetId = null;

    _budgetChartsContainer = null;
    _chartMonthSelect = null;
    _chartYearInput = null;

    _filterCategorySelect = null;
    _filterMonthSelect = null;
    _filterYearInput = null;
    _applyFilterButton = null;
    _clearFilterButton = null;


    _currentMonth = new Date().getMonth() + 1;
    _currentYear = new Date().getFullYear();

    constructor(container, db, charts) {
        if (!(container instanceof HTMLElement)) {
            throw new Error('Budgets: el container debe ser un elemento HTML válido.');
        }
        if (!db) {
            throw new Error('Budgets: la instancia de IndexedDB es requerida.');
        }
        if (!charts) {
            throw new Error('Budgets: la instancia de Charts es requerida.');
        }

        this._container = container;
        this._db = db;
        this._charts = charts;
        this._loadCSS(this._cssPath);

        document.addEventListener('transactionsUpdated', () => {
            this.loadBudgets();
            this.updateBudgetCharts();
        });
        document.addEventListener('categoryDeleted', async (event) => {
            const { categoryId } = event.detail;
            await this.handleCategoryDeleted(categoryId);
        });
        document.addEventListener('categoriesUpdated', async () => {
            await this.loadCategories();
            await this.loadBudgets();
            this.updateBudgetCharts();
        });
    }

    _loadCSS(path) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = path;
        document.head.appendChild(link);
    }

    async loadCategories() {
        try {
            this._categories = await this._db.getCategories();
            this.updateCategorySelects();
        } catch (error) {
            console.error('Error al cargar categorías para presupuestos:', error);
            alert('Error al cargar las categorías. No podrá gestionar presupuestos.');
        }
    }

    async loadBudgets(filters = {}) {
        try {
            this._budgets = await this._db.getBudgets(filters);
            this.renderBudgetsList();
        } catch (error) {
            console.error('Error al cargar presupuestos:', error);
            alert('Error al cargar los presupuestos. Por favor, intente de nuevo.');
        }
    }

    render() {
        this._container.innerHTML = '';

        const budgetsView = document.createElement('div');
        budgetsView.classList.add('budgets-grid-container');

        const headerArea = document.createElement('div');
        headerArea.classList.add('header');
        const title = document.createElement('h2');
        title.textContent = 'Gestión de presupuestos';
        headerArea.appendChild(title);
        budgetsView.appendChild(headerArea);

        const budgetFormArea = document.createElement('div');
        budgetFormArea.classList.add('budget-form-area');

        const formArea = document.createElement('div');
        formArea.classList.add('form-area');
        const formTitle = document.createElement('h3');
        formTitle.textContent = 'Establecer presupuesto';
        formArea.appendChild(formTitle);

        const monthOptions = [];
        const monthNames = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        monthNames.forEach((name, index) => {
            monthOptions.push({ value: (index + 1).toString(), text: name });
        });
        const budgetMonthWrapper = document.createElement('div');
        this._budgetMonthSelect = new Select(budgetMonthWrapper, {
            items: monthOptions,
            selectedValue: this._currentMonth.toString(),
            styles: { width: '100%', marginBottom: '10px' },
        });
        formArea.appendChild(this._budgetMonthSelect.render());

        const budgetYearWrapper = document.createElement('div');
        this._budgetYearInput = new Input(budgetYearWrapper, {
            placeholder: 'Año (ej: 2025)',
            type: 'number',
            value: this._currentYear.toString(),
            styles: { width: '89%', marginBottom: '10px' },
        });
        formArea.appendChild(this._budgetYearInput.render());

        const budgetCategoryWrapper = document.createElement('div');
        formArea.appendChild(budgetCategoryWrapper);
        this._budgetCategorySelect = new Select(budgetCategoryWrapper, {
            items: [],
            styles: { width: '95%', marginBottom: '10px' },
            placeholder: 'Seleccione una categoría',
        });
        this._budgetCategorySelect.render();

        const budgetAmountWrapper = document.createElement('div');
        this._budgetAmountInput = new Input(budgetAmountWrapper, {
            placeholder: 'Monto estimado (ej: 500.00)',
            type: 'number',
            step: '0.01',
            styles: { width: '89%', marginBottom: '10px' },
        });
        formArea.appendChild(this._budgetAmountInput.render());

        const saveButtonWrapper = document.createElement('div');
        this._saveBudgetButton = new Button(saveButtonWrapper, {
            text: 'Guardar',
            styles: { width: '100%', padding: '10px' },
            onClick: () => this.handleAddOrUpdateBudget(),
        });
        formArea.appendChild(this._saveBudgetButton.render());
        budgetFormArea.appendChild(formArea);

        const searchArea = document.createElement('div');
        searchArea.classList.add('search-area');
        const searchTitle = document.createElement('h3');
        searchTitle.textContent = 'Filtrar presupuestos';
        searchArea.appendChild(searchTitle);

        const filterCategoryWrapper = document.createElement('div');
        searchArea.appendChild(filterCategoryWrapper);
        this._filterCategorySelect = new Select(filterCategoryWrapper, {
            items: [{ value: '', text: 'Todas las categorías' }],
            styles: { width: '100%', marginBottom: '10px' },
            placeholder: 'Categoría',
        });
        this._filterCategorySelect.render();

        const filterMonthWrapper = document.createElement('div');
        searchArea.appendChild(filterMonthWrapper);
        this._filterMonthSelect = new Select(filterMonthWrapper, {
            items: [{ value: '', text: 'Todos los meses' }, ...monthOptions],
            selectedValue: '',
            styles: { width: '100%', marginBottom: '10px' },
            placeholder: 'Mes',
        });
        this._filterMonthSelect.render();

        const filterYearWrapper = document.createElement('div');
        searchArea.appendChild(filterYearWrapper);
        this._filterYearInput = new Input(filterYearWrapper, {
            placeholder: 'Año (ej: 2025)',
            type: 'number',
            styles: { width: '89%', marginBottom: '10px' },
        });
        this._filterYearInput.render();

        const applyFilterButtonWrapper = document.createElement('div');
        this._applyFilterButton = new Button(applyFilterButtonWrapper, {
            text: 'Aplicar',
            styles: { width: '100%', padding: '10px', marginTop: '10px' },
            onClick: () => this.applyFilters(),
        });
        searchArea.appendChild(this._applyFilterButton.render());

        const clearFilterButtonWrapper = document.createElement('div');
        this._clearFilterButton = new Button(clearFilterButtonWrapper, {
            text: 'Limpiar',
            styles: { width: '100%', padding: '10px', marginTop: '5px', backgroundColor: '#6c757d' },
            onClick: () => this.clearFilters(),
        });
        searchArea.appendChild(this._clearFilterButton.render());

        budgetFormArea.appendChild(searchArea);
        budgetsView.appendChild(budgetFormArea);

        const listArea = document.createElement('div');
        listArea.classList.add('budget-list-area');
        const listTitle = document.createElement('h3');
        listTitle.textContent = 'Presupuestos registrados';
        listArea.appendChild(listTitle);

        this._budgetsListContainer = document.createElement('ul');
        this._budgetsListContainer.classList.add('budgets-list');
        listArea.appendChild(this._budgetsListContainer);
        budgetsView.appendChild(listArea);

        const chartsArea = document.createElement('div');
        chartsArea.classList.add('budget-charts-area');

        const chartControlsContainer = document.createElement('div');
        chartControlsContainer.classList.add('chart-controls');

        const chartMonthWrapper = document.createElement('div');
        const chartYearWrapper = document.createElement('div');

        this._chartMonthSelect = new Select(chartMonthWrapper, {
            items: monthOptions,
            selectedValue: this._currentMonth.toString(),
            styles: { width: '100%', marginBottom: '10px' },
            onChange: (e) => this._handleChartMonthYearChange(e.target.value, this._chartYearInput.getValue())
        });
        chartControlsContainer.appendChild(this._chartMonthSelect.render());

        this._chartYearInput = new Input(chartYearWrapper, {
            placeholder: 'Año',
            type: 'number',
            value: this._currentYear.toString(),
            styles: { width: '95%', marginBottom: '10px' },
            onInput: (e) => this._handleChartMonthYearChange(this._chartMonthSelect.getValue(), e.target.value)
        });
        chartControlsContainer.appendChild(this._chartYearInput.render());
        chartsArea.appendChild(chartControlsContainer);

        this._budgetChartsContainer = document.createElement('div');
        this._budgetChartsContainer.id = 'budget-charts-display';
        this._budgetChartsContainer.classList.add('charts-display');
        chartsArea.appendChild(this._budgetChartsContainer);
        budgetsView.appendChild(chartsArea);

        this._container.appendChild(budgetsView);

        this.loadCategories();
        this.loadBudgets();
        this.updateBudgetCharts();
    }

    updateCategorySelects() {
        const categoryOptions = [{ value: '', text: 'Todas las categorías' }];
        this._categories.forEach(cat => {
            categoryOptions.push({ value: cat.id, text: cat.name });
        });

        this._budgetCategorySelect.remove();
        const budgetCategoryWrapper = this._budgetCategorySelect.container;
        this._budgetCategorySelect = new Select(budgetCategoryWrapper, {
            items: categoryOptions.filter(opt => opt.value !== ''),
            styles: { width: '100%', marginBottom: '10px' },
            placeholder: 'Seleccione una categoría',
        });
        budgetCategoryWrapper.appendChild(this._budgetCategorySelect.render());

        if (categoryOptions.filter(opt => opt.value !== '').length > 0) {
            this._budgetCategorySelect.setValue(categoryOptions.filter(opt => opt.value !== '')[0].value);
        }

        this._filterCategorySelect.remove();
        const filterCategoryWrapper = this._filterCategorySelect.container;
        this._filterCategorySelect = new Select(filterCategoryWrapper, {
            items: categoryOptions,
            styles: { width: '100%', marginBottom: '10px' },
            placeholder: 'Categoría',
        });
        filterCategoryWrapper.appendChild(this._filterCategorySelect.render());
        this._filterCategorySelect.setValue('');
    }

    async renderBudgetsList() {
        if (!this._budgetsListContainer) return;

        this._budgetsListContainer.innerHTML = '';

        if (this._budgets.length === 0) {
            const noBudgetsMessage = document.createElement('li');
            noBudgetsMessage.textContent = 'No hay presupuestos registrados que coincidan con los filtros.';
            noBudgetsMessage.classList.add('no-budgets-message');
            this._budgetsListContainer.appendChild(noBudgetsMessage);
            return;
        }

        const allTransactions = await this._db.getTransactions();

        this._budgets.forEach(budget => {
            const listItem = document.createElement('li');
            listItem.classList.add('budget-item');

            const monthName = new Date(budget.year, budget.month - 1).toLocaleString('es-ES', { month: 'long' });
            const categoryName = this._categories.find(cat => cat.id === budget.categoryId)?.name;

            if (!categoryName) {
                return;
            }

            const actualExpenses = allTransactions
                .filter(t => {
                    const transactionDate = new Date(t.date);
                    return t.type === 'expense' &&
                        t.categoryId === budget.categoryId &&
                        transactionDate.getMonth() + 1 === budget.month &&
                        transactionDate.getFullYear() === budget.year;
                })
                .reduce((sum, t) => sum + t.amount, 0);

            const deviation = actualExpenses - budget.amount;
            let deviationClass = '';
            let deviationText = '';

            if (deviation > 0) {
                deviationClass = 'deviation-over';
                deviationText = ` (+Bs. ${deviation.toFixed(2)})`;
            } else if (deviation < 0) {
                deviationClass = 'deviation-under';
                deviationText = ` (-Bs. ${Math.abs(deviation).toFixed(2)})`;
            } else {
                deviationClass = 'deviation-ok';
                deviationText = ' (Exacto)';
            }

            listItem.innerHTML = `
                <div class="budget-details">
                    <span class="budget-period">Mes: ${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${budget.year}</span>
                    <span class="budget-category">Categoría: ${categoryName}</span>
                    <span class="budget-estimated">Estimado: Bs. ${budget.amount.toFixed(2)}</span>
                    <span class="budget-actual">Real: Bs. ${actualExpenses.toFixed(2)}</span>
                    <span class="budget-deviation ${deviationClass}">Desviación: ${deviationText}</span>
                </div>
                <div class="budget-actions">
                    <a href="#" class="edit-budget-link" data-id="${budget.id}">Editar</a>
                    <a href="#" class="delete-budget-link" data-id="${budget.id}">Eliminar</a>
                </div>
            `;

            listItem.querySelector('.edit-budget-link').addEventListener('click', (e) => {
                e.preventDefault();
                this.handleEditBudget(budget.id);
            });
            listItem.querySelector('.delete-budget-link').addEventListener('click', (e) => {
                e.preventDefault();
                this.handleDeleteBudget(budget.id, categoryName, monthName, budget.year);
            });

            this._budgetsListContainer.appendChild(listItem);
        });
    }

    async handleAddOrUpdateBudget() {
        const month = parseInt(this._budgetMonthSelect.getValue(), 10);
        const year = parseInt(this._budgetYearInput.getValue(), 10);
        const categoryId = parseInt(this._budgetCategorySelect.getValue(), 10);
        const amount = parseFloat(this._budgetAmountInput.getValue());

        if (!month || !year || !categoryId || isNaN(amount) || amount <= 0) {
            alert('Por favor, complete todos los campos de presupuesto: mes, año, categoría y monto (debe ser positivo).');
            return;
        }

        const budgetData = {
            month,
            year,
            categoryId,
            amount
        };

        try {
            if (this._currentEditingBudgetId) {
                budgetData.id = this._currentEditingBudgetId;
                await this._db.updateBudget(budgetData);
                alert('Presupuesto actualizado exitosamente.');
                this._currentEditingBudgetId = null;
            } else {
                const existingBudget = this._budgets.find(b =>
                    b.month === month && b.year === year && b.categoryId === categoryId
                );
                if (existingBudget) {
                    alert('Ya existe un presupuesto para esta categoría en el mes y año seleccionados. Por favor, edítelo en la lista.');
                    return;
                }
                await this._db.addBudget(budgetData);
                alert('Presupuesto registrado exitosamente.');
            }
            this.clearForm();
            await this.loadBudgets();
            this.updateBudgetCharts();
        } catch (error) {
            console.error('Error al guardar presupuesto:', error);
            alert('Error al guardar el presupuesto. Por favor, intente de nuevo.');
        }
    }

    handleEditBudget(id) {
        if (this._currentEditingBudgetId !== null) {
            this.clearForm();
        }

        const budgetToEdit = this._budgets.find(b => b.id === id);

        if (budgetToEdit) {
            this._currentEditingBudgetId = id;
            this._budgetMonthSelect.setValue(budgetToEdit.month.toString());
            this._budgetYearInput.setValue(budgetToEdit.year.toString());
            this._budgetCategorySelect.setValue(budgetToEdit.categoryId.toString());
            this._budgetAmountInput.setValue(budgetToEdit.amount);

            this._saveBudgetButton.setText('Actualizar Presupuesto');
        } else {
            alert('Presupuesto no encontrado para editar.');
        }
    }

    async handleDeleteBudget(id, categoryName, monthName, year) {
        const confirmDelete = confirm(`¿Estás seguro de que deseas eliminar el presupuesto de "${categoryName}" para ${monthName} de ${year}?`);

        if (confirmDelete) {
            try {
                await this._db.deleteBudget(id);
                alert('Presupuesto eliminado exitosamente.');
                await this.loadBudgets();
                this.updateBudgetCharts();
            } catch (error) {
                console.error('Error al eliminar presupuesto:', error);
                alert('Hubo un error al intentar eliminar el presupuesto. Por favor, inténtalo de nuevo.');
            }
        }
    }

    async handleCategoryDeleted(deletedCategoryId) {
        console.log(`Budgets: Categoría eliminada detectada: ${deletedCategoryId}. Eliminando presupuestos asociados...`);
        try {
            const budgetsToDelete = this._budgets.filter(
                budget => budget.categoryId === deletedCategoryId
            );

            if (budgetsToDelete.length > 0) {
                console.log(`Encontrados ${budgetsToDelete.length} presupuestos asociados a la categoría ${deletedCategoryId}.`);
                for (const budget of budgetsToDelete) {
                    await this._db.deleteBudget(budget.id);
                    console.log(`Presupuesto con ID ${budget.id} eliminado.`);
                }
                alert(`Se han eliminado ${budgetsToDelete.length} presupuestos asociados a la categoría eliminada.`);
                await this.loadBudgets();
                this.updateBudgetCharts();
            } else {
                console.log(`No se encontraron presupuestos asociados a la categoría ${deletedCategoryId}.`);
            }
            await this.loadCategories();
        } catch (error) {
            console.error('Error al eliminar presupuestos asociados a la categoría:', error);
            alert('Hubo un error al eliminar presupuestos asociados a la categoría. Por favor, inténtalo de nuevo.');
        }
    }

    clearForm() {
        this._budgetMonthSelect.setValue(this._currentMonth.toString());
        this._budgetYearInput.setValue(this._currentYear.toString());
        if (this._categories.length > 0) {
            const validCategories = this._categories.filter(cat => cat.id !== '');
            if (validCategories.length > 0) {
                this._budgetCategorySelect.setValue(validCategories[0].id);
            } else {
                this._budgetCategorySelect.setValue('');
            }
        } else {
            this._budgetCategorySelect.setValue('');
        }
        this._budgetAmountInput.setValue('');
        this._currentEditingBudgetId = null;
        this._saveBudgetButton.setText('Guardar');
    }

    async applyFilters() {
        const filters = {};
        const categoryId = this._filterCategorySelect.getValue();
        const month = this._filterMonthSelect.getValue();
        const year = this._filterYearInput.getValue();

        if (categoryId !== '') {
            filters.categoryId = parseInt(categoryId, 10);
        }
        if (month !== '') {
            filters.month = parseInt(month, 10);
        }
        if (year !== '') {
            filters.year = parseInt(year, 10);
        }

        await this.loadBudgets(filters);
    }

    async clearFilters() {
        this._filterCategorySelect.setValue('');
        this._filterMonthSelect.setValue('');
        this._filterYearInput.setValue('');
        await this.loadBudgets();
    }

    _handleChartMonthYearChange(month, year) {
        this._currentMonth = parseInt(month, 10);
        this._currentYear = parseInt(year, 10);
        this.updateBudgetCharts();
    }

    async updateBudgetCharts() {
        if (!this._budgetChartsContainer) return;

        this._budgetChartsContainer.innerHTML = '';

        const month = this._currentMonth;
        const year = this._currentYear;

        const barChartContainer = document.createElement('div');
        barChartContainer.id = 'budget-bar-chart';
        barChartContainer.classList.add('chart-container', 'bar-chart-container');
        this._budgetChartsContainer.appendChild(barChartContainer);

        const projectionChartContainer = document.createElement('div');
        projectionChartContainer.id = 'budget-projection-chart';
        projectionChartContainer.classList.add('chart-container', 'projection-chart-container');
        this._budgetChartsContainer.appendChild(projectionChartContainer);

        await this._charts.genBudgetComparisonChart(barChartContainer, month, year);
        await this._charts.genMonthlyExpenseProjection(projectionChartContainer, month, year);
    }
}