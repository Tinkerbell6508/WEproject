// Shared frontend JS for pages
const apiBase = '/api/recipes';

function qs(selector, parent = document){ return parent.querySelector(selector); }
function qsa(sel, parent = document){ return Array.from((parent || document).querySelectorAll(sel)); }

// Utility: fetch and return json, throw on error
async function fetchJson(url, opts){
  const res = await fetch(url, opts);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res.json();
}

// ---------- Home page handlers ----------
function wireHome() {
  const viewBtn = qs('#viewBtn');
  const addBtn = qs('#addBtn');
  if (viewBtn) viewBtn.addEventListener('click', () => location.href = '/view');
  if (addBtn) addBtn.addEventListener('click', () => location.href = '/add');
}

// ---------- View recipes page ----------
async function loadAndRenderRecipes() {
  const container = qs('#recipesContainer');
  if (!container) return;
  container.innerHTML = '<p>Loading recipes…</p>';
  try{
    const recipes = await fetchJson(apiBase);
    if (!recipes.length) {
      container.innerHTML = '<p>No recipes yet. Try adding one!</p>';
      return;
    }
    container.innerHTML = '';
    const grid = document.createElement('div');grid.className='grid';
    recipes.forEach(r => grid.appendChild(renderCard(r)));
    container.appendChild(grid);
  }catch(err){
    container.innerHTML = `<p class="error">Failed to load recipes: ${err.message}</p>`;
  }
}

function renderCard(r){
  const card = document.createElement('div');card.className='card';
  const imgWrap = document.createElement('div');imgWrap.className='image';
  const img = document.createElement('img');
  img.src = r.imageURL && r.imageURL.trim() ? r.imageURL : svgPlaceholder();
  img.alt = r.title || 'Recipe image';
  img.onerror = () => { img.src = svgPlaceholder(); };
  imgWrap.appendChild(img);
  card.appendChild(imgWrap);
  const h3 = document.createElement('h3'); h3.textContent = r.title || 'Untitled'; card.appendChild(h3);
  const instr = document.createElement('p'); instr.textContent = r.instructions ? (r.instructions.length>180? r.instructions.slice(0,180)+'…': r.instructions) : '';
  card.appendChild(instr);
  if (r.ingredients && r.ingredients.length){
    const ing = document.createElement('ul'); ing.className='ingredients';
    r.ingredients.forEach(i=>{const li=document.createElement('li');li.textContent=i;ing.appendChild(li)});
    card.appendChild(ing);
  }
  const actions = document.createElement('div'); actions.className='card-actions';
  const left = document.createElement('div');
  const editBtn = document.createElement('button'); editBtn.className='small-btn edit'; editBtn.textContent='Edit';
  editBtn.addEventListener('click', ()=> location.href = '/edit?id='+r._id);
  const delBtn = document.createElement('button'); delBtn.className='small-btn delete'; delBtn.textContent='Delete';
  delBtn.addEventListener('click', ()=> handleDelete(r._id, card));
  left.appendChild(editBtn); left.appendChild(delBtn);
  actions.appendChild(left);
  card.appendChild(actions);
  return card;
}

async function handleDelete(id, cardEl){
  if (!confirm('Delete this recipe? This cannot be undone.')) return;
  try{
    await fetchJson(apiBase+'/'+id, { method: 'DELETE' });
    // remove card
    cardEl.style.transition='opacity .25s'; cardEl.style.opacity='0'; setTimeout(()=>cardEl.remove(),300);
  }catch(err){alert('Failed to delete: '+err.message)}
}

// ---------- Add recipe page ----------
function wireAddForm(){
  const form = qs('#addForm'); if (!form) return;
  form.addEventListener('submit', async (ev)=>{
    ev.preventDefault();
    const data = new FormData(form);
    const payload = {
      title: data.get('title')||'',
      ingredients: (data.get('ingredients')||'').split('\n').map(s=>s.trim()).filter(Boolean),
      instructions: data.get('instructions')||'',
      imageURL: data.get('imageURL')||''
    };
    try{
      await fetchJson(apiBase, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
      location.href = '/view';
    }catch(err){alert('Failed to save: '+err.message)}
  });
}

// ---------- Edit recipe page ----------
async function wireEditForm(){
  const form = qs('#editForm'); if (!form) return;
  const params = new URLSearchParams(location.search); const id = params.get('id');
  if (!id){ alert('No recipe id provided'); location.href='/view'; return; }
  // load recipe
  try{
    const r = await fetchJson(apiBase+'/'+id);
    qs('[name=title]').value = r.title||'';
    qs('[name=ingredients]').value = (r.ingredients||[]).join('\n');
    qs('[name=instructions]').value = r.instructions||'';
    qs('[name=imageURL]').value = r.imageURL||'';
  }catch(err){ alert('Failed to load recipe: '+err.message); location.href='/view'; return; }

  form.addEventListener('submit', async (ev)=>{
    ev.preventDefault();
    const data = new FormData(form);
    const payload = {
      title: data.get('title')||'',
      ingredients: (data.get('ingredients')||'').split('\n').map(s=>s.trim()).filter(Boolean),
      instructions: data.get('instructions')||'',
      imageURL: data.get('imageURL')||''
    };
    try{
      await fetchJson(apiBase+'/'+id, {method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
      location.href = '/view';
    }catch(err){alert('Failed to update: '+err.message)}
  });
}

// ---------- Utility: SVG placeholder (data URL) ----------
function svgPlaceholder(){
  const svg = `data:image/svg+xml;utf8,` + encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='500' viewBox='0 0 800 500'>
      <defs>
        <linearGradient id='g' x1='0' x2='1'><stop offset='0' stop-color='#e9e2d8'/><stop offset='1' stop-color='#dfe9df'/></linearGradient>
      </defs>
      <rect width='100%' height='100%' fill='url(#g)' />
      <g fill='#9dbfa3' opacity='0.9' transform='translate(60,80)'>
        <rect x='0' y='0' rx='12' ry='12' width='200' height='140'></rect>
        <rect x='230' y='0' rx='12' ry='12' width='480' height='140'></rect>
        <rect x='0' y='170' rx='12' ry='12' width='700' height='40'></rect>
      </g>
    </svg>`
  );
  return svg;
}

// ---------- Auto-run depending on page ----------
document.addEventListener('DOMContentLoaded', ()=>{
  wireHome();
  wireAddForm();
  wireEditForm();
  // view page loader
  if (qs('#recipesContainer')) loadAndRenderRecipes();
});
