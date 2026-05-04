with open('admin.js', 'r', encoding='utf-8-sig') as f:
    c = f.read()

# ── 1. Add _genId utility before autoTranslate ────────────────────────────────
gen_id_fn = """    // Auto-generate a slug from name parts: takes 2-3 chars from each part
    _genId: function(...parts) {
        return parts
            .filter(Boolean)
            .map(p => p.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 3))
            .join('-');
    },

    // Called oninput on name fields to auto-fill ID (only when not editing)
    autoFillId: function(targetId, ...sourceParts) {
        const el = document.getElementById(targetId);
        if (!el || el.readOnly) return;
        el.value = this._genId(...sourceParts);
    },

    """

marker = "    autoTranslate: async function(fieldIdPrefix"
if marker not in c:
    print("Marker not found"); exit(1)
c = c.replace(marker, gen_id_fn + marker, 1)
print("Patch 1 (genId utility): OK")

# ── 2. Country: wire name input to auto-fill ID ───────────────────────────────
old_country_name_input = 'id="new-country-name" style="width:100%; padding:8px; margin-bottom:12px;" placeholder="e.g., Kuwait"'
new_country_name_input = 'id="new-country-name" style="width:100%; padding:8px; margin-bottom:12px;" placeholder="e.g., Kuwait" oninput="if(!document.getElementById(\'new-country-id\').readOnly) admin.autoFillId(\'new-country-id\', this.value)"'
if old_country_name_input in c:
    c = c.replace(old_country_name_input, new_country_name_input, 1)
    print("Patch 2 (country name oninput): OK")
else:
    print("Patch 2: NOT FOUND")

# ── 3. State: wire name + country select to auto-fill ID ─────────────────────
old_state_name_input = 'id="new-state-name" style="width:100%; padding:8px; margin-bottom:12px;" placeholder="e.g., Dubai Emirate"'
new_state_name_input = 'id="new-state-name" style="width:100%; padding:8px; margin-bottom:12px;" placeholder="e.g., Dubai Emirate" oninput="if(!document.getElementById(\'new-state-id\').readOnly){const c=document.getElementById(\'new-state-country\').value;admin.autoFillId(\'new-state-id\',c,this.value);}"'
if old_state_name_input in c:
    c = c.replace(old_state_name_input, new_state_name_input, 1)
    print("Patch 3 (state name oninput): OK")
else:
    print("Patch 3: NOT FOUND")

old_state_country_select = 'id="new-state-country" style="width:100%; padding:8px; margin-bottom:10px;">'
new_state_country_select = 'id="new-state-country" style="width:100%; padding:8px; margin-bottom:10px;" onchange="if(!document.getElementById(\'new-state-id\').readOnly){const n=document.getElementById(\'new-state-name\').value;admin.autoFillId(\'new-state-id\',this.value,n);}">'
if old_state_country_select in c:
    c = c.replace(old_state_country_select, new_state_country_select, 1)
    print("Patch 3b (state country onchange): OK")
else:
    print("Patch 3b: NOT FOUND")

# ── 4. City: wire name + country + state to auto-fill ID ─────────────────────
# Find city name input placeholder
old_city_name_input = 'id="new-city-name" style="width:100%; padding:8px; margin-bottom:12px;" placeholder="e.g., Dubai"'
new_city_name_input = 'id="new-city-name" style="width:100%; padding:8px; margin-bottom:12px;" placeholder="e.g., Dubai" oninput="admin._autoCityId()"'
if old_city_name_input in c:
    c = c.replace(old_city_name_input, new_city_name_input, 1)
    print("Patch 4 (city name oninput): OK")
else:
    print("Patch 4: NOT FOUND")

# Also patch loadStatesForCity to trigger city ID regen on country change
old_city_country = 'id="new-city-country" style="width:100%; padding:8px; margin-bottom:10px;" onchange="admin.loadStatesForCity(this.value)"'
new_city_country = 'id="new-city-country" style="width:100%; padding:8px; margin-bottom:10px;" onchange="admin.loadStatesForCity(this.value); admin._autoCityId()"'
if old_city_country in c:
    c = c.replace(old_city_country, new_city_country, 1)
    print("Patch 4b (city country onchange): OK")
else:
    print("Patch 4b: NOT FOUND")

# ── 5. Retailer: wire name + city to auto-fill ID ────────────────────────────
old_ret_name_input = 'id="new-ret-name" placeholder="Retailer Name" style="width:100%; padding:8px; margin-bottom:12px;"'
new_ret_name_input = 'id="new-ret-name" placeholder="Retailer Name" style="width:100%; padding:8px; margin-bottom:12px;" oninput="if(!document.getElementById(\'new-ret-id\').readOnly){const c=document.getElementById(\'new-ret-city\').value;admin.autoFillId(\'new-ret-id\',c,this.value);}"'
if old_ret_name_input in c:
    c = c.replace(old_ret_name_input, new_ret_name_input, 1)
    print("Patch 5 (retailer name oninput): OK")
else:
    print("Patch 5: NOT FOUND")

# ── 6. Add _autoCityId helper and update loadOfferRetailers trigger ───────────
auto_city_id_fn = """    _autoCityId: function() {
        const el = document.getElementById('new-city-id');
        if (!el || el.readOnly) return;
        const country = document.getElementById('new-city-country')?.value || '';
        const state = document.getElementById('new-city-state')?.value || '';
        const name = document.getElementById('new-city-name')?.value || '';
        el.value = this._genId(country, state || null, name);
    },

    """

c = c.replace(gen_id_fn + marker, gen_id_fn + auto_city_id_fn + marker, 1)
print("Patch 6 (_autoCityId): OK")

# Also wire city state dropdown onchange
old_city_state = 'id="new-city-state" style="width:100%; padding:8px; margin-bottom:10px;" onchange="admin.loadOfferRetailers(this.value)"'
new_city_state = 'id="new-city-state" style="width:100%; padding:8px; margin-bottom:10px;" onchange="admin.loadOfferRetailers(this.value); admin._autoCityId()"'
if old_city_state in c:
    c = c.replace(old_city_state, new_city_state, 1)
    print("Patch 6b (city state onchange): OK")
else:
    print("Patch 6b: NOT FOUND (may not exist)")

with open('admin.js', 'w', encoding='utf-8-sig') as f:
    f.write(c)

print("\nDone.")
