// Inicializador que conecta el módulo robot-search.js con el DOM de libros.html
import { init as robotInit } from './robot-search.js';

const ui = (() => {
  const searchInput = document.getElementById('searchInput');
  const robotBtn = document.getElementById('robotBtn');
  const imagesInput = document.getElementById('robotImages');

  function onLoading(isLoading) {
    let el = document.getElementById('robotLoading');
    if (!el) {
      el = document.createElement('div'); el.id = 'robotLoading';
      el.style.marginTop = '0.6rem';
      const filters = document.querySelector('.filters');
      if (filters) filters.parentNode.insertBefore(el, filters.nextSibling);
    }
    el.textContent = isLoading ? 'Cargando...' : '';
  }

  function onError(err) {
    let el = document.getElementById('robotError');
    if (!el) {
      el = document.createElement('div'); el.id = 'robotError';
      el.style.color = '#e74c3c'; el.style.marginTop = '0.4rem';
      const filters = document.querySelector('.filters');
      if (filters) filters.parentNode.insertBefore(el, filters.nextSibling);
    }
    el.textContent = err ? (err.message || String(err)) : '';
  }

  function onResults(results) {
    let el = document.getElementById('robotResults');
    if (!el) {
      el = document.createElement('div'); el.id = 'robotResults'; el.style.marginTop = '0.8rem';
      const container = document.querySelector('.container') || document.body; container.appendChild(el);
    }
    el.innerHTML = `<pre style="white-space: pre-wrap; background: #fff; padding: 1rem; border-radius: 8px;">${JSON.stringify(results, null, 2)}</pre>`;
  }

  function onPreviosUpdate(previos) {
    let container = document.getElementById('previosTermsContainer');
    if (!container) {
      container = document.createElement('div'); container.id = 'previosTermsContainer';
      container.style.marginTop = '0.8rem';
      const filters = document.querySelector('.filters'); if (filters) filters.parentNode.insertBefore(container, filters.nextSibling);
    }
    container.innerHTML = '';
    if (!previos || previos.length === 0) return;
    const title = document.createElement('div'); title.textContent = 'Búsquedas anteriores:'; title.style.fontSize='0.9rem'; title.style.color='var(--text-light)'; title.style.marginBottom='0.4rem'; container.appendChild(title);
    const list = document.createElement('div'); list.style.display='flex'; list.style.gap='0.5rem';
    previos.forEach(t => {
      const btn = document.createElement('button'); btn.className='btn-secondary'; btn.textContent = t; btn.style.padding = '0.3rem 0.6rem';
      btn.addEventListener('click', () => { if (searchInput) searchInput.value = t; });
      list.appendChild(btn);
    });
    container.appendChild(list);
  }

  function onImagesUpdate(images) {
    let container = document.getElementById('robotImagesPreview');
    if (!container) {
      container = document.createElement('div'); container.id = 'robotImagesPreview'; container.style.display='flex'; container.style.gap='0.5rem'; container.style.marginTop='0.6rem';
      const filters = document.querySelector('.filters'); if (filters) filters.parentNode.insertBefore(container, filters.nextSibling);
    }
    container.innerHTML = '';
    images.forEach(img => {
      const wrap = document.createElement('div'); wrap.style.width='60px'; wrap.style.textAlign='center';
      const image = document.createElement('img'); image.src = img.previewUrl || img.uploadedUrl; image.style.width='100%'; image.style.height='60px'; image.style.objectFit='cover'; image.style.borderRadius='4px'; wrap.appendChild(image);
      const status = document.createElement('div'); status.style.fontSize='0.7rem'; status.style.color='#666'; status.textContent = img.status; wrap.appendChild(status);
      container.appendChild(wrap);
    });
  }

  return { onLoading, onError, onResults, onPreviosUpdate, onImagesUpdate, searchInput, robotBtn, imagesInput };
})();

const api = robotInit({
  initialTerm: '',
  onLoading: ui.onLoading,
  onError: ui.onError,
  onResults: ui.onResults,
  onPreviosUpdate: ui.onPreviosUpdate,
  onImagesUpdate: ui.onImagesUpdate,
  endpoint: '' // si tienes endpoint real, pon la URL aquí
});

// Wire UI events
if (ui.searchInput) {
  let debounce = null;
  ui.searchInput.addEventListener('input', (e) => {
    const val = e.target.value;
    // actualizar estado local simple
    if (debounce) clearTimeout(debounce);
    debounce = setTimeout(() => {
      api.handleSearch({ term: val, previos: api.getState?.().previosTerms, images: api.getState?.().images });
    }, 400);
  });
}

if (ui.robotBtn) {
  ui.robotBtn.addEventListener('click', async () => {
    if (ui.imagesInput) ui.imagesInput.click();
    // esperar un poco por si añaden imágenes
    setTimeout(async () => {
      // subir imágenes pendientes
      const s = api.getState();
      const pending = (s.images || []).filter(i => i.status === 'pending');
      if (pending.length > 0) {
        const uploaded = await api.uploadImages(pending);
        api.setImages(uploaded.concat((s.images || []).filter(i => i.status !== 'pending')));
      }
      // agregar previo y buscar
      const term = (ui.searchInput && ui.searchInput.value) || api.getState().term || '';
      api.addPrevioTerm(term);
      await api.handleSearch({ term, previos: api.getState().previosTerms, images: api.getState().images });
    }, 300);
  });
}

if (ui.imagesInput) {
  ui.imagesInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files || []);
    const mapped = files.map(file => ({ file, previewUrl: URL.createObjectURL(file), uploadedUrl: null, status: 'pending' }));
    api.setImages(mapped.concat(api.getState().images || []));
  });
}
