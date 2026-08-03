const API_BASE = "/api/payments";
let currentTab = "upi";

// Keep session-level metadata so modal can show real UPI IDs.
const paymentMetaStore = {};

// Generate UUID v4
function generateUUID() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === "x" ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function showMessage(text, type = "info") {
    const box = document.getElementById("messageBox");
    const icons = { success: "✓", error: "✕", info: "ℹ" };
    box.innerHTML = `<div class="message ${type}">${icons[type]} ${text}</div>`;
    box.scrollIntoView({ behavior: "smooth", block: "start" });
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleString("en-IN");
}

function getStatusClass(status) {
    return `status-${String(status || "").toLowerCase()}`;
}

function switchTab(tab) {
    currentTab = tab;
    document.querySelectorAll(".tab-button").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.tab === tab);
    });
    document.querySelectorAll(".tab-content").forEach(content => {
        content.classList.toggle("active", content.id === `${tab}Tab`);
    });

    const payerUpiId = document.getElementById("payerUpiId");
    const payeeUpiId = document.getElementById("payeeUpiId");
    const sourceAccount = document.getElementById("sourceAccount");
    const destinationAccount = document.getElementById("destinationAccount");

    // Required handling by tab
    if (tab === "upi") {
        payerUpiId.required = true;
        payeeUpiId.required = true;
        sourceAccount.required = false;
        destinationAccount.required = false;
    } else if (tab === "netbanking") {
        payerUpiId.required = false;
        payeeUpiId.required = false;
        sourceAccount.required = true;
        destinationAccount.required = true;
    } else {
        payerUpiId.required = false;
        payeeUpiId.required = false;
        sourceAccount.required = false;
        destinationAccount.required = false;
    }
}

function resetForm() {
    document.getElementById("paymentForm").reset();
    document.getElementById("messageBox").innerHTML = "";
    document.getElementById("currency").value = "INR";
    document.getElementById("bankName").value = "SBI";
    document.getElementById("accountType").value = "Savings";
    switchTab("upi");
}

async function fetchJson(url, options) {
    const response = await fetch(url, options);
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw data;
    }
    return data;
}

async function loadDashboard() {
    try {
        const payments = await fetchJson(API_BASE);

        const stats = {
            total: payments.length,
            CREATED: 0,
            VALIDATED: 0,
            SENT: 0,
            COMPLETED: 0,
            FAILED: 0
        };

        payments.forEach(p => {
            stats[p.status] = (stats[p.status] || 0) + 1;
        });

        document.getElementById("statTotal").textContent = stats.total;
        document.getElementById("statCreated").textContent = stats.CREATED;
        document.getElementById("statValidated").textContent = stats.VALIDATED;
        document.getElementById("statSent").textContent = stats.SENT;
        document.getElementById("statCompleted").textContent = stats.COMPLETED;
        document.getElementById("statFailed").textContent = stats.FAILED;

        renderPayments(payments);
    } catch (err) {
        console.error("Failed to load payments:", err);
    }
}

