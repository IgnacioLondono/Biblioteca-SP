// contacto.js - Gestión del formulario de contacto
class FormularioContacto {
    constructor() {
        this.init();
    }

    init() {
        this.configurarEventos();
        this.configurarContadorCaracteres();
    }

    configurarEventos() {
        const formulario = document.getElementById('contactoForm');
        if (formulario) {
            formulario.addEventListener('submit', (e) => {
                e.preventDefault();
                this.procesarFormulario();
            });
        }

        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) {
            loginBtn.addEventListener('click', () => {
                window.location.href = 'login.html';
            });
        }
    }

    configurarContadorCaracteres() {
        const textarea = document.getElementById('contactMessage');
        if (textarea) {
            textarea.addEventListener('input', (e) => {
                const contador = document.getElementById('charCount');
                if (contador) {
                    contador.textContent = e.target.value.length;
                    
                    if (e.target.value.length > 450) {
                        contador.style.color = '#e74c3c';
                    } else if (e.target.value.length > 400) {
                        contador.style.color = 'orange';
                    } else {
                        contador.style.color = 'var(--text-light)';
                    }
                }
            });
        }
    }

    async procesarFormulario() {
        const formulario = document.getElementById('contactoForm');
        const boton = formulario.querySelector('button[type="submit"]');
        const textoOriginal = boton.innerHTML;

        try {
            // Mostrar loading
            boton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
            boton.disabled = true;

            // Validar formulario
            if (!this.validarFormulario()) {
                throw new Error('Por favor, corrige los errores en el formulario');
            }

            // Obtener datos
            const datos = {
                nombre: document.getElementById('contactName').value,
                email: document.getElementById('contactEmail').value,
                asunto: document.getElementById('contactSubject').value,
                mensaje: document.getElementById('contactMessage').value,
                fecha: new Date().toLocaleString('es-CL')
            };

            // Simular envío
            await this.simularEnvio(datos);

            // Mostrar éxito
            this.mostrarMensajeExito();
            formulario.reset();
            document.getElementById('charCount').textContent = '0';

        } catch (error) {
            alert(error.message);
        } finally {
            // Restaurar botón
            boton.innerHTML = textoOriginal;
            boton.disabled = false;
        }
    }

    validarFormulario() {
        let valido = true;

        // Validar nombre
        const nombre = document.getElementById('contactName').value;
        if (!nombre.trim()) {
            this.mostrarError('contactName', 'El nombre es requerido');
            valido = false;
        } else {
            this.limpiarError('contactName');
        }

        // Validar email
        const email = document.getElementById('contactEmail').value;
        const validacionEmail = ValidadorBiblioteca.validarEmail(email);
        if (!validacionEmail.valido) {
            this.mostrarError('contactEmail', validacionEmail.mensaje);
            valido = false;
        } else {
            this.limpiarError('contactEmail');
        }

        // Validar mensaje
        const mensaje = document.getElementById('contactMessage').value;
        if (!mensaje.trim()) {
            this.mostrarError('contactMessage', 'El mensaje es requerido');
            valido = false;
        } else if (mensaje.length > 500) {
            this.mostrarError('contactMessage', 'El mensaje no puede exceder 500 caracteres');
            valido = false;
        } else {
            this.limpiarError('contactMessage');
        }

        return valido;
    }

    mostrarError(campoId, mensaje) {
        const campo = document.getElementById(campoId);
        campo.style.borderColor = '#e74c3c';
        
        let elementoError = campo.parentNode.querySelector('.error-message');
        if (!elementoError) {
            elementoError = document.createElement('div');
            elementoError.className = 'error-message';
            elementoError.style.color = '#e74c3c';
            elementoError.style.fontSize = '0.9rem';
            elementoError.style.marginTop = '0.3rem';
            campo.parentNode.appendChild(elementoError);
        }
        
        elementoError.textContent = mensaje;
    }

    limpiarError(campoId) {
        const campo = document.getElementById(campoId);
        campo.style.borderColor = '#ddd';
        
        const elementoError = campo.parentNode.querySelector('.error-message');
        if (elementoError) {
            elementoError.remove();
        }
    }

    simularEnvio(datos) {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Guardar en localStorage
                const mensajes = JSON.parse(localStorage.getItem('mensajesContacto')) || [];
                mensajes.push(datos);
                localStorage.setItem('mensajesContacto', JSON.stringify(mensajes));
                resolve();
            }, 1500);
        });
    }

    mostrarMensajeExito() {
        const mensajeHTML = `
            <div style="background: #d1fae5; border: 1px solid #10b981; border-radius: 10px; padding: 1rem; margin: 1rem 0;">
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <i class="fas fa-check-circle" style="color: #10b981; font-size: 1.5rem;"></i>
                    <div>
                        <h3 style="margin: 0; color: #065f46;">¡Mensaje enviado con éxito!</h3>
                        <p style="margin: 0.5rem 0 0 0; color: #047857;">Te contactaremos dentro de las próximas 24 horas.</p>
                    </div>
                </div>
            </div>
        `;

        const formulario = document.getElementById('contactoForm');
        formulario.insertAdjacentHTML('beforebegin', mensajeHTML);

        // Auto-eliminar después de 5 segundos
        setTimeout(() => {
            const elemento = document.querySelector('[style*="background: #d1fae5"]');
            if (elemento) elemento.remove();
        }, 5000);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new FormularioContacto();
});