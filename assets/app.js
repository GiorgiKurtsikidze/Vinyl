const storageKey = 'affiliate-pipeline-data-v1';
const newId = () =>
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const defaultDeals = [
  {
    id: newId(),
    partner: 'Nordic Performance Group',
    geo: 'EU',
    source: 'Referral',
    model: 'Rev Share',
    status: 'Prospecting',
    details: 'Interested in finance installs with localized creatives.',
    next: 'Share localized deck + pricing grid by Friday.',
    updated: new Date().toISOString()
  },
  {
    id: newId(),
    partner: 'Atlas Media',
    geo: 'LATAM',
    source: 'Conference',
    model: 'CPA',
    status: 'Negotiating',
    details: 'Wants hybrid deal with tiered payouts.',
    next: 'Send revised commercial terms for legal review.',
    updated: new Date().toISOString()
  },
  {
    id: newId(),
    partner: 'Zenith Apps',
    geo: 'NA',
    source: 'Inbound',
    model: 'CPL',
    status: 'Live',
    details: 'Scaling gaming traffic 15% week over week.',
    next: 'Ship creative refresh + new landers.',
    updated: new Date().toISOString()
  },
  {
    id: newId(),
    partner: 'Blue Flamingo',
    geo: 'APAC',
    source: 'Partner Intro',
    model: 'Rev Share',
    status: 'Paused',
    details: 'Paused pending tracking discrepancy fix.',
    next: 'QA pixel + resend postback logs.',
    updated: new Date().toISOString()
  },
  {
    id: newId(),
    partner: 'NeonBoost',
    geo: 'Global',
    source: 'Agency',
    model: 'Hybrid',
    status: 'Prospecting',
    details: 'Global mobile UA shop expanding into utilities.',
    next: 'Book tech deep dive early next week.',
    updated: new Date().toISOString()
  }
];

const elements = {
  tableBody: document.getElementById('pipelineTable'),
  emptyState: document.getElementById('emptyState'),
  modal: document.getElementById('dealModal'),
  modalTitle: document.getElementById('modalTitle'),
  dealForm: document.getElementById('dealForm'),
  geoFilter: document.getElementById('geoFilter'),
  modelFilter: document.getElementById('modelFilter'),
  statusFilter: document.getElementById('statusFilter'),
  resetFilters: document.getElementById('resetFilters'),
  newDealButtons: [document.getElementById('newDealButton'), document.getElementById('emptyNewDeal')],
  importButton: document.getElementById('importButton'),
  importInput: document.getElementById('importInput'),
  exportButton: document.getElementById('exportButton'),
  resetApp: document.getElementById('resetApp'),
  toastContainer: document.getElementById('toastContainer')
};

const state = {
  deals: [],
  filters: {
    geo: 'all',
    model: 'all',
    status: 'all'
  }
};

document.addEventListener('DOMContentLoaded', init);

function init() {
  state.deals = loadDeals();
  renderFilters();
  attachEvents();
  renderTable();
}

function loadDeals() {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return [...defaultDeals];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed : [...defaultDeals];
  } catch (err) {
    console.warn('Failed to parse stored deals, resetting', err);
    return [...defaultDeals];
  }
}

function saveDeals() {
  localStorage.setItem(storageKey, JSON.stringify(state.deals));
}

function attachEvents() {
  elements.dealForm.addEventListener('submit', handleFormSubmit);
  document.querySelectorAll('[data-close-modal]').forEach(btn => btn.addEventListener('click', closeModal));
  elements.newDealButtons.forEach(btn => btn && btn.addEventListener('click', () => openModal()));
  elements.tableBody.addEventListener('click', handleTableActions);
  elements.resetFilters.addEventListener('click', () => {
    state.filters = { geo: 'all', model: 'all', status: 'all' };
    syncFilterInputs();
    renderTable();
  });
  elements.geoFilter.addEventListener('change', evt => updateFilter('geo', evt.target.value));
  elements.modelFilter.addEventListener('change', evt => updateFilter('model', evt.target.value));
  elements.statusFilter.addEventListener('change', evt => updateFilter('status', evt.target.value));
  elements.importButton.addEventListener('click', () => elements.importInput.click());
  elements.importInput.addEventListener('change', handleImport);
  elements.exportButton.addEventListener('click', handleExport);
  elements.resetApp.addEventListener('click', resetData);
}

