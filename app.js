const STORAGE_KEY = "affiliate.pipeline.deals";
const uid = () =>
  crypto?.randomUUID?.() ??
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

const DEFAULT_DEALS = [
  {
    id: uid(),
    partner: "Atlas Media",
    geo: "North America",
    source: "Inbound",
    model: "CPA",
    status: "Discovery",
    details: "Kickoff deck delivered. Waiting on BI packet.",
    nextSteps: "Schedule deeper tech scoping early next week.",
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 2
  },
  {
    id: uid(),
    partner: "NeonClicks",
    geo: "LATAM",
    source: "Event",
    model: "RevShare",
    status: "Negotiating",
    details: "Working through exclusivity clause and bonus tiers.",
    nextSteps: "Legal to review revised redlines Friday.",
    updatedAt: Date.now() - 1000 * 60 * 60 * 18
  },
  {
    id: uid(),
    partner: "OrbitX",
    geo: "EMEA",
    source: "Referral",
    model: "Hybrid",
    status: "Live",
    details: "Campaign live in UK + DE. Scaling paid search.",
    nextSteps: "Add FR creatives. Monitor CAC this week.",
    updatedAt: Date.now() - 1000 * 60 * 60 * 6
  }
];

const state = {
  deals: [],
  filters: {
    geo: "all",
    model: "all",
    status: "all"
  },
  editedId: null
};

const els = {
  geoFilter: document.querySelector("#geoFilter"),
  modelFilter: document.querySelector("#modelFilter"),
  statusFilter: document.querySelector("#statusFilter"),
  resetFilters: document.querySelector("#resetFilters"),
  pipelineBody: document.querySelector("#pipelineBody"),
  rowCount: document.querySelector("#rowCount"),
  lastUpdated: document.querySelector("#lastUpdated"),
  newDealBtn: document.querySelector("#newDealBtn"),
  importGeminiBtn: document.querySelector("#importGeminiBtn"),
  exportDataBtn: document.querySelector("#exportDataBtn"),
  clearDataBtn: document.querySelector("#clearDataBtn"),
  modal: document.querySelector("#dealModal"),
  modalTitle: document.querySelector("#modalTitle"),
  closeModal: document.querySelector("#closeModal"),
  cancelModal: document.querySelector("#cancelModal"),
  dealForm: document.querySelector("#dealForm"),
  partnerInput: document.querySelector("#partnerInput"),
  geoInput: document.querySelector("#geoInput"),
  sourceInput: document.querySelector("#sourceInput"),
  modelInput: document.querySelector("#modelInput"),
  statusInput: document.querySelector("#statusInput"),
  detailsInput: document.querySelector("#detailsInput"),
  stepsInput: document.querySelector("#stepsInput"),
  toast: document.querySelector("#toast"),
  dataFileInput: document.querySelector("#dataFileInput"),
  dealId: document.querySelector("#dealId")
};

const filterOptions = {
  geo: new Set(),
  model: new Set(),
  status: new Set()
};

init();

function init() {
  state.deals = loadDeals();
  refreshFilterOptions();
  attachListeners();
  render();
}

function loadDeals() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(saved) && saved.length) {
      return saved;
    }
  } catch (err) {
    console.warn("Could not parse saved deals:", err);
  }
  return DEFAULT_DEALS;
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.deals));
  } catch (error) {
    console.warn("Could not persist pipeline:", error);
  }
}

