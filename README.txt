KNOCKOUTNOTES LIVE GOOGLE SHEETS API

These files use the Google Apps Script API deployment already created for the KnockoutNotes Content Sheet.

Google Sheet columns currently supported:
Type | Category | Title | Summary | Answer | Reference | Date | URL

Optional future columns:
PDF | Slides | Tags

Type meanings:
Pearl = Pearls page
Note = Notes page
Viva = Viva page
Drug = Drugs page
Critical Care = Critical Care page
Update = Recent Updates page

Latest from KnockoutNotes = newest 5 published rows across all types.
Recent Updates = only rows whose Type is Update/Guideline Update/etc.

After uploading these files to GitHub, Cloudflare Pages should redeploy.
For normal content updates, edit the Google Sheet only.
