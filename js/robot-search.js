// robot-search.js
// Módulo ES reutilizable que exporta funciones para manejar búsquedas "robot",
// subida de imágenes y estado. No manipula el DOM; acepta callbacks en init.

let state = {
  term: '',
  previosTerms: [],
  images: [],
  isLoading: false,
  results: null,
  error: null
};

const LOCAL_KEY = 'previousSearches';

function loadPreviosTerms() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (raw) state.previosTerms = JSON.parse(raw);
  } catch (e) {
    // ignore
  }
}

function savePreviosTerms() {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(state.previosTerms));
  } catch (e) {
    // ignore
  }
}

// Simple upload simulation (returns Promise<images[]>)
export function uploadImages(imagesToUpload = []) {
  if (!imagesToUpload || imagesToUpload.length === 0) return Promise.resolve([]);

  const uploads = imagesToUpload.map(item => {
    if (item.uploadedUrl) return Promise.resolve({ ...item, status: 'done' });
    return new Promise(resolve => {
      const delay = 600 + Math.floor(Math.random() * 600);
      setTimeout(() => {
        const uploadedUrl = item.previewUrl || (item.file && URL.createObjectURL(item.file)) || null;
        resolve({ ...item, uploadedUrl, status: 'done' });
      }, delay);
    });
  });

  return Promise.all(uploads).then(res => res);
}

// callRobots: realiza POST a endpoint (axios si disponible)
export function callRobots(payload, { endpoint = 'https://api.ejemplo.com/robots/search', timeout = 10000 } = {}) {
  if (window.axios) {
    return window.axios.post(endpoint, payload, { timeout }).then(r => r.data);
  }

  return fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }).then(resp => {
    if (!resp.ok) throw new Error('HTTP ' + resp.status);
    return resp.json();
  });
}

// init: acepta opciones y callbacks para integrarlo en cualquier UI
export function init(options = {}) {
  const {
    initialTerm = '',
    onLoading = () => {},
    onError = () => {},
    onResults = () => {},
    onPreviosUpdate = () => {},
    onImagesUpdate = () => {}
  } = options;

  state.term = initialTerm;
  loadPreviosTerms();

  // funciones expuestas que usan callbacks
  async function handleSearch({ term = state.term, images = state.images, previos = state.previosTerms } = {}) {
    if (!term || term.trim() === '') return null;
    state.isLoading = true; onLoading(true);
    state.error = null; onError(null);

    const payload = {
      term: term.trim(),
      previous: previos || [],
      imagesMeta: (images || []).map(i => ({ name: i.file?.name || 'preview', status: i.status }))
    };

    try {
      const resp = await callRobots(payload, options);
      state.results = resp; onResults(resp);
      return resp;
    } catch (err) {
      // si falla la llamada, devolver simulación
      const simulated = { results: [`Simulación para: "${payload.term}"`], timestamp: new Date().toISOString() };
      state.results = simulated; onResults(simulated);
      state.error = err; onError(err);
      return simulated;
    } finally {
      state.isLoading = false; onLoading(false);
    }
  }

  function addPrevioTerm(term) {
    if (!term || !term.trim()) return;
    const normalized = term.trim();
    if (!state.previosTerms.includes(normalized)) {
      state.previosTerms = [normalized, ...state.previosTerms].slice(0, 10);
      savePreviosTerms(); onPreviosUpdate(state.previosTerms);
    }
  }

  function setImages(images) {
    state.images = images || [];
    onImagesUpdate(state.images);
  }

  return {
    handleSearch,
    addPrevioTerm,
    setImages,
    uploadImages: (imgs) => uploadImages(imgs),
    getState: () => JSON.parse(JSON.stringify(state))
  };
}

// Auto export getState for debugging (if imported as module, user can call init().getState())
