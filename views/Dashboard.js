import { Button } from '../components/Button.js';
import { Textarea } from '../components/Textarea.js';

export class Dashboard {
    _container = null;
    _db = null;

    textarea = null;
    textareaButton = null;

    constructor(container, db) {
        if (!(container instanceof HTMLElement)) {
            throw new Error('Dashboard: el container debe ser un elemento HTML válido.');
        }
        if (!db) {
            console.warn('Dashboard: la instancia de IndexedDB no fue proporcionada (no requerida directamente en esta vista).');
        }
        this._container = container;
        this._db = db;
    }

    render() {
        const div = document.createElement('div');
        div.innerHTML = '<h2>Bienvenido a su resumen de finanzas</h2><p>Resumen de finanzas...</p>';

        div.style.display = 'flex';
        div.style.flexDirection = 'column';
        div.style.gap = '10px';

        const button1 = new Button(div, {
            styles: {
                width: '20%'
            },
            onClick: () => {
                alert('onClick de Button 1');
            }
        });

        const button2 = new Button(div, {
            text: 'Prueba Button 2 Pasando Estilos',
            onClick: () => {
                alert('onClick de Button 2');
            },
            styles: {
                backgroundColor: '#e74c3c',
                color: '#00ff40ff',
                padding: '15px',
                borderRadius: '25px',
                width: '20%'
            },
            hoverStyles: {
                backgroundColor: '#df1d08ff',
                color: '#1000f7ff'
            }
        });

        this.textarea = new Textarea(div, {
            placeholder: 'Ingrese un texto',
            rows: 10,
            styles: {
                resize: 'none'
            },
            onInput: (event) => {
                p1.textContent = this.textarea.getValue();
            },
        });

        const lbl1 = document.createElement('label');
        lbl1.textContent = 'Contenido textarea: ';
        div.appendChild(lbl1);

        const p1 = document.createElement('p1');
        p1.textContent = ``;
        div.appendChild(p1);

        this._container.innerHTML = '';
        this._container.appendChild(div);

        return div; 
    }
}