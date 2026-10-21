const API = "https://aessaaessa.alwaysdata.net";

// Session Management
function getSession() {
  const session = localStorage.getItem("sa_session");
  return session ? JSON.parse(session) : null;
}

function saveSession(user) {
  localStorage.setItem("sa_session", JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem("sa_session");
}

// Intercept fetch to add any headers if needed in the future
async function apiFetch(endpoint, options = {}) {
  const session = getSession();
  if (session && session.id) {
    options.headers = {
      ...options.headers,
      "x-admin-id": session.id,
    };
  }

  const response = await fetch(`${API}${endpoint}`, options);
  
  if (response.status === 401) {
    clearSession();
    window.location.reload();
  }
  
  return response;
}

// Auth APIs
async function apiLogin(email, password) {
  const r = await apiFetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, role: "superadmin" }),
  });
  return r.json();
}

// Admin APIs
async function apiGetDashboard() {
  const [pRes, tRes, sRes, uRes] = await Promise.all([
    apiFetch("/api/admin/pharmacies").then((r) => r.json()),
    apiFetch("/api/admin/tickets").then((r) => r.json()),
    apiFetch("/api/admin/settings").then((r) => r.json()),
    apiFetch("/api/admin/users")
      .then((r) => r.json())
      .catch(() => ({ users: [] })),
  ]);
  return { pRes, tRes, sRes, uRes };
}

async function apiGetPharmacies() {
  return apiFetch("/api/admin/pharmacies").then((r) => r.json());
}

async function apiSavePharmacy(id, body) {
  const url = id ? `/api/admin/pharmacies/${id}` : `/api/admin/pharmacies`;
  return apiFetch(url, {
    method: id ? "PUT" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).then((r) => r.json());
}

async function apiTogglePharmacy(id, currentStatus) {
  return apiFetch(`/api/admin/pharmacies/${id}/toggle`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isActive: !currentStatus }),
  }).then((r) => r.json());
}

async function apiDeletePharmacy(id) {
  return apiFetch(`/api/admin/pharmacies/${id}`, { method: "DELETE" }).then(
    (r) => r.json(),
  );
}

async function apiGetUsers() {
  return apiFetch("/api/admin/users").then((r) => r.json());
}

async function apiGetPharmacySales(pharmacyId) {
  // Arbitrary wide date range for total sales
  return apiFetch(
    `/api/pharmacies/${pharmacyId}/sales?from=2020-01-01&to=2030-12-31`,
  ).then((r) => r.json());
}

async function apiGetTickets() {
  return apiFetch("/api/admin/tickets").then((r) => r.json());
}