function updateFilter(key, value) {
  state.filters[key] = value;
  renderTable();
}

function syncFilterInputs() {
  elements.geoFilter.value = state.filters.geo;
  elements.modelFilter.value = state.filters.model;
  elements.statusFilter.value = state.filters.status;
}

function renderFilters() {
  const uniqueValues = key => ['all', ...new Set(state.deals.map(deal => deal[key]).filter(Boolean))];
  populateSelect(elements.geoFilter, uniqueValues('geo'), 'All Geos');
  populateSelect(elements.modelFilter, uniqueValues('model'), 'All Models');
  populateSelect(elements.statusFilter, uniqueValues('status'), 'All Statuses');
  syncFilterInputs();
}

function populateSelect(select, values, label) {
  select.innerHTML = values
    .map(value => {
      const display = value === 'all' ? label : value;
      return `<option value="${value}">${display}</option>`;
    })
    .join('');
}

function getFilteredDeals() {
  return state.deals.filter(deal => {
    const geoMatch = state.filters.geo === 'all' || deal.geo === state.filters.geo;
    const modelMatch = state.filters.model === 'all' || deal.model === state.filters.model;
    const statusMatch = state.filters.status === 'all' || deal.status === state.filters.status;
    return geoMatch && modelMatch && statusMatch;
  });
}

function renderTable() {
  const filtered = getFilteredDeals();
  elements.tableBody.innerHTML = filtered
    .map((deal, index) => renderRow(deal, index))
    .join('');
  elements.emptyState.style.display = filtered.length ? 'none' : 'block';
}

function renderRow(deal, index) {
  const statusClass = getStatusClass(deal.status);
  const truncatedDetails = escapeHtml(truncate(deal.details || 'N/A', 85));
  const truncatedNext = escapeHtml(truncate(deal.next || 'N/A', 85));

  return `
    <tr data-id="${deal.id}">
      <td>${index + 1}</td>
      <td>${escapeHtml(deal.partner)}</td>
      <td>${escapeHtml(deal.geo)}</td>
      <td>${escapeHtml(deal.source || 'N/A')}</td>
      <td>${escapeHtml(deal.model || 'N/A')}</td>
      <td>
        <span class="status-chip ${statusClass}">
          ${escapeHtml(deal.status)}
        </span>
      </td>
      <td>${truncatedDetails}</td>
      <td>${truncatedNext}</td>
      <td class="actions-col">
        <div class="row-actions">
          <button type="button" data-action="edit" data-id="${deal.id}">Edit</button>
          <button type="button" data-action="delete" data-id="${deal.id}">Delete</button>
        </div>
      </td>
    </tr>
  `;
}

function getStatusClass(status) {
  const normalized = status.toLowerCase();
  if (normalized.includes('prospect')) return 'status-chip status-prospecting';
  if (normalized.includes('negotiat')) return 'status-chip status-negotiating';
  if (normalized.includes('live')) return 'status-chip status-live';
  if (normalized.includes('pause')) return 'status-chip status-paused';
  return 'status-chip status-closed';
}

function handleFormSubmit(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const payload = {
    id: formData.get('id') || newId(),
    partner: formData.get('partner').trim(),
    geo: formData.get('geo').trim(),
    source: formData.get('source').trim(),
    model: formData.get('model').trim(),
    status: formData.get('status'),
    details: formData.get('details').trim(),
    next: formData.get('next').trim(),
    updated: new Date().toISOString()
  };

  const existingIndex = state.deals.findIndex(deal => deal.id === payload.id);
  if (existingIndex >= 0) {
    state.deals[existingIndex] = payload;
    showToast('Deal updated');
  } else {
    state.deals.unshift(payload);
    showToast('Deal added');
  }
  saveDeals();
  renderFilters();
  renderTable();
  closeModal();
  event.target.reset();
}

