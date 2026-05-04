const admin = {
    contentDiv: document.getElementById('admin-main'),

    init: function() {
        if (!localStorage.getItem('adminToken')) {
            document.getElementById('login-modal').style.display = 'flex';
            this.contentDiv.innerHTML = '';
            return;
        }
        document.getElementById('login-modal').style.display = 'none';
        
        const role = localStorage.getItem('adminRole');
        if (role !== 'superadmin') {
            document.querySelectorAll('[data-role="superadmin"]').forEach(el => el.style.display = 'none');
            this.showTab('offers');
        } else {
            document.querySelectorAll('[data-role="superadmin"]').forEach(el => el.style.display = '');
            this.showTab('dashboard');
        }
        
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
                localStorage.setItem('adminRole', data.role);
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
        localStorage.removeItem('adminRole');
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
                case 'dashboard':
                case 'stats':
                    html = await this.renderStats(this._statsSince || 0, this._statsFrom, this._statsTo);
                    break;
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
                case 'blogs':
                    html = await this.renderBlogs();
                    break;
                case 'users':
                    html = await this.renderUsers();
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
                    <input type="hidden" id="new-country-image">
                    
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
                    <input type="hidden" id="new-state-image">

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
                    <input type="hidden" id="new-city-image">
                    
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
                
                <div style="background:#f0f9ff; border:1px solid #bae6fd; border-radius:8px; padding:12px; margin-bottom:10px;">
                    <h4 style="margin:0 0 8px; font-size:0.9em; color:#0369a1;"><i class="fa-solid fa-link" style="margin-right:6px;"></i>Affiliate Tracking (Optional)</h4>
                    <label style="font-size: 0.8em; font-weight: bold; display: block; margin-bottom: 4px;">Structure Type:</label>
                    <select id="new-ret-aff-type" style="width:100%; padding:8px; margin-bottom:8px;">
                        <option value="direct">Direct (No Rewriting)</option>
                        <option value="prefix">Prefix (Prepend to URL)</option>
                        <option value="suffix">Suffix (Append as Query Params)</option>
                        <option value="template">Custom Template (Use {URL} placeholder)</option>
                    </select>
                    <input type="text" id="new-ret-aff-val" placeholder="Affiliate Value (e.g. ?tag=id-21 or https://ad.link?url=)" style="width:100%; padding:8px; margin-bottom:5px; box-sizing:border-box;">
                    <p style="font-size:0.7em; color:#64748b; margin:4px 0 0;">Outbound links to this retailer will be rewritten using this structure.</p>
                </div>

                <label style="font-weight: bold; font-size: 0.9em;">Primary City:</label>
                <select id="new-ret-city" style="width:100%; padding:8px; margin-bottom:10px;">${cityOptions}</select>
                <label style="font-weight: bold; font-size: 0.9em;">Additional Cities (Hold Ctrl/Cmd to select multiple, optional):</label>
                <select id="new-ret-cityIds" multiple style="width:100%; height:80px; padding:8px; margin-bottom:10px;">${cityOptions}</select>
                <label style="font-weight: bold; font-size: 0.9em;">Upload Logo/Image (Optional):</label><br>
                <input type="file" id="new-ret-image-file" accept="image/*" style="width:100%; padding:8px; margin-bottom:5px;">
                <input type="hidden" id="new-ret-image">
                
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
        const cityIdsSelect = document.getElementById('new-ret-cityIds');
        const cityIds = Array.from(cityIdsSelect.selectedOptions).map(opt => opt.value);
        const affiliateType = document.getElementById('new-ret-aff-type').value;
        const affiliateValue = document.getElementById('new-ret-aff-val').value;
        let image = document.getElementById('new-ret-image').value;
        const imageFile = document.getElementById('new-ret-image-file').files[0];
        const isEdit = document.getElementById('new-ret-id').readOnly;
        
        if(id && name && cityId) {
            try { 
                if (imageFile) image = await this.uploadFile(imageFile);
                const payload = { name, websiteUrl, cityId, cityIds, image, affiliateType, affiliateValue };
                if (isEdit) {
                    const res = await fetch(`/api/admin/retailers/${id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` },
                        body: JSON.stringify(payload)
                    });
                    if (!res.ok) throw new Error('Failed to update retailer');
                    alert('Retailer updated successfully!');
                } else {
                    await api.addRetailer({ id, name, websiteUrl, cityId, cityIds, image });
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
            document.getElementById('new-ret-aff-type').value = retailer.affiliateType || 'direct';
            document.getElementById('new-ret-aff-val').value = retailer.affiliateValue || '';
            document.getElementById('new-ret-city').value = retailer.cityId;
            const cityIdsSelect = document.getElementById('new-ret-cityIds');
            if (cityIdsSelect) {
                Array.from(cityIdsSelect.options).forEach(opt => {
                    opt.selected = retailer.cityIds && retailer.cityIds.includes(opt.value);
                });
            }
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
        const countries = await api.getCountries();
        const cities = await api.getAllCities();
        
        // Build lookup maps
        const retMap = {};
        retailers.forEach(r => { retMap[r.id] = r; });
        const cityMap = {};
        cities.forEach(c => { cityMap[c.id] = c; });

        // Store for cascading use
        window._offerFormData = { countries, cities, retailers };

        // Separate active, archived, and expired offers
        const now = new Date();
        const activeOffers = offers.filter(o => new Date(o.validUntil) >= now && !o.archived);
        const archivedOffers = offers.filter(o => o.archived);
        const expiredOffers = offers.filter(o => new Date(o.validUntil) < now && !o.archived);
        
        let rows = activeOffers.map(o => {
            const ret = retMap[o.retailerId];
            const retName = ret ? ret.name : o.retailerId.toUpperCase();
            return `<tr><td>${o.title}</td><td>${retName}</td><td>${o.maxPagesViewed || 0}</td><td>${o.validFrom ? new Date(o.validFrom).toLocaleDateString('en-GB', {day:'2-digit', month:'short', year:'numeric'}) : ''} to ${o.validUntil ? new Date(o.validUntil).toLocaleDateString('en-GB', {day:'2-digit', month:'short', year:'numeric'}) : ''}</td><td><button class="action-btn" onclick="admin.editOffer('${o.id || o._id}')">Edit</button> <button class="action-btn" style="background:#7c3aed;" onclick="admin.archiveOffer('${o.id || o._id}')">Archive</button> <button class="action-btn" style="background:#e74c3c;" onclick="admin.deleteOffer('${o.id || o._id}')">Delete</button></td></tr>`;
        }).join('');
        let countryOptions = countries.map(c => `<option value="${c.id}">${c.name}</option>`).join('');

        let expiredSection = '';
        if (expiredOffers.length > 0) {
            let expiredRows = expiredOffers.map(o => `
                <tr style="background:#fff7ed;">
                    <td><input type="checkbox" class="expired-offer-checkbox" data-offer-id="${o.id || o._id}" data-pdf="${o.pdfUrl || ''}" data-image="${o.image || ''}"></td>
                    <td>${o.title}</td>
                    <td>${o.retailerId.toUpperCase()}</td>
                    <td>${o.maxPagesViewed || 0}</td>
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
                                <th>Max Pages Viewed</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>${expiredRows}</tbody>
                    </table>
                </div>
            `;
        }

        let archivedSection = '';
        if (archivedOffers.length > 0) {
            let archivedRows = archivedOffers.map(o => `
                <tr style="background:#f5f3ff;">
                    <td>${o.title}</td>
                    <td>${(retMap[o.retailerId] || {}).name || o.retailerId.toUpperCase()}</td>
                    <td>${o.validUntil ? new Date(o.validUntil).toLocaleDateString('en-GB', {day:'2-digit', month:'short', year:'numeric'}) : ''}</td>
                    <td>
                        <button class="action-btn" style="background:#16a34a;" onclick="admin.unarchiveOffer('${o.id || o._id}')">Restore</button>
                        <button class="action-btn" style="background:#e74c3c;" onclick="admin.deleteOffer('${o.id || o._id}')">Delete</button>
                    </td>
                </tr>
            `).join('');
            archivedSection = `
                <div style="margin-top:30px; padding:20px; background:#f5f3ff; border:2px solid #7c3aed; border-radius:8px;">
                    <h3 style="color:#7c3aed; margin:0 0 15px;"><i class="fa-solid fa-box-archive"></i> Archived Offers (${archivedOffers.length})</h3>
                    <table class="admin-table">
                        <thead><tr><th>Title</th><th>Retailer</th><th>Valid Until</th><th>Actions</th></tr></thead>
                        <tbody>${archivedRows}</tbody>
                    </table>
                </div>
            `;
        }

        return `
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <h2>Flyers</h2>
                <button class="action-btn" style="background:#27ae60;" onclick="admin.showAddOfferForm()">+ Add New Offer</button>
            </div>
            
            <div id="upload-form" style="display:none; background:#f9f9f9; padding:20px; border-radius:8px; margin-top:15px; border:1px solid #ddd;">
                <h3>Add New Offer</h3>
                <div style="margin-top:10px;">
                    <input type="hidden" id="new-off-id">
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

                    <label style="font-weight: bold; font-size: 0.9em;">Select Country:</label>
                    <select id="new-off-country" style="width:100%; padding:8px; margin-bottom:10px;" onchange="admin.loadOfferCities(this.value)">
                        <option value="">— Select Country —</option>
                        ${countryOptions}
                    </select>

                    <label style="font-weight: bold; font-size: 0.9em;">Select City / State:</label>
                    <select id="new-off-city" style="width:100%; padding:8px; margin-bottom:10px;" onchange="admin.loadOfferRetailers(this.value)" disabled>
                        <option value="">— Select country first —</option>
                    </select>

                    <label style="font-weight: bold; font-size: 0.9em;">Select Retailer:</label>
                    <select id="new-off-retailer" style="width:100%; padding:8px; margin-bottom:10px;" disabled>
                        <option value="">— Select city first —</option>
                    </select>
                    
                    <label style="font-weight: bold; font-size: 0.9em;">Upload PDF Flyer (Optional):</label>
                    <input type="file" id="new-off-pdf-file" accept="application/pdf" style="width:100%; padding:8px; margin-bottom:5px;">
                    <input type="hidden" id="new-off-pdf">
                    
                    <label style="font-weight: bold; font-size: 0.9em;">Target Retailer Website URL (Optional):</label>
                    <input type="url" id="new-off-retailer-url" placeholder="https://example.com/promo" style="width:100%; padding:8px; margin-bottom:10px;">

                    <label style="font-weight: bold; font-size: 0.9em; color:#0369a1;"><i class="fa-solid fa-link" style="margin-right:6px;"></i>Direct Affiliate Link (Optional Override):</label>
                    <input type="url" id="new-off-aff-override" placeholder="https://ad.link/custom-for-this-offer" style="width:100%; padding:8px; margin-bottom:15px;">

                    <label style="font-weight: bold; font-size: 0.9em;">Upload Cover Image (Optional):</label>
                    <input type="file" id="new-off-image-file" accept="image/*" style="width:100%; padding:8px; margin-bottom:5px;">
                    <input type="hidden" id="new-off-image">
                    
                    
                    <input type="text" id="new-off-badge" placeholder="Badge (e.g. 50% OFF)" style="width:100%; padding:8px; margin-bottom:10px;">
                    <input type="text" id="new-off-coupon" placeholder="Coupon Code (optional)" style="width:100%; padding:8px; margin-bottom:15px;">

                    <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:8px; padding:14px; margin-bottom:15px;">
                        <h4 style="margin:0 0 10px; font-size:0.9em; color:#166534;"><i class="fa-solid fa-magnifying-glass" style="margin-right:6px;"></i>SEO Settings (Optional)</h4>
                        <input type="text" id="new-off-meta-title" placeholder="Custom SEO Title (defaults to Offer Title)" style="width:100%; padding:8px; margin-bottom:8px; box-sizing:border-box;">
                        <textarea id="new-off-meta-desc" placeholder="Custom SEO Description (defaults to auto-generated)" rows="2" style="width:100%; padding:8px; box-sizing:border-box; resize:none;"></textarea>
                        <p style="font-size:0.75em; color:#64748b; margin:4px 0 0;"><i class="fa-solid fa-circle-question" style="margin-right:4px;"></i>Override the page title and description shown in Google search results. Leave blank to use defaults.</p>
                    </div>

                    <button class="action-btn" id="save-offer-btn" onclick="admin.saveOffer()">Save Offer</button>
                    <button class="action-btn" style="background:#e74c3c; margin-left:10px;" onclick="document.getElementById('upload-form').style.display='none'">Cancel</button>
                </div>
            </div>
            
            <h3 style="margin-top:30px;">Active Offers (${activeOffers.length})</h3>
            <table class="admin-table" style="margin-top:10px;"><thead><tr><th>Title</th><th>Retailer</th><th>Max Pages Viewed</th><th>Validity</th><th>Actions</th></tr></thead><tbody>${rows || '<tr><td colspan="5" style="text-align:center; color:#94a3b8;">No active offers</td></tr>'}</tbody></table>
            
            ${archivedSection}
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
        document.getElementById('new-off-id').value = '';
        document.getElementById('new-off-title').value = '';
        document.getElementById('new-off-valid-from').value = '';
        document.getElementById('new-off-valid-until').value = '';
        document.getElementById('new-off-badge').value = '';
        document.getElementById('new-off-pdf').value = '';
        document.getElementById('new-off-retailer-url').value = '';
        document.getElementById('new-off-image').value = '';
        
        // Reset cascading dropdowns
        const countryEl = document.getElementById('new-off-country');
        const cityEl = document.getElementById('new-off-city');
        const retEl = document.getElementById('new-off-retailer');
        if (countryEl) countryEl.value = '';
        if (cityEl) { cityEl.innerHTML = '<option value="">— Select country first —</option>'; cityEl.disabled = true; }
        if (retEl) { retEl.innerHTML = '<option value="">— Select city first —</option>'; retEl.disabled = true; }

        const btn = document.getElementById('save-offer-btn');
        if(btn) {
            btn.removeAttribute('data-edit-id');
            btn.innerText = 'Save Offer';
        }
        document.querySelector('#upload-form h3').innerText = 'Add New Offer';
    },

    loadOfferCities: function(countryId) {
        const cityEl = document.getElementById('new-off-city');
        const retEl = document.getElementById('new-off-retailer');
        retEl.innerHTML = '<option value="">— Select city first —</option>';
        retEl.disabled = true;
        if (!countryId || !window._offerFormData) {
            cityEl.innerHTML = '<option value="">— Select country first —</option>';
            cityEl.disabled = true;
            return;
        }
        const filtered = window._offerFormData.cities.filter(c => c.countryId === countryId);
        cityEl.innerHTML = '<option value="">— Select City —</option>' + filtered.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
        cityEl.disabled = false;
    },

    loadOfferRetailers: function(cityId) {
        const retEl = document.getElementById('new-off-retailer');
        if (!cityId || !window._offerFormData) {
            retEl.innerHTML = '<option value="">— Select city first —</option>';
            retEl.disabled = true;
            return;
        }
        const filtered = window._offerFormData.retailers.filter(r => r.cityId === cityId);
        retEl.innerHTML = '<option value="">— Select Retailer —</option>' + filtered.map(r => `<option value="${r.id}">${r.name}</option>`).join('');
        retEl.disabled = false;
    },

    archiveOffer: async function(id) {
        if (!confirm('Archive this offer? It will be hidden from the active list.')) return;
        try {
            await fetch(`/api/admin/offers/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` },
                body: JSON.stringify({ archived: true })
            });
            this.showTab('offers');
        } catch(e) { alert('Error archiving offer.'); }
    },

    unarchiveOffer: async function(id) {
        try {
            await fetch(`/api/admin/offers/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` },
                body: JSON.stringify({ archived: false })
            });
            this.showTab('offers');
        } catch(e) { alert('Error restoring offer.'); }
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
            document.getElementById('new-off-retailer-url').value = offer.retailerUrl || '';
            document.getElementById('new-off-aff-override').value = offer.affiliateOverrideUrl || '';
            document.getElementById('new-off-image').value = offer.image || '';

            const saveBtn = document.getElementById('save-offer-btn');
            saveBtn.innerText = 'Update Offer';
            saveBtn.setAttribute('data-edit-id', offer.id || offer._id);
            document.querySelector('#upload-form h3').innerText = 'Edit Offer';
            window.scrollTo(0, 0);
        } catch(e) { alert('Error loading offer details.'); }
    },

    saveOffer: async function() {
        const title = document.getElementById('new-off-title').value;
        const validFrom = document.getElementById('new-off-valid-from').value;
        const validUntil = document.getElementById('new-off-valid-until').value;
        const retailerId = document.getElementById('new-off-retailer').value;
        const badge = document.getElementById('new-off-badge').value;
        const btn = document.getElementById('save-offer-btn');
        const editId = btn.getAttribute('data-edit-id');
        
        // Auto-generate ID for new offers: retailerId-YYYYMMDD-random
        let id = document.getElementById('new-off-id').value;
        if (!id && !editId) {
            const dateStr = new Date().toISOString().slice(0,10).replace(/-/g,'');
            const rand = Math.random().toString(36).substring(2, 6);
            id = `${retailerId}-${dateStr}-${rand}`.toLowerCase();
        }

        let pdfUrl = document.getElementById('new-off-pdf').value || '#';
        let retailerUrl = document.getElementById('new-off-retailer-url').value || '';
        let image = document.getElementById('new-off-image').value;

        const pdfFile = document.getElementById('new-off-pdf-file').files[0];
        const imageFile = document.getElementById('new-off-image-file').files[0];

        btn.innerText = editId ? 'Updating...' : 'Uploading...';
        btn.disabled = true;

        try {
            if (pdfFile) pdfUrl = await this.uploadFile(pdfFile);
            if (imageFile) image = await this.uploadFile(imageFile);
            
            const couponCode = document.getElementById('new-off-coupon')?.value || '';
            const metaTitle = document.getElementById('new-off-meta-title')?.value || '';
            const metaDescription = document.getElementById('new-off-meta-desc')?.value || '';

            const affiliateOverrideUrl = document.getElementById('new-off-aff-override')?.value || '';

            if(id && title && validFrom && validUntil && retailerId) {
                const payload = { id, title, validFrom, validUntil, retailerId, pdfUrl, retailerUrl, image, badge, couponCode, metaTitle, metaDescription, affiliateOverrideUrl };
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
    _statsFrom: null,
    _statsTo: null,

    loadStats: async function(since, from, to) {
        this._statsSince = since !== undefined ? since : 0;
        this._statsFrom = from || null;
        this._statsTo = to || null;
        this.contentDiv.innerHTML = '<p style="padding:20px;">Loading stats...</p>';
        this.contentDiv.innerHTML = await this.renderStats(this._statsSince, this._statsFrom, this._statsTo);
    },

    applyCustomStats: function() {
        const from = document.getElementById('stats-from').value;
        const to = document.getElementById('stats-to').value;
        if (!from || !to) { alert('Please select both a start and end date.'); return; }
        if (from > to) { alert('Start date must be before end date.'); return; }
        this.loadStats(null, from, to);
    },

    renderStats: async function(since = 0, from = null, to = null) {
        try {
            const stats = await api.getStats(since, from, to);
            window._lastStatsData = stats;
            
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
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <h2>Marketing Analytics Dashboard</h2>
                    <div style="display:flex; gap:8px;">
                        <button onclick="admin.exportOffersCSV()" class="action-btn" style="background:#2563eb;"><i class="fa-solid fa-table"></i> Export Offers</button>
                        <button onclick="admin.exportMetricsCSV()" class="action-btn" style="background:#27ae60;"><i class="fa-solid fa-file-csv"></i> Export Metrics</button>
                    </div>
                </div>
                <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:8px; padding:14px 18px; margin-bottom:20px; font-size:0.85rem; color:#1e40af;">
                    <i class="fa-solid fa-circle-info" style="margin-right:6px;"></i>
                    <strong>How to access your data:</strong> Use the <strong>Export</strong> buttons above to download your offers and analytics as CSV files (open in Excel/Google Sheets).
                    For detailed visitor demographics and traffic sources, check your <strong>Google Analytics</strong> dashboard (configure your GA ID in Site Settings).
                </div>

                <!-- Date Range Toggle -->
                <div style="display:flex; flex-wrap:wrap; gap:8px; margin-bottom:24px; align-items:center;">
                    ${[{label:'Last 7 days',val:7},{label:'Last 30 days',val:30},{label:'All time',val:0}].map(opt => {
                        const isActive = !from && since === opt.val;
                        return `<button onclick="admin.loadStats(${opt.val})"
                            style="padding:8px 16px; border-radius:8px; font-size:0.8rem; font-weight:700; cursor:pointer; border:2px solid ${isActive ? 'var(--red)' : 'var(--border)'}; background:${isActive ? 'var(--red)' : 'white'}; color:${isActive ? 'white' : 'var(--text-secondary)'}; transition:all .15s;">
                            ${opt.label}
                        </button>`;
                    }).join('')}
                    <button onclick="document.getElementById('custom-range-picker').style.display = document.getElementById('custom-range-picker').style.display === 'none' ? 'flex' : 'none'"
                        style="padding:8px 16px; border-radius:8px; font-size:0.8rem; font-weight:700; cursor:pointer; border:2px solid ${from ? 'var(--red)' : 'var(--border)'}; background:${from ? 'var(--red)' : 'white'}; color:${from ? 'white' : 'var(--text-secondary)'}; transition:all .15s;">
                        <i class="fa-solid fa-calendar-days"></i> ${from ? `${from} → ${to}` : 'Custom'}
                    </button>
                    <div id="custom-range-picker" style="display:${from ? 'flex' : 'none'}; align-items:center; gap:8px; flex-wrap:wrap;">
                        <input type="date" id="stats-from" value="${from || ''}" style="padding:7px 10px; border:1.5px solid var(--border); border-radius:8px; font-size:0.8rem; font-family:inherit;">
                        <span style="color:var(--text-muted); font-size:0.8rem;">to</span>
                        <input type="date" id="stats-to" value="${to || ''}" style="padding:7px 10px; border:1.5px solid var(--border); border-radius:8px; font-size:0.8rem; font-family:inherit;">
                        <button onclick="admin.applyCustomStats()" style="padding:7px 14px; border-radius:8px; font-size:0.8rem; font-weight:700; cursor:pointer; border:none; background:var(--green); color:white;">Apply</button>
                    </div>
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

            <div style="background:#f9f9f9; padding:24px; border-radius:8px; border:1px solid #ddd; max-width:800px;">

                <h3 style="margin-bottom:16px;"><i class="fa-solid fa-globe" style="color:#2563eb;"></i> General Settings</h3>
                <label style="font-size:0.85em; font-weight:bold;">Production Site URL</label>
                <input type="url" id="s-site-url" value="${s.siteUrl || ''}" placeholder="https://your-frontend.up.railway.app" style="width:100%; padding:8px; margin:6px 0 4px; box-sizing:border-box;">
                <p style="font-size:0.75em; color:#64748b; margin:0 0 12px;"><i class="fa-solid fa-circle-question" style="margin-right:4px;"></i>Your live website address. Used for generating sitemaps, canonical SEO links, and share URLs (e.g. WhatsApp share links).</p>
                
                <label style="font-size:0.85em; font-weight:bold;">Custom Logo URL (Optional)</label>
                <input type="url" id="s-custom-logo" value="${s.customLogoUrl || ''}" placeholder="https://example.com/logo.png" style="width:100%; padding:8px; margin:6px 0 12px; box-sizing:border-box;">
                
                <label style="font-size:0.85em; font-weight:bold;">Favicon URL (Optional - Icon on browser tab)</label>
                <input type="url" id="s-favicon-url" value="${s.faviconUrl || ''}" placeholder="https://example.com/favicon.ico" style="width:100%; padding:8px; margin:6px 0 12px; box-sizing:border-box;">

                <label style="font-size:0.85em; font-weight:bold;">Custom Home Page Message (Optional)</label>
                <input type="text" id="s-home-message" value="${s.homeMessage || ''}" placeholder="e.g. Welcome to DealNamaa! Discover best offers." style="width:100%; padding:8px; margin:6px 0 12px; box-sizing:border-box;">

                <label style="display:flex; align-items:center; gap:8px; font-weight:bold; margin-bottom: 20px;">
                    <input type="checkbox" id="s-show-stats" ${s.showStats ? 'checked' : ''}> Show Visitors & Deals Saved Stats on Main Website
                </label>

                <h3 style="margin-bottom:16px;"><i class="fa-brands fa-google" style="color:#4285F4;"></i> Google Analytics & AdSense</h3>
                <label style="font-size:0.85em; font-weight:bold;">Google Analytics Measurement ID</label>
                <input type="text" id="s-ga-id" value="${s.gaId || ''}" placeholder="e.g. G-XXXXXXXXXX" style="width:100%; padding:8px; margin:6px 0 12px; box-sizing:border-box;">

                <label style="font-size:0.85em; font-weight:bold;">Google AdSense Client ID (Auto Ads)</label>
                <input type="text" id="s-adsense-id" value="${s.adSenseId || ''}" placeholder="e.g. ca-pub-1234567890123456" style="width:100%; padding:8px; margin:6px 0 20px; box-sizing:border-box;">

                <h3 style="margin-bottom:16px;"><i class="fa-solid fa-share-nodes" style="color:#e74c3c;"></i> Social Media Links</h3>
                <label style="font-size:0.85em; font-weight:bold;">Facebook Page URL</label>
                <input type="url" id="s-facebook" value="${s.facebookUrl || ''}" placeholder="https://facebook.com/yourpage" style="width:100%; padding:8px; margin:6px 0 12px; box-sizing:border-box;">
                <label style="font-size:0.85em; font-weight:bold;">Twitter / X Profile URL</label>
                <input type="url" id="s-twitter" value="${s.twitterUrl || ''}" placeholder="https://twitter.com/yourhandle" style="width:100%; padding:8px; margin:6px 0 12px; box-sizing:border-box;">
                <label style="font-size:0.85em; font-weight:bold;">Instagram Profile URL</label>
                <input type="url" id="s-instagram" value="${s.instagramUrl || ''}" placeholder="https://instagram.com/yourhandle" style="width:100%; padding:8px; margin:6px 0 20px; box-sizing:border-box;">

                <h3 style="margin-bottom:16px;"><i class="fa-solid fa-address-book" style="color:#27ae60;"></i> Contact Info</h3>
                <label style="font-size:0.85em; font-weight:bold;">Contact Email</label>
                <input type="email" id="s-contact-email" value="${s.contactEmail || ''}" placeholder="hello@dealnamaa.com" style="width:100%; padding:8px; margin:6px 0 12px; box-sizing:border-box;">
                <label style="font-size:0.85em; font-weight:bold;">Contact Phone</label>
                <input type="text" id="s-contact-phone" value="${s.contactPhone || ''}" placeholder="+971 4 123 4567" style="width:100%; padding:8px; margin:6px 0 12px; box-sizing:border-box;">
                <label style="font-size:0.85em; font-weight:bold;">Contact Address</label>
                <textarea id="s-contact-address" rows="2" style="width:100%; padding:8px; margin:6px 0 20px; box-sizing:border-box;">${s.contactAddress || ''}</textarea>

                <h3 style="margin-bottom:16px;"><i class="fa-solid fa-file-lines" style="color:#8e44ad;"></i> Dynamic Pages (HTML Supported)</h3>
                <label style="font-size:0.85em; font-weight:bold;">About Us</label>
                <textarea id="s-about-us" rows="4" style="width:100%; padding:8px; margin:6px 0 12px; box-sizing:border-box;">${s.aboutUs || ''}</textarea>
                <label style="font-size:0.85em; font-weight:bold;">Privacy Policy</label>
                <textarea id="s-privacy-policy" rows="4" style="width:100%; padding:8px; margin:6px 0 12px; box-sizing:border-box;">${s.privacyPolicy || ''}</textarea>
                <label style="font-size:0.85em; font-weight:bold;">Terms of Service</label>
                <textarea id="s-terms-service" rows="4" style="width:100%; padding:8px; margin:6px 0 20px; box-sizing:border-box;">${s.termsOfService || ''}</textarea>

                <h3 style="margin-bottom:16px;"><i class="fa-solid fa-comment" style="color:#27ae60;"></i> Feedback Page</h3>
                <label style="font-size:0.85em; font-weight:bold;">Feedback Page URL</label>
                <input type="text" id="s-feedback" value="${s.feedbackUrl || '/feedback'}" placeholder="/feedback or https://forms.google.com/..."
                    style="width:100%; padding:8px; margin:6px 0 4px; box-sizing:border-box;">
                <p style="font-size:0.75em; color:#64748b; margin:0 0 12px;"><i class="fa-solid fa-circle-question" style="margin-right:4px;"></i>Where the "Leave Feedback" button links to. Default is <code>/feedback</code> (built-in form). You can also use an external form URL like Google Forms.</p>

                <button class="action-btn" style="background:#27ae60; width:100%; padding:12px; font-size:1em; margin-top:20px;" onclick="admin.saveSettings()">Save Settings</button>
                <p id="settings-msg" style="display:none; margin-top:12px; text-align:center; font-weight:bold;"></p>
            </div>
        `;
    },

    saveSettings: async function() {
        const payload = {
            siteUrl: document.getElementById('s-site-url').value.trim(),
            customLogoUrl: document.getElementById('s-custom-logo').value.trim(),
            faviconUrl: document.getElementById('s-favicon-url').value.trim(),
            homeMessage: document.getElementById('s-home-message').value.trim(),
            showStats: document.getElementById('s-show-stats').checked,
            gaId: document.getElementById('s-ga-id').value.trim(),
            facebookUrl: document.getElementById('s-facebook').value.trim(),
            twitterUrl: document.getElementById('s-twitter').value.trim(),
            instagramUrl: document.getElementById('s-instagram').value.trim(),
            contactEmail: document.getElementById('s-contact-email').value.trim(),
            contactPhone: document.getElementById('s-contact-phone').value.trim(),
            contactAddress: document.getElementById('s-contact-address').value.trim(),
            aboutUs: document.getElementById('s-about-us').value.trim(),
            privacyPolicy: document.getElementById('s-privacy-policy').value.trim(),
            termsOfService: document.getElementById('s-terms-service').value.trim(),
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

            window._lastFeedbackData = feedbackList;

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
                        <button onclick="admin.exportFeedbackCSV()" class="action-btn" style="background:#27ae60;"><i class="fa-solid fa-file-csv"></i> Export CSV</button>
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
        if(!confirm('Are you sure you want to delete this offer permanently?')) return;
        try {
            const res = await fetch(`/api/admin/offers/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` } });
            if (!res.ok) throw new Error('Failed to delete offer');
            alert('Offer deleted');
            this.showTab('offers');
        } catch(e) { alert('Error: ' + e.message); }
    },

    // ==========================================
    // BLOGS
    // ==========================================

    renderBlogs: async function() {
        const blogs = await api.getAllBlogs();
        
        let rows = blogs.map(b => `
            <tr>
                <td>${b.slug}</td>
                <td>${b.title}</td>
                <td><span class="badge ${b.status === 'published' ? 'badge-green' : 'badge-gray'}">${b.status}</span></td>
                <td>${b.views}</td>
                <td>
                    <button class="action-btn" onclick="admin.editBlog('${b.slug}')">Edit</button>
                    <button class="action-btn" style="background:#e74c3c;" onclick="admin.deleteBlog('${b.slug}')">Delete</button>
                </td>
            </tr>
        `).join('');

        return `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 20px;">
                <h2>Blog Posts</h2>
                <button class="action-btn" style="background:#27ae60;" onclick="admin.showAddBlogForm()">+ Add Blog Post</button>
            </div>
            
            <div id="add-blog-form" class="form-card" style="display:none;">
                <h3 id="blog-form-title"><i class="fa-solid fa-pen-nib"></i> Add New Blog Post</h3>
                <input type="hidden" id="edit-blog-id">
                
                <label style="font-weight: bold; font-size: 0.9em;">Slug (URL identifier, e.g. 'top-10-deals'):</label>
                <input type="text" id="new-blog-slug" style="width:100%; padding:8px; margin-bottom:10px;">
                
                <label style="font-weight: bold; font-size: 0.9em;">Title:</label>
                <input type="text" id="new-blog-title" style="width:100%; padding:8px; margin-bottom:10px;">
                
                <label style="font-weight: bold; font-size: 0.9em;">Excerpt:</label>
                <textarea id="new-blog-excerpt" rows="2" style="width:100%; padding:8px; margin-bottom:10px;"></textarea>
                
                <label style="font-weight: bold; font-size: 0.9em;">Content (HTML supported):</label>
                <textarea id="new-blog-content" rows="10" style="width:100%; padding:8px; margin-bottom:10px; font-family:monospace;"></textarea>
                
                <label style="font-weight: bold; font-size: 0.9em;">Featured Image:</label>
                <input type="file" id="new-blog-image-file" accept="image/*" style="width:100%; padding:8px; margin-bottom:5px;">
                <input type="hidden" id="new-blog-image">
                
                <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:8px; padding:14px; margin:bottom:15px; margin-top:10px;">
                    <h4 style="margin:0 0 10px; font-size:0.9em; color:#166534;"><i class="fa-solid fa-magnifying-glass" style="margin-right:6px;"></i>SEO Settings</h4>
                    <input type="text" id="new-blog-meta-title" placeholder="Meta Title" style="width:100%; padding:8px; margin-bottom:8px;">
                    <textarea id="new-blog-meta-desc" placeholder="Meta Description" rows="2" style="width:100%; padding:8px;"></textarea>
                </div>
                
                <label style="font-weight: bold; font-size: 0.9em; margin-top:15px; display:block;">Status:</label>
                <select id="new-blog-status" style="width:100%; padding:8px; margin-bottom:15px;">
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                </select>

                <div style="margin-top: 15px;">
                    <button class="action-btn" id="save-blog-btn" onclick="admin.saveBlog()">Save Post</button>
                    <button class="action-btn" style="background:#e74c3c; margin-left:10px;" onclick="document.getElementById('add-blog-form').style.display='none'">Cancel</button>
                </div>
            </div>
            
            <table class="admin-table" style="margin-top:10px;">
                <thead><tr><th>Slug</th><th>Title</th><th>Status</th><th>Views</th><th>Actions</th></tr></thead>
                <tbody>${rows || '<tr><td colspan="5" style="text-align:center; color:#94a3b8;">No blog posts found</td></tr>'}</tbody>
            </table>
        `;
    },

    showAddBlogForm: function() {
        document.getElementById('add-blog-form').style.display = 'block';
        document.getElementById('blog-form-title').innerHTML = '<i class="fa-solid fa-pen-nib"></i> Add New Blog Post';
        document.getElementById('edit-blog-id').value = '';
        document.getElementById('new-blog-slug').value = '';
        document.getElementById('new-blog-slug').readOnly = false;
        document.getElementById('new-blog-title').value = '';
        document.getElementById('new-blog-excerpt').value = '';
        document.getElementById('new-blog-content').value = '';
        document.getElementById('new-blog-image').value = '';
        document.getElementById('new-blog-image-file').value = '';
        document.getElementById('new-blog-meta-title').value = '';
        document.getElementById('new-blog-meta-desc').value = '';
        document.getElementById('new-blog-status').value = 'published';
    },

    saveBlog: async function() {
        const slug = document.getElementById('new-blog-slug').value.toLowerCase().trim();
        const title = document.getElementById('new-blog-title').value;
        const excerpt = document.getElementById('new-blog-excerpt').value;
        const content = document.getElementById('new-blog-content').value;
        const metaTitle = document.getElementById('new-blog-meta-title').value;
        const metaDescription = document.getElementById('new-blog-meta-desc').value;
        const status = document.getElementById('new-blog-status').value;
        let image = document.getElementById('new-blog-image').value;
        const imageFile = document.getElementById('new-blog-image-file').files[0];
        
        const editId = document.getElementById('edit-blog-id').value;

        if(!slug || !title || !excerpt || !content) {
            alert('Please fill out all required fields (Slug, Title, Excerpt, Content).');
            return;
        }

        const btn = document.getElementById('save-blog-btn');
        btn.innerText = 'Saving...';
        btn.disabled = true;

        try {
            if (imageFile) image = await this.uploadFile(imageFile);
            if (!image) {
                alert('Please upload a featured image.');
                btn.innerText = 'Save Post';
                btn.disabled = false;
                return;
            }

            const payload = { slug, title, excerpt, content, image, metaTitle, metaDescription, status };
            let res;
            
            if (editId) {
                res = await fetch(`/api/admin/blogs/${editId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` },
                    body: JSON.stringify(payload)
                });
            } else {
                res = await fetch('/api/admin/blogs', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` },
                    body: JSON.stringify(payload)
                });
            }

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || 'Failed to save blog');
            }

            alert('Blog saved successfully!');
            this.showTab('blogs');
        } catch(e) {
            alert('Error: ' + e.message);
            btn.innerText = 'Save Post';
            btn.disabled = false;
        }
    },

    editBlog: async function(slugToEdit) {
        try {
            const blogs = await api.getAllBlogs();
            const blog = blogs.find(b => b.slug === slugToEdit);
            if (!blog) throw new Error('Blog not found');

            this.showAddBlogForm();
            document.getElementById('blog-form-title').innerHTML = '<i class="fa-solid fa-pen-nib"></i> Edit Blog Post';
            document.getElementById('edit-blog-id').value = blog.slug;
            document.getElementById('new-blog-slug').value = blog.slug;
            document.getElementById('new-blog-slug').readOnly = true;
            document.getElementById('new-blog-title').value = blog.title;
            document.getElementById('new-blog-excerpt').value = blog.excerpt;
            document.getElementById('new-blog-content').value = blog.content;
            document.getElementById('new-blog-image').value = blog.image || '';
            document.getElementById('new-blog-meta-title').value = blog.metaTitle || '';
            document.getElementById('new-blog-meta-desc').value = blog.metaDescription || '';
            document.getElementById('new-blog-status').value = blog.status || 'published';
            
            window.scrollTo(0, 0);
        } catch(e) {
            alert('Error loading blog: ' + e.message);
        }
    },

    deleteBlog: async function(slug) {
        if(!confirm('Are you sure you want to delete this blog post permanently?')) return;
        try {
            const res = await fetch(`/api/admin/blogs/${slug}`, { 
                method: 'DELETE', 
                headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` } 
            });
            if (!res.ok) throw new Error('Failed to delete blog');
            alert('Blog deleted');
            this.showTab('blogs');
        } catch(e) { 
            alert('Error: ' + e.message); 
        }
    },

    // ==========================================
    // USERS (Admin & Superadmin)
    // ==========================================
    
    renderUsers: async function() {
        try {
            const res = await fetch('/api/admin/users', { headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` } });
            if (!res.ok) throw new Error('Failed to fetch users');
            const users = await res.json();
            
            let rows = users.map(u => `
                <tr>
                    <td>${u.username}</td>
                    <td><span class="badge ${u.role === 'superadmin' ? 'badge-red' : 'badge-gray'}">${u.role}</span></td>
                    <td>${new Date(u.createdAt).toLocaleDateString()}</td>
                    <td>
                        <button class="action-btn" style="background:#e74c3c;" onclick="admin.deleteUser('${u._id}')">Delete</button>
                    </td>
                </tr>
            `).join('');

            return `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 20px;">
                    <h2>Admin Users</h2>
                    <button class="action-btn" style="background:#27ae60;" onclick="admin.showAddUserForm()">+ Add User</button>
                </div>
                
                <div id="add-user-form" class="form-card" style="display:none;">
                    <h3><i class="fa-solid fa-user-plus"></i> Add New Admin</h3>
                    
                    <label style="font-weight: bold; font-size: 0.9em;">Username:</label>
                    <input type="text" id="new-user-username" style="width:100%; padding:8px; margin-bottom:10px;" placeholder="admin2">
                    
                    <label style="font-weight: bold; font-size: 0.9em;">Password:</label>
                    <input type="password" id="new-user-password" style="width:100%; padding:8px; margin-bottom:10px;" placeholder="Min 6 characters">
                    
                    <label style="font-weight: bold; font-size: 0.9em;">Role:</label>
                    <select id="new-user-role" style="width:100%; padding:8px; margin-bottom:15px;">
                        <option value="admin">Admin (Flyers Only)</option>
                        <option value="superadmin">Super Admin (Full Access)</option>
                    </select>

                    <div style="margin-top: 15px;">
                        <button class="action-btn" onclick="admin.saveUser()">Create User</button>
                        <button class="action-btn" style="background:#e74c3c; margin-left:10px;" onclick="document.getElementById('add-user-form').style.display='none'">Cancel</button>
                    </div>
                </div>
                
                <table class="admin-table" style="margin-top:10px;">
                    <thead><tr><th>Username</th><th>Role</th><th>Created</th><th>Actions</th></tr></thead>
                    <tbody>${rows || '<tr><td colspan="4" style="text-align:center; color:#94a3b8;">No users found</td></tr>'}</tbody>
                </table>
            `;
        } catch (e) {
            return `<p style="color:red">Error loading users: ${e.message}</p>`;
        }
    },

    showAddUserForm: function() {
        document.getElementById('add-user-form').style.display = 'block';
        document.getElementById('new-user-username').value = '';
        document.getElementById('new-user-password').value = '';
        document.getElementById('new-user-role').value = 'admin';
    },

    saveUser: async function() {
        const username = document.getElementById('new-user-username').value.trim();
        const password = document.getElementById('new-user-password').value;
        const role = document.getElementById('new-user-role').value;

        if(!username || !password) {
            alert('Username and password are required.');
            return;
        }

        try {
            const res = await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` },
                body: JSON.stringify({ username, password, role })
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || 'Failed to create user');
            }

            alert('User created successfully!');
            this.showTab('users');
        } catch(e) {
            alert('Error: ' + e.message);
        }
    },

    deleteUser: async function(id) {
        if(!confirm('Are you sure you want to delete this user?')) return;
        try {
            const res = await fetch(`/api/admin/users/${id}`, { 
                method: 'DELETE', 
                headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` } 
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || 'Failed to delete user');
            }
            alert('User deleted');
            this.showTab('users');
        } catch(e) { 
            alert('Error: ' + e.message); 
        }
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
    },

    resetOfferMetrics: async function(id) {
        if (!confirm('Reset all metrics (clicks, likes, dislikes, ratings, saves, time, pages) for this offer? This is for testing purposes only.')) return;
        try {
            const res = await fetch(`/api/admin/offers/${id}/reset-metrics`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
            });
            if (!res.ok) throw new Error('Failed to reset metrics');
            alert('Metrics reset successfully! Refresh the page to see updated values.');
            this.showTab('offers');
        } catch(e) { alert('Error resetting metrics: ' + e.message); }
    },

    exportMetricsCSV: function() {
        if (!window._lastStatsData) {
            alert('No stats data available to export.');
            return;
        }
        
        const stats = window._lastStatsData;
        const rows = [];
        
        rows.push(["=== DEALNAMAA METRICS EXPORT ==="]);
        rows.push([]);
        
        rows.push(["--- OVERVIEW ---"]);
        rows.push(["Metric", "Value"]);
        rows.push(["Total Visits", stats.visits || 0]);
        rows.push(["Active Offers", (stats.totals || {}).activeOffers || 0]);
        rows.push(["Conversion Rate", `${stats.conversionRate || 0}%`]);
        rows.push(["Offers With Clicks", stats.offersWithClicks || 0]);
        rows.push(["Average Engagement Time", `${stats.avgEngagementTime || 0} seconds`]);
        rows.push(["Average PDF Pages Viewed", stats.avgPagesViewed || 0]);
        rows.push([]);
        
        rows.push(["--- TOP OFFERS ---"]);
        rows.push(["Title", "Retailer ID", "Total Clicks"]);
        (stats.topOffers || []).forEach(o => {
            rows.push([`"${o.title.replace(/"/g, '""')}"`, o.retailerId, o.clicks]);
        });
        rows.push([]);
        
        rows.push(["--- PDF ENGAGEMENT ---"]);
        rows.push(["Title", "Max Pages Viewed", "Total Time (Seconds)"]);
        (stats.offersWithPDFViews || []).forEach(o => {
            rows.push([`"${o.title.replace(/"/g, '""')}"`, o.maxPagesViewed, o.totalTimeSeconds]);
        });

        const csvContent = rows.map(e => e.join(",")).join("\r\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `dealnamaa_metrics_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    },

    exportOffersCSV: async function() {
        try {
            const offers = await api.getAllOffers();
            const retailers = await api.getAllRetailers();
            const retMap = {};
            retailers.forEach(r => { retMap[r.id] = r.name; });

            const rows = [];
            rows.push(["ID", "Title", "Retailer", "Valid From", "Valid Until", "Status", "Clicks", "Likes", "Dislikes", "Max Pages Viewed", "Time (sec)", "Badge", "Coupon Code"]);
            const now = new Date();
            offers.forEach(o => {
                const status = new Date(o.validUntil) >= now ? 'Active' : 'Expired';
                const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', {day:'2-digit', month:'short', year:'numeric'}) : '';
                rows.push([
                    o.id || o._id,
                    `"${(o.title || '').replace(/"/g, '""')}"`,
                    `"${(retMap[o.retailerId] || o.retailerId).replace(/"/g, '""')}"`,
                    fmtDate(o.validFrom),
                    fmtDate(o.validUntil),
                    status,
                    o.clicks || 0,
                    o.likes || 0,
                    o.dislikes || 0,
                    o.maxPagesViewed || 0,
                    o.totalTimeSeconds || 0,
                    o.badge || '',
                    o.couponCode || ''
                ]);
            });

            const csvContent = rows.map(e => e.join(",")).join("\r\n");
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", `dealnamaa_offers_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch(e) { alert('Error exporting offers: ' + e.message); }
    },

    exportFeedbackCSV: function() {
        if (!window._lastFeedbackData || window._lastFeedbackData.length === 0) {
            alert('No feedback data to export. Open the Feedback tab first.');
            return;
        }
        const data = window._lastFeedbackData;
        const rows = [];
        rows.push(["Date", "Time", "Name", "Email", "Message", "Rating"]);
        data.forEach(f => {
            const d = new Date(f.date);
            const date = d.toLocaleDateString('en-GB', {day:'2-digit', month:'short', year:'numeric'});
            const time = d.toLocaleTimeString('en-GB', {hour:'2-digit', minute:'2-digit', second:'2-digit'});
            rows.push([
                date,
                time,
                `"${(f.name || '').replace(/"/g, '""')}"`,
                f.email || '',
                `"${(f.message || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`,
                f.rating || ''
            ]);
        });
        const csvContent = rows.map(e => e.join(",")).join("\r\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `dealnamaa_feedback_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
};

// Boot Admin Dashboard
document.addEventListener('DOMContentLoaded', () => admin.init());