function attachListeners() {
  [els.geoFilter, els.modelFilter, els.statusFilter].forEach((select) => {
    select.addEventListener("change", () => {
      state.filters = {
        ...state.filters,
        [select.id.replace("Filter", "").toLowerCase()]:
          select.value || "all"
      };
      renderTable();
    });
  });

  els.resetFilters.addEventListener("click", () => {
    state.filters = { geo: "all", model: "all", status: "all" };
    els.geoFilter.value = "all";
    els.modelFilter.value = "all";
    els.statusFilter.value = "all";
    renderTable();
  });

  els.newDealBtn.addEventListener("click", () => openModal());
  els.closeModal.addEventListener("click", closeModal);
  els.cancelModal.addEventListener("click", closeModal);
  els.modal.addEventListener("click", (evt) => {
    if (evt.target === els.modal) closeModal();
  });

  els.dealForm.addEventListener("submit", onDealSubmit);

  els.pipelineBody.addEventListener("click", (evt) => {
    const btn = evt.target.closest("[data-action]");
    if (!btn) return;
    const id = btn.dataset.id;
    if (btn.dataset.action === "edit") {
      const deal = state.deals.find((d) => d.id === id);
      if (deal) openModal(deal);
    } else if (btn.dataset.action === "delete") {
      deleteDeal(id);
    }
  });

  els.exportDataBtn.addEventListener("click", exportData);

  els.clearDataBtn.addEventListener("click", () => {
    if (
      state.deals.length &&
      confirm("This will remove all deals from this browser. Continue?")
    ) {
      state.deals = [];
      persist();
      refreshFilterOptions();
      render();
      showToast("Pipeline cleared");
    }
  });

  els.importGeminiBtn.addEventListener("click", () => els.dataFileInput.click());
  els.dataFileInput.addEventListener("change", importData);
}

function refreshFilterOptions() {
  filterOptions.geo.clear();
  filterOptions.model.clear();
  filterOptions.status.clear();

  state.deals.forEach((deal) => {
    filterOptions.geo.add(deal.geo);
    filterOptions.model.add(deal.model);
    filterOptions.status.add(deal.status);
  });

  populateSelect(els.geoFilter, Array.from(filterOptions.geo), "All geos");
  populateSelect(els.modelFilter, Array.from(filterOptions.model), "All models");
  populateSelect(
    els.statusFilter,
    Array.from(filterOptions.status),
    "All statuses"
  );
}

function populateSelect(select, values, label) {
  const fragment = document.createDocumentFragment();
  const baseOption = document.createElement("option");
  baseOption.value = "all";
  baseOption.textContent = label;
  fragment.appendChild(baseOption);

  values
    .sort((a, b) => a.localeCompare(b))
    .forEach((value) => {
      const opt = document.createElement("option");
      opt.value = value;
      opt.textContent = value;
      fragment.appendChild(opt);
    });
  select.replaceChildren(fragment);
  const key = select.id.replace("Filter", "").toLowerCase();
  const desired = state.filters[key];
  select.value = desired && values.includes(desired) ? desired : "all";
}

function render() {
  renderTable();
  updateMeta();
}