function renderPayments(payments) {
    const tbody = document.getElementById("paymentsTableBody");
    tbody.innerHTML = "";

    if (!payments || payments.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; color:#999; padding:40px;">No payments found</td></tr>`;
        return;
    }

    payments.forEach(p => {
        const meta = paymentMetaStore[p.id] || {};
        const method = meta.paymentMethod || "N/A";
        const fromDisplay = meta.payerUpiId || p.sourceAccount || "-";
        const toDisplay = meta.payeeUpiId || p.destinationAccount || "-";

        const row = `
            <tr>
                <td><strong>#${p.id}</strong></td>
                <td>${method}</td>
                <td>${p.amount} ${p.currency}</td>
                <td>${fromDisplay}</td>
                <td>${toDisplay}</td>
                <td><span class="status-badge ${getStatusClass(p.status)}">${p.status}</span></td>
                <td>${formatDate(p.createdAt)}</td>
                <td><a class="view-link" onclick="viewPaymentDetails(${p.id})">View</a></td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

async function filterPayments() {
    const searchId = document.getElementById("searchInput").value.trim();
    const status = document.getElementById("filterStatus").value;

    try {
        let payments;
        if (searchId) {
            const payment = await fetchJson(`${API_BASE}/${searchId}`);
            payments = [payment];
        } else if (status) {
            payments = await fetchJson(`${API_BASE}?status=${status}`);
        } else {
            payments = await fetchJson(API_BASE);
        }
        renderPayments(payments);
    } catch (err) {
        console.error("Filter failed:", err);
        showMessage("No results found", "info");
    }
}

async function viewPaymentDetails(id) {
    try {
        const payment = await fetchJson(`${API_BASE}/${id}`);
        const history = await fetchJson(`${API_BASE}/${id}/history`);
        const meta = paymentMetaStore[id] || {};

        const fromDisplay = meta.payerUpiId || payment.sourceAccount || "-";
        const toDisplay = meta.payeeUpiId || payment.destinationAccount || "-";

        let historyHtml = "";
        history.forEach(h => {
            historyHtml += `
                <div style="padding: 12px; background: #f8fafc; border-left: 3px solid #2563eb; margin-bottom: 10px;">
                    <strong>${h.fromStatus || "START"} → ${h.toStatus}</strong><br>
                    <small style="color:#999;">${formatDate(h.changedAt)} | ${h.changedBy}</small><br>
                    <small>${h.note || "-"}</small>
                </div>
            `;
        });

        const body = document.getElementById("modalBody");
        body.innerHTML = `
            <h2>Payment Details #${payment.id}</h2>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #e2e8f0;">
            <div style="margin-bottom: 20px;">
                <p><strong>Method:</strong> ${meta.paymentMethod || "N/A"}</p>
                <p><strong>Amount:</strong> ${payment.amount} ${payment.currency}</p>
                <p><strong>From:</strong> ${fromDisplay}</p>
                <p><strong>To:</strong> ${toDisplay}</p>
                <p><strong>Status:</strong> <span class="status-badge ${getStatusClass(payment.status)}">${payment.status}</span></p>
                ${payment.status === "FAILED" ? `<p style="color:#dc2626;"><strong>${payment.errorCode}:</strong> ${payment.errorMessage || ""}</p>` : ""}
                <p><strong>Created:</strong> ${formatDate(payment.createdAt)}</p>
            </div>
            <h3 style="margin-top: 30px;">History</h3>
            ${historyHtml}
        `;

        document.getElementById("detailsModal").classList.add("show");
    } catch (err) {
        showMessage(`Error: ${err.message || "Could not load payment details"}`, "error");
    }
}

function closeModal() {
    document.getElementById("detailsModal").classList.remove("show");
}

function buildPayloadAndMeta() {
    const amountRaw = document.getElementById("amount").value;
    const amount = Number(amountRaw);
    const currency = document.getElementById("currency").value;
    const description = document.getElementById("reference").value || "";

    if (!amount || amount <= 0) {
        throw { errorCode: "VALIDATION_FAILED", message: "Amount must be greater than 0" };
    }

    const base = {
        paymentMethod: currentTab.toUpperCase(),
        amount: amount.toFixed(2),
        currency,
        description
    };

    // Backend-required fields
    let sourceAccount = "ACC1001";
    let destinationAccount = "ACC2002";

    let payerUpiId = "";
    let payeeUpiId = "";

    if (currentTab === "upi") {
        payerUpiId = document.getElementById("payerUpiId").value.trim();
        payeeUpiId = document.getElementById("payeeUpiId").value.trim();
        if (!payerUpiId || !payeeUpiId) {
            throw { errorCode: "VALIDATION_FAILED", message: "Both UPI IDs are required" };
        }
    } else if (currentTab === "netbanking") {
        sourceAccount = document.getElementById("sourceAccount").value.trim();
        destinationAccount = document.getElementById("destinationAccount").value.trim();
        if (!sourceAccount || !destinationAccount) {
            throw { errorCode: "VALIDATION_FAILED", message: "Source and destination account are required for Net Banking" };
        }
    } else {
        // Card: keep internal mapped accounts
        sourceAccount = "ACC1001";
        destinationAccount = "ACC2002";
    }

    const fullPayload = {
        ...base,
        payerUpiId,
        payeeUpiId,
        sourceAccount,
        destinationAccount
    };

    // Current backend expects this shape.
    const backendPayload = {
        idempotencyKey: "", // filled during submit
        amount: amount.toFixed(2),
        currency,
        sourceAccount,
        destinationAccount
    };

    return { fullPayload, backendPayload };
}

document.getElementById("paymentForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    try {
        const idempotencyKey = generateUUID();
        const { fullPayload, backendPayload } = buildPayloadAndMeta();

        backendPayload.idempotencyKey = idempotencyKey;

        console.log("Idempotency-Key:", idempotencyKey);
        console.log("Requested frontend payload:", fullPayload);

        const result = await fetchJson(API_BASE, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Idempotency-Key": idempotencyKey
            },
            body: JSON.stringify(backendPayload)
        });

        // Save UI metadata for modal/table display
        paymentMetaStore[result.id] = {
            paymentMethod: fullPayload.paymentMethod,
            payerUpiId: fullPayload.payerUpiId,
            payeeUpiId: fullPayload.payeeUpiId,
            description: fullPayload.description
        };

        showMessage(`Payment created successfully. ID: #${result.id}`, "success");
        resetForm();
        loadDashboard();
        window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
        showMessage(`❌ ${err.errorCode || "ERROR"}: ${err.message || "Payment creation failed"}`, "error");
    }
});

document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".tab-button").forEach(btn => {
        btn.addEventListener("click", () => switchTab(btn.dataset.tab));
    });

    loadDashboard();
    setInterval(loadDashboard, 5000);
    switchTab("upi");
});

document.getElementById("detailsModal").addEventListener("click", function (e) {
    if (e.target === this) closeModal();
});