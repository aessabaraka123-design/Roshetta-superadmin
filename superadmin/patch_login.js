
const fs = require('fs');
let text = fs.readFileSync('superadmin/assets/app.js', 'utf8');
text = text.replace('loadAll();', "tab('dashboard');\n        loadAll();");
fs.writeFileSync('superadmin/assets/app.js', text);