function renderTable() {
  const filtered = state.deals.filter((deal) => {
    const geoMatch =
      state.filters.geo === "all" || deal.geo === state.filters.geo;
    const modelMatch =
      state.filters.model === "all" || deal.model === state.filters.model;
    const statusMatch =
      state.filters.status === "all" || deal.status === state.filters.status;
    return geoMatch && modelMatch && statusMatch;
  });

  els.rowCount.textContent = filtered.length;

  if (!filtered.length) {
    els.pipelineBody.innerHTML = `
      <tr class="empty-state">
        <td colspan="9">
          <p>No deals match the current filters.</p>
        </td>
      </tr>`;
    return;
  }

  const rows = filtered
    .map(
      (deal, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${deal.partner}</td>
        <td>${deal.geo}</td>
        <td>${deal.source}</td>
        <td>${deal.model}</td>
        <td>${renderStatusChip(deal.status)}</td>
        <td>${escapeHtml(deal.details || "—")}</td>
        <td>${escapeHtml(deal.nextSteps || "—")}</td>
        <td class="actions-cell">
          <button class="icon-button" data-action="edit" data-id="${deal.id}" title="Edit">✏️</button>
          <button class="icon-button" data-action="delete" data-id="${deal.id}" title="Delete">🗑️</button>
        </td>
      </tr>`
    )
    .join("");

  els.pipelineBody.innerHTML = rows;
}

function renderStatusChip(status) {
  const key = status.toLowerCase();
  const classMap = {
    discovery: "discovery",
    negotiating: "negotiating",
    "pending launch": "pending",
    live: "live",
    "on hold": "hold"
  };
  const cls = classMap[key] || "discovery";
  return `<span class="chip ${cls}">${status}</span>`;
}

function escapeHtml(value) {
  const safe = String(value ?? "");
  return safe
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function updateMeta() {
  if (!state.deals.length) {
    els.lastUpdated.textContent = "Never updated";
    return;
  }
  const latest = Math.max(...state.deals.map((deal) => deal.updatedAt || 0));
  const formatted = new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(latest);
  els.lastUpdated.textContent = `Updated ${formatted}`;
}

function openModal(deal) {
  els.modal.classList.remove("hidden");
  els.modal.setAttribute("aria-hidden", "false");
  if (deal) {
    state.editedId = deal.id;
    els.modalTitle.textContent = "Edit Deal";
    els.dealId.value = deal.id;
    els.partnerInput.value = deal.partner;
    els.geoInput.value = deal.geo;
    els.sourceInput.value = deal.source;
    els.modelInput.value = deal.model;
    els.statusInput.value = deal.status;
    els.detailsInput.value = deal.details || "";
    els.stepsInput.value = deal.nextSteps || "";
  } else {
    state.editedId = null;
    els.modalTitle.textContent = "New Deal";
    els.dealForm.reset();
    els.statusInput.value = "Discovery";
  }
  els.partnerInput.focus();
}

function closeModal() {
  els.modal.classList.add("hidden");
  els.modal.setAttribute("aria-hidden", "true");
  els.dealForm.reset();
  state.editedId = null;
}

function onDealSubmit(evt) {
  evt.preventDefault();
  const formData = {
    partner: els.partnerInput.value.trim(),
    geo: els.geoInput.value.trim(),
    source: els.sourceInput.value.trim(),
    model: els.modelInput.value.trim(),
    status: els.statusInput.value,
    details: els.detailsInput.value.trim(),
    nextSteps: els.stepsInput.value.trim(),
    updatedAt: Date.now()
  };

  if (!formData.partner) {
    alert("Partner name is required.");
    return;
  }

  if (state.editedId) {
    state.deals = state.deals.map((deal) =>
      deal.id === state.editedId ? { ...deal, ...formData } : deal
    );
    showToast("Deal updated");
  } else {
    state.deals = [{ id: uid(), ...formData }, ...state.deals];
    showToast("Deal added");
  }

  persist();
  refreshFilterOptions();
  render();
  closeModal();
}

function deleteDeal(id) {
  const deal = state.deals.find((d) => d.id === id);
  if (!deal) return;
  if (confirm(`Delete ${deal.partner}? This cannot be undone.`)) {
    state.deals = state.deals.filter((d) => d.id !== id);
    persist();
    refreshFilterOptions();
    render();
    showToast("Deal removed");
  }
}

function exportData() {
  if (!state.deals.length) {
    alert("Nothing to export yet.");
    return;
  }
  const blob = new Blob([JSON.stringify(state.deals, null, 2)], {
    type: "application/json"
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `affiliate-pipeline-${new Date()
    .toISOString()
    .slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

function importData(evt) {
  const file = evt.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const parsed = JSON.parse(e.target.result);
      if (!Array.isArray(parsed)) throw new Error("Expected an array");
      const sanitized = parsed
        .map((deal) => ({
          id: deal.id || uid(),
          partner: String(deal.partner || "").trim(),
          geo: String(deal.geo || "").trim(),
          source: String(deal.source || "").trim(),
          model: String(deal.model || "").trim(),
          status: String(deal.status || "Discovery").trim(),
          details: String(deal.details || ""),
          nextSteps: String(deal.nextSteps || ""),
          updatedAt: deal.updatedAt || Date.now()
        }))
        .filter((deal) => deal.partner);

      if (!sanitized.length) throw new Error("No valid deals in file");

      state.deals = sanitized;
      persist();
      refreshFilterOptions();
      render();
      showToast("Gemini import complete");
    } catch (error) {
      alert("Could not import file: " + error.message);
    } finally {
      evt.target.value = "";
    }
  };
  reader.readAsText(file);
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.remove("hidden");
  requestAnimationFrame(() => {
    els.toast.classList.add("visible");
  });
  setTimeout(() => {
    els.toast.classList.remove("visible");
    els.toast.classList.add("hidden");
  }, 2500);
}
