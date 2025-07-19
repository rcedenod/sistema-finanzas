import { Input } from '../components/Input.js';
import { Select } from '../components/Select.js';
import { Textarea } from '../components/Textarea.js';
import { Button } from '../components/Button.js';

export class Transactions {
    _container = null;
    _db = null;
    _transactions = [];
    _categories = [];
    _cssPath = './views/styles/Transactions.css';

    _transactionTypeSelect = null;
    _transactionAmountInput = null;
    _transactionDateInput = null;
    _transactionCategorySelect = null;
    _transactionDescriptionTextarea = null;
    _addTransactionButton = null;
    _filterTypeSelect = null;
    _filterCategorySelect = null;
    _searchTextInput = null;

    _transactionsListContainer = null;
    _currentEditingTransactionId = null;

    constructor(container, db) {
        if (!(container instanceof HTMLElement)) {
            throw new Error('Transactions: el container debe ser un elemento HTML válido.');
        }
        if (!db) {
            throw new Error('Transactions: la instancia de IndexedDB es requerida.');
        }

        this._container = container;
        this._db = db;
        this._loadCSS(this._cssPath);

        document.addEventListener('transactionsUpdated', () => {
            this.loadTransactions();
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
            console.error('Error al cargar categorías para transacciones:', error);
            alert('Error al cargar las categorías. No podrá registrar transacciones.');
        }
    }

    async loadTransactions() {
        try {
            this._transactions = await this._db.getTransactions();
            this._transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
            this.renderTransactionsList();
        } catch (error) {
            console.error('Error al cargar transacciones:', error);
            alert('Error al cargar las transacciones. Por favor, intente de nuevo.');
        }
    }

    async filterAndSearchTransactions() {
        const type = this._filterTypeSelect.getValue();
        const categoryValue = this._filterCategorySelect.getValue();
        const searchTerm = this._searchTextInput.getValue().trim();

        let filterCategoryId = null;
        if (categoryValue && categoryValue !== 'all') {
            const parsedId = parseInt(categoryValue, 10);
            if (!isNaN(parsedId)) {
                filterCategoryId = parsedId;
            } else {
                console.warn('Invalid category ID received from filter select:', categoryValue);
            }
        }
        const filterType = type === 'all' ? null : type;

        try {
            let filteredTransactions = await this._db.getTransactionsFiltered(filterType, filterCategoryId, searchTerm);

            filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

            this._transactions = filteredTransactions;
            this.renderTransactionsList();
        } catch (error) {
            console.error('Error al filtrar y buscar transacciones:', error);
            alert('Error al aplicar filtros y búsqueda.');
        }
    }

    render() {
        this._container.innerHTML = '';

        const container = document.createElement('div');
        container.classList.add('container');

        const headerArea = document.createElement('div');
        headerArea.classList.add('header');
        const title = document.createElement('h2');
        title.textContent = 'Gestión de transacciones';
        headerArea.appendChild(title);
        container.appendChild(headerArea);

        const registerArea = document.createElement('div');
        registerArea.classList.add('register');
        const formTitle = document.createElement('h3');
        formTitle.textContent = 'Información de la transacción';
        registerArea.appendChild(formTitle);

        const typeWrapper = document.createElement('div');
        registerArea.appendChild(typeWrapper);
        this._transactionTypeSelect = new Select(typeWrapper, {
            items: [
                { value: 'income', text: 'Ingreso' },
                { value: 'expense', text: 'Egreso' }
            ],
            selectedValue: 'expense',
            styles: { width: '100%', marginBottom: '10px' },
        });

        const amountWrapper = document.createElement('div');
        registerArea.appendChild(amountWrapper);
        this._transactionAmountInput = new Input(amountWrapper, {
            placeholder: 'Monto (ej: 100.50)',
            type: 'number',
            step: '0.01',
            styles: { width: '95%', marginBottom: '10px' },
        });

        const dateWrapper = document.createElement('div');
        registerArea.appendChild(dateWrapper);
        this._transactionDateInput = new Input(dateWrapper, {
            type: 'date',
            value: new Date().toISOString().slice(0, 10),
            styles: { width: '95%', marginBottom: '10px' },
        });

        const categoryWrapper = document.createElement('div');
        registerArea.appendChild(categoryWrapper);
        this._transactionCategorySelect = new Select(categoryWrapper, {
            items: [],
            styles: { width: '100%', marginBottom: '10px' },
        });

        const descriptionWrapper = document.createElement('div');
        registerArea.appendChild(descriptionWrapper);
        this._transactionDescriptionTextarea = new Textarea(descriptionWrapper, {
            placeholder: 'Descripción (opcional)',
            styles: { width: '100%', marginBottom: '10px', minHeight: '60px' },
        });

        const addButtonWrapper = document.createElement('div');
        registerArea.appendChild(addButtonWrapper);
        this._addTransactionButton = new Button(addButtonWrapper, {
            text: 'Guardar',
            styles: { width: '100%', padding: '10px' },
            onClick: () => this.handleAddOrUpdateTransaction(),
        });

        container.appendChild(registerArea);

        const filtersArea = document.createElement('div');
        filtersArea.classList.add('filters');
        const filterTitle = document.createElement('h3');
        filterTitle.textContent = 'Filtrar transacciones';
        filtersArea.appendChild(filterTitle);

        const filterTypeWrapper = document.createElement('div');
        filtersArea.appendChild(filterTypeWrapper);
        this._filterTypeSelect = new Select(filterTypeWrapper, {
            items: [
                { value: 'all', text: 'Todos los tipos' },
                { value: 'income', text: 'Ingresos' },
                { value: 'expense', text: 'Egresos' }
            ],
            selectedValue: 'all',
            styles: { width: '100%', marginBottom: '10px' },
            onChange: () => this.filterAndSearchTransactions()
        });
        this._filterTypeSelect.render();

        const filterCategoryWrapper = document.createElement('div');
        filtersArea.appendChild(filterCategoryWrapper);
        this._filterCategorySelect = new Select(filterCategoryWrapper, {
            items: [{ value: 'all', text: 'Todas las categorías' }],
            styles: { width: '100%', marginBottom: '10px' },
            onChange: () => this.filterAndSearchTransactions()
        });
        this._filterCategorySelect.render();

        const searchInputWrapper = document.createElement('div');
        filtersArea.appendChild(searchInputWrapper);
        this._searchTextInput = new Input(searchInputWrapper, {
            placeholder: 'Buscar por descripción o categoría',
            styles: { width: '95%', marginBottom: '10px' },
            onInput: () => this.filterAndSearchTransactions()
        });
        this._searchTextInput.render();
        container.appendChild(filtersArea);

        const contentArea = document.createElement('div');
        contentArea.classList.add('content');
        const listTitle = document.createElement('h3');
        listTitle.textContent = 'Transacciones registradas';
        contentArea.appendChild(listTitle);

        this._transactionsListContainer = document.createElement('ul');
        this._transactionsListContainer.classList.add('transactions-list');
        contentArea.appendChild(this._transactionsListContainer);
        container.appendChild(contentArea);

        this._container.appendChild(container);

        this.loadCategories();
        this.loadTransactions();

        return container;
    }

    updateCategorySelects() {
        const categoryOptions = [{ value: 'all', text: 'Todas las categorías' }];
        const formCategoryOptions = [];

        this._categories.forEach(cat => {
            categoryOptions.push({ value: cat.id, text: cat.name });
            formCategoryOptions.push({ value: cat.id, text: cat.name });
        });

        this._transactionCategorySelect.remove();
        const formCategoryWrapper = this._transactionCategorySelect.container;
        this._transactionCategorySelect = new Select(formCategoryWrapper, {
            items: formCategoryOptions,
            styles: { width: '100%', marginBottom: '10px' },
        });
        formCategoryWrapper.appendChild(this._transactionCategorySelect.render());

        this._filterCategorySelect.remove();
        const filterCategoryWrapper = this._filterCategorySelect.container;
        this._filterCategorySelect = new Select(filterCategoryWrapper, {
            items: categoryOptions,
            selectedValue: 'all',
            styles: { width: '100%', marginBottom: '10px' },
            onChange: () => this.filterAndSearchTransactions()
        });
        filterCategoryWrapper.appendChild(this._filterCategorySelect.render());
    }

    renderTransactionsList() {
        if (!this._transactionsListContainer) return;

        this._transactionsListContainer.innerHTML = '';

        if (this._transactions.length === 0) {
            const noTransactionsMessage = document.createElement('li');
            noTransactionsMessage.textContent = 'No hay transacciones para mostrar.';
            noTransactionsMessage.classList.add('no-transactions-message');
            this._transactionsListContainer.appendChild(noTransactionsMessage);
            return;
        }

        this._transactions.forEach(transaction => {
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

            let displayContent = `
                <div class="transaction-details">
                    <span class="transaction-type">${transaction.type === 'income' ? 'Ingreso' : 'Egreso'}</span>
                    <span class="transaction-amount">Bs. ${transaction.amount.toFixed(2)}</span>
                    <span class="transaction-date">${dateDisplay}</span>
                    <span class="transaction-category">Categoría: ${categoryName}</span>
                    <p class="transaction-description">${transaction.description || 'Sin descripción'}</p>
                </div>
                <div class="transaction-actions">
                    <a href="#" class="edit-transaction-link" data-id="${transaction.id}">Editar</a>
                    <a href="#" class="delete-transaction-link" data-id="${transaction.id}">Eliminar</a>
                </div>
            `;
            listItem.innerHTML = displayContent;

            listItem.querySelector('.edit-transaction-link').addEventListener('click', (e) => {
                e.preventDefault();
                this.handleEditTransaction(transaction.id);
            });
            listItem.querySelector('.delete-transaction-link').addEventListener('click', (e) => {
                e.preventDefault();
                this.handleDeleteTransaction(transaction.id, transaction.amount, transaction.type, categoryName);
            });

            this._transactionsListContainer.appendChild(listItem);
        });
    }

    async handleAddOrUpdateTransaction() {
        const type = this._transactionTypeSelect.getValue();
        const amount = parseFloat(this._transactionAmountInput.getValue());
        const dateInput = this._transactionDateInput.getValue(); // 'YYYY-MM-DD'
        const categoryId = parseInt(this._transactionCategorySelect.getValue(), 10);
        const description = this._transactionDescriptionTextarea.getValue().trim();

        if (!type || isNaN(amount) || amount <= 0 || !dateInput || !categoryId) {
            alert('Por favor, complete todos los campos obligatorios: Tipo, Monto (debe ser positivo), Fecha y Categoría.');
            return;
        }

        const selectedCategory = this._categories.find(cat => cat.id === categoryId);
        if (!selectedCategory) {
            alert('Categoría seleccionada no válida.');
            return;
        }

        const now = new Date();
        const selectedDate = new Date(dateInput);
        selectedDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
        const fullDateTime = selectedDate.toISOString();

        const transactionData = {
            type,
            amount,
            date: fullDateTime,
            categoryId,
            categoryName: selectedCategory.name,
            description
        };

        try {
            if (this._currentEditingTransactionId) {
                const originalTransaction = this._transactions.find(t => t.id === this._currentEditingTransactionId);
                
                transactionData.date = originalTransaction.date;
                transactionData.isEdited = true;
                
                transactionData.id = this._currentEditingTransactionId;
                await this._db.updateTransaction(transactionData);
                alert('Transacción actualizada exitosamente.');
                this._currentEditingTransactionId = null;
            } else {
                await this._db.addTransaction(transactionData);
                alert('Transacción registrada exitosamente.');
            }
            this.clearForm();
            await this.loadTransactions();
            this.filterAndSearchTransactions();
        } catch (error) {
            console.error('Error al guardar transacción:', error);
            alert('Error al guardar la transacción. Por favor, intente de nuevo.');
        }
    }

    async handleEditTransaction(id) {
        if (this._currentEditingTransactionId !== null) {
            this.clearForm();
        }

        const transactionToEdit = this._transactions.find(t => t.id === id);

        if (transactionToEdit) {
            this._currentEditingTransactionId = id;
            this._transactionTypeSelect.setValue(transactionToEdit.type);
            this._transactionAmountInput.setValue(transactionToEdit.amount);
            this._transactionDateInput.setValue(transactionToEdit.date.slice(0, 10));
            this._transactionCategorySelect.setValue(transactionToEdit.categoryId);
            this._transactionDescriptionTextarea.setValue(transactionToEdit.description);
        } else {
            alert('Transacción no encontrada para editar.');
        }
    }

    async handleDeleteTransaction(id, amount, type, categoryName) {
        const confirmDelete = confirm(`¿Estás seguro de que deseas eliminar la transacción de ${type === 'income' ? 'Ingreso' : 'Egreso'} de Bs. ${amount.toFixed(2)} en la categoría "${categoryName}"?`);

        if (confirmDelete) {
            try {
                await this._db.deleteTransaction(id);
                alert('Transacción eliminada exitosamente.');
                await this.loadTransactions();
                this.filterAndSearchTransactions();
            } catch (error) {
                console.error('Error al eliminar transacción:', error);
                alert('Hubo un error al intentar eliminar la transacción. Por favor, inténtalo de nuevo.');
            }
        }
    }

    clearForm() {
        this._transactionTypeSelect.setValue('expense');
        this._transactionAmountInput.setValue('');
        this._transactionDateInput.setValue(new Date().toISOString().slice(0, 10));
        if (this._categories.length > 0) {
            this._transactionCategorySelect.setValue(this._categories[0].id);
        } else {
            this._transactionCategorySelect.setValue('');
        }
        this._transactionDescriptionTextarea.setValue('');
        this._currentEditingTransactionId = null;

        const addButton = this._container.querySelector('.register .button');
        if (addButton) {
            addButton.textContent = 'Guardar';
        }
    }
}