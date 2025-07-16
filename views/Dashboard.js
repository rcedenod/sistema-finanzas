import { Button } from '../components/Button.js';

export class Dashboard {
    render() {
        const div = document.createElement('div');
        div.innerHTML = '<h2>Bienvenido a su resumen de finanzas</h2><p>Resumen de finanzas...</p>';


        div.style.display = 'flex';
        div.style.flexDirection = 'column';
        div.style.gap = '10px';

        const button1 = new Button(div, {
            text: 'Prueba Button 1',
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

		// probando botones
		button1.setText('Hola mundo');
		// button2.remove();

        return div;
    }
}