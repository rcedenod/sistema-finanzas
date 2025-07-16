// Input.js
export class Input {
    // input por defecto (sin focus)
    _defaultStyles = {
        backgroundColor: '#fff',
        padding: '10px 15px',
        border: '1px solid #ccc',
        borderRadius: '5px',
        fontSize: '16px',
        width: '15%',
    };

    // input con focus
    _defaultFocusStyles = {
        borderColor: '#1ab7bc',
        outline: 'none',
    };

    // input deshabilitado
    _defaultDisabledStyles = {
        backgroundColor: '#f0f0f0',
    };

    constructor(container, {
        type = 'text',
        placeholder = '',
        value = '',
        styles = {},
        focusStyles = {},
        disabledStyles = {},
        isDisabled = false,
        onInput = () => {},
        onChange = () => {}
    }) {
        if (!(container instanceof HTMLElement)) {
            throw new Error('Input: el container debe ser un elemento HTML válido.');
        }

        this.container = container; // contenedor
        this.type = type; // tipo de input
        this.placeholder = placeholder; // placeholder
        this.value = value; // valor inicial
        this.isDisabled = isDisabled; // estado deshabilitado/habilitado

        this.styles = { ...this._defaultStyles, ...styles }; // estilos generales
        this.focusStyles = { ...this._defaultFocusStyles, ...focusStyles }; // estilos al hacer focus
        this.disabledStyles = { ...this._defaultDisabledStyles, ...disabledStyles }; // estilos al deshabilitar

        this.onInput = onInput; // que hacer al recibir informacion
        this.onChange = onChange; // al finalizar de ingresar la informacion

        this.inputElement = document.createElement('input');
        this.render();
    }

    _applyStyles(element, stylesObject) {
        for (const key in stylesObject) {
            if (Object.hasOwnProperty.call(stylesObject, key)) {
                element.style[key] = stylesObject[key];
            }
        }
    }

    render() {
        this.inputElement.type = this.type;
        this.inputElement.placeholder = this.placeholder;
        this.inputElement.value = this.value;
        this.inputElement.disabled = this.isDisabled;

        this._applyStyles(this.inputElement, this.styles);

        // guardar estilos iniciales para poder volver a ellos al quitar el foco o habilitar
        this.initialStyles = {};
        for (const key in this.styles) {
            this.initialStyles[key] = this.inputElement.style[key];
        }

        // eventos de foco (focus y perder focus)
        this.handleFocus = () => {
            if (!this.inputElement.disabled) {
                this._applyStyles(this.inputElement, this.focusStyles);
            }
        };
        this.handleBlur = () => {
            if (!this.inputElement.disabled) {
                this._applyStyles(this.inputElement, this.initialStyles);
            }
        };

        this.inputElement.addEventListener('focus', this.handleFocus); // al hacer click al input (focus)
        this.inputElement.addEventListener('blur', this.handleBlur); // al salir del input (perfer el focus)
        this.inputElement.addEventListener('input', this.onInput); // cambio de tecla
        this.inputElement.addEventListener('change', this.onChange); // al finalizar de ingresar informacion

        this.container.appendChild(this.inputElement);

        return this.inputElement;
    }

    // metodos para interactuar con el input desde fuera
    getValue() {
        return this.inputElement.value;
    }
    setValue(newValue) {
        this.inputElement.value = newValue;
    }
    setDisabled(isDisabled) {
        if (this.inputElement) {
            this.inputElement.disabled = isDisabled;
            if (isDisabled) {
                // aplicar estilos de deshabilitado
                this._applyStyles(this.inputElement, this.disabledStyles);
            } else {
                // restaurar estilos por defecto
                this._applyStyles(this.inputElement, this.initialStyles);
            }
        }
    }
    remove() {
        if (this.inputElement && this.inputElement.parentElement) {
            this.inputElement.removeEventListener('focus', this.handleFocus);
            this.inputElement.removeEventListener('blur', this.handleBlur);
            this.inputElement.removeEventListener('input', this.onInput);
            this.inputElement.removeEventListener('change', this.onChange);
            this.inputElement.parentElement.removeChild(this.inputElement);
        }
    }
}