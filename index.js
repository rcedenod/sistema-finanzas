import { Navbar } from './components/Navbar.js';
import { Sidebar } from './components/Sidebar.js';
import { Dashboard } from './views/Dashboard.js';
import { Transactions } from './views/Transactions.js';
import { Categories } from './views/Categories.js';
import { Budgets } from './views/Budgets.js';
import { IndexedDB } from './services/IndexedDB.js';
import { Charts } from './services/Charts.js';

document.addEventListener('DOMContentLoaded', async () => {
    const app = document.getElementById('main-container');

    const db = new IndexedDB();
    try {
        await db.initialize();
        console.log('IndexedDB inicializada con éxito y lista para usar.');
    } catch (error) {
        console.error('Fallo al inicializar IndexedDB:', error);
        alert('Hubo un problema al iniciar la base de datos. La aplicación podría no funcionar correctamente.');
        return;
    }

    const charts = new Charts(db);

    const appGridContainer = document.createElement('div');
    appGridContainer.classList.add('app-grid-container');
    app.appendChild(appGridContainer);

    const navbarElement = new Navbar('Budgenet').render();
    appGridContainer.appendChild(navbarElement);

    const views = {
        dashboard: { label: 'Resumen', component: Dashboard, instance: null },
        transactions: { label: 'Transacciones', component: Transactions, instance: null },
        categories: { label: 'Categorías', component: Categories, instance: null },
        budgets: { label: 'Presupuestos', component: Budgets, instance: null }
    };

    const sidebarElement = new Sidebar(
        Object.keys(views).map(key => ({ label: views[key].label, view: key }))
    ).render();

    appGridContainer.appendChild(sidebarElement);

    const contentElement = document.createElement('main');
    contentElement.classList.add('content');
    appGridContainer.appendChild(contentElement);

    const loadView = (view) => {
        sidebarElement.querySelectorAll('.sidebar-item').forEach(li => {
            li.classList.toggle('active', li.dataset.view === view);
        });

        contentElement.innerHTML = '';
        const viewConfig = views[view];
        if (viewConfig && viewConfig.component) {
            if (!viewConfig.instance) {
                if(view === 'categories') {
                    viewConfig.instance = new viewConfig.component(contentElement, db, charts);
                }
                else if (view === 'transactions' || view === 'budgets') {
                    viewConfig.instance = new viewConfig.component(contentElement, db);
                } else {
                    viewConfig.instance = new viewConfig.component(contentElement);
                }
            }
            viewConfig.instance.render();
        }
    };

    sidebarElement.querySelectorAll('.sidebar-item').forEach(li => {
        li.addEventListener('click', () => loadView(li.dataset.view));
    });

    loadView('dashboard');
});