// Set today's date as default
document.addEventListener('DOMContentLoaded', () => {
    const dateInput = document.getElementById('date');
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
    dateInput.max = today; // Prevent future dates

    loadEntries();
});

// Form submission
document.getElementById('updateForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        date: document.getElementById('date').value,
        title: document.getElementById('title').value,
        content: document.getElementById('content').value
    };

    try {
        const response = await fetch('/api/entries', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            const result = await response.json();
            console.log('Entry added:', result);
            
            // Reset form
            document.getElementById('updateForm').reset();
            document.getElementById('date').value = new Date().toISOString().split('T')[0];
            
            // Reload entries
            loadEntries();
            
            // Show success message
            showMessage('Update added successfully!', 'success');
        } else {
            const error = await response.json();
            showMessage(error.error || 'Failed to add update', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage('Network error. Please try again.', 'error');
    }
});

// Load all entries
async function loadEntries() {
    const entriesList = document.getElementById('entriesList');
    entriesList.innerHTML = '<p class="loading">Loading entries...</p>';

    try {
        const response = await fetch('/api/entries');
        const entries = await response.json();

        if (entries.length === 0) {
            entriesList.innerHTML = '<p class="empty">No entries yet. Add your first update above!</p>';
            return;
        }

        entriesList.innerHTML = entries.map(entry => `
            <div class="entry-card" data-id="${entry.id}">
                <div class="entry-header">
                    <h3>${escapeHtml(entry.title)}</h3>
                    <div class="entry-actions">
                        <button class="btn-icon edit-btn" onclick="editEntry('${entry.id}')" title="Edit">✏️</button>
                        <button class="btn-icon delete-btn" onclick="deleteEntry('${entry.id}')" title="Delete">🗑️</button>
                    </div>
                </div>
                <div class="entry-date">${formatDate(entry.date)}</div>
                <div class="entry-content">${escapeHtml(entry.content).replace(/\n/g, '<br>')}</div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading entries:', error);
        entriesList.innerHTML = '<p class="error">Failed to load entries. Please refresh the page.</p>';
    }
}

// Delete entry
async function deleteEntry(id) {
    if (!confirm('Are you sure you want to delete this entry?')) {
        return;
    }

    try {
        const response = await fetch(`/api/entries/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            loadEntries();
            showMessage('Entry deleted successfully!', 'success');
        } else {
            showMessage('Failed to delete entry', 'error');
        }
    } catch (error) {
        console.error('Error deleting entry:', error);
        showMessage('Network error. Please try again.', 'error');
    }
}

// Edit entry
async function editEntry(id) {
    try {
        const response = await fetch('/api/entries');
        const entries = await response.json();
        const entry = entries.find(e => e.id === id);

        if (!entry) {
            showMessage('Entry not found', 'error');
            return;
        }

        // Populate form with entry data
        document.getElementById('date').value = entry.date;
        document.getElementById('title').value = entry.title;
        document.getElementById('content').value = entry.content;

        // Scroll to form
        document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
        document.getElementById('title').focus();

        // Change form to edit mode
        const form = document.getElementById('updateForm');
        form.dataset.editId = id;
        form.querySelector('button').textContent = 'Update Entry';

        // Update form handler
        form.onsubmit = async (e) => {
            e.preventDefault();
            
            const formData = {
                date: document.getElementById('date').value,
                title: document.getElementById('title').value,
                content: document.getElementById('content').value
            };

            try {
                const updateResponse = await fetch(`/api/entries/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                if (updateResponse.ok) {
                    // Reset form
                    form.reset();
                    document.getElementById('date').value = new Date().toISOString().split('T')[0];
                    delete form.dataset.editId;
                    form.querySelector('button').textContent = 'Add Update';
                    form.onsubmit = arguments.callee; // Restore original handler
                    
                    loadEntries();
                    showMessage('Entry updated successfully!', 'success');
                } else {
                    showMessage('Failed to update entry', 'error');
                }
            } catch (error) {
                console.error('Error:', error);
                showMessage('Network error. Please try again.', 'error');
            }
        };
    } catch (error) {
        console.error('Error loading entry:', error);
        showMessage('Failed to load entry for editing', 'error');
    }
}

// Helper functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showMessage(message, type) {
    // Remove existing message
    const existing = document.querySelector('.message');
    if (existing) {
        existing.remove();
    }

    // Create new message
    const messageEl = document.createElement('div');
    messageEl.className = `message message-${type}`;
    messageEl.textContent = message;
    document.body.appendChild(messageEl);

    // Remove after 3 seconds
    setTimeout(() => {
        messageEl.remove();
    }, 3000);
}
