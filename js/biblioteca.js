// Funcionalidades extendidas para el catálogo
class Catalogo {
    constructor() {
        this.librosFiltrados = [...libros];
        this.init();
    }

    init() {
        this.cargarCatalogoCompleto();
        this.setupFiltros();
    }

    cargarCatalogoCompleto() {
        const container = document.getElementById('catalogBooks');
        if (!container) return;

        container.innerHTML = this.librosFiltrados.map(libro => `
            <div class="book-card">
                <img src="${libro.portada}" alt="${libro.titulo}" class="book-cover">
                <h3 class="book-title">${libro.titulo}</h3>
                <p class="book-author">${libro.autor}</p>
                <p class="book-genre">${libro.genero} • ${libro.año}</p>
                <p class="book-status ${libro.disponible ? 'available' : 'unavailable'}">
                    ${libro.disponible ? 'Disponible' : 'Prestado'}
                </p>
                <div class="book-actions">
                    <button class="btn-secondary" onclick="catalogo.verDetalle(${libro.id})">
                        <i class="fas fa-eye"></i> Ver Detalles
                    </button>
                    <button class="btn-primary" onclick="catalogo.prestarLibro(${libro.id})" 
                            ${!libro.disponible ? 'disabled' : ''}>
                        <i class="fas fa-book"></i> Prestar
                    </button>
                </div>
            </div>
        `).join('');
    }

    setupFiltros() {
        const searchInput = document.getElementById('searchInput');
        const genreFilter = document.getElementById('genreFilter');

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filtrarLibros(e.target.value, genreFilter.value);
            });
        }

        if (genreFilter) {
            genreFilter.addEventListener('change', (e) => {
                this.filtrarLibros(searchInput.value, e.target.value);
            });
        }
    }

    filtrarLibros(textoBusqueda, genero) {
        this.librosFiltrados = libros.filter(libro => {
            const coincideTexto = libro.titulo.toLowerCase().includes(textoBusqueda.toLowerCase()) ||
                                libro.autor.toLowerCase().includes(textoBusqueda.toLowerCase());
            const coincideGenero = !genero || libro.genero === genero;
            
            return coincideTexto && coincideGenero;
        });

        this.cargarCatalogoCompleto();
    }

    verDetalle(libroId) {
        window.location.href = `libro-detalle.html?id=${libroId}`;
    }

    prestarLibro(libroId) {
        biblioteca.prestarLibro(libroId);
        this.cargarCatalogoCompleto();
    }
}

// Inicializar catálogo si estamos en la página correspondiente
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('catalogBooks')) {
        window.catalogo = new Catalogo();
    }
});