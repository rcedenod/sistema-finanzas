import { Input } from '../components/Input.js';
import { Button } from '../components/Button.js';

export class Categories {
    _container = null;
    _db = null;
    _categories = [];
    _newCategoryInput = null;
    _editCategoryInput = null;
    _editingCategoryId = null;
    _categoriesListContainer = null;

    constructor(container, db) {
        if (!(container instanceof HTMLElement)) {
            throw new Error('Categories: el container debe ser un elemento HTML válido.');
        }
        if (!db) {
            throw new Error('Categories: la instancia de IndexedDB es requerida.');
        }

        this._container = container;
        this._db = db;

        this.initializeDefaultCategories();
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
        } catch (error) {
            console.error('Error al cargar categorías:', error);
            alert('Error al cargar las categorías. Por favor, intente de nuevo.');
        }
    }

    render() {
        this._container.innerHTML = '';

        const categoriesView = document.createElement('div');
        categoriesView.classList.add('categories-grid-container');
        categoriesView.style.display = 'grid';
        categoriesView.style.gridTemplateColumns = '1fr 1fr';
        categoriesView.style.gridTemplateRows = '0.1fr 0.4fr 1.3fr';
        categoriesView.style.gap = '15px';
        categoriesView.style.gridAutoFlow = 'row';
        categoriesView.style.gridTemplateAreas = `
            "header header"
            "create-area view-area"
            "extra view-area"
        `;
        categoriesView.style.width = '100%';
        categoriesView.style.height = '100%';

        const headerArea = document.createElement('div');
        headerArea.classList.add('header');
        headerArea.style.gridArea = 'header';
        headerArea.style.backgroundColor = '#ecf0f1';
        headerArea.style.borderRadius = '8px';
        headerArea.style.textAlign = 'center';

        const title = document.createElement('h2');
        title.textContent = 'Gestión de Categorías';
        title.style.color = '#2C3E50';
        headerArea.appendChild(title);
        categoriesView.appendChild(headerArea);

        const createArea = document.createElement('div');
        createArea.classList.add('create-area');
        createArea.style.gridArea = 'create-area';
        createArea.style.border = '1px solid #eee';
        createArea.style.padding = '15px';
        createArea.style.borderRadius = '8px';
        createArea.style.backgroundColor = '#f9f9f9';
        createArea.style.display = 'flex';
        createArea.style.flexDirection = 'column';
        createArea.style.gap = '10px';

        const addCategoryTitle = document.createElement('h3');
        addCategoryTitle.textContent = 'Añadir Nueva Categoría';
        addCategoryTitle.style.color = '#34495E';
        createArea.appendChild(addCategoryTitle);

        const newCategoryInputWrapper = document.createElement('div');
        this._newCategoryInput = new Input(newCategoryInputWrapper, {
            placeholder: 'Nombre de la nueva categoría',
            styles: { width: '96%' },
        });
        createArea.appendChild(this._newCategoryInput.render());

        const addCategoryButtonWrapper = document.createElement('div');
        const addCategoryButton = new Button(addCategoryButtonWrapper, {
            text: 'Añadir Categoría',
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
        viewArea.style.gridArea = 'view-area';
        viewArea.style.border = '1px solid #eee';
        viewArea.style.padding = '15px';
        viewArea.style.borderRadius = '8px';
        viewArea.style.backgroundColor = '#f9f9f9';
        viewArea.style.display = 'flex';
        viewArea.style.flexDirection = 'column';
        viewArea.style.gap = '10px';
        viewArea.style.overflowY = 'auto';

        const titleAndResetContainer = document.createElement('div');
        titleAndResetContainer.style.display = 'flex';
        titleAndResetContainer.style.justifyContent = 'space-between';
        titleAndResetContainer.style.alignItems = 'center';

        const listTitle = document.createElement('h3');
        listTitle.textContent = 'Categorías Existentes';
        listTitle.style.color = '#34495E';
        listTitle.style.margin = '0';
        titleAndResetContainer.appendChild(listTitle);

        const resetLink = document.createElement('a');
        resetLink.href = '#';
        resetLink.textContent = 'Reestablecer categorías';
        resetLink.style.color = '#6c757d';
        resetLink.style.textDecoration = 'none';
        resetLink.style.cursor = 'pointer';
        resetLink.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleResetCategories();
        });
        titleAndResetContainer.appendChild(resetLink);

        viewArea.appendChild(titleAndResetContainer);

        this._categoriesListContainer = document.createElement('ul');
        this._categoriesListContainer.style.listStyle = 'none';
        this._categoriesListContainer.style.padding = '0';
        this._categoriesListContainer.style.margin = '0';
        this._categoriesListContainer.style.display = 'flex';
        this._categoriesListContainer.style.flexDirection = 'column';
        this._categoriesListContainer.style.gap = '8px';
        viewArea.appendChild(this._categoriesListContainer);
        categoriesView.appendChild(viewArea);

        const extraArea = document.createElement('div');
        extraArea.classList.add('extra');
        extraArea.style.gridArea = 'extra';
        
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
            noCategoriesMessage.style.padding = '10px';
            noCategoriesMessage.style.textAlign = 'center';
            noCategoriesMessage.style.color = '#777';
            this._categoriesListContainer.appendChild(noCategoriesMessage);
            return;
        }

        this._categories.forEach(category => {
            const listItem = document.createElement('li');
            listItem.style.display = 'flex';
            listItem.style.justifyContent = 'space-between';
            listItem.style.alignItems = 'center';
            listItem.style.padding = '10px 15px';
            listItem.style.border = '1px solid #ddd';
            listItem.style.borderRadius = '5px';
            listItem.style.backgroundColor = '#fff';

            const categoryNameDisplay = document.createElement('span');
            categoryNameDisplay.textContent = category.name;
            categoryNameDisplay.style.color = '#2C3E50';

            listItem.appendChild(categoryNameDisplay);

            const actionsContainer = document.createElement('div');
            actionsContainer.style.display = 'flex';
            actionsContainer.style.gap = '10px';

            const editLink = document.createElement('a');
            editLink.href = '#';
            editLink.textContent = 'Editar';
            editLink.style.color = '#6c757d';
            editLink.style.textDecoration = 'none';
            editLink.style.cursor = 'pointer';
            editLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleEditCategory(category.id, category.name, listItem, categoryNameDisplay);
            });
            actionsContainer.appendChild(editLink);

            const deleteLink = document.createElement('a');
            deleteLink.href = '#';
            deleteLink.textContent = 'Eliminar';
            deleteLink.style.color = '#dc3545';
            deleteLink.style.textDecoration = 'none';
            deleteLink.style.cursor = 'pointer';
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
        listItem.style.flexDirection = 'column';

        const editInputWrapper = document.createElement('div');
        editInputWrapper.style.width = '100%';

        this._editCategoryInput = new Input(editInputWrapper, {
            value: currentName,
            styles: { width: '97%' },
        });

        const editInputField = this._editCategoryInput.render();
        listItem.appendChild(editInputField);

        const newActionsContainer = document.createElement('div');
        newActionsContainer.style.display = 'flex';
        newActionsContainer.style.gap = '10px';
        newActionsContainer.style.marginTop = '10px';
        newActionsContainer.style.justifyContent = 'flex-end';
        newActionsContainer.style.width = '100%';

        const saveLink = document.createElement('a');
        saveLink.href = '#';
        saveLink.textContent = 'Guardar';
        saveLink.style.color = '#007bff';
        saveLink.style.textDecoration = 'none';
        saveLink.style.cursor = 'pointer';
        saveLink.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleSaveEdit(id);
        });
        newActionsContainer.appendChild(saveLink);

        const cancelLink = document.createElement('a');
        cancelLink.href = '#';
        cancelLink.textContent = 'Cancelar';
        cancelLink.style.color = '#6c757d';
        cancelLink.style.textDecoration = 'none';
        cancelLink.style.cursor = 'pointer';
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

    async handleDeleteCategory(id, name) {
        const confirmDelete = confirm(`¿Estás seguro de que deseas eliminar la categoría "${name}"?`);

        if (confirmDelete) {
            try {
                await this._db.deleteCategory(id);
                alert(`¡Categoría "${name}" eliminada exitosamente!`);
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
}