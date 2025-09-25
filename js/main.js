// Datos de ejemplo para la biblioteca
const libros = [
    {
        id: 1,
        titulo: "Cien Años de Soledad",
        autor: "Gabriel García Márquez",
        genero: "Realismo Mágico",
        año: 1967,
        descripcion: "Una obra maestra de la literatura latinoamericana que narra la historia de la familia Buendía en Macondo.",
        portada: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        disponible: true,
        destacado: true
    },
    {
        id: 2,
        titulo: "1984",
        autor: "George Orwell",
        genero: "Ciencia Ficción",
        año: 1949,
        descripcion: "Una distopía clásica sobre un régimen totalitario y la vigilancia masiva.",
        portada: "https://images.unsplash.com/photo-1589998059171-988d887df646?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        disponible: true,
        destacado: true
    },
    {
        id: 3,
        titulo: "El Quijote de la Mancha",
        autor: "Miguel de Cervantes",
        genero: "Clásico",
        año: 1605,
        descripcion: "La obra cumbre de la literatura española y una de las más importantes de la literatura universal.",
        portada: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        disponible: true,
        destacado: false
    },
    {
        id: 4,
        titulo: "Harry Potter y la Piedra Filosofal",
        autor: "J.K. Rowling",
        genero: "Fantasía",
        año: 1997,
        descripcion: "El primer libro de la famosa serie que inició el fenómeno mundial de Harry Potter.",
        portada: "https://images.unsplash.com/photo-1621351183012-e2f9972dd9bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        disponible: true,
        destacado: true
    },
    {
        id: 5,
        titulo: "Orgullo y Prejuicio",
        autor: "Jane Austen",
        genero: "Romance",
        año: 1813,
        descripcion: "Una comedia romántica que explora las relaciones de clase y el amor en la Inglaterra del siglo XIX.",
        portada: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        disponible: false,
        destacado: false
    },
    {
        id: 6,
        titulo: "Crónica de una Muerte Anunciada",
        autor: "Gabriel García Márquez",
        genero: "Novela",
        año: 1981,
        descripcion: "Una novela basada en un hecho real ocurrido en Colombia en 1951.",
        portada: "https://images.unsplash.com/photo-1512820790803-83ca734da794?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        disponible: true,
        destacado: true
    }
];

class Biblioteca {
    constructor() {
        this.librosPrestados = JSON.parse(localStorage.getItem('librosPrestados')) || [];
        this.init();
    }

    init() {
        this.cargarLibrosDestacados();
        this.setupEventListeners();
    }

    cargarLibrosDestacados() {
        const container = document.getElementById('featuredBooks');
        if (!container) return;

        const librosDestacados = libros.filter(libro => libro.destacado);
        
        container.innerHTML = librosDestacados.map(libro => `
            <div class="book-card">
                <img src="${libro.portada}" alt="${libro.titulo}" class="book-cover">
                <h3 class="book-title">${libro.titulo}</h3>
                <p class="book-author">${libro.autor}</p>
                <p class="book-genre">${libro.genero} • ${libro.año}</p>
                <div class="book-actions">
                    <button class="btn-secondary" onclick="biblioteca.verDetalle(${libro.id})">
                        <i class="fas fa-eye"></i> Ver
                    </button>
                    <button class="btn-primary" onclick="biblioteca.prestarLibro(${libro.id})" 
                            ${!libro.disponible ? 'disabled' : ''}>
                        <i class="fas fa-book"></i> Prestar
                    </button>
                </div>
            </div>
        `).join('');
    }

    verDetalle(libroId) {
        window.location.href = `libro-detalle.html?id=${libroId}`;
    }

    prestarLibro(libroId) {
        const libro = libros.find(l => l.id === libroId);
        if (!libro) return;

        if (this.librosPrestados.find(l => l.id === libroId)) {
            this.mostrarNotificacion('Ya tienes este libro prestado', 'error');
            return;
        }

        this.librosPrestados.push({
            ...libro,
            fechaPrestamo: new Date().toISOString(),
            fechaDevolucion: this.calcularFechaDevolucion()
        });

        localStorage.setItem('librosPrestados', JSON.stringify(this.librosPrestados));
        
        libro.disponible = false;
        this.mostrarNotificacion(`¡Libro "${libro.titulo}" prestado exitosamente!`, 'success');
        this.cargarLibrosDestacados();
    }

    calcularFechaDevolucion() {
        const fecha = new Date();
        fecha.setDate(fecha.getDate() + 14); // 2 semanas de préstamo
        return fecha.toISOString();
    }

    setupEventListeners() {
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) {
            loginBtn.addEventListener('click', () => {
                window.location.href = 'login.html';
            });
        }
    }

    mostrarNotificacion(mensaje, tipo = 'success') {
        // Crear notificación simple
        alert(mensaje); // En una versión mejorada, usaríamos un sistema de notificaciones bonito
    }
}

// Inicializar la biblioteca cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.biblioteca = new Biblioteca();
});