async function apiUpdateTicket(id, status) {
  return apiFetch(`/api/admin/tickets/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
}

async function apiGetSettings() {
  return apiFetch("/api/admin/settings?t=" + Date.now()).then((r) => r.json());
}

async function apiSaveSettings(body) {
  return apiFetch("/api/admin/settings", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).then((r) => r.json());
}

async function apiGetSubRequests() {
  return apiFetch("/api/admin/subscription-requests").then((r) => r.json());
}
async function apiApproveSubRequest(id) {
  return apiFetch(`/api/admin/subscription-requests/${id}/approve`, {
    method: "POST",
  }).then((r) => r.json());
}
async function apiRejectSubRequest(id) {
  return apiFetch(`/api/admin/subscription-requests/${id}/reject`, {
    method: "POST",
  }).then((r) => r.json());
}
async function apiDeleteSubRequest(id) {
  return apiFetch(`/api/admin/subscription-requests/${id}`, {
    method: "DELETE",
  }).then((r) => r.json());
}

async function apiGetPharmacyDetails(id) {
  const [ph, branches, staff] = await Promise.all([
    apiFetch(`/api/admin/pharmacies/${id}`).then((r) => r.json()),
    apiFetch(`/api/admin/pharmacies/${id}/branches`).then((r) => r.json()),
    apiFetch(`/api/admin/pharmacies/${id}/staff`).then((r) => r.json()),
  ]);
  return {
    pharmacy: ph.pharmacy,
    branches: branches.branches || [],
    staff: staff.staff || [],
  };
}

async function apiGetPharmacyStats(id) {
  const res = await apiFetch(`/api/admin/pharmacies/${id}/stats`);
  return res.json();
}

async function apiGetAdminSales(id, limit = 50, offset = 0) {
  const res = await apiFetch(`/api/admin/pharmacies/${id}/sales?limit=${limit}&offset=${offset}`);
  return res.json();
}

async function apiDeleteAdminSale(phId, saleId) {
  const res = await apiFetch(`/api/admin/pharmacies/${phId}/sales/${saleId}`, {
    method: "DELETE"
  });
  return res.json();
}

async function apiToggleReadOnly(id, isReadOnly) {
  return apiFetch(`/api/admin/pharmacies/${id}/readonly`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isReadOnly }),
  }).then((r) => r.json());
}
async function apiAddStaff(pharmacyId, body) {
  return apiFetch(`/api/admin/pharmacies/${pharmacyId}/staff`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).then((r) => r.json());
}
async function apiDeleteStaff(pharmacyId, staffId) {
  return apiFetch(`/api/admin/pharmacies/${pharmacyId}/staff/${staffId}`, {
    method: "DELETE",
  }).then((r) => r.json());
}
async function apiAddBranch(pharmacyId, body) {
  return apiFetch(`/api/admin/pharmacies/${pharmacyId}/branches`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).then((r) => r.json());
}
async function apiDeleteBranch(pharmacyId, branchId) {
  return apiFetch(`/api/admin/pharmacies/${pharmacyId}/branches/${branchId}`, {
    method: "DELETE",
  }).then((r) => r.json());
}

async function apiUpdateStaff(pharmacyId, staffId, body) {
  return apiFetch(`/api/admin/pharmacies/${pharmacyId}/staff/${staffId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).then((r) => r.json());
}

async function apiUpdateBranch(pharmacyId, branchId, body) {
  return apiFetch(`/api/admin/pharmacies/${pharmacyId}/branches/${branchId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).then((r) => r.json());
}

async function apiGetNotifications() {
  return apiFetch("/api/admin/notifications").then((r) => r.json());
}

async function apiGetPlans() {
  return apiFetch("/api/admin/subscription-plans").then((r) => r.json());
}

async function apiSavePlan(id, body) {
  const url = id ? `/api/admin/subscription-plans/${id}` : "/api/admin/subscription-plans";
  return apiFetch(url, {
    method: id ? "PUT" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).then((r) => r.json());
}

async function apiDeletePlan(id) {
  return apiFetch(`/api/admin/subscription-plans/${id}`, { method: "DELETE" }).then((r) => r.json());
}

async function apiBroadcast(title, message, type) {
  return apiFetch(`/api/admin/broadcasts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, message, type }),
  }).then((r) => r.json());
}

async function apiRenewSubscription(pharmacyId, months, amountPaid) {
  return apiFetch(`/api/admin/pharmacies/${pharmacyId}/renew`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ months, amountPaid }),
  }).then((r) => r.json());
}

async function apiResetPharmacyPassword(pharmacyId, newPassword) {
  return apiFetch(`/api/admin/pharmacies/${pharmacyId}/reset-password`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ newPassword }),
  }).then((r) => r.json());
}

