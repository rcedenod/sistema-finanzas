import { Input } from '../components/Input.js';3
import { Button } from '../components/Button.js';

export class Transactions {
	usernameInput = null;
    passwordInput = null;

	render() {
		const div = document.createElement('div');
		div.innerHTML = '<h2>Bienvenido al apartado de transanciones</h2><p>Transancciones...</p>';

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

		return div;
	}
}