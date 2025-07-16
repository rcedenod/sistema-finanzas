import { Navbar } from './components/Navbar.js';
import { Sidebar } from './components/Sidebar.js';
import { Dashboard } from './views/Dashboard.js';
import { Transactions } from './views/Transactions.js';
import { Categories } from './views/Categories.js';
import { Budgets } from './views/Budgets.js';

document.addEventListener('DOMContentLoaded', () => {
	const app = document.getElementById('main-container');

	// renderizar navbar
	app.appendChild(new Navbar('Budgenet').render());

	// contenedor de la pagina
	const container = document.createElement('div');
	container.classList.add('app-container');
	app.appendChild(container);

	// definir las vistas a mostrar
	const views = {
		dashboard: { label: 'Resumen', component: Dashboard },
		transactions: { label: 'Transacciones', component: Transactions },
		categories: { label: 'Categorías', component: Categories },
		budgets: { label: 'Presupuestos', component: Budgets }
	};

	// renderizar el sidebar con las opciones (vistas)
	const sidebar = new Sidebar(
		Object.keys(views).map(key => ({ label: views[key].label, view: key }))
	).render();
	container.appendChild(sidebar);

	// contenedor principal de la pagina
	const content = document.createElement('main');
	content.classList.add('content');
	container.appendChild(content);

	// cargas una vista a cada opcion del sidebar
	const loadView = (viewName) => {
		// para mantener seleccionada una opcion en el sidebar
		sidebar.querySelectorAll('.sidebar-item').forEach(li => {
			li.classList.toggle('active', li.dataset.view === viewName);
		});

		content.innerHTML = '';
		const view = views[viewName];
		if (view && view.component) {
			const comp = new view.component();
			content.appendChild(comp.render());
		}
	};

    // agregar el evento para mostrar el contenido de una vista al hacer click en una opcion del sidebar
	sidebar.querySelectorAll('.sidebar-item').forEach(li => {
		li.addEventListener('click', () => loadView(li.dataset.view));
	});

    // cargar vista por defecto
	loadView('dashboard');
});