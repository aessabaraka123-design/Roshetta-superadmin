const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf-8');

// Replace styles
html = html.replace(/<style>[\s\S]*?<\/style>/, '<link rel="stylesheet" href="assets/style.css">');

// Add Chart.js to head
if(!html.includes('chart.js')) {
  html = html.replace('</head>', '  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>\n</head>');
}

// Replace scripts
html = html.replace(/<script>\s*const API[\s\S]*?<\/script>/, '<script src="assets/api.js"></script>\n<script src="assets/app.js"></script>');

// Add Chart Canvas to Dashboard
if(!html.includes('dashChart')) {
  const dashInsert = `<div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-8">
  <h3 class="font-bold text-slate-800 mb-4">نمو الصيدليات الجديدة</h3>
  <div><canvas id="dashChart" height="250"></canvas></div>
</div>`;
  html = html.replace('<div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">', dashInsert + '\n<div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">');
}

// Add Pagination containers
function addPagination(html, tableId, containerId) {
  const tableRegex = new RegExp(`(<tbody id="${tableId}"[^>]*>[\\s\\S]*?<\\/tbody><\\/table>)`);
  return html.replace(tableRegex, `$1\n<div id="${containerId}" class="pagination-container"></div>`);
}

html = addPagination(html, 'pharmTbl', 'pharmPagination');
html = addPagination(html, 'usersTbl', 'usersPagination');
html = addPagination(html, 'salesTbl', 'salesPagination');
// Tickets pagination doesn't have a container in JS yet, but I can add it
// actually I didn't add pagination for tickets in app.js, so I'll skip it or add it later if needed.

fs.writeFileSync('index.html', html);
console.log('index.html updated successfully');
