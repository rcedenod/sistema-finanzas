import { Button } from '../components/Button.js';

export class Dashboard {
    render() {
        const div = document.createElement('div');
        div.innerHTML = '<h2>Bienvenido a su resumen de finanzas</h2><p>Resumen de finanzas...</p>';

        const button1 = new Button(div, {
            text: 'Prueba Button 1',
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
                marginLeft: '10px'
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