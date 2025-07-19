import { Input } from '../components/Input.js';
import { Button } from '../components/Button.js';

export class Transactions {
    _container = null;
    _db = null; // Añade una propiedad para la instancia de la base de datos

    usernameInput = null;
    passwordInput = null;

    // Modifica el constructor para aceptar 'container' y 'db'
    constructor(container, db) {
        if (!(container instanceof HTMLElement)) {
            throw new Error('Transactions: el container debe ser un elemento HTML válido.');
        }
        if (!db) { // Aunque no se use directamente ahora, lo pasamos por consistencia
            console.warn('Transactions: la instancia de IndexedDB no fue proporcionada (no requerida directamente en esta vista).');
        }
        this._container = container;
        this._db = db;
    }

    render() {
        const div = document.createElement('div');
        div.innerHTML = '<h2>Bienvenido al apartado de transacciones</h2><p>Transacciones...</p>'; // Corregido "Transanciones"

        div.style.display = 'flex';
        div.style.flexDirection = 'column';
        div.style.gap = '10px';

        this.usernameInput = new Input(div, {
            type: 'text',
            placeholder: 'Ingrese su nombre de usuario',
            onInput: (event) => {
                p1.textContent = event.target.value;
            }
        });

        this.passwordInput = new Input(div, {
            type: 'password',
            placeholder: 'Contraseña',
            onInput: (event) => {
                p2.textContent = event.target.value;
            }
        });

        const toggleInputDisabledBtn = new Button(div, {
            text: 'Deshabilitar input',
            styles: {
                width: '15%'
            },
            onClick: () => {
                const currentDisabledState = this.usernameInput.inputElement.disabled;
                this.usernameInput.setDisabled(!currentDisabledState);
            }
        });

        const lbl1 = document.createElement('label');
        lbl1.textContent = 'Valor input usuario: ';
        div.appendChild(lbl1);

        const p1 = document.createElement('p1');
        p1.textContent = ``;
        div.appendChild(p1);

        const lbl2 = document.createElement('label');
        lbl2.textContent = 'Valor input contraseña: ';
        div.appendChild(lbl2);

        const p2 = document.createElement('p1');
        p2.textContent = ``;
        div.appendChild(p2);

        // Agrega el contenido al contenedor principal de la vista
        this._container.innerHTML = ''; // Limpia el contenedor si es necesario
        this._container.appendChild(div);

        return div; // Opcional: si tu `index.js` necesita que `render()` devuelva un elemento.
    }
}