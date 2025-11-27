// Affiliate Pipeline Tracker - Main Application Logic

class AffiliatePipeline {
    constructor() {
        this.deals = this.loadDeals();
        this.currentEditId = null;
        this.initializeApp();
    }

    initializeApp() {
        this.bindEventListeners();
        this.renderDeals();
        this.updateFilters();
    }

    bindEventListeners() {
        // New Deal Button
        document.getElementById('newDealBtn').addEventListener('click', () => this.openModal());
        
        // Modal Controls
        document.getElementById('modalClose').addEventListener('click', () => this.closeModal());
        document.getElementById('cancelBtn').addEventListener('click', () => this.closeModal());
        document.getElementById('dealForm').addEventListener('submit', (e) => this.handleFormSubmit(e));
        
        // Filters
        document.getElementById('geoFilter').addEventListener('change', () => this.renderDeals());
        document.getElementById('modelFilter').addEventListener('change', () => this.renderDeals());
        document.getElementById('statusFilter').addEventListener('change', () => this.renderDeals());
        document.getElementById('resetFilters').addEventListener('click', () => this.resetFilters());
        
        // Import/Export
        document.getElementById('exportBtn').addEventListener('click', () => this.exportData());
        document.getElementById('importBtn').addEventListener('click', () => this.triggerImport());
        document.getElementById('fileInput').addEventListener('change', (e) => this.handleImport(e));
        
        // Share button (copy URL)
        document.getElementById('shareBtn').addEventListener('click', () => this.shareApp());
        
        // Import from Gemini (placeholder)
        document.getElementById('importGeminiBtn').addEventListener('click', () => this.importFromGemini());
        
        // Close modal on outside click
        document.getElementById('dealModal').addEventListener('click', (e) => {
            if (e.target.id === 'dealModal') {
                this.closeModal();
            }
        });
    }

    // Data Management
    loadDeals() {
        const stored = localStorage.getItem('affiliateDeals');
        return stored ? JSON.parse(stored) : [];
    }

    saveDeals() {
        localStorage.setItem('affiliateDeals', JSON.stringify(this.deals));
    }

    addDeal(deal) {
        const newDeal = {
            id: Date.now(),
            ...deal,
            createdAt: new Date().toISOString()
        };
        this.deals.push(newDeal);
        this.saveDeals();
        this.renderDeals();
        this.updateFilters();
    }

    updateDeal(id, updatedData) {
        const index = this.deals.findIndex(d => d.id === id);
        if (index !== -1) {
            this.deals[index] = {
                ...this.deals[index],
                ...updatedData,
                updatedAt: new Date().toISOString()
            };
            this.saveDeals();
            this.renderDeals();
            this.updateFilters();
        }
    }

    deleteDeal(id) {
        if (confirm('Are you sure you want to delete this deal?')) {
            this.deals = this.deals.filter(d => d.id !== id);
            this.saveDeals();
            this.renderDeals();
            this.updateFilters();
        }
    }

