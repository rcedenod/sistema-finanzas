import { Navbar } from './components/Navbar.js';
import { Sidebar } from './components/Sidebar.js';
import { Dashboard } from './views/Dashboard.js';
import { Transactions } from './views/Transactions.js';
import { Categories } from './views/Categories.js';
import { Budgets } from './views/Budgets.js';

document.addEventListener('DOMContentLoaded', () => {
	const app = document.getElementById('main-container');
	if (!app) return;

	// creo el contenedor principal de la aplicacion el cual es un grid
	const appGridContainer = document.createElement('div');
	appGridContainer.classList.add('app-grid-container');
	app.appendChild(appGridContainer);

	// renderizar navbar y añadirlo al grid principal
	const navbarElement = new Navbar('Budgenet').render();
	appGridContainer.appendChild(navbarElement);

	// definir mis vistas y el componente al q pertenecen
	const views = {
		dashboard: { label: 'Resumen', component: Dashboard },
		transactions: { label: 'Transacciones', component: Transactions },
		categories: { label: 'Categorías', component: Categories },
		budgets: { label: 'Presupuestos', component: Budgets }
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
			const comp = new viewConfig.component();
			contentElement.appendChild(comp.render());
		}
	};

	// agregar el evento de mostrar componente correspondiente a cada opcion del sidebar
	sidebarElement.querySelectorAll('.sidebar-item').forEach(li => {
		li.addEventListener('click', () => loadView(li.dataset.view));
	});

	// vista default dashboard
	loadView('dashboard');
});