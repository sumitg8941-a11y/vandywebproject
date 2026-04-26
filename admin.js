const admin = {
    contentDiv: document.getElementById('admin-main'),

    init: function() {
        if (!localStorage.getItem('adminToken')) {
            document.getElementById('login-modal').style.display = 'flex';
            this.contentDiv.innerHTML = '';
            return;
        }
        document.getElementById('login-modal').style.display = 'none';
        this.showTab('countries');
        
        // Dynamically add the Feedback tab to the sidebar if it doesn't exist
        setTimeout(() => {
            const firstTab = document.querySelector('.tab-btn');
            if (firstTab && firstTab.parentNode && !document.querySelector('[onclick*="feedback"]')) {
                const btn = document.createElement('button');
                btn.className = 'tab-btn';
                btn.setAttribute('onclick', "admin.showTab('feedback', event)");
                btn.innerHTML = '📝 Feedback';
                firstTab.parentNode.appendChild(btn);
            }
        }, 500);
    },

    login: async function() {
        const u = document.getElementById('login-user').value;
        const p = document.getElementById('login-pass').value;
        try {
            const res = await fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: u, password: p })
            });
            if (res.ok) {
                const data = await res.json();
                localStorage.setItem('adminToken', data.token);
                document.getElementById('login-modal').style.display = 'none';
                document.getElementById('login-error').style.display = 'none';
                this.init(); // Reload data now that we have token
            } else {
                document.getElementById('login-error').style.display = 'block';
            }
        } catch(e) {
            alert('Login request failed. Server might be down.');
        }
    },

    logout: function() {
        localStorage.removeItem('adminToken');
        location.reload();
    },

    showTab: async function(tabName, eventObj) {
        // Update active class on sidebar buttons
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        
        if (eventObj && eventObj.currentTarget) {
            eventObj.currentTarget.classList.add('active');
        } else {
            const btn = document.querySelector(`[onclick*="${tabName}"]`);
            if (btn) btn.classList.add('active');
        }

        this.contentDiv.innerHTML = '<p style="padding: 20px;">Loading data from MongoDB...</p>';
        let html = '';
        try {
            switch(tabName) {
                case 'countries':
                    html = await this.renderCountries();
                    break;
                case 'cities':
                    html = await this.renderCities();
                    break;
                case 'retailers':
                    html = await this.renderRetailers();
                    break;
                case 'offers':
                    html = await this.renderOffers();
                    break;
                case 'stats':
                    html = await this.renderStats();
                    break;
                case 'feedback':
                    html = await this.renderFeedback();
                    break;
            }
            this.contentDiv.innerHTML = html;
        } catch (error) {
            this.contentDiv.innerHTML = '<div style="padding:20px; color:#e74c3c;"><h2>Database Error</h2><p>Could not load data. Ensure MongoDB is running properly!</p></div>';
        }
    },

    renderCountries: async function() {
        const countries = await api.getCountries();
        let rows = countries.map(c => `
            <tr>
                <td>${c.id.toUpperCase()}</td>
                <td>${c.name}</td>
                <td><img src="${c.image}" width="50" style="border-radius:4px;"></td>
                <td>
                    <button class="action-btn" onclick="alert('Edit feature coming soon!')">Edit</button>
                    <button class="action-btn" style="background:#e74c3c;" onclick="admin.deleteCountry('${c.id}')">Delete</button>
                </td>
            </tr>
        `).join('');

        return `
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <h2>Countries</h2>
                <button class="action-btn" style="background:#27ae60;" onclick="document.getElementById('add-country-form').style.display='block'">+ Add Country</button>
            </div>
            
            <div id="add-country-form" style="display:none; background:#f9f9f9; padding:20px; border-radius:8px; margin-top:15px; border:1px solid #ddd;">
                <h3>Add New Country</h3>
                <div style="margin-top:10px;">
                    <label>Country Code (e.g., kw):</label><br>
                    <input type="text" id="new-country-id" style="width:100%; padding:8px; margin-bottom:10px;" placeholder="e.g., kw">
                    
                    <label>Country Name:</label><br>
                    <input type="text" id="new-country-name" style="width:100%; padding:8px; margin-bottom:10px;" placeholder="e.g., Kuwait">
                    
                    <label>Upload Cover Image (Optional):</label><br>
                    <input type="file" id="new-country-image-file" accept="image/*" style="width:100%; padding:8px; margin-bottom:5px;">
                    <input type="text" id="new-country-image" style="width:100%; padding:8px; margin-bottom:15px;" placeholder="OR provide Image URL (e.g. https://...)">
                    
                    <button class="action-btn" onclick="admin.saveCountry()">Save Country</button>
                    <button class="action-btn" style="background:#e74c3c; margin-left:10px;" onclick="document.getElementById('add-country-form').style.display='none'">Cancel</button>
                </div>
            </div>

            <table class="admin-table">
                <thead><tr><th>ID</th><th>Name</th><th>Image</th><th>Actions</th></tr></thead>
                <tbody>${rows}</tbody>
            </table>
        `;
    },

    saveCountry: async function() {
        const id = document.getElementById('new-country-id').value.toLowerCase();
        const name = document.getElementById('new-country-name').value;
        let image = document.getElementById('new-country-image').value;
        const imageFile = document.getElementById('new-country-image-file').files[0];
        
        if(id && name) {
            try {
                if (imageFile) image = await this.uploadFile(imageFile);
                await api.addCountry({ id, name, image });
                alert('Country securely saved to MongoDB permanently!');
                this.showTab('countries');
            } catch (error) {
                alert('Error saving country: ' + error.message);
            }        } else {
            alert('Please fill in all required fields before saving.');
        }
    },

    renderCities: async function() {
        const allCities = await api.getAllCities();
        const countries = await api.getCountries();
        
        let rows = allCities.map(c => `
            <tr>
                <td>${c.id.toUpperCase()}</td>
                <td>${c.name}</td>
                <td>${c.countryId.toUpperCase()}</td>
                <td>
                    <button class="action-btn" onclick="alert('Edit feature coming soon!')">Edit</button>
                    <button class="action-btn" style="background:#e74c3c;" onclick="admin.deleteCity('${c.id}')">Delete</button>
                </td>
            </tr>
        `).join('');

        let countryOptions = countries.map(c => `<option value="${c.id}">${c.name}</option>`).join('');

        return `
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <h2>Cities</h2>
                <button class="action-btn" style="background:#27ae60;" onclick="document.getElementById('add-city-form').style.display='block'">+ Add City</button>
            </div>
            
            <div id="add-city-form" style="display:none; background:#f9f9f9; padding:20px; border-radius:8px; margin-top:15px; border:1px solid #ddd;">
                <h3>Add New City</h3>
                <div style="margin-top:10px;">
                    <label>City Code (e.g., mct):</label><br>
                    <input type="text" id="new-city-id" style="width:100%; padding:8px; margin-bottom:10px;">
                    
                    <label>City Name:</label><br>
                    <input type="text" id="new-city-name" style="width:100%; padding:8px; margin-bottom:10px;">
                    
                    <label>Belongs to Country:</label><br>
                    <select id="new-city-country" style="width:100%; padding:8px; margin-bottom:10px;">
                        ${countryOptions}
                    </select>
                    
                    <label>Upload Cover Image (Optional):</label><br>
                    <input type="file" id="new-city-image-file" accept="image/*" style="width:100%; padding:8px; margin-bottom:5px;">
                    <input type="text" id="new-city-image" style="width:100%; padding:8px; margin-bottom:15px;" placeholder="OR provide Image URL">
                    
                    <button class="action-btn" onclick="admin.saveCity()">Save City</button>
                    <button class="action-btn" style="background:#e74c3c; margin-left:10px;" onclick="document.getElementById('add-city-form').style.display='none'">Cancel</button>
                </div>
            </div>
            <table class="admin-table"><thead><tr><th>ID</th><th>City Name</th><th>Country Code</th><th>Actions</th></tr></thead><tbody>${rows}</tbody></table>
        `;
    },

    saveCity: async function() {
        const id = document.getElementById('new-city-id').value.toLowerCase();
        const name = document.getElementById('new-city-name').value;
        const countryId = document.getElementById('new-city-country').value;
        let image = document.getElementById('new-city-image').value;
        const imageFile = document.getElementById('new-city-image-file').files[0];
        
        if(id && name && countryId) {
            try { 
                if (imageFile) image = await this.uploadFile(imageFile);
                await api.addCity({ id, name, countryId, image }); 
                alert('City saved!'); this.showTab('cities'); 
            } 
            catch(e) { alert('Error saving to database.'); }
        } else { alert('Please fill all required fields'); }
    },

    renderRetailers: async function() {
        const retailers = await api.getAllRetailers();
        const cities = await api.getAllCities();
        
        let rows = retailers.map(r => `<tr><td>${r.id.toUpperCase()}</td><td>${r.name}</td><td>${r.cityId.toUpperCase()}</td><td><button class="action-btn" onclick="alert('Edit feature coming soon!')">Edit</button> <button class="action-btn" style="background:#e74c3c;" onclick="admin.deleteRetailer('${r.id}')">Delete</button></td></tr>`).join('');
        let cityOptions = cities.map(c => `<option value="${c.id}">${c.name}</option>`).join('');

        return `
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <h2>Retailers</h2>
                <button class="action-btn" style="background:#27ae60;" onclick="document.getElementById('add-retailer-form').style.display='block'">+ Add Retailer</button>
            </div>
            <div id="add-retailer-form" style="display:none; background:#f9f9f9; padding:20px; border-radius:8px; margin-top:15px; border:1px solid #ddd;">
                <h3>Add New Retailer</h3>
                <input type="text" id="new-ret-id" placeholder="Retailer ID (e.g. r20)" style="width:100%; padding:8px; margin-bottom:10px;">
                <input type="text" id="new-ret-name" placeholder="Retailer Name" style="width:100%; padding:8px; margin-bottom:10px;">
                <input type="url" id="new-ret-web" placeholder="Official Website URL (Optional)" style="width:100%; padding:8px; margin-bottom:10px;">
                <select id="new-ret-city" style="width:100%; padding:8px; margin-bottom:10px;">${cityOptions}</select>
                
                <label style="font-weight: bold; font-size: 0.9em;">Upload Logo/Image (Optional):</label><br>
                <input type="file" id="new-ret-image-file" accept="image/*" style="width:100%; padding:8px; margin-bottom:5px;">
                <input type="text" id="new-ret-image" placeholder="OR provide Image URL" style="width:100%; padding:8px; margin-bottom:15px;">
                
                <button class="action-btn" onclick="admin.saveRetailer()">Save Retailer</button>
            </div>
            <table class="admin-table"><thead><tr><th>ID</th><th>Name</th><th>City Code</th><th>Actions</th></tr></thead><tbody>${rows}</tbody></table>
        `;
    },

    saveRetailer: async function() {
        const id = document.getElementById('new-ret-id').value.toLowerCase();
        const name = document.getElementById('new-ret-name').value;
        const websiteUrl = document.getElementById('new-ret-web').value;
        const cityId = document.getElementById('new-ret-city').value;
        let image = document.getElementById('new-ret-image').value;
        const imageFile = document.getElementById('new-ret-image-file').files[0];
        
        if(id && name && cityId) {
            try { 
                if (imageFile) image = await this.uploadFile(imageFile);
                await api.addRetailer({ id, name, websiteUrl, cityId, image }); 
                alert('Retailer saved!'); this.showTab('retailers'); 
            } 
            catch(e) { alert('Error: ' + e.message); }
        } else { alert('Please fill all required fields'); }
    },

    renderOffers: async function() {
        const offers = await api.getAllOffers();
        const retailers = await api.getAllRetailers();
        
        let rows = offers.map(o => `<tr><td>${o.title}</td><td>${o.retailerId.toUpperCase()}</td><td>${o.validFrom ? new Date(o.validFrom).toISOString().split('T')[0] : ''} to ${o.validUntil ? new Date(o.validUntil).toISOString().split('T')[0] : ''}</td><td><button class="action-btn" onclick="admin.editOffer('${o.id || o._id}')">Edit</button> <button class="action-btn" style="background:#e74c3c;" onclick="admin.deleteOffer('${o.id || o._id}')">Delete</button></td></tr>`).join('');
        let retailerOptions = retailers.map(r => `<option value="${r.id}">${r.name} (${r.cityId})</option>`).join('');

        return `
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <h2>Offers & PDFs</h2>
                <button class="action-btn" style="background:#27ae60;" onclick="admin.showAddOfferForm()">+ Add New Offer</button>
            </div>
            
            <div id="upload-form" style="display:none; background:#f9f9f9; padding:20px; border-radius:8px; margin-top:15px; border:1px solid #ddd;">
                <h3>Add New Offer</h3>
                <div style="margin-top:10px;">
                    <input type="text" id="new-off-id" placeholder="Offer ID (e.g. o20)" style="width:100%; padding:8px; margin-bottom:10px;">
                    <input type="text" id="new-off-title" placeholder="Offer Title (e.g., Weekend Sale)" style="width:100%; padding:8px; margin-bottom:10px;">
                    <div style="display:flex; gap:10px; margin-bottom:10px;">
                        <div style="flex:1;">
                            <label style="font-weight: bold; font-size: 0.9em;">Valid From:</label>
                            <input type="date" id="new-off-valid-from" style="width:100%; padding:8px;">
                        </div>
                        <div style="flex:1;">
                            <label style="font-weight: bold; font-size: 0.9em;">Valid Until:</label>
                            <input type="date" id="new-off-valid-until" style="width:100%; padding:8px;">
                        </div>
                    </div>
                    <select id="new-off-retailer" style="width:100%; padding:8px; margin-bottom:10px;">${retailerOptions}</select>
                    
                    <label style="font-weight: bold; font-size: 0.9em;">Upload PDF Flyer (Optional):</label>
                    <input type="file" id="new-off-pdf-file" accept="application/pdf" style="width:100%; padding:8px; margin-bottom:5px;">
                    <input type="text" id="new-off-pdf" placeholder="OR provide PDF URL (e.g. https://...)" style="width:100%; padding:8px; margin-bottom:15px;">
                    
                    <label style="font-weight: bold; font-size: 0.9em;">Upload Cover Image (Optional):</label>
                    <input type="file" id="new-off-image-file" accept="image/*" style="width:100%; padding:8px; margin-bottom:5px;">
                    <input type="text" id="new-off-image" placeholder="OR provide Image URL (e.g. https://...)" style="width:100%; padding:8px; margin-bottom:15px;">
                    
                    <input type="text" id="new-off-badge" placeholder="Badge (e.g. 50% OFF)" style="width:100%; padding:8px; margin-bottom:15px;">
                    <button class="action-btn" id="save-offer-btn" onclick="admin.saveOffer()">Save Offer</button>
                    <button class="action-btn" style="background:#e74c3c; margin-left:10px;" onclick="document.getElementById('upload-form').style.display='none'">Cancel</button>
                </div>
            </div>
            
            <table class="admin-table" style="margin-top:20px;"><thead><tr><th>Title</th><th>Retailer</th><th>Validity</th><th>Actions</th></tr></thead><tbody>${rows}</tbody></table>
        `;
    },

    uploadFile: async function(file) {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` },
            body: formData
        });
        if (!res.ok) throw new Error('Failed to upload file');
        const data = await res.json();
        return data.url;
    },

    showAddOfferForm: function() {
        document.getElementById('upload-form').style.display = 'block';
        document.getElementById('new-off-id').readOnly = false;
        document.getElementById('new-off-id').value = '';
        document.getElementById('new-off-title').value = '';
        document.getElementById('new-off-valid-from').value = '';
        document.getElementById('new-off-valid-until').value = '';
        document.getElementById('new-off-badge').value = '';
        document.getElementById('new-off-pdf').value = '';
        document.getElementById('new-off-image').value = '';
        
        const btn = document.getElementById('save-offer-btn');
        if(btn) {
            btn.removeAttribute('data-edit-id');
            btn.innerText = 'Save Offer';
        }
        document.querySelector('#upload-form h3').innerText = 'Add New Offer';
    },

    editOffer: async function(id) {
        try {
            const res = await fetch('/api/offer/' + id);
            if (!res.ok) throw new Error('Offer not found');
            const offer = await res.json();

            document.getElementById('upload-form').style.display = 'block';
            document.getElementById('new-off-id').value = offer.id || offer._id;
            document.getElementById('new-off-id').readOnly = true;
            document.getElementById('new-off-title').value = offer.title || '';
            document.getElementById('new-off-valid-from').value = offer.validFrom ? new Date(offer.validFrom).toISOString().split('T')[0] : '';
            document.getElementById('new-off-valid-until').value = offer.validUntil ? new Date(offer.validUntil).toISOString().split('T')[0] : '';
            document.getElementById('new-off-retailer').value = offer.retailerId || '';
            document.getElementById('new-off-badge').value = offer.badge || '';
            document.getElementById('new-off-pdf').value = (offer.pdfUrl && offer.pdfUrl !== '#') ? offer.pdfUrl : '';
            document.getElementById('new-off-image').value = offer.image || '';

            const saveBtn = document.getElementById('save-offer-btn');
            saveBtn.innerText = 'Update Offer';
            saveBtn.setAttribute('data-edit-id', offer.id || offer._id);
            document.querySelector('#upload-form h3').innerText = 'Edit Offer';
            window.scrollTo(0, 0);
        } catch(e) { alert('Error loading offer details.'); }
    },

    saveOffer: async function() {
        const id = document.getElementById('new-off-id').value.toLowerCase();
        const title = document.getElementById('new-off-title').value;
        const validFrom = document.getElementById('new-off-valid-from').value;
        const validUntil = document.getElementById('new-off-valid-until').value;
        const retailerId = document.getElementById('new-off-retailer').value;
        const badge = document.getElementById('new-off-badge').value;

        let pdfUrl = document.getElementById('new-off-pdf').value || '#';
        let image = document.getElementById('new-off-image').value;

        const pdfFile = document.getElementById('new-off-pdf-file').files[0];
        const imageFile = document.getElementById('new-off-image-file').files[0];
        const btn = document.getElementById('save-offer-btn');

        const editId = btn.getAttribute('data-edit-id');
        btn.innerText = editId ? 'Updating...' : 'Uploading...';
        btn.disabled = true;

        try {
            if (pdfFile) pdfUrl = await this.uploadFile(pdfFile);
            if (imageFile) image = await this.uploadFile(imageFile);
            
            if(id && title && validFrom && validUntil && retailerId) {
                const payload = { id, title, validFrom, validUntil, retailerId, pdfUrl, image, badge };
                if (editId) {
                    const res = await fetch(`/api/offers/${editId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` },
                        body: JSON.stringify(payload)
                    });
                    if (!res.ok) throw new Error('Failed to update offer');
                } else {
                    await api.addOffer(payload); 
                }
                
                alert(editId ? 'Offer updated successfully!' : 'Offer saved successfully!'); 
                this.showTab('offers'); 
            } else {
                alert('Please fill all required fields.');
            }
        } catch(e) {
            alert('Error saving offer: ' + e.message);
        } finally {
            if (btn) {
                btn.innerText = editId ? 'Update Offer' : 'Save Offer';
                btn.disabled = false;
            }
        }
    },

    renderStats: async function() {
        try {
            const stats = await api.getStats();
            let topRetHtml = stats.topRetailers.map(r => `<li>${r.name} - <b>${r.clicks} clicks</b></li>`).join('');
            let topOffHtml = stats.topOffers.map(o => `<li>${o.title} - <b>${o.clicks} clicks</b></li>`).join('');
            
            return `
                <h2>Platform Statistics</h2>
                <div style="background:#2c3e50; color:white; padding:20px; border-radius:8px; margin-bottom:20px; display:inline-block;">
                    <h3 style="margin-bottom:5px;">Total Website Visits</h3>
                    <h1 style="font-size:3rem; color:#27ae60;">${stats.visits}</h1>
                </div>
                
                <div style="display:flex; gap:20px;">
                    <div style="flex:1; background:#f9f9f9; padding:20px; border-radius:8px; border:1px solid #ddd;">
                        <h3>Top Clicked Retailers</h3>
                        <ul style="margin-top:10px; padding-left:20px; line-height:1.8;">${topRetHtml || '<li>No data yet</li>'}</ul>
                    </div>
                    <div style="flex:1; background:#f9f9f9; padding:20px; border-radius:8px; border:1px solid #ddd;">
                        <h3>Top Clicked Offers</h3>
                        <ul style="margin-top:10px; padding-left:20px; line-height:1.8;">${topOffHtml || '<li>No data yet</li>'}</ul>
                    </div>
                </div>
            `;
        } catch(e) { return `<p>Error loading stats</p>`; }
    },

    renderFeedback: async function() {
        try {
            const res = await fetch('/api/admin/feedback', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
            });
            if (!res.ok) throw new Error('Failed to fetch feedback');
            const feedbackList = await res.json();
            
            let rows = feedbackList.map(f => `
                <tr>
                    <td>${new Date(f.date).toLocaleDateString()}</td>
                    <td><b>${f.name}</b><br><small style="color:#7f8c8d;">${f.email}</small></td>
                    <td><div style="max-height:100px; overflow-y:auto; padding:8px; background:#f9f9f9; border:1px solid #ddd; border-radius:4px; font-style:italic;">"${f.message}"</div></td>
                </tr>
            `).join('');

            return `<h2>User Feedback</h2><table class="admin-table" style="margin-top:15px;"><thead><tr><th style="width:15%;">Date</th><th style="width:25%;">User</th><th>Message</th></tr></thead><tbody>${rows || '<tr><td colspan="3" style="text-align:center;">No feedback yet.</td></tr>'}</tbody></table>`;
        } catch(e) { return `<p style="color:red;">Error loading feedback. Ensure server is running.</p>`; }
    },

    deleteCountry: async function(id) {
        if(!confirm('Are you sure you want to delete this country?')) return;
        try {
            await fetch(`/api/countries/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` } });
            this.showTab('countries');
        } catch(e) { alert('Error deleting country'); }
    },

    deleteCity: async function(id) {
        if(!confirm('Are you sure you want to delete this city?')) return;
        try {
            await fetch(`/api/cities/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` } });
            this.showTab('cities');
        } catch(e) { alert('Error deleting city'); }
    },

    deleteRetailer: async function(id) {
        if(!confirm('Are you sure you want to delete this retailer?')) return;
        try {
            await fetch(`/api/retailers/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` } });
            this.showTab('retailers');
        } catch(e) { alert('Error deleting retailer'); }
    },

    deleteOffer: async function(id) {
        if(!confirm('Are you sure you want to delete this offer?')) return;
        try {
            await fetch(`/api/offers/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` } });
            this.showTab('offers');
        } catch(e) { alert('Error deleting offer'); }
    }
};

// Boot Admin Dashboard
document.addEventListener('DOMContentLoaded', () => admin.init());