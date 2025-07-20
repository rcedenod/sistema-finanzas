export class Dashboard {
    _container = null;
    _db = null;
    _cssPath = './views/styles/Dashboard.css';
    textarea = null;
    textareaButton = null;

    constructor(dashboardView, db, charts) {
        if (!(dashboardView instanceof HTMLElement)) {
            throw new Error('Dashboard: el dashboardView debe ser un elemento HTML válido.');
        }
        if (!db) {
            console.warn('Dashboard: la instancia de IndexedDB no fue proporcionada.');
        }
        if (!charts) {
            console.warn('Dashboard: la instancia de Charts no fue proporcionada.');
        }
        this._container = dashboardView;
        this._db = db;
        this._charts = charts;
        this._loadCSS(this._cssPath); 
    }

    _loadCSS(path) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = path;
        document.head.appendChild(link);
    }

    render() {
        this._container.innerHTML = '';

        const dashboardView = document.createElement('div');
        dashboardView.classList.add('dashboardView');

        const headerArea = document.createElement('div');
        headerArea.classList.add('header');
        headerArea.innerHTML = '<h2>Bienvenido a su resumen de finanzas</h2>';
        dashboardView.appendChild(headerArea);

        const recentTransactionsArea = document.createElement('div');
        recentTransactionsArea.classList.add('recent-transactions');
        dashboardView.appendChild(recentTransactionsArea);

        const expensesIncomesArea = document.createElement('div');
        expensesIncomesArea.classList.add('expenses-incomes');
        dashboardView.appendChild(expensesIncomesArea);

        const asideArea = document.createElement('div');
        asideArea.classList.add('aside');
        
        dashboardView.appendChild(asideArea);

        const graphArea = document.createElement('div');
        graphArea.classList.add('graph');
        dashboardView.appendChild(graphArea);

        this._container.appendChild(dashboardView);

        return dashboardView;
    }
}