    // UI Rendering
    renderDeals() {
        const tbody = document.getElementById('dealsTableBody');
        const emptyState = document.getElementById('emptyState');
        
        // Get filter values
        const geoFilter = document.getElementById('geoFilter').value;
        const modelFilter = document.getElementById('modelFilter').value;
        const statusFilter = document.getElementById('statusFilter').value;
        
        // Filter deals
        let filteredDeals = this.deals.filter(deal => {
            if (geoFilter !== 'all' && deal.geo !== geoFilter) return false;
            if (modelFilter !== 'all' && deal.model !== modelFilter) return false;
            if (statusFilter !== 'all' && deal.status !== statusFilter) return false;
            return true;
        });
        
        if (filteredDeals.length === 0) {
            tbody.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }
        
        emptyState.style.display = 'none';
        
        tbody.innerHTML = filteredDeals.map((deal, index) => `
            <tr>
                <td>${index + 1}</td>
                <td><strong>${this.escapeHtml(deal.partnerName)}</strong></td>
                <td>${this.escapeHtml(deal.geo)}</td>
                <td>${this.escapeHtml(deal.source || '-')}</td>
                <td>${this.escapeHtml(deal.model)}</td>
                <td><span class="status-badge status-${this.getStatusClass(deal.status)}">${this.escapeHtml(deal.status)}</span></td>
                <td>${this.escapeHtml(deal.details || '-')}</td>
                <td>${this.escapeHtml(deal.nextSteps || '-')}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon" onclick="app.editDeal(${deal.id})">✏️ Edit</button>
                        <button class="btn-icon delete" onclick="app.deleteDeal(${deal.id})">🗑️ Delete</button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    updateFilters() {
        // Get unique values
        const geos = [...new Set(this.deals.map(d => d.geo))].sort();
        const models = [...new Set(this.deals.map(d => d.model))].sort();
        const statuses = [...new Set(this.deals.map(d => d.status))].sort();
        
        // Update GEO filter
        const geoFilter = document.getElementById('geoFilter');
        const currentGeo = geoFilter.value;
        geoFilter.innerHTML = '<option value="all">All Geos</option>' + 
            geos.map(geo => `<option value="${this.escapeHtml(geo)}">${this.escapeHtml(geo)}</option>`).join('');
        geoFilter.value = currentGeo;
        
        // Update Model filter
        const modelFilter = document.getElementById('modelFilter');
        const currentModel = modelFilter.value;
        modelFilter.innerHTML = '<option value="all">All Models</option>' + 
            models.map(model => `<option value="${this.escapeHtml(model)}">${this.escapeHtml(model)}</option>`).join('');
        modelFilter.value = currentModel;
        
        // Update Status filter
        const statusFilter = document.getElementById('statusFilter');
        const currentStatus = statusFilter.value;
        statusFilter.innerHTML = '<option value="all">All Statuses</option>' + 
            statuses.map(status => `<option value="${this.escapeHtml(status)}">${this.escapeHtml(status)}</option>`).join('');
        statusFilter.value = currentStatus;
    }

    resetFilters() {
        document.getElementById('geoFilter').value = 'all';
        document.getElementById('modelFilter').value = 'all';
        document.getElementById('statusFilter').value = 'all';
        this.renderDeals();
    }

    // Modal Management
    openModal(deal = null) {
        const modal = document.getElementById('dealModal');
        const form = document.getElementById('dealForm');
        const title = document.getElementById('modalTitle');
        
        if (deal) {
            title.textContent = 'Edit Deal';
            document.getElementById('partnerName').value = deal.partnerName;
            document.getElementById('geo').value = deal.geo;
            document.getElementById('source').value = deal.source || '';
            document.getElementById('model').value = deal.model;
            document.getElementById('status').value = deal.status;
            document.getElementById('details').value = deal.details || '';
            document.getElementById('nextSteps').value = deal.nextSteps || '';
            this.currentEditId = deal.id;
        } else {
            title.textContent = 'New Deal';
            form.reset();
            this.currentEditId = null;
        }
        
        modal.classList.add('show');
    }

    closeModal() {
        const modal = document.getElementById('dealModal');
        modal.classList.remove('show');
        this.currentEditId = null;
    }

    handleFormSubmit(e) {
        e.preventDefault();
        
        const dealData = {
            partnerName: document.getElementById('partnerName').value,
            geo: document.getElementById('geo').value,
            source: document.getElementById('source').value,
            model: document.getElementById('model').value,
            status: document.getElementById('status').value,
            details: document.getElementById('details').value,
            nextSteps: document.getElementById('nextSteps').value
        };
        
        if (this.currentEditId) {
            this.updateDeal(this.currentEditId, dealData);
        } else {
            this.addDeal(dealData);
        }
        
        this.closeModal();
    }

    editDeal(id) {
        const deal = this.deals.find(d => d.id === id);
        if (deal) {
            this.openModal(deal);
        }
    }

    // Import/Export
    exportData() {
        const dataStr = JSON.stringify(this.deals, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `affiliate-deals-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        this.showNotification('Data exported successfully!');
    }

    triggerImport() {
        document.getElementById('fileInput').click();
    }

    handleImport(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const imported = JSON.parse(event.target.result);
                if (Array.isArray(imported)) {
                    if (confirm(`This will import ${imported.length} deals. Continue?`)) {
                        this.deals = imported;
                        this.saveDeals();
                        this.renderDeals();
                        this.updateFilters();
                        this.showNotification('Data imported successfully!');
                    }
                } else {
                    alert('Invalid file format. Please upload a valid JSON file.');
                }
            } catch (error) {
                alert('Error reading file. Please check the file format.');
            }
        };
        reader.readAsText(file);
        
        // Reset file input
        e.target.value = '';
    }

    importFromGemini() {
        alert('This feature would integrate with Gemini API to import data. For now, use the Import Data button to upload a JSON file.');
    }

    shareApp() {
        const url = window.location.href;
        if (navigator.clipboard) {
            navigator.clipboard.writeText(url).then(() => {
                this.showNotification('Link copied to clipboard!');
            }).catch(() => {
                alert(`Share this URL: ${url}`);
            });
        } else {
            alert(`Share this URL: ${url}`);
        }
    }

    // Utility Functions
    getStatusClass(status) {
        return status.toLowerCase().replace(/\s+/g, '-');
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showNotification(message) {
        // Simple notification - you could enhance this with a toast library
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
            z-index: 9999;
            animation: fadeIn 0.3s ease-out;
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transition = 'opacity 0.3s';
            setTimeout(() => document.body.removeChild(notification), 300);
        }, 3000);
    }
}

// Initialize the app
const app = new AffiliatePipeline();

// Add some sample data if none exists
if (app.deals.length === 0) {
    const sampleDeals = [
        {
            partnerName: "Example Partner 1",
            geo: "US",
            source: "Direct",
            model: "CPA",
            status: "Active",
            details: "High-performing partner with consistent conversions",
            nextSteps: "Schedule monthly review meeting"
        },
        {
            partnerName: "Example Partner 2",
            geo: "UK",
            source: "Network",
            model: "RevShare",
            status: "In Progress",
            details: "New partnership in testing phase",
            nextSteps: "Monitor performance for 2 weeks"
        },
        {
            partnerName: "Example Partner 3",
            geo: "Global",
            source: "Direct",
            model: "Hybrid",
            status: "New",
            details: "Potential high-value partnership",
            nextSteps: "Send contract for review"
        }
    ];
    
    sampleDeals.forEach(deal => app.addDeal(deal));
}
