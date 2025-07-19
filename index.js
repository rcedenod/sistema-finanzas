import { Navbar } from './components/Navbar.js';
import { Sidebar } from './components/Sidebar.js';
import { Dashboard } from './views/Dashboard.js';
import { Transactions } from './views/Transactions.js';
import { Categories } from './views/Categories.js';
import { Budgets } from './views/Budgets.js';
// Importa tu nuevo componente IndexedDB
import { IndexedDB } from './services/IndexedDB.js'; // Asegúrate de que la ruta sea correcta

document.addEventListener('DOMContentLoaded', async () => { // ¡Añade 'async' aquí!
    const app = document.getElementById('main-container');

    // ** 1. Inicializar la base de datos IndexedDB **
    const db = new IndexedDB();
    try {
        await db.initialize(); // Espera a que la base de datos se inicialice
        console.log('IndexedDB inicializada con éxito y lista para usar.');
    } catch (error) {
        console.error('Fallo al inicializar IndexedDB:', error);
        alert('Hubo un problema al iniciar la base de datos. La aplicación podría no funcionar correctamente.');
        return; // Detener la ejecución si la DB no se inicializa
    }

    // creo el contenedor principal de la aplicacion el cual es un grid
    const appGridContainer = document.createElement('div');
    appGridContainer.classList.add('app-grid-container');
    app.appendChild(appGridContainer);

    // renderizar navbar y añadirlo al grid principal
    const navbarElement = new Navbar('Budgenet').render();
    appGridContainer.appendChild(navbarElement);

    // definir mis vistas y el componente al q pertenecen
    // ** 2. Pasar la instancia 'db' a las vistas que la necesiten **
    const views = {
        dashboard: { label: 'Resumen', component: Dashboard, instance: null },
        transactions: { label: 'Transacciones', component: Transactions, instance: null },
        categories: { label: 'Categorías', component: Categories, instance: null }, // Categories necesitará 'db'
        budgets: { label: 'Presupuestos', component: Budgets, instance: null }
    };

    // renderizar sidebar y añadirlo al grid principal
    const sidebarElement = new Sidebar(
        Object.keys(views).map(key => ({ label: views[key].label, view: key }))
    ).render();

    appGridContainer.appendChild(sidebarElement);

    // area principal donde se muestra el contenido, añadirla al grid principal
    const contentElement = document.createElement('main');
    contentElement.classList.add('content');
    appGridContainer.appendChild(contentElement);

    // cargar vista a opcion del sidebar
    const loadView = (view) => {
        // highlight opcion seleccionada de la sidebar
        sidebarElement.querySelectorAll('.sidebar-item').forEach(li => {
            li.classList.toggle('active', li.dataset.view === view);
        });

        // limpiar contenido previo y renderizar componente
        contentElement.innerHTML = '';
        const viewConfig = views[view];
        if (viewConfig && viewConfig.component) {
            // Reutilizar instancia si ya existe o crear una nueva pasándole 'db'
            if (!viewConfig.instance) {
                // ** 3. Pasar la instancia 'db' al constructor de las vistas **
                // Aquí solo Categories y Transactions necesitan 'db' inicialmente.
                // Puedes ajustar esto según qué vista interactúe con la DB.
                if (view === 'categories' || view === 'transactions' || view === 'budgets') {
                    viewConfig.instance = new viewConfig.component(contentElement, db); // Pasar contentElement y db
                } else {
                    viewConfig.instance = new viewConfig.component(contentElement); // Solo contentElement para otros
                }
            }
            // Asegurarse de que el render se adjunta al contentElement si el constructor lo necesita
            // o si el componente renderiza directamente en un elemento dado.
            // Para Categories, Transactions, etc., si esperan un 'container' como primer arg.
            // puedes necesitar ajustar sus constructores si no lo hacen ya.
            viewConfig.instance.render(); // Llama al método render de la instancia
            // Si tu render devuelve un elemento, quizás necesites:
            // contentElement.appendChild(viewConfig.instance.render());
            // Si el render del componente ya adjunta al contentElement, solo llama:
            // viewConfig.instance.render();
            // Aclaración: Asumo que el render de tus vistas adjunta el contenido al `contentElement` pasado al constructor,
            // o que lo tienes manejado de alguna otra forma. Si tu `render()` devuelve un elemento, entonces
            // `contentElement.appendChild(viewConfig.instance.render());` sería más adecuado.
        }
    };

    // agregar el evento de mostrar componente correspondiente a cada opcion del sidebar
    sidebarElement.querySelectorAll('.sidebar-item').forEach(li => {
        li.addEventListener('click', () => loadView(li.dataset.view));
    });

    // vista default dashboard
    loadView('dashboard');
});

// Nota importante: Las vistas (Categories, Transactions, etc.)
// deberán adaptar sus constructores para aceptar 'db' como argumento.
// Ejemplo: constructor(container, db) { this._container = container; this._db = db; }