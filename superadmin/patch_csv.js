const fs = require('fs');
let file = fs.readFileSync('assets/app.js', 'utf8');

// Fix 1: Use semicolons for Arabic Excel compatibility
// Fix 2: Add all missing fields in the rows mapping
const oldExport = `  const headers = ['ID', 'Name', 'Owner', 'Phone', 'Email', 'Subscription Plan', 'Expiry', 'Total Paid', 'Is Active'];
    const rows = pharms.map(p => [
      p.id,
      p.name,
      p.owner || '',
    ]);
    
    let csvContent = "data:text/csv;charset=utf-8,\\uFEFF" 
      + headers.join(",") + "\\n" 
      + rows.map(e => e.map(cell => \`"\${(cell+'').replace(/"/g, '""')}"\`).join(",")).join("\\n");`;

const newExport = `  const headers = ['ID', 'الاسم', 'المالك', 'الهاتف', 'البريد', 'نوع الاشتراك', 'انتهاء الاشتراك', 'نشط'];
    const rows = pharms.map(p => [
      p.id,
      p.name || '',
      p.owner || '',
      p.phone || '',
      p.email || '',
      p.subscriptionType || '',
      p.subscriptionExpiry ? p.subscriptionExpiry.split('T')[0] : '',
      p.isActive ? 'نعم' : 'لا',
    ]);
    
    let csvContent = "data:text/csv;charset=utf-8,\\uFEFF" 
      + headers.join(";") + "\\n" 
      + rows.map(e => e.map(cell => \`"\${(cell+'').replace(/"/g, '""')}"\`).join(";")).join("\\n");`;

if (file.includes(oldExport)) {
  file = file.replace(oldExport, newExport);
  fs.writeFileSync('assets/app.js', file);
  console.log("CSV export fixed!");
} else {
  console.log("Pattern not found exactly, trying partial...");
  // Try partial match
  file = file.replace(
    /const headers = \['ID', 'Name', 'Owner', 'Phone', 'Email', 'Subscription Plan', 'Expiry', 'Total Paid', 'Is Active'\];[\s\S]*?join\(","\)\)\.join\("\\n"\);/,
    newExport
  );
  fs.writeFileSync('assets/app.js', file);
  console.log("CSV export fixed via regex!");
}
