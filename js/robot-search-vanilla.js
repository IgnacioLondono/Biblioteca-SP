/*
  robot-search-vanilla.js
  - Implementa manejo de previosTerms (localStorage), debounce (useEffect-like),
    subida básica de imágenes (simulada), y llamadas a un endpoint de "robots"
    usando Axios si está disponible o Fetch como fallback.
  - Expone window.robotSearch para debug/test.

  Integración: libros.html incluye un botón #robotBtn y un input #robotImages.
  Al hacer click en "Robot" se abre el selector de imágenes y se ejecuta la
  acción que envía el state como parámetro a la llamada HTTP.
*/
(function () {
    const LOCAL_KEY = 'previousSearches';

    // Estado local (similar a useState de React)
    const state = {
        term: '',
        previosTerms: [],
        images: [], // { file, previewUrl, uploadedUrl?, status }
        isLoading: false,
        results: null,
        error: null
    };

    // debounce timer (useEffect-like behavior)
    let debounceTimer = null;

    // Init: cargar previosTerms y enlazar eventos
    function init() {
        loadPreviosTerms();
        bindElements();
        renderPreviosTerms();
    }

    function loadPreviosTerms() {
        try {
            const raw = localStorage.getItem(LOCAL_KEY);
            if (raw) state.previosTerms = JSON.parse(raw);
        } catch (e) {
            console.warn('robot-search: no se pudo leer previousSearches', e);
        }
    }

    function savePreviosTerms() {
        try {
            localStorage.setItem(LOCAL_KEY, JSON.stringify(state.previosTerms));
        } catch (e) {
            console.warn('robot-search: no se pudo guardar previousSearches', e);
        }
    }

    function bindElements() {
        const searchInput = document.getElementById('searchInput');
        const robotBtn = document.getElementById('robotBtn');
        const imagesInput = document.getElementById('robotImages');

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                state.term = e.target.value;

                // Debounce: llamar a handleSearch cuando el usuario deja de escribir
                if (debounceTimer) clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    // Llamado controlado (simula useEffect que depende de `term`)
                    handleSearch({ term: state.term, previosTerms: [...state.previosTerms], images: [...state.images] });
                }, 400);
            });
        }

        if (robotBtn) {
            robotBtn.addEventListener('click', async () => {
                // Abrir selector de imágenes opcional
                if (imagesInput) imagesInput.click();

                // Si no se quieren imágenes, también se puede disparar sin ellas
                // Dejamos un pequeño delay para que el usuario pueda seleccionar imágenes
                setTimeout(async () => {
                    await handleSubmit();
                }, 300);
            });
        }

        if (imagesInput) {
            imagesInput.addEventListener('change', (e) => {
                handleImageSelection(e.target.files);
            });
        }
    }

    function renderPreviosTerms() {
        // Añadir UI simple arriba o abajo del buscador
        let container = document.getElementById('previosTermsContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'previosTermsContainer';
            container.style.marginTop = '0.8rem';
            const filters = document.querySelector('.filters');
            if (filters) filters.parentNode.insertBefore(container, filters.nextSibling);
        }

        container.innerHTML = '';
        if (state.previosTerms.length === 0) return;

        const title = document.createElement('div');
        title.textContent = 'Búsquedas anteriores:';
        title.style.fontSize = '0.9rem';
        title.style.color = 'var(--text-light)';
        title.style.marginBottom = '0.4rem';
        container.appendChild(title);

        const list = document.createElement('div');
        list.style.display = 'flex';
        list.style.gap = '0.5rem';
        state.previosTerms.forEach(t => {
            const btn = document.createElement('button');
            btn.className = 'btn-secondary';
            btn.textContent = t;
            btn.style.padding = '0.3rem 0.6rem';
            btn.addEventListener('click', () => {
                const input = document.getElementById('searchInput');
                if (input) input.value = t;
                state.term = t;
                handleSearch({ term: state.term, previosTerms: [...state.previosTerms], images: [...state.images] });
            });
            list.appendChild(btn);
        });
        container.appendChild(list);
    }

    // Manejo de imágenes (preview + estado)
    function handleImageSelection(fileList) {
        const files = Array.from(fileList || []);
        const mapped = files.map(file => ({
            file,
            previewUrl: URL.createObjectURL(file),
            uploadedUrl: null,
            status: 'pending'
        }));

        state.images = [...mapped, ...state.images].slice(0, 6);
        renderImagesPreview();
    }

    function renderImagesPreview() {
        let container = document.getElementById('robotImagesPreview');
        if (!container) {
            container = document.createElement('div');
            container.id = 'robotImagesPreview';
            container.style.display = 'flex';
            container.style.gap = '0.5rem';
            container.style.marginTop = '0.6rem';
            const filters = document.querySelector('.filters');
            if (filters) filters.parentNode.insertBefore(container, filters.nextSibling);
        }

        container.innerHTML = '';
        state.images.forEach((img, i) => {
            const wrap = document.createElement('div');
            wrap.style.width = '60px';
            wrap.style.textAlign = 'center';
            const image = document.createElement('img');
            image.src = img.previewUrl || img.uploadedUrl;
            image.style.width = '100%';
            image.style.height = '60px';
            image.style.objectFit = 'cover';
            image.style.borderRadius = '4px';
            wrap.appendChild(image);
            const status = document.createElement('div');
            status.style.fontSize = '0.7rem';
            status.style.color = '#666';
            status.textContent = img.status;
            wrap.appendChild(status);
            container.appendChild(wrap);
        });
    }

    // Subida de imágenes (simulada si no existe endpoint). Devuelve Promise resolving to updated images array
    function uploadImages(imagesToUpload = []) {
        // Si no hay archivos, devolver el array original
        if (!imagesToUpload || imagesToUpload.length === 0) return Promise.resolve([]);

        // Simular subida: usar Promise.all con timeout para cada archivo
        const uploads = imagesToUpload.map(item => {
            // si ya tiene uploadedUrl, ignorar
            if (item.uploadedUrl) {
                return Promise.resolve({ ...item, status: 'done' });
            }

            return new Promise(resolve => {
                // Simular delay 600-1200ms
                const delay = 600 + Math.floor(Math.random() * 600);
                setTimeout(() => {
                    // Simular url de subida (básica)
                    const uploadedUrl = item.previewUrl;
                    resolve({ ...item, uploadedUrl, status: 'done' });
                }, delay);
            });
        });

        return Promise.all(uploads);
    }

    // callRobots: action que realiza la llamada HTTP. Recibe payload (state) como parámetro.
    function callRobots(payload) {
        const url = 'https://api.ejemplo.com/robots/search'; // reemplaza por tu endpoint real

        // Si axios está disponible, usarlo
        if (window.axios) {
            return window.axios.post(url, payload).then(r => r.data);
        }

        // Fallback a fetch con promesas
        return fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        }).then(resp => {
            if (!resp.ok) throw new Error('HTTP ' + resp.status);
            return resp.json();
        });
    }

    // handleSearch: llamada controlada que no altera el previosTerms (solo consulta)
    async function handleSearch(stateToSend) {
        // Evitar llamadas vacías
        if (!stateToSend || !stateToSend.term || stateToSend.term.trim() === '') return;

        setLoading(true);
        clearError();

        const payload = {
            term: stateToSend.term.trim(),
            previous: stateToSend.previosTerms || [],
            imagesMeta: (stateToSend.images || []).map(i => ({ name: i.file?.name || 'preview', status: i.status }))
        };

        try {
            // Llamada real (si no hay endpoint real, this will fail) — catch arriba
            const resp = await callRobots(payload);
            state.results = resp;
            renderResults();
        } catch (err) {
            // si no hay backend, simular respuesta
            console.warn('robot-search: callRobots falló, se simula respuesta ->', err.message);
            const simulated = { results: [`Simulación para: "${payload.term}"`], timestamp: new Date().toISOString() };
            state.results = simulated;
            renderResults();
        } finally {
            setLoading(false);
        }
    }

    // handleSubmit: subir imágenes (si las hay), actualizar previosTerms y llamar a robots
    async function handleSubmit() {
        setLoading(true);
        clearError();

        try {
            // Subir imágenes pendientes
            const pending = state.images.filter(i => i.status === 'pending');
            if (pending.length > 0) {
                const uploaded = await uploadImages(pending);
                // mezclar con el resto
                const others = state.images.filter(i => i.status !== 'pending');
                state.images = [...uploaded, ...others];
                renderImagesPreview();
            }

            // Actualizar previosTerms (añadir al inicio si no existe)
            const normalized = state.term.trim();
            if (normalized) {
                if (!state.previosTerms.includes(normalized)) {
                    state.previosTerms = [normalized, ...state.previosTerms].slice(0, 10);
                    savePreviosTerms();
                    renderPreviosTerms();
                }
            }

            // Llamar al robot pasando el state como parámetro
            await handleSearch({ term: state.term, previosTerms: [...state.previosTerms], images: [...state.images] });
        } catch (err) {
            setError(err.message || 'Error en envío');
        } finally {
            setLoading(false);
        }
    }

    // Helpers UI: loading, error, results
    function setLoading(val) {
        state.isLoading = val;
        let el = document.getElementById('robotLoading');
        if (!el) {
            el = document.createElement('div');
            el.id = 'robotLoading';
            el.style.marginTop = '0.6rem';
            const filters = document.querySelector('.filters');
            if (filters) filters.parentNode.insertBefore(el, filters.nextSibling);
        }
        el.textContent = val ? 'Cargando...' : '';
    }

    function setError(msg) {
        state.error = msg;
        renderError();
    }

    function clearError() {
        state.error = null;
        renderError();
    }

    function renderError() {
        let el = document.getElementById('robotError');
        if (!el) {
            el = document.createElement('div');
            el.id = 'robotError';
            el.style.color = '#e74c3c';
            el.style.marginTop = '0.4rem';
            const filters = document.querySelector('.filters');
            if (filters) filters.parentNode.insertBefore(el, filters.nextSibling);
        }
        el.textContent = state.error || '';
    }

    function renderResults() {
        let el = document.getElementById('robotResults');
        if (!el) {
            el = document.createElement('div');
            el.id = 'robotResults';
            el.style.marginTop = '0.8rem';
            const container = document.querySelector('.container') || document.body;
            container.appendChild(el);
        }

        if (!state.results) {
            el.innerHTML = '';
            return;
        }

        // Render simple
        el.innerHTML = `<pre style="white-space: pre-wrap; background: #fff; padding: 1rem; border-radius: 8px;">${JSON.stringify(state.results, null, 2)}</pre>`;
    }

    // Exponer API para tests / consola
    window.robotSearch = {
        init,
        getState: () => JSON.parse(JSON.stringify(state)),
        handleSearch: (s) => handleSearch(s),
        handleSubmit: () => handleSubmit(),
        uploadImages
    };

    // Auto init on DOM ready
    document.addEventListener('DOMContentLoaded', () => init());

})();
