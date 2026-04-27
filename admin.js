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
        this._loadSiteUrl();
        
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

    _loadSiteUrl: async function() {
        try {
            const res = await fetch('/api/settings');
            if (!res.ok) return;
            const s = await res.json();
            if (s.siteUrl) {
                const url = s.siteUrl.trim();
                const btn = document.getElementById('live-site-btn');
                const link = document.getElementById('live-site-link');
                if (btn) { btn.href = url; btn.style.display = 'inline-flex'; }
                if (link) { link.href = url; link.style.display = 'flex'; }
            }
        } catch(e) {}
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
                case 'states':
                    html = await this.renderStates();
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
                    html = await this.renderStats(this._statsSince || 0);
                    break;
                case 'settings':
                    html = await this.renderSettings();
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
                    <button class="action-btn" onclick="admin.editCountry('${c.id}')">Edit</button>
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
                    <button class="action-btn" style="background:#e74c3c; margin-left:10px;" onclick="document.getElementById('new-country-id').readOnly=false; document.getElementById('add-country-form').style.display='none'; document.querySelector('#add-country-form h3').innerText='Add New Country';">Cancel</button>
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
        const isEdit = document.getElementById('new-country-id').readOnly;
        
        if(id && name) {
            try {
                if (imageFile) image = await this.uploadFile(imageFile);
                if (isEdit) {
                    const res = await fetch(`/api/admin/countries/${id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` },
                        body: JSON.stringify({ name, image })
                    });
                    if (!res.ok) throw new Error('Failed to update country');
                    alert('Country updated successfully!');
                } else {
                    await api.addCountry({ id, name, image });
                    alert('Country securely saved to MongoDB permanently!');
                }
                document.getElementById('new-country-id').readOnly = false;
                this.showTab('countries');
            } catch (error) {
                alert('Error saving country: ' + error.message);
            }
        } else {
            alert('Please fill in all required fields before saving.');
        }
    },

    editCountry: async function(id) {
        try {
            const countries = await api.getCountries();
            const country = countries.find(c => c.id === id);
            if (!country) throw new Error('Country not found');
            
            document.getElementById('add-country-form').style.display = 'block';
            document.getElementById('new-country-id').value = country.id;
            document.getElementById('new-country-id').readOnly = true;
            document.getElementById('new-country-name').value = country.name;
            document.getElementById('new-country-image').value = country.image || '';
            document.querySelector('#add-country-form h3').innerText = 'Edit Country';
            window.scrollTo(0, 0);
        } catch(e) {
            alert('Error loading country: ' + e.message);
        }
    },

    renderStates: async function() {
        const states = await api.getAllStates();
        const countries = await api.getCountries();
        const countryMap = {};
        countries.forEach(c => { countryMap[c.id] = c.name; });

        let rows = states.map(s => `
            <tr>
                <td>${s.id.toUpperCase()}</td>
                <td>${s.name}</td>
                <td>${countryMap[s.countryId] || s.countryId.toUpperCase()}</td>
                <td><img src="${s.image}" width="50" style="border-radius:4px;"></td>
                <td>
                    <button class="action-btn" onclick="admin.editState('${s.id}')">Edit</button>
                    <button class="action-btn" style="background:#e74c3c;" onclick="admin.deleteState('${s.id}')">Delete</button>
                </td>
            </tr>
        `).join('');

        let countryOptions = countries.map(c => `<option value="${c.id}">${c.name}</option>`).join('');

        return `
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <h2>States / Provinces</h2>
                <button class="action-btn" style="background:#27ae60;" onclick="document.getElementById('add-state-form').style.display='block'">+ Add State</button>
            </div>
            <p style="color:#64748b; font-size:0.9em; margin:8px 0 16px;">States are optional. Add them only for countries that have a State → City hierarchy (e.g. India, USA, Australia). Countries with direct City access don’t need states.</p>

            <div id="add-state-form" style="display:none; background:#f9f9f9; padding:20px; border-radius:8px; margin-top:15px; border:1px solid #ddd;">
                <h3>Add New State</h3>
                <div style="margin-top:10px;">
                    <label>State Code (e.g., mh for Maharashtra):</label><br>
                    <input type="text" id="new-state-id" style="width:100%; padding:8px; margin-bottom:10px;" placeholder="e.g., mh">

                    <label>State Name:</label><br>
                    <input type="text" id="new-state-name" style="width:100%; padding:8px; margin-bottom:10px;" placeholder="e.g., Maharashtra">

                    <label>Belongs to Country:</label><br>
                    <select id="new-state-country" style="width:100%; padding:8px; margin-bottom:10px;">
                        ${countryOptions}
                    </select>

                    <label>Upload Cover Image (Optional):</label><br>
                    <input type="file" id="new-state-image-file" accept="image/*" style="width:100%; padding:8px; margin-bottom:5px;">
                    <input type="text" id="new-state-image" style="width:100%; padding:8px; margin-bottom:15px;" placeholder="OR provide Image URL">

                    <button class="action-btn" onclick="admin.saveState()">Save State</button>
                    <button class="action-btn" style="background:#e74c3c; margin-left:10px;" onclick="document.getElementById('new-state-id').readOnly=false; document.getElementById('add-state-form').style.display='none'; document.querySelector('#add-state-form h3').innerText='Add New State';">Cancel</button>
                </div>
            </div>

            <table class="admin-table">
                <thead><tr><th>ID</th><th>Name</th><th>Country</th><th>Image</th><th>Actions</th></tr></thead>
                <tbody>${rows || '<tr><td colspan="5" style="text-align:center;color:#94a3b8;">No states added yet</td></tr>'}</tbody>
            </table>
        `;
    },

    saveState: async function() {
        const id = document.getElementById('new-state-id').value.toLowerCase();
        const name = document.getElementById('new-state-name').value;
        const countryId = document.getElementById('new-state-country').value;
        let image = document.getElementById('new-state-image').value;
        const imageFile = document.getElementById('new-state-image-file').files[0];
        const isEdit = document.getElementById('new-state-id').readOnly;

        if (!id || !name || !countryId) { alert('Please fill in all required fields.'); return; }
        try {
            if (imageFile) image = await this.uploadFile(imageFile);
            if (!image) image = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&q=80';
            if (isEdit) {
                const res = await fetch(`/api/admin/states/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` },
                    body: JSON.stringify({ name, countryId, image })
                });
                if (!res.ok) throw new Error('Failed to update state');
                alert('State updated successfully!');
            } else {
                const res = await fetch('/api/states', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` },
                    body: JSON.stringify({ id, name, countryId, image })
                });
                if (!res.ok) throw new Error('Failed to save state');
                alert('State saved!');
            }
            document.getElementById('new-state-id').readOnly = false;
            this.showTab('states');
        } catch(e) { alert('Error: ' + e.message); }
    },

    editState: async function(id) {
        try {
            const states = await api.getAllStates();
            const state = states.find(s => s.id === id);
            if (!state) throw new Error('State not found');
            document.getElementById('add-state-form').style.display = 'block';
            document.getElementById('new-state-id').value = state.id;
            document.getElementById('new-state-id').readOnly = true;
            document.getElementById('new-state-name').value = state.name;
            document.getElementById('new-state-country').value = state.countryId;
            document.getElementById('new-state-image').value = state.image || '';
            document.querySelector('#add-state-form h3').innerText = 'Edit State';
            window.scrollTo(0, 0);
        } catch(e) { alert('Error loading state: ' + e.message); }
    },

    deleteState: async function(id) {
        if (!confirm('Delete this state? Cities linked to it will become direct cities under the country.')) return;
        try {
            const res = await fetch(`/api/states/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` } });
            if (!res.ok) throw new Error('Failed to delete');
            alert('State deleted!');
            this.showTab('states');
        } catch(e) { alert('Error: ' + e.message); }
    },

    loadStatesForCity: async function(countryId) {
        const states = await api.getAllStates();
        const filtered = states.filter(s => s.countryId === countryId);
        const select = document.getElementById('new-city-state');
        if (!select) return;
        select.innerHTML = '<option value="">— No State (direct city) —</option>' +
            filtered.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    },

    renderCities: async function() {
        const allCities = await api.getAllCities();
        const countries = await api.getCountries();
        const allStates = await api.getAllStates();

        // Build a map of stateId -> stateName for display
        const stateMap = {};
        allStates.forEach(s => { stateMap[s.id] = s.name; });

        let rows = allCities.map(c => `
            <tr>
                <td>${c.id.toUpperCase()}</td>
                <td>${c.name}</td>
                <td>${c.countryId.toUpperCase()}</td>
                <td>${c.stateId ? stateMap[c.stateId] || c.stateId.toUpperCase() : '<span style="color:#94a3b8;">—</span>'}</td>
                <td>
                    <button class="action-btn" onclick="admin.editCity('${c.id}')">Edit</button>
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
                    <select id="new-city-country" style="width:100%; padding:8px; margin-bottom:10px;" onchange="admin.loadStatesForCity(this.value)">
                        ${countryOptions}
                    </select>

                    <label>Belongs to State (optional — only if country has states):</label><br>
                    <select id="new-city-state" style="width:100%; padding:8px; margin-bottom:10px;">
                        <option value="">— No State (direct city) —</option>
                        ${allStates.map(s => `<option value="${s.id}">${s.name} (${s.countryId.toUpperCase()})</option>`).join('')}
                    </select>
                    
                    <label>Upload Cover Image (Optional):</label><br>
                    <input type="file" id="new-city-image-file" accept="image/*" style="width:100%; padding:8px; margin-bottom:5px;">
                    <input type="text" id="new-city-image" style="width:100%; padding:8px; margin-bottom:15px;" placeholder="OR provide Image URL">
                    
                    <button class="action-btn" onclick="admin.saveCity()">Save City</button>
                    <button class="action-btn" style="background:#e74c3c; margin-left:10px;" onclick="document.getElementById('new-city-id').readOnly=false; document.getElementById('add-city-form').style.display='none'; document.querySelector('#add-city-form h3').innerText='Add New City';">Cancel</button>
                </div>
            </div>
            <table class="admin-table"><thead><tr><th>ID</th><th>City Name</th><th>Country</th><th>State</th><th>Actions</th></tr></thead><tbody>${rows}</tbody></table>
        `;
    },

    saveCity: async function() {
        const id = document.getElementById('new-city-id').value.toLowerCase();
        const name = document.getElementById('new-city-name').value;
        const countryId = document.getElementById('new-city-country').value;
        const stateId = document.getElementById('new-city-state').value || '';
        let image = document.getElementById('new-city-image').value;
        const imageFile = document.getElementById('new-city-image-file').files[0];
        const isEdit = document.getElementById('new-city-id').readOnly;
        
        if(id && name && countryId) {
            try { 
                if (imageFile) image = await this.uploadFile(imageFile);
                if (isEdit) {
                    const res = await fetch(`/api/admin/cities/${id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` },
                        body: JSON.stringify({ name, countryId, stateId, image })
                    });
                    if (!res.ok) throw new Error('Failed to update city');
                    alert('City updated successfully!');
                } else {
                    await api.addCity({ id, name, countryId, stateId, image });
                    alert('City saved!');
                }
                document.getElementById('new-city-id').readOnly = false;
                this.showTab('cities');
            } 
            catch(e) { alert('Error saving to database.'); }
        } else { alert('Please fill all required fields'); }
    },

    editCity: async function(id) {
        try {
            const cities = await api.getAllCities();
            const city = cities.find(c => c.id === id);
            if (!city) throw new Error('City not found');
            
            document.getElementById('add-city-form').style.display = 'block';
            document.getElementById('new-city-id').value = city.id;
            document.getElementById('new-city-id').readOnly = true;
            document.getElementById('new-city-name').value = city.name;
            document.getElementById('new-city-country').value = city.countryId;
            document.getElementById('new-city-image').value = city.image || '';
            // Load states for this country then set the stateId
            await this.loadStatesForCity(city.countryId);
            document.getElementById('new-city-state').value = city.stateId || '';
            document.querySelector('#add-city-form h3').innerText = 'Edit City';
            window.scrollTo(0, 0);
        } catch(e) {
            alert('Error loading city: ' + e.message);
        }
    },

    renderRetailers: async function() {
        const retailers = await api.getAllRetailers();
        const cities = await api.getAllCities();
        
        let rows = retailers.map(r => `<tr><td>${r.id.toUpperCase()}</td><td>${r.name}</td><td>${r.cityId.toUpperCase()}</td><td><button class="action-btn" onclick="admin.editRetailer('${r.id}')">Edit</button> <button class="action-btn" style="background:#e74c3c;" onclick="admin.deleteRetailer('${r.id}')">Delete</button></td></tr>`).join('');
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
                <button class="action-btn" style="background:#e74c3c; margin-left:10px;" onclick="document.getElementById('new-ret-id').readOnly=false; document.getElementById('add-retailer-form').style.display='none'; document.querySelector('#add-retailer-form h3').innerText='Add New Retailer';">Cancel</button>
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
        const isEdit = document.getElementById('new-ret-id').readOnly;
        
        if(id && name && cityId) {
            try { 
                if (imageFile) image = await this.uploadFile(imageFile);
                if (isEdit) {
                    const res = await fetch(`/api/admin/retailers/${id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` },
                        body: JSON.stringify({ name, websiteUrl, cityId, image })
                    });
                    if (!res.ok) throw new Error('Failed to update retailer');
                    alert('Retailer updated successfully!');
                } else {
                    await api.addRetailer({ id, name, websiteUrl, cityId, image });
                    alert('Retailer saved!');
                }
                document.getElementById('new-ret-id').readOnly = false;
                this.showTab('retailers');
            } 
            catch(e) { alert('Error: ' + e.message); }
        } else { alert('Please fill all required fields'); }
    },

    editRetailer: async function(id) {
        try {
            const retailers = await api.getAllRetailers();
            const retailer = retailers.find(r => r.id === id);
            if (!retailer) throw new Error('Retailer not found');
            
            document.getElementById('add-retailer-form').style.display = 'block';
            document.getElementById('new-ret-id').value = retailer.id;
            document.getElementById('new-ret-id').readOnly = true;
            document.getElementById('new-ret-name').value = retailer.name;
            document.getElementById('new-ret-web').value = retailer.websiteUrl || '';
            document.getElementById('new-ret-city').value = retailer.cityId;
            document.getElementById('new-ret-image').value = retailer.image || '';
            document.querySelector('#add-retailer-form h3').innerText = 'Edit Retailer';
            window.scrollTo(0, 0);
        } catch(e) {
            alert('Error loading retailer: ' + e.message);
        }
    },

    renderOffers: async function() {
        const offers = await api.getAllOffers();
        const retailers = await api.getAllRetailers();
        
        // Separate active and expired offers
        const now = new Date();
        const activeOffers = offers.filter(o => new Date(o.validUntil) >= now);
        const expiredOffers = offers.filter(o => new Date(o.validUntil) < now);
        
        let rows = activeOffers.map(o => `<tr><td>${o.title}</td><td>${o.retailerId.toUpperCase()}</td><td>${o.validFrom ? new Date(o.validFrom).toISOString().split('T')[0] : ''} to ${o.validUntil ? new Date(o.validUntil).toISOString().split('T')[0] : ''}</td><td><button class="action-btn" onclick="admin.editOffer('${o.id || o._id}')">Edit</button> <button class="action-btn" style="background:#e74c3c;" onclick="admin.deleteOffer('${o.id || o._id}')">Delete</button></td></tr>`).join('');
        let retailerOptions = retailers.map(r => `<option value="${r.id}">${r.name} (${r.cityId})</option>`).join('');

        let expiredSection = '';
        if (expiredOffers.length > 0) {
            let expiredRows = expiredOffers.map(o => `
                <tr style="background:#fff7ed;">
                    <td><input type="checkbox" class="expired-offer-checkbox" data-offer-id="${o.id || o._id}" data-pdf="${o.pdfUrl || ''}" data-image="${o.image || ''}"></td>
                    <td>${o.title}</td>
                    <td>${o.retailerId.toUpperCase()}</td>
                    <td style="color:#ea580c; font-weight:600;">Expired ${Math.floor((now - new Date(o.validUntil)) / (1000 * 60 * 60 * 24))} days ago</td>
                    <td><button class="action-btn" style="background:#e74c3c;" onclick="admin.deleteOffer('${o.id || o._id}')">Delete</button></td>
                </tr>
            `).join('');
            
            expiredSection = `
                <div style="margin-top:30px; padding:20px; background:#fff7ed; border:2px solid #ea580c; border-radius:8px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                        <h3 style="color:#ea580c; margin:0;"><i class="fa-solid fa-clock"></i> Expired Offers (${expiredOffers.length})</h3>
                        <div>
                            <button class="action-btn" style="background:#ea580c;" onclick="admin.selectAllExpired()">Select All</button>
                            <button class="action-btn" style="background:#e74c3c; margin-left:10px;" onclick="admin.deleteSelectedExpired()"><i class="fa-solid fa-trash"></i> Delete Selected</button>
                        </div>
                    </div>
                    <p style="color:#9a3412; font-size:0.9em; margin-bottom:15px;">⚠️ Deleting expired offers will permanently remove them and their associated files from storage.</p>
                    <table class="admin-table">
                        <thead>
                            <tr>
                                <th style="width:40px;"><input type="checkbox" id="select-all-expired" onclick="admin.toggleAllExpired(this)"></th>
                                <th>Title</th>
                                <th>Retailer</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>${expiredRows}</tbody>
                    </table>
                </div>
            `;
        }

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
            
            <h3 style="margin-top:30px;">Active Offers (${activeOffers.length})</h3>
            <table class="admin-table" style="margin-top:10px;"><thead><tr><th>Title</th><th>Retailer</th><th>Validity</th><th>Actions</th></tr></thead><tbody>${rows || '<tr><td colspan="4" style="text-align:center; color:#94a3b8;">No active offers</td></tr>'}</tbody></table>
            
            ${expiredSection}
        `;
    },

    uploadFile: async function(file) {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/admin/upload', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` },
            body: formData
        });
        if (!res.ok) {
            let errMsg = `Failed to upload file (HTTP ${res.status})`;
            try {
                const text = await res.text();
                try {
                    const data = JSON.parse(text);
                    if (data.error) errMsg = data.error;
                } catch(e) {
                    errMsg += `: ` + text.substring(0, 50);
                }
            } catch(e) {}
            throw new Error(errMsg);
        }
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
                    const res = await fetch(`/api/admin/offers/${editId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` },
                        body: JSON.stringify(payload)
                    });
                    if (!res.ok) {
                        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
                        console.error('Update failed:', res.status, errorData);
                        throw new Error(errorData.error || `HTTP ${res.status}`);
                    }
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

    _statsSince: 0,

    loadStats: async function(since) {
        this._statsSince = since;
        this.contentDiv.innerHTML = '<p style="padding:20px;">Loading stats...</p>';
        this.contentDiv.innerHTML = await this.renderStats(since);
    },

    renderStats: async function(since = 0) {
        try {
            const stats = await api.getStats(since);
            
            // Format numbers with safe defaults
            const formatNum = (n) => (n || 0).toLocaleString();
            const formatTime = (seconds) => {
                if (seconds < 60) return `${seconds}s`;
                const mins = Math.floor(seconds / 60);
                const secs = seconds % 60;
                return `${mins}m ${secs}s`;
            };
            
            // Top retailers HTML
            let topRetHtml = (stats.topRetailers || []).slice(0, 5).map((r, i) => `
                <div class="stat-row">
                    <div class="stat-row-rank ${i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : ''}">${i + 1}</div>
                    <div class="stat-row-info">
                        <div class="stat-row-name">${r.name}</div>
                        <div class="stat-row-sub">${r.category || 'General'}</div>
                    </div>
                    <div class="stat-row-value">${formatNum(r.clicks)} clicks</div>
                </div>
            `).join('');
            
            // Top offers HTML
            let topOffHtml = (stats.topOffers || []).slice(0, 5).map((o, i) => `
                <div class="stat-row">
                    <div class="stat-row-rank ${i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : ''}">${i + 1}</div>
                    <div class="stat-row-info">
                        <div class="stat-row-name">${o.title}</div>
                        <div class="stat-row-sub">${o.retailerId.toUpperCase()}</div>
                    </div>
                    <div class="stat-row-value">${formatNum(o.clicks)} clicks</div>
                </div>
            `).join('');
            
            // Top countries HTML
            let topCountriesHtml = (stats.topCountries || []).slice(0, 5).map((c, i) => `
                <div class="stat-row">
                    <div class="stat-row-rank ${i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : ''}">${i + 1}</div>
                    <div class="stat-row-info">
                        <div class="stat-row-name">${c.name}</div>
                        <div class="stat-row-sub">${c.id.toUpperCase()}</div>
                    </div>
                    <div class="stat-row-value">${formatNum(c.visits)} visits</div>
                </div>
            `).join('');
            
            // Top cities HTML
            let topCitiesHtml = (stats.topCities || []).slice(0, 5).map((c, i) => `
                <div class="stat-row">
                    <div class="stat-row-rank ${i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : ''}">${i + 1}</div>
                    <div class="stat-row-info">
                        <div class="stat-row-name">${c.name}</div>
                        <div class="stat-row-sub">${c.countryId.toUpperCase()}</div>
                    </div>
                    <div class="stat-row-value">${formatNum(c.visits)} visits</div>
                </div>
            `).join('');
            
            // PDF engagement HTML
            let pdfEngagementHtml = (stats.offersWithPDFViews || []).slice(0, 5).map((o, i) => `
                <div class="stat-row">
                    <div class="stat-row-rank">${i + 1}</div>
                    <div class="stat-row-info">
                        <div class="stat-row-name">${o.title}</div>
                        <div class="stat-row-sub">Max page: ${o.maxPagesViewed}</div>
                    </div>
                    <div class="stat-row-value">${formatTime(o.totalTimeSeconds || 0)}</div>
                </div>
            `).join('');
            
            // Category performance HTML
            let categoryHtml = (stats.offersByCategory || []).slice(0, 5).map((cat, i) => `
                <div class="stat-row">
                    <div class="stat-row-rank">${i + 1}</div>
                    <div class="stat-row-info">
                        <div class="stat-row-name">${cat._id || 'Uncategorized'}</div>
                        <div class="stat-row-sub">${cat.count} offers</div>
                    </div>
                    <div class="stat-row-value">${formatNum(cat.totalClicks)} clicks</div>
                </div>
            `).join('');
            
            return `
                <h2>Marketing Analytics Dashboard</h2>
                <p style="color:#64748b; margin-bottom:24px;">Comprehensive insights to optimize your platform performance</p>

                <!-- Date Range Toggle -->
                <div style="display:flex; gap:8px; margin-bottom:24px;">
                    ${[{label:'Last 7 days',val:7},{label:'Last 30 days',val:30},{label:'All time',val:0}].map(opt=>`
                        <button onclick="admin.loadStats(${opt.val})"
                            style="padding:8px 16px; border-radius:8px; font-size:0.8rem; font-weight:700; cursor:pointer; border:2px solid ${since===opt.val?'var(--red)':'var(--border)'}; background:${since===opt.val?'var(--red)':'white'}; color:${since===opt.val?'white':'var(--text-secondary)'}; transition:all .15s;">
                            ${opt.label}
                        </button>
                    `).join('')}
                </div>
                
                <!-- KPI Cards -->
                <div class="kpi-grid">
                    <div class="kpi-card" style="--kpi-color:#dc2626; --kpi-bg:#fef2f2;">
                        <div class="kpi-icon"><i class="fa-solid fa-eye"></i></div>
                        <div class="kpi-value">${formatNum(stats.visits || 0)}</div>
                        <div class="kpi-label">Total Visits</div>
                        <div class="kpi-sub">All-time website traffic</div>
                    </div>
                    
                    <div class="kpi-card" style="--kpi-color:#16a34a; --kpi-bg:#f0fdf4;">
                        <div class="kpi-icon"><i class="fa-solid fa-tags"></i></div>
                        <div class="kpi-value">${formatNum((stats.totals || {}).activeOffers || 0)}</div>
                        <div class="kpi-label">Active Offers</div>
                        <div class="kpi-sub">+${(stats.totals || {}).offersAddedLast7Days || 0} this week</div>
                    </div>
                    
                    <div class="kpi-card" style="--kpi-color:#2563eb; --kpi-bg:#eff6ff;">
                        <div class="kpi-icon"><i class="fa-solid fa-percentage"></i></div>
                        <div class="kpi-value">${stats.conversionRate || 0}%</div>
                        <div class="kpi-label">Conversion Rate</div>
                        <div class="kpi-sub">${formatNum(stats.offersWithClicks || 0)} offers clicked</div>
                    </div>
                    
                    <div class="kpi-card" style="--kpi-color:#ea580c; --kpi-bg:#fff7ed;">
                        <div class="kpi-icon"><i class="fa-solid fa-clock"></i></div>
                        <div class="kpi-value">${formatTime(stats.avgEngagementTime || 0)}</div>
                        <div class="kpi-label">Avg. Engagement</div>
                        <div class="kpi-sub">Time spent per offer</div>
                    </div>
                    
                    <div class="kpi-card" style="--kpi-color:#7c3aed; --kpi-bg:#f5f3ff;">
                        <div class="kpi-icon"><i class="fa-solid fa-file-pdf"></i></div>
                        <div class="kpi-value">${stats.avgPagesViewed || 0}</div>
                        <div class="kpi-label">Avg. Pages Viewed</div>
                        <div class="kpi-sub">PDF engagement depth</div>
                    </div>
                    
                    <div class="kpi-card" style="--kpi-color:#ca8a04; --kpi-bg:#fefce8;">
                        <div class="kpi-icon"><i class="fa-solid fa-chart-line"></i></div>
                        <div class="kpi-value">+${(stats.totals || {}).offersAddedLast30Days || 0}</div>
                        <div class="kpi-label">Monthly Growth</div>
                        <div class="kpi-sub">New offers added</div>
                    </div>
                </div>
                
                <!-- Geographic Performance -->
                <div class="card" style="margin-top:24px;">
                    <div class="card-header">
                        <h3 style="font-size:1.1rem; font-weight:700; color:#0f172a;">
                            <i class="fa-solid fa-globe" style="color:#2563eb;"></i> Geographic Performance
                        </h3>
                    </div>
                    <div class="card-body">
                        <div class="grid-2">
                            <div>
                                <h4 style="font-size:0.9rem; font-weight:600; color:#64748b; margin-bottom:12px;">Top Countries by Visits</h4>
                                ${topCountriesHtml || '<p style="color:#94a3b8; text-align:center; padding:20px;">No data yet</p>'}
                            </div>
                            <div>
                                <h4 style="font-size:0.9rem; font-weight:600; color:#64748b; margin-bottom:12px;">Top Cities by Visits</h4>
                                ${topCitiesHtml || '<p style="color:#94a3b8; text-align:center; padding:20px;">No data yet</p>'}
                            </div>
                        </div>
                        <div style="margin-top:20px; padding:16px; background:#eff6ff; border-radius:8px; border:1px solid #bfdbfe;">
                            <p style="font-size:0.85rem; color:#1e40af; margin:0;">
                                <i class="fa-solid fa-lightbulb"></i> <strong>Insight:</strong> 
                                ${stats.topCountryName || 'N/A'} is your most visited region. Consider adding more retailers from this area.
                            </p>
                        </div>
                    </div>
                </div>
                
                <!-- Top Performers -->
                <div class="grid-2" style="margin-top:24px;">
                    <div class="card">
                        <div class="card-header">
                            <h3 style="font-size:1rem; font-weight:700; color:#0f172a;">
                                <i class="fa-solid fa-store" style="color:#16a34a;"></i> Top Retailers
                            </h3>
                        </div>
                        <div class="card-body">
                            ${topRetHtml || '<p style="color:#94a3b8; text-align:center; padding:20px;">No data yet</p>'}
                        </div>
                    </div>
                    
                    <div class="card">
                        <div class="card-header">
                            <h3 style="font-size:1rem; font-weight:700; color:#0f172a;">
                                <i class="fa-solid fa-fire" style="color:#dc2626;"></i> Top Offers
                            </h3>
                        </div>
                        <div class="card-body">
                            ${topOffHtml || '<p style="color:#94a3b8; text-align:center; padding:20px;">No data yet</p>'}
                        </div>
                    </div>
                </div>
                
                <!-- PDF Engagement -->
                <div class="card" style="margin-top:24px;">
                    <div class="card-header">
                        <h3 style="font-size:1.1rem; font-weight:700; color:#0f172a;">
                            <i class="fa-solid fa-file-pdf" style="color:#7c3aed;"></i> PDF Engagement Analytics
                        </h3>
                    </div>
                    <div class="card-body">
                        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:16px; margin-bottom:20px;">
                            <div style="text-align:center; padding:16px; background:#f5f3ff; border-radius:8px;">
                                <div style="font-size:2rem; font-weight:800; color:#7c3aed;">${stats.avgPagesViewed || 0}</div>
                                <div style="font-size:0.8rem; color:#6b21a8; margin-top:4px;">Avg Pages Viewed</div>
                            </div>
                            <div style="text-align:center; padding:16px; background:#fef2f2; border-radius:8px;">
                                <div style="font-size:2rem; font-weight:800; color:#dc2626;">${(stats.offersWithPDFViews || []).length}</div>
                                <div style="font-size:0.8rem; color:#991b1b; margin-top:4px;">PDFs with Views</div>
                            </div>
                            <div style="text-align:center; padding:16px; background:#f0fdf4; border-radius:8px;">
                                <div style="font-size:2rem; font-weight:800; color:#16a34a;">${formatTime(stats.avgEngagementTime || 0)}</div>
                                <div style="font-size:0.8rem; color:#15803d; margin-top:4px;">Avg Time Spent</div>
                            </div>
                        </div>
                        <h4 style="font-size:0.9rem; font-weight:600; color:#64748b; margin-bottom:12px;">Most Engaged PDFs</h4>
                        ${pdfEngagementHtml || '<p style="color:#94a3b8; text-align:center; padding:20px;">No PDF views yet</p>'}
                    </div>
                </div>
                
                <!-- Category Performance -->
                <div class="card" style="margin-top:24px;">
                    <div class="card-header">
                        <h3 style="font-size:1.1rem; font-weight:700; color:#0f172a;">
                            <i class="fa-solid fa-layer-group" style="color:#ea580c;"></i> Category Performance
                        </h3>
                    </div>
                    <div class="card-body">
                        ${categoryHtml || '<p style="color:#94a3b8; text-align:center; padding:20px;">No categories yet</p>'}
                        <div style="margin-top:20px; padding:16px; background:#fff7ed; border-radius:8px; border:1px solid #fed7aa;">
                            <p style="font-size:0.85rem; color:#9a3412; margin:0;">
                                <i class="fa-solid fa-chart-bar"></i> <strong>Tip:</strong> 
                                Focus marketing efforts on top-performing categories to maximize ROI.
                            </p>
                        </div>
                    </div>
                </div>
                
                <!-- Conversion Insights -->
                <div class="card" style="margin-top:24px;">
                    <div class="card-header">
                        <h3 style="font-size:1.1rem; font-weight:700; color:#0f172a;">
                            <i class="fa-solid fa-bullseye" style="color:#16a34a;"></i> Conversion Insights
                        </h3>
                    </div>
                    <div class="card-body">
                        <div style="display:grid; grid-template-columns:2fr 1fr 1fr; gap:16px;">
                            <div style="padding:20px; background:#f0fdf4; border-radius:8px; border:1px solid #bbf7d0;">
                                <div style="font-size:2.5rem; font-weight:800; color:#16a34a;">${stats.conversionRate || 0}%</div>
                                <div style="font-size:0.9rem; color:#15803d; margin-top:4px; font-weight:600;">Overall Conversion Rate</div>
                                <div style="font-size:0.75rem; color:#4ade80; margin-top:8px;">
                                    ${formatNum(stats.offersWithClicks || 0)} of ${formatNum((stats.totals || {}).activeOffers || 0)} offers have clicks
                                </div>
                            </div>
                            <div style="padding:20px; background:#fef2f2; border-radius:8px; border:1px solid #fecaca; text-align:center;">
                                <div style="font-size:2rem; font-weight:800; color:#dc2626;">${formatNum(stats.offersWithoutClicks || 0)}</div>
                                <div style="font-size:0.8rem; color:#991b1b; margin-top:4px;">Zero Clicks</div>
                            </div>
                            <div style="padding:20px; background:#eff6ff; border-radius:8px; border:1px solid #bfdbfe; text-align:center;">
                                <div style="font-size:2rem; font-weight:800; color:#2563eb;">${stats.expiringIn30 || 0}</div>
                                <div style="font-size:0.8rem; color:#1e40af; margin-top:4px;">Expiring Soon</div>
                            </div>
                        </div>
                        <div style="margin-top:20px; padding:16px; background:#fef2f2; border-radius:8px; border:1px solid #fecaca;">
                            <p style="font-size:0.85rem; color:#991b1b; margin:0;">
                                <i class="fa-solid fa-triangle-exclamation"></i> <strong>Action Required:</strong> 
                                ${formatNum(stats.offersWithoutClicks || 0)} offers have zero engagement. Consider improving titles, images, or removing them.
                            </p>
                        </div>
                    </div>
                </div>
            `;
        } catch(e) {
            console.error('Stats render error:', e);
            return `<p style="color:#dc2626;">Error loading stats: ${e.message}</p>`;
        }
    },

    renderSettings: async function() {
        let s = {};
        try {
            const res = await fetch('/api/settings');
            if (res.ok) s = await res.json();
        } catch(e) {}

        return `
            <h2>Site Settings</h2>
            <p style="color:#7f8c8d; margin-bottom:20px;">These settings are saved to the database and applied to the live website immediately.</p>

            <div style="background:#f9f9f9; padding:24px; border-radius:8px; border:1px solid #ddd; max-width:600px;">

                <h3 style="margin-bottom:16px;"><i class="fa-solid fa-globe" style="color:#2563eb;"></i> Live Website URL</h3>
                <label style="font-size:0.85em; font-weight:bold;">Production Site URL</label>
                <input type="url" id="s-site-url" value="${s.siteUrl || ''}" placeholder="https://your-frontend.up.railway.app"
                    style="width:100%; padding:8px; margin:6px 0 4px; box-sizing:border-box;">
                <p style="font-size:0.78em; color:#7f8c8d; margin-bottom:20px;">Used for the "View Live Website" button in the admin sidebar. Leave blank to hide the button.</p>

                <h3 style="margin-bottom:16px;"><i class="fa-brands fa-google" style="color:#4285F4;"></i> Google Analytics</h3>
                <label style="font-size:0.85em; font-weight:bold;">Google Analytics Measurement ID</label>
                <input type="text" id="s-ga-id" value="${s.gaId || ''}" placeholder="e.g. G-XXXXXXXXXX"
                    style="width:100%; padding:8px; margin:6px 0 4px; box-sizing:border-box;">
                <p style="font-size:0.78em; color:#7f8c8d; margin-bottom:20px;">Leave blank to disable Google Analytics. Get your ID from <a href="https://analytics.google.com" target="_blank">analytics.google.com</a>.</p>

                <h3 style="margin-bottom:16px;"><i class="fa-solid fa-share-nodes" style="color:#e74c3c;"></i> Social Media Links</h3>
                <label style="font-size:0.85em; font-weight:bold;">Facebook Page URL</label>
                <input type="url" id="s-facebook" value="${s.facebookUrl || ''}" placeholder="https://facebook.com/yourpage"
                    style="width:100%; padding:8px; margin:6px 0 12px; box-sizing:border-box;">

                <label style="font-size:0.85em; font-weight:bold;">Twitter / X Profile URL</label>
                <input type="url" id="s-twitter" value="${s.twitterUrl || ''}" placeholder="https://twitter.com/yourhandle"
                    style="width:100%; padding:8px; margin:6px 0 12px; box-sizing:border-box;">

                <label style="font-size:0.85em; font-weight:bold;">Instagram Profile URL</label>
                <input type="url" id="s-instagram" value="${s.instagramUrl || ''}" placeholder="https://instagram.com/yourhandle"
                    style="width:100%; padding:8px; margin:6px 0 20px; box-sizing:border-box;">

                <h3 style="margin-bottom:16px;"><i class="fa-solid fa-comment" style="color:#27ae60;"></i> Feedback Page</h3>
                <label style="font-size:0.85em; font-weight:bold;">Feedback Page URL</label>
                <input type="text" id="s-feedback" value="${s.feedbackUrl || '/feedback'}" placeholder="/feedback or https://forms.google.com/..."
                    style="width:100%; padding:8px; margin:6px 0 4px; box-sizing:border-box;">
                <p style="font-size:0.78em; color:#7f8c8d; margin-bottom:20px;">Can be an internal path (e.g. /feedback) or an external URL like a Google Form.</p>

                <button class="action-btn" style="background:#27ae60; width:100%; padding:12px; font-size:1em;" onclick="admin.saveSettings()">Save Settings</button>
                <p id="settings-msg" style="display:none; margin-top:12px; text-align:center; font-weight:bold;"></p>
            </div>
        `;
    },

    saveSettings: async function() {
        const payload = {
            siteUrl: document.getElementById('s-site-url').value.trim(),
            gaId: document.getElementById('s-ga-id').value.trim(),
            facebookUrl: document.getElementById('s-facebook').value.trim(),
            twitterUrl: document.getElementById('s-twitter').value.trim(),
            instagramUrl: document.getElementById('s-instagram').value.trim(),
            feedbackUrl: document.getElementById('s-feedback').value.trim() || '/feedback',
        };
        try {
            const res = await fetch('/api/admin/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` },
                body: JSON.stringify(payload)
            });
            const msg = document.getElementById('settings-msg');
            if (res.ok) {
                msg.style.display = 'block';
                msg.style.color = '#27ae60';
                msg.innerText = '✅ Settings saved successfully! Changes will appear on the website within 5 minutes.';
                this._loadSiteUrl();
            } else {
                msg.style.display = 'block';
                msg.style.color = '#e74c3c';
                msg.innerText = '❌ Failed to save settings. Please try again.';
            }
        } catch(e) {
            alert('Error saving settings: ' + e.message);
        }
    },

    renderFeedback: async function(sort = 'newest') {
        try {
            const res = await fetch(`/api/admin/feedback?sort=${sort}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
            });
            if (!res.ok) throw new Error('Failed to fetch feedback');
            const feedbackList = await res.json();

            let rows = feedbackList.map(f => `
                <tr>
                    <td style="white-space:nowrap;">${new Date(f.date).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })}</td>
                    <td><b>${f.name}</b><br><small style="color:#7f8c8d;">${f.email}</small></td>
                    <td><div style="max-height:100px; overflow-y:auto; padding:8px; background:#f9f9f9; border:1px solid #ddd; border-radius:4px; font-style:italic;">"${f.message}"</div></td>
                    <td><button class="action-btn" style="background:#e74c3c;" onclick="admin.deleteFeedback('${f._id}')"><i class="fa-solid fa-trash"></i></button></td>
                </tr>
            `).join('');

            return `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                    <h2>User Feedback <span style="font-size:0.85em; color:#64748b; font-weight:400;">(${feedbackList.length})</span></h2>
                    <div style="display:flex; align-items:center; gap:8px;">
                        <label style="font-size:0.85em; color:#64748b;">Sort:</label>
                        <select onchange="admin.showTab('feedback'); admin._feedbackSort=this.value; admin.renderFeedback(this.value).then(h=>admin.contentDiv.innerHTML=h)" style="padding:6px 10px; border:1px solid #ddd; border-radius:6px; font-size:0.85em;">
                            <option value="newest" ${sort==='newest'?'selected':''}>Newest First</option>
                            <option value="oldest" ${sort==='oldest'?'selected':''}>Oldest First</option>
                        </select>
                    </div>
                </div>
                <table class="admin-table">
                    <thead><tr><th style="width:12%;">Date</th><th style="width:22%;">User</th><th>Message</th><th style="width:60px;">Del</th></tr></thead>
                    <tbody>${rows || '<tr><td colspan="4" style="text-align:center;">No feedback yet.</td></tr>'}</tbody>
                </table>
            `;
        } catch(e) { return `<p style="color:red;">Error loading feedback. Ensure server is running.</p>`; }
    },

    deleteFeedback: async function(id) {
        if (!confirm('Delete this feedback permanently?')) return;
        try {
            const res = await fetch(`/api/admin/feedback/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
            });
            if (!res.ok) throw new Error('Failed to delete');
            this.showTab('feedback');
        } catch(e) { alert('Error deleting feedback: ' + e.message); }
    },

    deleteCountry: async function(id) {
        if(!confirm('Are you sure you want to delete this country?')) return;
        try {
            const res = await fetch(`/api/admin/countries/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` } });
            if (!res.ok) throw new Error('Failed to delete');
            alert('Country deleted successfully!');
            this.showTab('countries');
        } catch(e) { alert('Error deleting country: ' + e.message); }
    },

    deleteCity: async function(id) {
        if(!confirm('Are you sure you want to delete this city?')) return;
        try {
            const res = await fetch(`/api/admin/cities/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` } });
            if (!res.ok) throw new Error('Failed to delete');
            alert('City deleted successfully!');
            this.showTab('cities');
        } catch(e) { alert('Error deleting city: ' + e.message); }
    },

    deleteRetailer: async function(id) {
        if(!confirm('Are you sure you want to delete this retailer?')) return;
        try {
            const res = await fetch(`/api/admin/retailers/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` } });
            if (!res.ok) throw new Error('Failed to delete');
            alert('Retailer deleted successfully!');
            this.showTab('retailers');
        } catch(e) { alert('Error deleting retailer: ' + e.message); }
    },

    deleteOffer: async function(id) {
        if(!confirm('Are you sure you want to delete this offer?')) return;
        try {
            const res = await fetch(`/api/admin/offers/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` } });
            if (!res.ok) throw new Error('Failed to delete');
            alert('Offer deleted successfully!');
            this.showTab('offers');
        } catch(e) { alert('Error deleting offer: ' + e.message); }
    },

    toggleAllExpired: function(checkbox) {
        document.querySelectorAll('.expired-offer-checkbox').forEach(cb => cb.checked = checkbox.checked);
    },

    selectAllExpired: function() {
        document.querySelectorAll('.expired-offer-checkbox').forEach(cb => cb.checked = true);
        document.getElementById('select-all-expired').checked = true;
    },

    deleteSelectedExpired: async function() {
        const checkboxes = document.querySelectorAll('.expired-offer-checkbox:checked');
        if (checkboxes.length === 0) {
            alert('Please select at least one expired offer to delete.');
            return;
        }

        if (!confirm(`Are you sure you want to permanently delete ${checkboxes.length} expired offer(s) and their files?\n\nThis action cannot be undone!`)) {
            return;
        }

        const offerIds = Array.from(checkboxes).map(cb => cb.dataset.offerId);
        let successCount = 0;
        let failCount = 0;

        for (const offerId of offerIds) {
            try {
                const res = await fetch(`/api/admin/offers/${offerId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
                });
                if (res.ok) {
                    successCount++;
                } else {
                    failCount++;
                }
            } catch (e) {
                failCount++;
            }
        }

        alert(`Cleanup complete!\n✅ Deleted: ${successCount}\n❌ Failed: ${failCount}`);
        this.showTab('offers');
    }
};

// Boot Admin Dashboard
document.addEventListener('DOMContentLoaded', () => admin.init());