function handleTableActions(event) {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  const id = button.dataset.id;
  const action = button.dataset.action;
  const deal = state.deals.find(item => item.id === id);
  if (!deal) return;

  if (action === 'edit') {
    openModal(deal);
  }
  if (action === 'delete') {
    const confirmed = confirm(`Remove ${deal.partner}?`);
    if (!confirmed) return;
    state.deals = state.deals.filter(item => item.id !== id);
    saveDeals();
    renderFilters();
    renderTable();
    showToast('Deal deleted');
  }
}

function openModal(deal) {
  elements.modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  if (deal) {
    elements.modalTitle.textContent = 'Edit Deal';
    document.getElementById('dealId').value = deal.id;
    document.getElementById('partnerInput').value = deal.partner;
    document.getElementById('geoInput').value = deal.geo;
    document.getElementById('sourceInput').value = deal.source || '';
    document.getElementById('modelInput').value = deal.model || '';
    document.getElementById('statusInput').value = deal.status;
    document.getElementById('detailsInput').value = deal.details || '';
    document.getElementById('nextInput').value = deal.next || '';
  } else {
    elements.modalTitle.textContent = 'New Deal';
    elements.dealForm.reset();
    document.getElementById('dealId').value = '';
  }
}

function closeModal() {
  elements.modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  elements.dealForm.reset();
}

function handleImport(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = evt => {
    try {
      const imported = parseCsv(evt.target.result);
      if (!imported.length) throw new Error('No rows detected');
      state.deals = [...imported, ...state.deals];
      saveDeals();
      renderFilters();
      renderTable();
      showToast('CSV imported');
    } catch (err) {
      alert('Import failed: ' + err.message);
    } finally {
      event.target.value = '';
    }
  };
  reader.readAsText(file);
}

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  const headers = lines.shift().split(',').map(header => header.trim().toLowerCase());
  const required = ['partner', 'geo', 'source', 'model', 'status', 'details', 'next'];
  const missing = required.filter(field => !headers.includes(field));
  if (missing.length) {
    throw new Error(`Missing columns: ${missing.join(', ')}`);
  }
  return lines.map(line => {
    const values = line.split(',');
    const entry = {};
    headers.forEach((header, index) => {
      entry[header] = values[index]?.trim() ?? '';
    });
    return {
      id: newId(),
      partner: entry.partner,
      geo: entry.geo,
      source: entry.source,
      model: entry.model,
      status: entry.status || 'Prospecting',
      details: entry.details,
      next: entry.next,
      updated: new Date().toISOString()
    };
  });
}

function handleExport() {
  if (!state.deals.length) {
    alert('Nothing to export yet.');
    return;
  }
  const header = ['partner', 'geo', 'source', 'model', 'status', 'details', 'next'];
  const rows = state.deals.map(deal => header.map(key => escapeCsv(deal[key] || '')).join(','));
  const csv = [header.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'affiliate-pipeline.csv';
  anchor.click();
  URL.revokeObjectURL(url);
  showToast('CSV exported');
}

function escapeCsv(value) {
  if (value.includes(',') || value.includes('"')) {
    return '"' + value.replace(/"/g, '""') + '"';
  }
  return value;
}

function resetData() {
  if (!confirm('This will clear the pipeline and restore sample data. Continue?')) return;
  state.deals = [...defaultDeals];
  saveDeals();
  renderFilters();
  renderTable();
  showToast('Pipeline reset');
}

function showToast(message) {
  if (!elements.toastContainer) return;
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  elements.toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 180);
  }, 2500);
}

function truncate(text, limit) {
  if (text.length <= limit) return text;
  return text.slice(0, limit) + '...';
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
