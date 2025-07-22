// views/Categories.js
import { Input } from '../components/Input.js';
import { Button } from '../components/Button.js';
import { Select } from '../components/Select.js';

export class Categories {
    _container = null;
    _db = null;
    _charts = null;
    _categories = [];
    _newCategoryInput = null;
    _editCategoryInput = null;
    _editingCategoryId = null;
    _categoriesListContainer = null;
    _chartCategorySelect = null;
    _cssPath = './views/styles/Categories.css';

    _monthSelect = null;
    _currentMonth = new Date().getMonth() + 1;
    _currentYear = new Date().getFullYear();

    constructor(container, db, charts) {
        if (!(container instanceof HTMLElement)) {
            throw new Error('Categories: el container debe ser un elemento HTML válido.');
        }
        if (!db) {
            throw new Error('Categories: la instancia de IndexedDB es requerida.');
        }
        if (!charts) {
            throw new Error('Categories: la instancia de Charts es requerida.');
        }

        this._container = container;
        this._db = db;
        this._charts = charts;

        this._loadCSS(this._cssPath);

        this.initializeDefaultCategories();
    }

    _loadCSS(path) {
        const existingLink = document.querySelector(`link[href="${path}"]`);
        if (existingLink) {
            console.log(`Stylesheet "${path}" already loaded.`);
            return;
        }

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = path;
        document.head.appendChild(link);
        console.log(`Stylesheet "${path}" loaded.`);
    }

    async initializeDefaultCategories(forceRecreate = false) {
        const predefinedCategories = [
            { id: -1, name: 'Comida', isDefault: true, originalName: 'Comida' },
            { id: -2, name: 'Transporte', isDefault: true, originalName: 'Transporte' },
            { id: -3, name: 'Vivienda', isDefault: true, originalName: 'Vivienda' },
            { id: -4, name: 'Entretenimiento', isDefault: true, originalName: 'Entretenimiento' },
            { id: -5, name: 'Salario', isDefault: true, originalName: 'Salario' },
            { id: -6, name: 'Otros', isDefault: true, originalName: 'Otros' }
        ];

        try {
            for (const predefinedCat of predefinedCategories) {
                const existingCategory = await this._db.getCategoryById(predefinedCat.id);

                if (forceRecreate || !existingCategory) {
                    await this._db.putCategory(predefinedCat);
                    console.log(`Categoría predefinida "${predefinedCat.name}" añadida/recreada.`);
                } else {
                    console.log(`Categoría predefinida "${predefinedCat.name}" (ID ${predefinedCat.id}) ya existe. No se recrea.`);
                }
            }
            this.loadCategories();
        } catch (error) {
            console.error('Error al inicializar categorías predefinidas:', error);
        }
    }

    async loadCategories() {
        try {
            this._categories = await this._db.getCategories();
            this._categories.sort((a, b) => {
                return a.name.localeCompare(b.name);
            });
            this.renderCategoriesList();
            await this._loadChartsForCurrentMonth(this._currentMonth, this._currentYear);
        } catch (error) {
            console.error('Error al cargar categorías:', error);
            alert('Error al cargar las categorías. Por favor, intente de nuevo.');
        }
    }

    genExpensesByMonthCategory
    
