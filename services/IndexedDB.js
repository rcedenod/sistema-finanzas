export class IndexedDB {
    constructor() {
        this.dbName = 'BudgenetDB';
        this.dbVersion = 10;
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
}