async function apiNotifyPharmacy(pharmacyId, title, message) {
  return apiFetch(`/api/admin/pharmacies/${pharmacyId}/notify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, message }),
  }).then((r) => r.json());
}

async function apiSetCustomPrice(pharmacyId, customPrice) {
  return apiFetch(`/api/admin/pharmacies/${pharmacyId}/custom-price`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ customPrice: customPrice === "" ? null : parseFloat(customPrice) }),
  }).then((r) => r.json());
}


async function apiGetAdminCustomers(phId) {
  const res = await apiFetch("/api/admin/pharmacies/" + phId + "/customers");
  return res.json();
}
async function apiGetAdminDebtPayments(phId) {
  try {
    const [debtRes, salesRes] = await Promise.allSettled([
      apiFetch("/api/admin/pharmacies/" + phId + "/debt-payments").then((r) => r.json()),
      apiFetch("/api/pharmacies/" + phId + "/sales").then((r) => r.json()),
    ]);

    let payments = [];
    if (debtRes.status === "fulfilled" && debtRes.value && debtRes.value.payments) {
      payments = [...debtRes.value.payments];
    }

    if (salesRes.status === "fulfilled" && salesRes.value && salesRes.value.sales) {
      const debtSales = salesRes.value.sales.filter(s => s.status === "debt_payment" || s.paymentMethod === "debt_payment");
      debtSales.forEach(s => {
        let custName = "عميل";
        let custId = null;
        if (typeof s.customer === "string") {
          try {
            const parsed = JSON.parse(s.customer);
            custName = parsed.name || "عميل";
            custId = parsed.id;
          } catch(e) {
            custName = s.customer;
          }
        } else if (s.customer && typeof s.customer === "object") {
          custName = s.customer.name || "عميل";
          custId = s.customer.id;
        }

        const exists = payments.some(p => p.id === s.id || (p.date === s.date && p.amount === s.total));
        if (!exists) {
          payments.push({
            id: s.id,
            pharmacy_id: s.pharmacy_id,
            customer_id: custId,
            customer_name: custName,
            amount: s.total,
            date: s.date,
            method: s.paymentMethod,
            cashier: s.cashierName,
            branch: s.branchName
          });
        }
      });
    }

    payments.sort((a, b) => ((b.date || "") > (a.date || "") ? 1 : ((b.date || "") < (a.date || "") ? -1 : 0)));
    return { success: true, payments };
  } catch (err) {
    console.error("apiGetAdminDebtPayments error:", err);
    try {
      const fallback = await apiFetch("/api/pharmacies/" + phId + "/sales").then(r => r.json());
      const debtSales = (fallback.sales || []).filter(s => s.status === "debt_payment").map(s => {
        let custName = "عميل";
        if (typeof s.customer === "string") {
          try { custName = JSON.parse(s.customer).name || "عميل"; } catch(e) { custName = s.customer; }
        } else if (s.customer && typeof s.customer === "object") {
          custName = s.customer.name || "عميل";
        }
        return {
          id: s.id,
          customer_name: custName,
          amount: s.total,
          date: s.date,
          method: s.paymentMethod,
          branch: s.branchName
        };
      });
      return { success: true, payments: debtSales };
    } catch (e2) {
      return { success: false, payments: [] };
    }
  }
}

async function apiGetAdminSuppliers(phId) {
  const res = await apiFetch("/api/admin/pharmacies/" + phId + "/suppliers");
  return res.json();
}

async function apiGetAdminPurchases(phId) {
  try {
    const [adminRes, phRes] = await Promise.allSettled([
      apiFetch("/api/admin/pharmacies/" + phId + "/purchases").then((r) => r.json()),
      apiFetch("/api/pharmacies/" + phId + "/purchase-invoices").then((r) => r.json()),
    ]);

    const adminPurchases = (adminRes.status === "fulfilled" && adminRes.value && adminRes.value.purchases) ? adminRes.value.purchases : [];
    const phInvoices = (phRes.status === "fulfilled" && phRes.value && phRes.value.invoices) ? phRes.value.invoices : [];

    const map = new Map();
    phInvoices.forEach(inv => {
      if (inv.id) map.set(inv.id, inv);
      if (inv.invoice_number) map.set(String(inv.invoice_number), inv);
    });

    if (adminPurchases.length > 0) {
      const merged = adminPurchases.map(p => {
        const full = map.get(p.id) || map.get(String(p.invoice_number)) || {};
        return {
          ...p,
          items: (p.items && p.items.length > 0) ? p.items : (full.items || []),
          notes: p.notes || full.notes || "",
          branch_name: p.branch_name || full.branch_name || full.branch_id || "",
        };
      });
      return { success: true, purchases: merged };
    } else {
      return { success: true, purchases: phInvoices };
    }
  } catch (err) {
    console.error("apiGetAdminPurchases error:", err);
    try {
      const fallback = await apiFetch("/api/pharmacies/" + phId + "/purchase-invoices").then(r => r.json());
      return { success: true, purchases: fallback.invoices || [] };
    } catch (e2) {
      return { success: false, purchases: [] };
    }
  }
}


async function apiCleanDisk() {
  return apiFetch("/api/admin/clean-disk", { method: "POST" }).then(r => r.json());
}
