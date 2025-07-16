import { Select } from '../components/Select.js';

export class Categories {
	categorySelect = null; 

	render() {
		const div = document.createElement('div');
		div.innerHTML = '<h2>Bienvenido a las categorias</h2><p>Categorias...</p>';

		div.style.display = 'flex';
        div.style.flexDirection = 'column';
        div.style.gap = '10px';

		this.categorySelect = new Select(div, {
            items: [
                { value: '', text: 'Seleccione una categoría' }, // opcion por defecto
                { value: 'food', text: 'Comida' },
                { value: 'transport', text: 'Transporte' },
                { value: 'housing', text: 'Vivienda' },
                { value: 'entertainment', text: 'Entretenimiento' },
                { value: 'salary', text: 'Salario' },
                { value: 'other', text: 'Otros' }
            ],
            styles: {
                width: '250px'
            },
            onChange: (event) => {
                p1.textContent = this.categorySelect.getValue();
            }
        });

		const lbl1 = document.createElement('label');
		lbl1.textContent = 'Categoria seleccionada: ';
		div.appendChild(lbl1);

		const p1 = document.createElement('p1');
		p1.textContent = ``;
		div.appendChild(p1);


		return div;
	}
}