    render() {
        this._container.innerHTML = '';

        const categoriesView = document.createElement('div');
        categoriesView.classList.add('categories-grid-container');

        const headerArea = document.createElement('div');
        headerArea.classList.add('header');
        const title = document.createElement('h2');
        title.textContent = 'Gestión de categorías';
        headerArea.appendChild(title);
        categoriesView.appendChild(headerArea);

        const createArea = document.createElement('div');
        createArea.classList.add('create-area');
        const addCategoryTitle = document.createElement('h3');
        addCategoryTitle.textContent = 'Añadir categoría';
        createArea.appendChild(addCategoryTitle);

        const newCategoryInputWrapper = document.createElement('div');
        this._newCategoryInput = new Input(newCategoryInputWrapper, {
            placeholder: 'Nombre de la categoría',
            styles: { width: '96%' },
        });
        createArea.appendChild(this._newCategoryInput.render());

        const addCategoryButtonWrapper = document.createElement('div');
        const addCategoryButton = new Button(addCategoryButtonWrapper, {
            text: 'Guardar',
            styles: {
                width: '100%',
                padding: '10px',
            },
            onClick: () => this.handleAddCategory(),
        });
        createArea.appendChild(addCategoryButton.render());
        categoriesView.appendChild(createArea);

        const viewArea = document.createElement('div');
        viewArea.classList.add('view-area');
        const titleAndResetContainer = document.createElement('div');
        titleAndResetContainer.classList.add('title-reset-container');

        const listTitle = document.createElement('h3');
        listTitle.textContent = 'Categorías existentes';
        titleAndResetContainer.appendChild(listTitle);

        const resetLink = document.createElement('a');
        resetLink.href = '#';
        resetLink.textContent = 'Reestablecer categorías';
        resetLink.classList.add('reset-link');
        resetLink.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleResetCategories();
        });
        titleAndResetContainer.appendChild(resetLink);

        viewArea.appendChild(titleAndResetContainer);

        this._categoriesListContainer = document.createElement('ul');
        this._categoriesListContainer.classList.add('categories-list');
        viewArea.appendChild(this._categoriesListContainer);
        categoriesView.appendChild(viewArea);

        const extraArea = document.createElement('div');
        extraArea.classList.add('extra');
        extraArea.id = 'category-charts-area';

        const monthSelectorContainer = document.createElement('div');
        monthSelectorContainer.classList.add('month-selector-container');
        
        const monthSelectTitle = document.createElement('h3');
        monthSelectTitle.textContent = 'Mes: ';
        monthSelectorContainer.appendChild(monthSelectTitle);

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
        extraArea.appendChild(monthSelectorContainer);

        const chartsContainerWrapper = document.createElement('div');
        chartsContainerWrapper.id = 'charts-display-area';
        chartsContainerWrapper.classList.add('charts-container-wrapper');
        extraArea.appendChild(chartsContainerWrapper);

        categoriesView.appendChild(extraArea);

        this._container.appendChild(categoriesView);

        this.loadCategories();

        return categoriesView;
    }

    renderCategoriesList() {
        if (!this._categoriesListContainer) return;

        this._categoriesListContainer.innerHTML = '';

        if (this._categories.length === 0) {
            const noCategoriesMessage = document.createElement('li');
            noCategoriesMessage.textContent = 'No hay categorías para mostrar.';
            noCategoriesMessage.classList.add('no-categories-message');
            this._categoriesListContainer.appendChild(noCategoriesMessage);
            return;
        }

        this._categories.forEach(category => {
            const listItem = document.createElement('li');
            listItem.classList.add('category-item');

            const categoryNameDisplay = document.createElement('span');
            categoryNameDisplay.textContent = category.name;
            categoryNameDisplay.classList.add('category-name');

            listItem.appendChild(categoryNameDisplay);

            const actionsContainer = document.createElement('div');
            actionsContainer.classList.add('category-actions');

            const editLink = document.createElement('a');
            editLink.href = '#';
            editLink.textContent = 'Editar';
            editLink.classList.add('edit-link');
            editLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleEditCategory(category.id, category.name, listItem, categoryNameDisplay);
            });
            actionsContainer.appendChild(editLink);

            const deleteLink = document.createElement('a');
            deleteLink.href = '#';
            deleteLink.textContent = 'Eliminar';
            deleteLink.classList.add('delete-link');
            deleteLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleDeleteCategory(category.id, category.name);
            });
            actionsContainer.appendChild(deleteLink);

            listItem.appendChild(actionsContainer);
            this._categoriesListContainer.appendChild(listItem);
        });
    }

    async handleAddCategory() {
        const categoryName = this._newCategoryInput.getValue().trim();

        if (!categoryName) {
            alert('El nombre de la categoría no puede estar vacío.');
            return;
        }

        try {
            const existingCategories = await this._db.getCategories();
            const nameExists = existingCategories.some(cat => cat.name.toLowerCase() === categoryName.toLowerCase());

            if (nameExists) {
                alert(`La categoría "${categoryName}" ya existe. Por favor, elija un nombre diferente.`);
                return;
            }

            const newCategory = { name: categoryName, isDefault: false };
            await this._db.addCategory(newCategory);
            this._newCategoryInput.setValue('');
            alert(`Categoría "${categoryName}" añadida exitosamente.`);
            await this.loadCategories();
        } catch (error) {
            console.error('Error al añadir categoría:', error);
            if (error.name === 'ConstraintError') {
                alert(`Error: Ya existe una categoría con el nombre "${categoryName}".`);
            } else {
                alert('Error al añadir la categoría. Por favor, intente de nuevo.');
            }
        }
    }

    handleEditCategory(id, currentName, listItem, categoryNameDisplay) {
        if (this._editingCategoryId === id) {
            return;
        }

        if (this._editingCategoryId !== null) {
            this.cancelEdit();
        }

        this._editingCategoryId = id;

        listItem.innerHTML = '';
        listItem.classList.add('category-item-editing');
        listItem.style.flexDirection = 'column';

        const editInputWrapper = document.createElement('div');
        editInputWrapper.classList.add('edit-input-wrapper');

        this._editCategoryInput = new Input(editInputWrapper, {
            value: currentName,
            styles: { width: '97%' },
        });

        const editInputField = this._editCategoryInput.render();
        listItem.appendChild(editInputField);

        const newActionsContainer = document.createElement('div');
        newActionsContainer.classList.add('edit-actions-container');

        const saveLink = document.createElement('a');
        saveLink.href = '#';
        saveLink.textContent = 'Guardar';
        saveLink.classList.add('save-link');
        saveLink.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleSaveEdit(id);
        });
        newActionsContainer.appendChild(saveLink);

        const cancelLink = document.createElement('a');
        cancelLink.href = '#';
        cancelLink.textContent = 'Cancelar';
        cancelLink.classList.add('cancel-link');
        cancelLink.addEventListener('click', (e) => {
            e.preventDefault();
            this.cancelEdit();
        });
        newActionsContainer.appendChild(cancelLink);

        listItem.appendChild(newActionsContainer);

        editInputField.focus();
    }

    async handleSaveEdit(id) {
        const newName = this._editCategoryInput.getValue().trim();

        if (!newName) {
            alert('El nombre de la categoría no puede estar vacío.');
            return;
        }
        const currentCategory = this._categories.find(c => c.id === id);
        if (currentCategory && newName === currentCategory.name) {
            alert('El nombre no ha cambiado.');
            this.cancelEdit();
            return;
        }

        try {
            const existingCategories = await this._db.getCategories();
            const nameExists = existingCategories.some(cat =>
                cat.id !== id && cat.name.toLowerCase() === newName.toLowerCase()
            );

            if (nameExists) {
                alert(`La categoría "${newName}" ya existe. Por favor, elija un nombre diferente.`);
                return;
            }

            if (currentCategory) {
                currentCategory.name = newName;
                await this._db.updateCategory(currentCategory);

                alert(`Categoría "${newName}" actualizada exitosamente.`);
                this._editingCategoryId = null;
                this._editCategoryInput.remove();
                await this.loadCategories();
            }
        } catch (error) {
            console.error('Error al guardar categoría editada:', error);
            alert('Error al actualizar la categoría. Por favor, intente de nuevo.');
        }
    }

    cancelEdit() {
        this._editingCategoryId = null;
        if (this._editCategoryInput) {
            this._editCategoryInput.remove();
            this._editCategoryInput = null;
        }
        this.renderCategoriesList();
    }

    async handleDeleteCategory(categoryId, categoryName) {
    const confirmDelete = confirm(`¿Estás seguro de que deseas eliminar la categoría "${categoryName}"? Esta acción eliminará todas las transacciones y presupuestos asociados a esta categoría.`);

    if (confirmDelete) {
        try {
            await this._db.deleteCategory(categoryId);

            const event = new CustomEvent('categoryDeleted', { detail: { categoryId: categoryId } });
            document.dispatchEvent(event);

            const categoriesUpdateEvent = new CustomEvent('categoriesUpdated');
            document.dispatchEvent(categoriesUpdateEvent);

            alert(`Categoría "${categoryName}" y sus elementos asociados eliminados exitosamente.`);
            await this.loadCategories();

        } catch (error) {
            console.error('Error al eliminar categoría:', error);
            alert('Hubo un error al intentar eliminar la categoría. Por favor, inténtalo de nuevo.');
        }
    }
}

    async handleResetCategories() {
        const confirmReset = confirm('¿Estás seguro de que deseas reestablecer todas las categorías a sus valores por defecto? Esto eliminará todas las categorías personalizadas.');

        if (confirmReset) {
            try {
                const allCategories = await this._db.getCategories();

                for (const category of allCategories) {
                    await this._db.deleteCategory(category.id);
                }

                await this.initializeDefaultCategories(true);
                alert('Categorías reestablecidas exitosamente a sus valores por defecto.');
                await this.loadCategories();
            } catch (error) {
                console.error('Error al reestablecer categorías:', error);
                alert('Hubo un error al reestablecer las categorías. Por favor, inténtalo de nuevo.');
            }
        }
    }

    async _handleMonthChange(selectedMonthValue) {
        this._currentMonth = parseInt(selectedMonthValue, 10);
        console.log(`Mes seleccionado: ${this._currentMonth}/${this._currentYear}`);
        await this._loadChartsForCurrentMonth(this._currentMonth, this._currentYear);
    }

    async _loadChartsForCurrentMonth(currentMonth, currentYear) {
        const chartsDisplayArea = this._container.querySelector('#charts-display-area');
        
        if (chartsDisplayArea && this._charts) {
            chartsDisplayArea.innerHTML = '';
            const expensesChartContainer = document.createElement('div');
            expensesChartContainer.classList.add('chart-wrapper');
            expensesChartContainer.id = 'expenses-chart-container';
            chartsDisplayArea.appendChild(expensesChartContainer);

            const incomesChartContainer = document.createElement('div');
            incomesChartContainer.classList.add('chart-wrapper');
            incomesChartContainer.id = 'incomes-chart-container';
            chartsDisplayArea.appendChild(incomesChartContainer);

            console.log(`Generando gráfico de egresos para ${currentMonth}/${currentYear} en #expenses-chart-container`);
            await this._charts.genExpensesByMonthCategory(expensesChartContainer, currentMonth, currentYear);

            console.log(`Generando gráfico de ingresos para ${currentMonth}/${currentYear} en #incomes-chart-container`);
            await this._charts.genIncomesByMonthCategory(incomesChartContainer, currentMonth, currentYear);

        } else if (!chartsDisplayArea) {
            console.warn('Categories: #charts-display-area element not found for charts. Make sure it exists in render().');
        } else {
            console.warn('Categories: Charts instance not available. Make sure it is passed in the constructor.');
        }
    }
}