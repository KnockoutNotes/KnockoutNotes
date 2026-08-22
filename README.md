# KnockoutNotes — Revamped + Google Sheets Content

## One-time setup
1. Create a Google Sheet named `KnockoutNotes Content`.
2. Use these columns in row 1:
   `Type | Category | Title | Summary | Answer | Reference | Date`
3. In Google Sheets: **File → Share → Publish to web**.
4. Choose the sheet containing the content, choose **Comma-separated values (.csv)**, then Publish.
5. Copy the CSV URL.
6. Open `sheet-config.js` and paste the URL between the quotes after `KNOCKOUTNOTES_SHEET_CSV =`.
7. Upload/replace the website files in GitHub.

## After setup
You do NOT edit HTML for normal content updates.

Add/edit rows in the Google Sheet:
- `Type = Pearl` → Pearls
- `Type = Note` → Notes
- `Type = Viva` → Viva
- `Type = Drug` → Drugs
- `Type = Critical Care` → Critical Care

Cloudflare continues serving the website. The browser reads the published Sheet when a page loads, so ordinary content edits do not require a GitHub or Cloudflare deployment.

## Important
Publishing a Google Sheet to the web makes its published contents accessible to anyone who has the published URL/page. Do not put patient-identifiable information, passwords, API keys, or private data in this sheet.

For medical content, keep the Reference column populated. Use current specialty guidelines for recommendations and standard anaesthesia textbooks for core physiology/pharmacology/practice.
