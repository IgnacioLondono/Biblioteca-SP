class DetalleLibro {
    constructor() {
        this.libroId = this.obtenerIdDesdeURL();
        this.libro = null;
        this.init();
    }

    obtenerIdDesdeURL() {
        const params = new URLSearchParams(window.location.search);
        return parseInt(params.get('id')) || 1;
    }

    init() {
        this.cargarDetalleLibro();
    }

    cargarDetalleLibro() {
        this.libro = libros.find(l => l.id === this.libroId) || this.libroPorDefecto();
        
        const container = document.getElementById('bookDetail');
        if (!container) return;

        container.innerHTML = `
            <div class="book-detail">
                <div class="detail-header">
                    <img src="${this.libro.portada}" alt="${this.libro.titulo}" class="detail-cover">
                    <div class="detail-info">
                        <h1>${this.libro.titulo}</h1>
                        <h2>Por ${this.libro.autor}</h2>
                        <div class="book-meta">
                            <span><i class="fas fa-book"></i> ${this.libro.genero}</span>
                            <span><i class="fas fa-calendar"></i> ${this.libro.año}</span>
                            <span class="status ${this.libro.disponible ? 'available' : 'unavailable'}">
                                <i class="fas fa-circle"></i> 
                                ${this.libro.disponible ? 'Disponible para préstamo' : 'Actualmente prestado'}
                            </span>
                        </div>
                        <p class="book-description">${this.libro.descripcion}</p>
                        <button class="btn-primary" onclick="detalleLibro.prestar()" 
                                ${!this.libro.disponible ? 'disabled' : ''}>
                            <i class="fas fa-book"></i> Solicitar Préstamo
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    libroPorDefecto() {
        return {
            id: 0,
            titulo: "Libro no encontrado",
            autor: "Autor desconocido",
            genero: "Desconocido",
            año: "N/A",
            descripcion: "El libro solicitado no está disponible en nuestro catálogo.",
            portada: "https://images.unsplash.com/photo-1512820790803-83ca734da794?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
            disponible: false
        };
    }

    prestar() {
        if (this.libro.disponible) {
            biblioteca.prestarLibro(this.libro.id);
            this.cargarDetalleLibro(); // Recargar para actualizar estado
        }
    }
}

// Inicializar detalle del libro
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('bookDetail')) {
        window.detalleLibro = new DetalleLibro();
    }
});