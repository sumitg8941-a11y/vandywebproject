# Quick Testing Guide for JSON-LD Structured Data

## Immediate Testing Steps

### 1. View Page Source (2 minutes)

**Steps:**
1. Navigate to any offer page: `http://your-domain.com/view/[offer-id]`
2. Right-click → "View Page Source" (or Ctrl+U / Cmd+U)
3. Search for `application/ld+json` (Ctrl+F / Cmd+F)
4. Verify you see a JSON structure like this:

```html
<script id="offer-structured-data" type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Offer",
  "name": "Your Offer Title",
  "description": "...",
  "image": "http://...",
  "url": "http://...",
  ...
}
</script>
```

**✅ Success Indicators:**
- Script tag is present
- JSON is properly formatted
- All URLs are absolute (start with http://)
- No `undefined` values

---

### 2. Browser DevTools Inspection (3 minutes)

**Steps:**
1. Open offer page
2. Press F12 (or right-click → Inspect)
3. Go to "Elements" or "Inspector" tab
4. Press Ctrl+F / Cmd+F and search for `offer-structured-data`
5. Click on the script tag to expand it
6. Verify the JSON structure

**✅ Success Indicators:**
- Script is in the `<head>` section
- JSON is valid (no red error indicators)
- All required fields are present

---

### 3. Google Rich Results Test (5 minutes)

**URL:** https://search.google.com/test/rich-results

**Steps:**
1. Go to the Rich Results Test tool
2. Enter your offer page URL
3. Click "Test URL"
4. Wait 10-30 seconds for results

**✅ Success Indicators:**
- "Page is eligible for rich results" message
- Offer schema detected
- Preview shows your offer information
- No errors in the "Detected structured data" section

**Common Issues:**
- **"URL is not accessible"** → Check if your site is publicly accessible
- **"No structured data found"** → Verify script is in page source
- **"Invalid property"** → Check field names match schema.org

---

### 4. Schema.org Validator (5 minutes)

**URL:** https://validator.schema.org/

**Steps:**
1. Go to Schema.org validator
2. Select "Fetch URL" tab
3. Enter your offer page URL
4. Click "Run Test"

**✅ Success Indicators:**
- Green checkmarks for all properties
- "No errors found" message
- Proper nesting shown in tree view

---

### 5. Manual JSON Validation (2 minutes)

**Steps:**
1. Copy the JSON from page source (between the script tags)
2. Go to https://jsonlint.com/
3. Paste the JSON
4. Click "Validate JSON"

**✅ Success Indicators:**
- "Valid JSON" message
- Properly formatted output
- No syntax errors

---

## Testing Checklist

Use this checklist for each offer page:

### Required Fields
- [ ] `@context` is "https://schema.org"
- [ ] `@type` is "Offer"
- [ ] `name` is present and matches offer title
- [ ] `url` is absolute URL to offer page
- [ ] `image` is absolute URL to offer image

### Optional but Recommended
- [ ] `description` includes badge if available
- [ ] `validFrom` is in ISO 8601 format
- [ ] `priceValidUntil` is in YYYY-MM-DD format
- [ ] `availability` is InStock or OutOfStock
- [ ] `category` is present

### Conditional Fields
- [ ] `seller` object present if retailer data loaded
- [ ] `priceSpecification` present if coupon code exists
- [ ] `aggregateRating` present if likes/dislikes exist

### Technical Validation
- [ ] No `undefined` values in JSON
- [ ] All URLs are absolute (not relative)
- [ ] Dates are properly formatted
- [ ] JSON is valid (no syntax errors)
- [ ] Script loads before page interaction

---

## Example Test Results

### ✅ Good Result
```
Google Rich Results Test:
✓ Page is eligible for rich results
✓ Offer detected
✓ 8 properties found
✓ No errors

Schema.org Validator:
✓ Valid schema.org markup
✓ All required properties present
✓ Proper nesting
```

### ❌ Bad Result (Needs Fixing)
```
Google Rich Results Test:
✗ No structured data found
✗ Page is not eligible for rich results

Possible Issues:
- Script not in page source
- JavaScript not executing
- Invalid JSON syntax
```

---

## Quick Fixes

### Issue: Script Not Found in Page Source
**Fix:** Clear browser cache and hard refresh (Ctrl+Shift+R)

### Issue: Invalid JSON
**Fix:** Check for:
- Missing commas
- Unescaped quotes
- Trailing commas
- Undefined values

### Issue: Relative URLs
**Fix:** Ensure all URLs start with `http://` or `https://`

### Issue: Invalid Dates
**Fix:** Verify dates are in ISO 8601 format:
- `validFrom`: "2024-01-01T00:00:00.000Z"
- `priceValidUntil`: "2024-12-31"

---

## Testing Different Scenarios

### Test Case 1: Basic Offer (No Extras)
- Offer with only required fields
- No coupon code
- No ratings
- No retailer data yet

**Expected:** Valid Offer schema with minimal fields

### Test Case 2: Complete Offer
- All fields populated
- Coupon code present
- Has likes/dislikes
- Retailer data loaded

**Expected:** Full Offer schema with all optional fields

### Test Case 3: Expired Offer
- `validUntil` date in the past

**Expected:** `availability` should be "OutOfStock"

### Test Case 4: Future Offer
- `validFrom` date in the future

**Expected:** Still valid, `availability` based on `validUntil`

---

## Monitoring After Deployment

### Week 1: Initial Validation
- [ ] Test 5-10 different offer pages
- [ ] Verify all pass Rich Results Test
- [ ] Check for any console errors
- [ ] Monitor page load performance

### Week 2-4: Search Console Monitoring
- [ ] Check Google Search Console for structured data errors
- [ ] Monitor "Enhancements" section
- [ ] Look for "Unparsable structured data" warnings
- [ ] Track Rich Results impressions

### Monthly: Ongoing Validation
- [ ] Random sample of 10 offer pages
- [ ] Check for new schema.org updates
- [ ] Review Rich Results performance
- [ ] Update schema if needed

---

## Troubleshooting Commands

### Check if Script Loads
```javascript
// In browser console
document.querySelector('script[type="application/ld+json"]')
```

### Extract JSON from Page
```javascript
// In browser console
JSON.parse(document.querySelector('script[type="application/ld+json"]').textContent)
```

### Validate JSON Structure
```javascript
// In browser console
const schema = JSON.parse(document.querySelector('script[type="application/ld+json"]').textContent);
console.log('Type:', schema['@type']);
console.log('Name:', schema.name);
console.log('URL:', schema.url);
```

---

## Success Metrics

### Immediate (Day 1)
- ✅ Structured data appears in page source
- ✅ Passes Rich Results Test
- ✅ Passes Schema.org Validator
- ✅ No console errors

### Short-term (Week 1-2)
- ✅ Google Search Console shows structured data
- ✅ No structured data errors reported
- ✅ All offer pages have valid schema

### Long-term (Month 1-3)
- ✅ Rich Results appear in search
- ✅ Improved click-through rates
- ✅ Better search rankings
- ✅ Enhanced mobile search appearance

---

## Support Resources

### If Tests Fail
1. Check `JSON_LD_STRUCTURED_DATA.md` for detailed troubleshooting
2. Review browser console for JavaScript errors
3. Verify offer data is loading correctly
4. Test with different offers to isolate issues

### Getting Help
- Google Search Central Help: https://support.google.com/webmasters
- Schema.org Community: https://github.com/schemaorg/schemaorg/issues
- Stack Overflow: Tag questions with `schema.org` and `json-ld`

---

**Remember:** It may take 1-4 weeks for Google to index your pages and display Rich Results. Be patient and monitor Google Search Console for updates.
