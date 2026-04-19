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
                    <button class="action-btn" style="background:#e74c3c;" onclick="alert('Delete feature coming soon!')">Delete</button>
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
                    
                    <label>Image URL:</label><br>
                    <input type="text" id="new-country-image" style="width:100%; padding:8px; margin-bottom:15px;" placeholder="https://...">
                    
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
        const image = document.getElementById('new-country-image').value;
        
        if(id && name && image) {
            try {
                await api.addCountry({ id, name, image });
                alert('Country securely saved to MongoDB permanently!');
                this.showTab('countries'); 
            } catch (error) {
                alert('Error saving country to the database. Ensure server is running.');
            }
        } else {
            alert('Please fill in all fields before saving.');
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
                    <button class="action-btn">Edit</button>
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
                    
                    <label>Image URL:</label><br>
                    <input type="text" id="new-city-image" style="width:100%; padding:8px; margin-bottom:15px;">
                    
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
        const image = document.getElementById('new-city-image').value;
        
        if(id && name && countryId && image) {
            try { await api.addCity({ id, name, countryId, image }); alert('City saved!'); this.showTab('cities'); } 
            catch(e) { alert('Error saving to database.'); }
        } else { alert('Fill all fields'); }
    },

    renderRetailers: async function() {
        const retailers = await api.getAllRetailers();
        const cities = await api.getAllCities();
        
        let rows = retailers.map(r => `<tr><td>${r.id.toUpperCase()}</td><td>${r.name}</td><td>${r.cityId.toUpperCase()}</td><td><button class="action-btn">Edit</button></td></tr>`).join('');
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
                <input type="text" id="new-ret-image" placeholder="Image URL" style="width:100%; padding:8px; margin-bottom:15px;">
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
        const image = document.getElementById('new-ret-image').value;
        if(id && name && cityId && image) {
            try { await api.addRetailer({ id, name, websiteUrl, cityId, image }); alert('Retailer saved!'); this.showTab('retailers'); } 
            catch(e) { alert('Error: ' + e.message); }
        } else { alert('Fill all fields'); }
    },

    renderOffers: async function() {
        const offers = await api.getAllOffers();
        const retailers = await api.getAllRetailers();
        
        let rows = offers.map(o => `<tr><td>${o.title}</td><td>${o.retailerId.toUpperCase()}</td><td>${new Date(o.date).toISOString().split('T')[0]}</td><td><button class="action-btn">Edit</button></td></tr>`).join('');
        let retailerOptions = retailers.map(r => `<option value="${r.id}">${r.name} (${r.cityId})</option>`).join('');

        return `
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <h2>Offers & PDFs</h2>
                <button class="action-btn" style="background:#27ae60;" onclick="document.getElementById('upload-form').style.display='block'">+ Add New Offer</button>
            </div>
            
            <div id="upload-form" style="display:none; background:#f9f9f9; padding:20px; border-radius:8px; margin-top:15px; border:1px solid #ddd;">
                <h3>Add New Offer</h3>
                <div style="margin-top:10px;">
                    <input type="text" id="new-off-id" placeholder="Offer ID (e.g. o20)" style="width:100%; padding:8px; margin-bottom:10px;">
                    <input type="text" id="new-off-title" placeholder="Offer Title (e.g., Weekend Sale)" style="width:100%; padding:8px; margin-bottom:10px;">
                    <input type="date" id="new-off-date" style="width:100%; padding:8px; margin-bottom:10px;">
                    <select id="new-off-retailer" style="width:100%; padding:8px; margin-bottom:10px;">${retailerOptions}</select>
                    
                    <label style="font-weight: bold; font-size: 0.9em;">Upload PDF Flyer (Optional):</label>
                    <input type="file" id="new-off-pdf-file" accept="application/pdf" style="width:100%; padding:8px; margin-bottom:5px;">
                    <input type="text" id="new-off-pdf" placeholder="OR provide PDF URL (e.g. https://...)" style="width:100%; padding:8px; margin-bottom:15px;">
                    
                    <label style="font-weight: bold; font-size: 0.9em;">Upload Cover Image (Required):</label>
                    <input type="file" id="new-off-image-file" accept="image/*" style="width:100%; padding:8px; margin-bottom:5px;">
                    <input type="text" id="new-off-image" placeholder="OR provide Image URL (e.g. https://...)" style="width:100%; padding:8px; margin-bottom:15px;">
                    
                    <input type="text" id="new-off-badge" placeholder="Badge (e.g. 50% OFF)" style="width:100%; padding:8px; margin-bottom:15px;">
                    <button class="action-btn" id="save-offer-btn" onclick="admin.saveOffer()">Save Offer</button>
                    <button class="action-btn" style="background:#e74c3c; margin-left:10px;" onclick="document.getElementById('upload-form').style.display='none'">Cancel</button>
                </div>
            </div>
            
            <table class="admin-table" style="margin-top:20px;"><thead><tr><th>Title</th><th>Retailer</th><th>Date</th><th>Actions</th></tr></thead><tbody>${rows}</tbody></table>
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

    saveOffer: async function() {
        const id = document.getElementById('new-off-id').value.toLowerCase();
        const title = document.getElementById('new-off-title').value;
        const date = document.getElementById('new-off-date').value;
        const retailerId = document.getElementById('new-off-retailer').value;
        const badge = document.getElementById('new-off-badge').value;

        let pdfUrl = document.getElementById('new-off-pdf').value || '#';
        let image = document.getElementById('new-off-image').value;

        const pdfFile = document.getElementById('new-off-pdf-file').files[0];
        const imageFile = document.getElementById('new-off-image-file').files[0];
        const btn = document.getElementById('save-offer-btn');

        btn.innerText = 'Uploading...';
        btn.disabled = true;

        try {
            if (pdfFile) pdfUrl = await this.uploadFile(pdfFile);
            if (imageFile) image = await this.uploadFile(imageFile);
            
            if(id && title && date && retailerId && image) {
                await api.addOffer({ id, title, date, retailerId, pdfUrl, image, badge }); 
                alert('Offer saved successfully!'); 
                this.showTab('offers'); 
            } else {
                alert('Please fill all required fields and provide a cover image.');
            }
        } catch(e) {
            alert('Error saving offer: ' + e.message);
        } finally {
            if (btn) {
                btn.innerText = 'Save Offer';
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
    }
};

// Boot Admin Dashboard
document.addEventListener('DOMContentLoaded', () => admin.init());