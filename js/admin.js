// admin.js - Panel de administración
class PanelAdministracion {
    constructor() {
        this.librosPrestados = JSON.parse(localStorage.getItem('librosPrestados')) || [];
        this.init();
    }

    init() {
        this.cargarEstadisticas();
        this.cargarPrestamosRecientes();
        this.configurarEventos();
    }

    cargarEstadisticas() {
        // Total de libros
        document.getElementById('totalLibros').textContent = libros.length;
        
        // Total de usuarios (simulado)
        document.getElementById('totalUsuarios').textContent = '125';
        
        // Préstamos activos
        const prestamosActivos = this.librosPrestados.length;
        document.getElementById('prestamosActivos').textContent = prestamosActivos;
        
        // Préstamos vencidos
        const vencidos = this.librosPrestados.filter(prestamo => {
            return new Date(prestamo.fechaDevolucion) < new Date();
        }).length;
        document.getElementById('vencidos').textContent = vencidos;
    }

    cargarPrestamosRecientes() {
        const tabla = document.getElementById('prestamosTable');
        if (!tabla) return;

        const prestamosRecientes = this.librosPrestados.slice(0, 5);
        
        tabla.innerHTML = prestamosRecientes.map(prestamo => {
            const vence = new Date(prestamo.fechaDevolucion);
            const hoy = new Date();
            const estaVencido = vence < hoy;
            const diasRestantes = Math.ceil((vence - hoy) / (1000 * 60 * 60 * 24));
            
            return `
                <tr>
                    <td>Usuario #${prestamo.id}</td>
                    <td>${prestamo.titulo}</td>
                    <td>${new Date(prestamo.fechaPrestamo).toLocaleDateString('es-CL')}</td>
                    <td>${vence.toLocaleDateString('es-CL')}</td>
                    <td>
                        <span class="${estaVencido ? 'unavailable' : 'available'}">
                            ${estaVencido ? 'Vencido' : `${diasRestantes} días restantes`}
                        </span>
                    </td>
                    <td>
                        <button class="btn-small btn-primary" onclick="admin.devolverLibro(${prestamo.id})">
                            <i class="fas fa-undo"></i> Devolver
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        if (prestamosRecientes.length === 0) {
            tabla.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem;">No hay préstamos activos</td></tr>';
        }
    }

    devolverLibro(libroId) {
        if (!confirm('¿Marcar este libro como devuelto?')) return;

        // Encontrar el libro en el array global y marcarlo como disponible
        const libro = libros.find(l => l.id === libroId);
        if (libro) {
            libro.disponible = true;
        }

        // Remover del array de préstamos
        this.librosPrestados = this.librosPrestados.filter(p => p.id !== libroId);
        localStorage.setItem('librosPrestados', JSON.stringify(this.librosPrestados));

        this.cargarEstadisticas();
        this.cargarPrestamosRecientes();
        alert('Libro marcado como devuelto exitosamente');
    }

    configurarEventos() {
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                if (confirm('¿Estás seguro de que quieres salir del panel de administración?')) {
                    window.location.href = '../index.html';
                }
            });
        }
    }
}

// Inicializar panel de administración
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.admin-container')) {
        window.admin = new PanelAdministracion();
    }
});