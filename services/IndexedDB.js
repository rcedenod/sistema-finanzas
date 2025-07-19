export class IndexedDB {
    constructor() {
        this.dbName = 'BudgenetDB';
        this.dbVersion = 16;
        this._db = null;
    }

    async initialize() {
        return new Promise((resolve, reject) => {
            if (this._db) {
                console.log('IndexedDB: La base de datos ya está abierta.');
                return resolve(this._db);
            }

            console.log(`IndexedDB: Abriendo la base de datos '${this.dbName}' (versión ${this.dbVersion})...`);
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                console.log('IndexedDB: onupgradeneeded disparado. Verificando/creando almacenes de objetos...');

                if (!db.objectStoreNames.contains('categories')) {
                    const categoriesStore = db.createObjectStore('categories', { keyPath: 'id', autoIncrement: true });
                    categoriesStore.createIndex('name', 'name', { unique: true });
                    console.log('IndexedDB: Almacén "categories" creado con índice "name".');
                } else {
                    console.log('IndexedDB: Almacén "categories" ya existe. No se recrea.');
                }

                if (!db.objectStoreNames.contains('transactions')) {
                    const transactionsStore = db.createObjectStore('transactions', { keyPath: 'id', autoIncrement: true });
                    transactionsStore.createIndex('type', 'type', { unique: false });
                    transactionsStore.createIndex('categoryId', 'categoryId', { unique: false });
                    transactionsStore.createIndex('date', 'date', { unique: false });
                    transactionsStore.createIndex('typeAndCategory', ['type', 'categoryId'], { unique: false });
                    console.log('IndexedDB: Almacén "transactions" creado con índices.');
                } else {
                    console.log('IndexedDB: Almacén "transactions" ya existe.');
                }
            };

            request.onsuccess = (event) => {
                this._db = event.target.result;
                console.log('IndexedDB: Base de datos abierta y lista.');
                resolve(this._db);
            };

            request.onerror = (event) => {
                console.error('IndexedDB: Error al abrir la base de datos:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    close() {
        if (this._db) {
            this._db.close();
            this._db = null;
            console.log('IndexedDB: Conexión de la base de datos cerrada.');
        }
    }

    async addCategory(category) {
        await this.initialize();
        return new Promise((resolve, reject) => {
            const transaction = this._db.transaction(['categories'], 'readwrite');
            const store = transaction.objectStore('categories');
            const request = store.add(category);

            request.onsuccess = () => {
                console.log(`IndexedDB: Categoría '${category.name}' añadida con ID: ${request.result}`);
                resolve(request.result);
            };
            request.onerror = (event) => {
                console.error('IndexedDB: Error al añadir categoría:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    async getCategories() {
        await this.initialize();
        return new Promise((resolve, reject) => {
            const transaction = this._db.transaction(['categories'], 'readonly');
            const store = transaction.objectStore('categories');
            const request = store.getAll();

            request.onsuccess = () => {
                console.log('IndexedDB: Todas las categorías recuperadas.');
                resolve(request.result);
            };
            request.onerror = (event) => {
                console.error('IndexedDB: Error al obtener categorías:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    async getCategoryById(id) {
        await this.initialize();
        return new Promise((resolve, reject) => {
            const transaction = this._db.transaction(['categories'], 'readonly');
            const store = transaction.objectStore('categories');
            const request = store.get(id);

            request.onsuccess = () => {
                console.log(`IndexedDB: Categoría con ID ${id} recuperada:`, request.result);
                resolve(request.result);
            };
            request.onerror = (event) => {
                console.error(`IndexedDB: Error al obtener categoría con ID ${id}:`, event.target.error);
                reject(event.target.error);
            };
        });
    }

    async updateCategory(category) {
        await this.initialize();
        return new Promise((resolve, reject) => {
            const transaction = this._db.transaction(['categories'], 'readwrite');
            const store = transaction.objectStore('categories');
            const request = store.put(category);

            request.onsuccess = () => {
                console.log(`IndexedDB: Categoría con ID ${category.id} actualizada.`);
                resolve();
            };
            request.onerror = (event) => {
                console.error(`IndexedDB: Error al actualizar categoría con ID ${category.id}:`, event.target.error);
                reject(event.target.error);
            };
        });
    }

    async deleteCategory(id) {
        await this.initialize();
        return new Promise((resolve, reject) => {
            const transaction = this._db.transaction(['categories'], 'readwrite');
            const store = transaction.objectStore('categories');
            const request = store.delete(id);

            transaction.oncomplete = () => {
                console.log(`IndexedDB: Transacción de eliminación completada para categoría ID: ${id}`);
                resolve();
            };
            transaction.onerror = (event) => {
                console.error(`IndexedDB: Error de transacción al eliminar categoría ID: ${id}:`, event.target.error);
                reject(event.target.error);
            };
            transaction.onabort = (event) => {
                console.warn(`IndexedDB: Transacción abortada al eliminar categoría ID: ${id}:`, event.target.error);
                reject(new Error('Transaction aborted'));
            };

            request.onsuccess = () => {
                console.log(`IndexedDB: Solicitud de eliminación para categoría ID ${id} enviada.`);
            };
            request.onerror = (event) => {
                console.error(`IndexedDB: Error en la solicitud de eliminación para categoría ID ${id}:`, event.target.error);
            };
        });
    }

    async putCategory(category) {
        await this.initialize();
        return new Promise((resolve, reject) => {
            const transaction = this._db.transaction(['categories'], 'readwrite');
            const store = transaction.objectStore('categories');
            const request = store.put(category);

            request.onsuccess = () => {
                const key = category.id || request.result;
                console.log(`IndexedDB: Categoría '${category.name}' insertada/actualizada con ID: ${key}`);
                resolve(key);
            };
            request.onerror = (event) => {
                console.error('IndexedDB: Error al añadir/actualizar categoría:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    async addTransaction(transaction) {
        await this.initialize();
        return new Promise((resolve, reject) => {
            const transactionDB = this._db.transaction(['transactions'], 'readwrite');
            const store = transactionDB.objectStore('transactions');

            transaction.isEdited = false;
            const request = store.add(transaction);

            request.onsuccess = () => {
                console.log('IndexedDB: Transacción añadida con éxito:', request.result);
                resolve(request.result);
            };
            request.onerror = (event) => {
                console.error('IndexedDB: Error al añadir transacción:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    async getTransactions() {
        await this.initialize();
        return new Promise((resolve, reject) => {
            const transactionDB = this._db.transaction(['transactions'], 'readonly');
            const store = transactionDB.objectStore('transactions');
            const request = store.getAll();

            request.onsuccess = () => {
                console.log('IndexedDB: Todas las transacciones recuperadas.');
                resolve(request.result);
            };
            request.onerror = (event) => {
                console.error('IndexedDB: Error al obtener transacciones:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    async getTransactionById(id) {
        await this.initialize();
        return new Promise((resolve, reject) => {
            const transactionDB = this._db.transaction(['transactions'], 'readonly');
            const store = transactionDB.objectStore('transactions');
            const request = store.get(id);

            request.onsuccess = () => {
                console.log(`IndexedDB: Transacción con ID ${id} recuperada:`, request.result);
                resolve(request.result);
            };
            request.onerror = (event) => {
                console.error(`IndexedDB: Error al obtener transacción con ID ${id}:`, event.target.error);
                reject(event.target.error);
            };
        });
    }

    async updateTransaction(transaction) {
        await this.initialize();
        return new Promise((resolve, reject) => {
            const transactionDB = this._db.transaction(['transactions'], 'readwrite');
            const store = transactionDB.objectStore('transactions');

            transaction.isEdited = true;
            const request = store.put(transaction);

            request.onsuccess = () => {
                console.log(`IndexedDB: Transacción con ID ${transaction.id} actualizada.`);
                resolve();
            };
            request.onerror = (event) => {
                console.error(`IndexedDB: Error al actualizar transacción con ID ${transaction.id}:`, event.target.error);
                reject(event.target.error);
            };
        });
    }

    async deleteTransaction(id) {
        await this.initialize();
        return new Promise((resolve, reject) => {
            const transactionDB = this._db.transaction(['transactions'], 'readwrite');
            const store = transactionDB.objectStore('transactions');
            const request = store.delete(id);

            transactionDB.oncomplete = () => {
                console.log(`IndexedDB: Transacción de eliminación completada para ID: ${id}`);
                resolve();
            };
            transactionDB.onerror = (event) => {
                console.error(`IndexedDB: Error de transacción al eliminar ID: ${id}:`, event.target.error);
                reject(event.target.error);
            };
        });
    }

    async deleteTransactionsByCategoryId(categoryId) {
        await this.initialize();
        return new Promise((resolve, reject) => {
            const transactionDB = this._db.transaction(['transactions'], 'readwrite');
            const store = transactionDB.objectStore('transactions');
            const index = store.index('categoryId');
            const request = index.openCursor(IDBKeyRange.only(categoryId));
            let count = 0;

            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    cursor.delete();
                    count++;
                    cursor.continue();
                } else {
                    transactionDB.oncomplete = () => {
                        console.log(`IndexedDB: Eliminadas ${count} transacciones para la categoría ID: ${categoryId}`);
                        resolve(count);
                    };
                    transactionDB.onerror = (e) => {
                        console.error('IndexedDB: Error al eliminar transacciones por categoryId:', e.target.error);
                        reject(e.target.error);
                    };
                    transactionDB.onabort = (e) => {
                        console.warn('IndexedDB: Transacción de eliminación de múltiples transacciones abortada:', e.target.error);
                        reject(new Error('Transaction aborted'));
                    };
                }
            };

            request.onerror = (event) => {
                console.error('IndexedDB: Error al abrir cursor para eliminar transacciones por categoryId:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    async getTransactionsFiltered(type = null, categoryId = null, searchTerm = null) {
        await this.initialize();
        return new Promise((resolve, reject) => {
            const transactionDB = this._db.transaction(['transactions'], 'readonly');
            const store = transactionDB.objectStore('transactions');
            let request = store.getAll();

            request.onsuccess = () => {
                let transactions = request.result;

                if (type && type !== 'all') {
                    transactions = transactions.filter(t => t.type === type);
                }
                if (categoryId && categoryId !== 'all') {
                    transactions = transactions.filter(t => t.categoryId === categoryId);
                }
                if (searchTerm) {
                    const lowerCaseSearchTerm = searchTerm.toLowerCase();
                    transactions = transactions.filter(t =>
                        (t.description && t.description.toLowerCase().includes(lowerCaseSearchTerm)) ||
                        (t.categoryName && t.categoryName.toLowerCase().includes(lowerCaseSearchTerm))
                    );
                }
                resolve(transactions);
            };

            request.onerror = (event) => {
                console.error('IndexedDB: Error al obtener transacciones filtradas:', event.target.error);
                reject(event.target.error);
            };
        });
    }
}