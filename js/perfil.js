// perfil.js - Sistema completo de perfil de usuario
class PerfilUsuario {
    constructor() {
        this.usuarioActual = this.obtenerUsuarioActual();
        this.librosPrestados = JSON.parse(localStorage.getItem('librosPrestados')) || [];
        this.historialPrestamos = JSON.parse(localStorage.getItem('historialPrestamos')) || [];
        this.configuracion = JSON.parse(localStorage.getItem('configuracionUsuario')) || this.configuracionPorDefecto();
        this.init();
    }

    init() {
        if (!this.usuarioActual) {
            alert('Debes iniciar sesión para ver tu perfil');
            window.location.href = 'login.html';
            return;
        }

        this.cargarDatosUsuario();
        this.cargarPrestamos();
        this.configurarEventos();
        this.configurarTabs();
    }

    obtenerUsuarioActual() {
        // En una aplicación real, esto vendría del sistema de autenticación
        return {
            id: 1001,
            rut: '12345678-9',
            nombre: 'Juan',
            apellidos: 'Pérez González',
            email: 'juan.perez@duoc.cl',
            fechaNacimiento: '1995-05-15',
            fechaRegistro: '2024-01-15',
            region: 'Metropolitana',
            comuna: 'Santiago',
            direccion: 'Av. Principal 123, Depto 45'
        };
    }

    configuracionPorDefecto() {
        return {
            notificacionesEmail: true,
            limitePrestamos: 5,
            tema: 'claro'
        };
    }

    cargarDatosUsuario() {
        // Información básica
        document.getElementById('userName').textContent = `${this.usuarioActual.nombre} ${this.usuarioActual.apellidos}`;
        document.getElementById('userEmail').textContent = this.usuarioActual.email;
        document.getElementById('userId').textContent = `#${this.usuarioActual.id}`;
        document.getElementById('memberSince').textContent = new Date(this.usuarioActual.fechaRegistro).toLocaleDateString('es-CL', {
            year: 'numeric',
            month: 'long'
        });

        // Formulario de perfil
        document.getElementById('profileRUT').value = this.usuarioActual.rut;
        document.getElementById('profileNombre').value = this.usuarioActual.nombre;
        document.getElementById('profileApellidos').value = this.usuarioActual.apellidos;
        document.getElementById('profileFechaNacimiento').value = this.usuarioActual.fechaNacimiento;
        document.getElementById('profileRegion').value = this.usuarioActual.region;
        document.getElementById('profileDireccion').value = this.usuarioActual.direccion;

        this.actualizarComunas(this.usuarioActual.region);
        document.getElementById('profileComuna').value = this.usuarioActual.comuna;

        // Configuración
        document.getElementById('notificacionesEmail').checked = this.configuracion.notificacionesEmail;
        document.getElementById('limitePrestamos').value = this.configuracion.limitePrestamos;
    }

    actualizarComunas(region) {
        const comunas = {
            'Metropolitana': ['Santiago', 'Providencia', 'Las Condes', 'Ñuñoa', 'Maipú'],
            'Valparaíso': ['Valparaíso', 'Viña del Mar', 'Quilpué', 'Villa Alemana'],
            'Biobío': ['Concepción', 'Talcahuano', 'Coronel', 'Lota']
        };

        const comunaSelect = document.getElementById('profileComuna');
        comunaSelect.innerHTML = '<option value="">Selecciona una comuna</option>';
        
        if (region && comunas[region]) {
            comunas[region].forEach(comuna => {
                comunaSelect.innerHTML += `<option value="${comuna}">${comuna}</option>`;
            });
        }
    }

    cargarPrestamos() {
        const prestamosActivos = this.librosPrestados.filter(p => 
            new Date(p.fechaDevolucion) >= new Date()
        );

        const prestamosProximos = prestamosActivos.filter(p => {
            const diasRestantes = this.calcularDiasRestantes(p.fechaDevolucion);
            return diasRestantes <= 3 && diasRestantes > 0;
        });

        const prestamosVencidos = this.librosPrestados.filter(p => 
            new Date(p.fechaDevolucion) < new Date()
        );

        // Estadísticas
        document.getElementById('totalPrestamos').textContent = prestamosActivos.length;
        document.getElementById('totalLeidos').textContent = this.historialPrestamos.length;
        document.getElementById('proximosVencer').textContent = prestamosProximos.length;
        document.getElementById('puntos').textContent = this.historialPrestamos.length * 10;

        // Lista de préstamos activos
        this.mostrarPrestamosActivos(prestamosActivos);
        this.mostrarPrestamosProximos(prestamosProximos);
        this.mostrarHistorialCompleto();
    }

