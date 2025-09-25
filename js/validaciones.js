class ValidadorBiblioteca {
    static validarEmail(email) {
        const dominiosPermitidos = ['@duoc.cl', '@profesor.duoc.cl', '@gmail.com'];
        const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!regexEmail.test(email)) {
            return { valido: false, mensaje: 'Formato de email inválido' };
        }
        
        const dominio = email.split('@')[1];
        if (!dominiosPermitidos.includes(`@${dominio}`)) {
            return { 
                valido: false, 
                mensaje: 'Solo se permiten correos @duoc.cl, @profesor.duoc.cl o @gmail.com' 
            };
        }
        
        return { valido: true };
    }

    static validarPassword(password) {
        if (password.length < 4 || password.length > 10) {
            return { 
                valido: false, 
                mensaje: 'La contraseña debe tener entre 4 y 10 caracteres' 
            };
        }
        return { valido: true };
    }

    static validarTexto(texto, campo, maxLongitud = 100) {
        if (!texto.trim()) {
            return { valido: false, mensaje: `${campo} es requerido` };
        }
        if (texto.length > maxLongitud) {
            return { 
                valido: false, 
                mensaje: `${campo} no puede exceder ${maxLongitud} caracteres` 
            };
        }
        return { valido: true };
    }
}

// Configurar validación del formulario de login
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            // Validaciones
            const validacionEmail = ValidadorBiblioteca.validarEmail(email);
            const validacionPassword = ValidadorBiblioteca.validarPassword(password);
            
            if (!validacionEmail.valido) {
                alert(validacionEmail.mensaje);
                return;
            }
            
            if (!validacionPassword.valido) {
                alert(validacionPassword.mensaje);
                return;
            }
            
            // Simular login exitoso
            alert('¡Login exitoso! Redirigiendo...');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        });
    }


    // Validaciones extendidas para el formulario de registro
function configurarValidacionesRegistro() {
    const registroForm = document.getElementById('registroForm');
    if (!registroForm) return;

    registroForm.addEventListener('submit', (e) => {
        e.preventDefault();
        procesarRegistro();
    });

    // Configurar dependencia región-comuna
    const regionSelect = document.getElementById('region');
    const comunaSelect = document.getElementById('comuna');

    if (regionSelect && comunaSelect) {
        regionSelect.addEventListener('change', (e) => {
            actualizarComunas(e.target.value, comunaSelect);
        });
    }
}

function actualizarComunas(region, comunaSelect) {
    const comunas = {
        'Metropolitana': ['Santiago', 'Providencia', 'Las Condes', 'Ñuñoa', 'Maipú'],
        'Valparaíso': ['Valparaíso', 'Viña del Mar', 'Quilpué', 'Villa Alemana'],
        'Biobío': ['Concepción', 'Talcahuano', 'Coronel', 'Lota']
    };

    comunaSelect.innerHTML = '<option value="">Selecciona una comuna</option>';
    
    if (region && comunas[region]) {
        comunas[region].forEach(comuna => {
            comunaSelect.innerHTML += `<option value="${comuna}">${comuna}</option>`;
        });
    }
}

function procesarRegistro() {
    const datos = {
        rut: document.getElementById('rut').value,
        nombre: document.getElementById('nombre').value,
        apellidos: document.getElementById('apellidos').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        confirmPassword: document.getElementById('confirmPassword').value,
        fechaNacimiento: document.getElementById('fechaNacimiento').value,
        region: document.getElementById('region').value,
        comuna: document.getElementById('comuna').value,
        direccion: document.getElementById('direccion').value
    };

    // Validaciones
    if (!validarRegistroCompleto(datos)) {
        return;
    }

    // Simular registro exitoso
    alert('¡Registro exitoso! Redirigiendo al login...');
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 1500);
}

function validarRegistroCompleto(datos) {
    // Validar RUT
    if (!validarRUT(datos.rut)) {
        alert('El RUT ingresado no es válido');
        return false;
    }

    // Validar nombre y apellidos
    const validacionNombre = ValidadorBiblioteca.validarTexto(datos.nombre, 'Nombre', 50);
    if (!validacionNombre.valido) {
        alert(validacionNombre.mensaje);
        return false;
    }

    const validacionApellidos = ValidadorBiblioteca.validarTexto(datos.apellidos, 'Apellidos', 100);
    if (!validacionApellidos.valido) {
        alert(validacionApellidos.mensaje);
        return false;
    }

    // Validar email
    const validacionEmail = ValidadorBiblioteca.validarEmail(datos.email);
    if (!validacionEmail.valido) {
        alert(validacionEmail.mensaje);
        return false;
    }

    // Validar contraseña
    const validacionPassword = ValidadorBiblioteca.validarPassword(datos.password);
    if (!validacionPassword.valido) {
        alert(validacionPassword.mensaje);
        return false;
    }

    // Validar confirmación de contraseña
    if (datos.password !== datos.confirmPassword) {
        alert('Las contraseñas no coinciden');
        return false;
    }

    // Validar dirección
    const validacionDireccion = ValidadorBiblioteca.validarTexto(datos.direccion, 'Dirección', 300);
    if (!validacionDireccion.valido) {
        alert(validacionDireccion.mensaje);
        return false;
    }

    return true;
}

function validarRUT(rut) {
    // Validación básica de RUT chileno
    const rutRegex = /^[0-9]+[-|‐]{1}[0-9kK]{1}$/;
    return rutRegex.test(rut);
}

// Inicializar validaciones de registro
document.addEventListener('DOMContentLoaded', () => {
    configurarValidacionesRegistro();
});


});