    mostrarPrestamosActivos(prestamos) {
        const container = document.getElementById('prestamosActivosList');
        
        if (prestamos.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #666;">
                    <i class="fas fa-book" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                    <p>No tienes préstamos activos en este momento</p>
                    <a href="libros.html" class="btn-primary">Explorar Catálogo</a>
                </div>
            `;
            return;
        }

        container.innerHTML = prestamos.map(prestamo => {
            const diasRestantes = this.calcularDiasRestantes(prestamo.fechaDevolucion);
            const porcentaje = Math.max(0, Math.min(100, (diasRestantes / 14) * 100));
            
            return `
                <div class="prestamo-card">
                    <img src="${prestamo.portada}" alt="${prestamo.titulo}" class="prestamo-cover">
                    <div class="prestamo-info">
                        <h3>${prestamo.titulo}</h3>
                        <p><strong>Autor:</strong> ${prestamo.autor}</p>
                        <p><strong>Fecha de préstamo:</strong> ${new Date(prestamo.fechaPrestamo).toLocaleDateString('es-CL')}</p>
                        <p><strong>Vence en:</strong> ${new Date(prestamo.fechaDevolucion).toLocaleDateString('es-CL')}</p>
                        
                        <div style="background: #f0f0f0; border-radius: 10px; height: 8px; margin: 0.5rem 0;">
                            <div style="background: ${diasRestantes <= 3 ? '#e74c3c' : '#2ecc71'}; 
                                        width: ${porcentaje}%; height: 100%; border-radius: 10px;"></div>
                        </div>
                        <p><small>${diasRestantes} días restantes</small></p>
                    </div>
                    <div>
                        <span class="prestamo-status status-activo">Activo</span>
                        <button class="btn-renew" onclick="perfil.renovarPrestamo(${prestamo.id})" 
                                ${diasRestantes > 3 ? '' : 'disabled'}>
                            <i class="fas fa-redo"></i> Renovar
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    mostrarPrestamosProximos(prestamos) {
        const container = document.getElementById('prestamosProximosList');
        
        if (prestamos.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #666;">No hay préstamos próximos a vencer</p>';
            return;
        }

        container.innerHTML = prestamos.map(prestamo => {
            const diasRestantes = this.calcularDiasRestantes(prestamo.fechaDevolucion);
            
            return `
                <div class="prestamo-card" style="border-left: 4px solid #f39c12;">
                    <img src="${prestamo.portada}" alt="${prestamo.titulo}" class="prestamo-cover">
                    <div class="prestamo-info">
                        <h3>${prestamo.titulo}</h3>
                        <p><strong>Vence en:</strong> ${diasRestantes} día${diasRestantes !== 1 ? 's' : ''}</p>
                        <p style="color: #e67e22;"><i class="fas fa-exclamation-triangle"></i> 
                        ¡Recuerda devolver o renovar este libro pronto!</p>
                    </div>
                    <div>
                        <span class="prestamo-status status-proximo">Por Vencer</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    mostrarHistorialCompleto() {
        const container = document.getElementById('historialPrestamos');
        const historialCompleto = [...this.historialPrestamos, ...this.librosPrestados];

        if (historialCompleto.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #666;">
                    <i class="fas fa-history" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                    <p>Aún no tienes historial de préstamos</p>
                </div>
            `;
            return;
        }

        container.innerHTML = historialCompleto.map(prestamo => {
            const esActivo = new Date(prestamo.fechaDevolucion) >= new Date();
            const fueDevuelto = this.historialPrestamos.some(h => h.id === prestamo.id);
            
            return `
                <div class="prestamo-card">
                    <img src="${prestamo.portada}" alt="${prestamo.titulo}" class="prestamo-cover">
                    <div class="prestamo-info">
                        <h3>${prestamo.titulo}</h3>
                        <p><strong>Autor:</strong> ${prestamo.autor}</p>
                        <p><strong>Prestado:</strong> ${new Date(prestamo.fechaPrestamo).toLocaleDateString('es-CL')}</p>
                        <p><strong>Devuelto:</strong> ${fueDevuelto ? new Date(prestamo.fechaDevolucion).toLocaleDateString('es-CL') : 'Pendiente'}</p>
                    </div>
                    <div>
                        <span class="prestamo-status ${esActivo ? 'status-activo' : 'status-vencido'}">
                            ${esActivo ? 'Activo' : 'Completado'}
                        </span>
                    </div>
                </div>
            `;
        }).join('');
    }

    calcularDiasRestantes(fechaDevolucion) {
        const unDia = 24 * 60 * 60 * 1000;
        const hoy = new Date();
        const vence = new Date(fechaDevolucion);
        return Math.ceil((vence - hoy) / unDia);
    }

    renovarPrestamo(libroId) {
        const prestamo = this.librosPrestados.find(p => p.id === libroId);
        if (!prestamo) return;

        if (this.calcularDiasRestantes(prestamo.fechaDevolucion) <= 3) {
            alert('No puedes renovar libros que vencen en menos de 3 días');
            return;
        }

        // Extender por 14 días más
        prestamo.fechaDevolucion = new Date(new Date(prestamo.fechaDevolucion).getTime() + (14 * 24 * 60 * 60 * 1000)).toISOString();
        
        localStorage.setItem('librosPrestados', JSON.stringify(this.librosPrestados));
        
        this.cargarPrestamos();
        alert('¡Préstamo renovado por 14 días más!');
    }

    configurarEventos() {
        // Formulario de perfil
        const profileForm = document.getElementById('profileForm');
        if (profileForm) {
            profileForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.guardarPerfil();
            });
        }

        // Región -> Comuna
        const regionSelect = document.getElementById('profileRegion');
        if (regionSelect) {
            regionSelect.addEventListener('change', (e) => {
                this.actualizarComunas(e.target.value);
            });
        }

        // Logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
                    localStorage.removeItem('usuarioActual');
                    window.location.href = 'index.html';
                }
            });
        }
    }

    configurarTabs() {
        const tabs = document.querySelectorAll('.tab');
        const tabContents = document.querySelectorAll('.tab-content');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Remover active de todos
                tabs.forEach(t => t.classList.remove('active'));
                tabContents.forEach(tc => tc.classList.remove('active'));

                // Activar tab clickeado
                tab.classList.add('active');
                document.getElementById(`${tab.dataset.tab}-tab`).classList.add('active');
            });
        });
    }

    guardarPerfil() {
        const datosActualizados = {
            ...this.usuarioActual,
            nombre: document.getElementById('profileNombre').value,
            apellidos: document.getElementById('profileApellidos').value,
            fechaNacimiento: document.getElementById('profileFechaNacimiento').value,
            region: document.getElementById('profileRegion').value,
            comuna: document.getElementById('profileComuna').value,
            direccion: document.getElementById('profileDireccion').value
        };

        // Validaciones básicas
        if (!datosActualizados.nombre || !datosActualizados.apellidos || !datosActualizados.direccion) {
            alert('Por favor, completa todos los campos requeridos');
            return;
        }

        this.usuarioActual = datosActualizados;
        localStorage.setItem('usuarioActual', JSON.stringify(this.usuarioActual));
        
        alert('¡Perfil actualizado exitosamente!');
        this.cargarDatosUsuario();
    }

    guardarConfiguracion() {
        this.configuracion.notificacionesEmail = document.getElementById('notificacionesEmail').checked;
        this.configuracion.limitePrestamos = parseInt(document.getElementById('limitePrestamos').value);
        
        localStorage.setItem('configuracionUsuario', JSON.stringify(this.configuracion));
        alert('Configuración guardada exitosamente');
    }

    cancelarEdicion() {
        this.cargarDatosUsuario();
        alert('Cambios cancelados');
    }

    eliminarCuenta() {
        if (!confirm('¿ESTÁS ABSOLUTAMENTE SEGURO? Esta acción eliminará permanentemente tu cuenta y todo tu historial.')) {
            return;
        }

        if (!confirm('ESTO NO SE PUEDE DESHACER. ¿Confirmas que quieres eliminar tu cuenta?')) {
            return;
        }

        // Limpiar datos del usuario
        localStorage.removeItem('usuarioActual');
        localStorage.removeItem('librosPrestados');
        localStorage.removeItem('historialPrestamos');
        localStorage.removeItem('configuracionUsuario');
        
        alert('Cuenta eliminada. Serás redirigido a la página principal.');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    }
}

// Inicializar perfil cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.perfil = new PerfilUsuario();
});