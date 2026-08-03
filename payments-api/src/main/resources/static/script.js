const API_BASE = "/api/payments";
let currentTab = "upi";

// Keep client-side payment extra metadata for immediate UI rendering.
const paymentMetaStore = {};

// Currency symbols map
const currencySymbolMap = {
    INR: "₹",
    USD: "$",
    EUR: "€",
    GBP: "£"
};

function generateUUID() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === "x" ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/* -------------------- Success Popup -------------------- */
function ensureSuccessModal() {
    let modal = document.getElementById("successModal");
    if (modal) return;

    modal = document.createElement("div");
    modal.id = "successModal";
    modal.style.display = "none";
    modal.style.position = "fixed";
    modal.style.left = "0";
    modal.style.top = "0";
    modal.style.width = "100%";
    modal.style.height = "100%";
    modal.style.background = "rgba(0,0,0,0.45)";
    modal.style.zIndex = "2000";
    modal.innerHTML = `
        <div style="
            background:#fff;
            max-width:460px;
            margin:120px auto;
            border-radius:10px;
            padding:22px;
            box-shadow:0 20px 40px rgba(0,0,0,0.2);
            text-align:center;
            font-family:inherit;
        ">
            <h3 style="margin:0 0 10px;color:#166534;">Payment Created</h3>
            <p id="successModalText" style="margin:0 0 18px;color:#334155;white-space:pre-line;"></p>
            <button id="successModalCloseBtn" style="
                background:#2563eb;color:#fff;border:none;border-radius:8px;
                padding:10px 20px;cursor:pointer;font-weight:600;
            ">OK</button>
        </div>
    `;
    document.body.appendChild(modal);

    document.getElementById("successModalCloseBtn").addEventListener("click", closeSuccessModal);
    modal.addEventListener("click", (e) => {
        if (e.target === modal) closeSuccessModal();
    });
}

function showSuccessModal(message) {
    ensureSuccessModal();
    document.getElementById("successModalText").textContent = message;
    document.getElementById("successModal").style.display = "block";
}

function closeSuccessModal() {
    const modal = document.getElementById("successModal");
    if (modal) modal.style.display = "none";
}

/* -------------------- Messages -------------------- */
function showMessage(text, type = "info") {
    const box = document.getElementById("messageBox");
    if (!box) return;
    const icons = { success: "✓", error: "✕", info: "ℹ" };
    box.innerHTML = `<div class="message ${type}">${icons[type]} ${text}</div>`;
}

/* -------------------- Date/Time Formatting -------------------- */
/**
 * Backend returns LocalDateTime (no timezone). Browser may parse it inconsistently.
 * Convert "YYYY-MM-DDTHH:mm:ss" into a local Date explicitly.
 */
function parseLocalDateTime(dateValue) {
    if (!dateValue) return null;
    if (typeof dateValue !== "string") {
        const d = new Date(dateValue);
        return isNaN(d.getTime()) ? null : d;
    }

    // Expected format: 2026-08-03T12:52:04
    const match = dateValue.match(
        /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?$/
    );
    if (match) {
        const [, y, m, d, hh, mm, ss] = match;
        return new Date(
            Number(y),
            Number(m) - 1,
            Number(d),
            Number(hh),
            Number(mm),
            Number(ss)
        );
    }

    const fallback = new Date(dateValue);
    return isNaN(fallback.getTime()) ? null : fallback;
}

function formatDate(dateValue) {
    const parsed = parseLocalDateTime(dateValue);
    if (!parsed) return "-";

    return parsed.toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
    });
}

/* -------------------- Currency Symbol Handling -------------------- */
function updateCurrencySymbol() {
    const currencySelect = document.getElementById("currency");
    const currencySymbolEl = document.querySelector(".currency-symbol");
    const amountInput = document.getElementById("amount");

    if (!currencySelect || !currencySymbolEl || !amountInput) return;

    const currency = currencySelect.value || "INR";
    const symbol = currencySymbolMap[currency] || "¤";
    currencySymbolEl.textContent = symbol;

    // Dynamic placeholder symbol
    amountInput.placeholder = `${symbol} 0.00`;
}

/* -------------------- UI Helpers -------------------- */
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

    if (payerUpiId && payeeUpiId && sourceAccount && destinationAccount) {
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
}

function resetForm() {
    const form = document.getElementById("paymentForm");
    if (form) form.reset();

    const currency = document.getElementById("currency");
    if (currency) currency.value = "INR";

    const bankName = document.getElementById("bankName");
    if (bankName) bankName.value = "SBI";

    const accountType = document.getElementById("accountType");
    if (accountType) accountType.value = "Savings";

    switchTab("upi");
    updateCurrencySymbol();
}

/* -------------------- API -------------------- */
async function fetchJson(url, options) {
    const response = await fetch(url, options);
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw data;
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

        const statTotal = document.getElementById("statTotal");
        const statCreated = document.getElementById("statCreated");
        const statValidated = document.getElementById("statValidated");
        const statSent = document.getElementById("statSent");
        const statCompleted = document.getElementById("statCompleted");
        const statFailed = document.getElementById("statFailed");

        if (statTotal) statTotal.textContent = stats.total;
        if (statCreated) statCreated.textContent = stats.CREATED;
        if (statValidated) statValidated.textContent = stats.VALIDATED;
        if (statSent) statSent.textContent = stats.SENT;
        if (statCompleted) statCompleted.textContent = stats.COMPLETED;
        if (statFailed) statFailed.textContent = stats.FAILED;

        renderPayments(payments);
    } catch (err) {
        console.error("Failed to load payments:", err);
    }
}

function renderPayments(payments) {
    const tbody = document.getElementById("paymentsTableBody");
    if (!tbody) return;
    tbody.innerHTML = "";

    if (!payments || payments.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;color:#999;padding:40px;">No payments found</td></tr>`;
        return;
    }

    payments.forEach(p => {
        const meta = paymentMetaStore[p.id] || {};
        const method = p.paymentMethod || meta.paymentMethod || "N/A";
        const fromDisplay = (method === "UPI")
            ? (p.payerUpiId || meta.payerUpiId || "-")
            : (p.sourceAccount || "-");
        const toDisplay = (method === "UPI")
            ? (p.payeeUpiId || meta.payeeUpiId || "-")
            : (p.destinationAccount || "-");

        tbody.innerHTML += `
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
    });
}

async function filterPayments() {
    const searchIdEl = document.getElementById("searchInput");
    const statusEl = document.getElementById("filterStatus");

    const searchId = searchIdEl ? searchIdEl.value.trim() : "";
    const status = statusEl ? statusEl.value : "";

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
        showMessage("No results found", "info");
    }
}

async function viewPaymentDetails(id) {
    try {
        const payment = await fetchJson(`${API_BASE}/${id}`);
        const history = await fetchJson(`${API_BASE}/${id}/history`);
        const meta = paymentMetaStore[id] || {};
        const method = payment.paymentMethod || meta.paymentMethod || "N/A";

        const fromDisplay = (method === "UPI")
            ? (payment.payerUpiId || meta.payerUpiId || "-")
            : (payment.sourceAccount || "-");
        const toDisplay = (method === "UPI")
            ? (payment.payeeUpiId || meta.payeeUpiId || "-")
            : (payment.destinationAccount || "-");

        let historyHtml = "";
        history.forEach(h => {
            historyHtml += `
                <div style="padding:12px;background:#f8fafc;border-left:3px solid #2563eb;margin-bottom:10px;">
                    <strong>${h.fromStatus || "START"} → ${h.toStatus}</strong><br>
                    <small style="color:#999;">${formatDate(h.changedAt)} | ${h.changedBy}</small><br>
                    <small>${h.note || "-"}</small>
                </div>
            `;
        });

        const body = document.getElementById("modalBody");
        if (!body) return;

        body.innerHTML = `
            <h2>Payment Details #${payment.id}</h2>
            <hr style="margin:20px 0;border:none;border-top:1px solid #e2e8f0;">
            <div style="margin-bottom:20px;">
                <p><strong>Method:</strong> ${method}</p>
                <p><strong>Amount:</strong> ${payment.amount} ${payment.currency}</p>
                <p><strong>From:</strong> ${fromDisplay}</p>
                <p><strong>To:</strong> ${toDisplay}</p>
                <p><strong>Description:</strong> ${payment.description || meta.description || "-"}</p>
                <p><strong>Status:</strong> <span class="status-badge ${getStatusClass(payment.status)}">${payment.status}</span></p>
                ${payment.status === "FAILED" ? `<p style="color:#dc2626;"><strong>${payment.errorCode}:</strong> ${payment.errorMessage || ""}</p>` : ""}
                <p><strong>Created:</strong> ${formatDate(payment.createdAt)}</p>
                <p><strong>Updated:</strong> ${formatDate(payment.updatedAt)}</p>
            </div>
            <h3>History</h3>
            ${historyHtml}
        `;

        const detailsModal = document.getElementById("detailsModal");
        if (detailsModal) detailsModal.classList.add("show");
    } catch (err) {
        showMessage(`Error: ${err.message || "Could not load payment details"}`, "error");
    }
}

function closeModal() {
    const detailsModal = document.getElementById("detailsModal");
    if (detailsModal) detailsModal.classList.remove("show");
}

function buildPayload() {
    const amountEl = document.getElementById("amount");
    const currencyEl = document.getElementById("currency");
    const referenceEl = document.getElementById("reference");

    const amount = Number(amountEl ? amountEl.value : 0);
    const currency = currencyEl ? currencyEl.value : "INR";
    const description = referenceEl ? referenceEl.value : "";

    if (!amount || amount <= 0) {
        throw { errorCode: "VALIDATION_FAILED", message: "Amount must be greater than 0" };
    }

    let sourceAccount = "ACC1001";
    let destinationAccount = "ACC2002";
    let payerUpiId = "";
    let payeeUpiId = "";

    if (currentTab === "upi") {
        const payerEl = document.getElementById("payerUpiId");
        const payeeEl = document.getElementById("payeeUpiId");

        payerUpiId = payerEl ? payerEl.value.trim() : "";
        payeeUpiId = payeeEl ? payeeEl.value.trim() : "";

        if (!payerUpiId || !payeeUpiId) {
            throw { errorCode: "VALIDATION_FAILED", message: "Both UPI IDs are required" };
        }
    } else if (currentTab === "netbanking") {
        const srcEl = document.getElementById("sourceAccount");
        const dstEl = document.getElementById("destinationAccount");

        sourceAccount = srcEl ? srcEl.value.trim() : "";
        destinationAccount = dstEl ? dstEl.value.trim() : "";

        if (!sourceAccount || !destinationAccount) {
            throw { errorCode: "VALIDATION_FAILED", message: "Source and destination account required for Net Banking" };
        }
    } else {
        sourceAccount = "ACC1001";
        destinationAccount = "ACC2002";
    }

    return {
        idempotencyKey: "",
        paymentMethod: currentTab.toUpperCase(),
        amount: amount.toFixed(2),
        currency,
        payerUpiId,
        payeeUpiId,
        description,
        sourceAccount,
        destinationAccount
    };
}

/* -------------------- Event Hooks -------------------- */
document.getElementById("paymentForm").addEventListener("submit", async function (e) {
    e.preventDefault();
    try {
        const idempotencyKey = generateUUID();
        const payload = buildPayload();
        payload.idempotencyKey = idempotencyKey;

        const result = await fetchJson(API_BASE, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Idempotency-Key": idempotencyKey
            },
            body: JSON.stringify(payload)
        });

        paymentMetaStore[result.id] = {
            paymentMethod: payload.paymentMethod,
            payerUpiId: payload.payerUpiId,
            payeeUpiId: payload.payeeUpiId,
            description: payload.description
        };

        // Success popup
        showSuccessModal(`Payment created successfully.\nPayment ID: #${result.id}`);

        resetForm();
        loadDashboard();
        window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
        showMessage(`❌ ${err.errorCode || "ERROR"}: ${err.message || "Payment creation failed"}`, "error");
    }
});

document.addEventListener("DOMContentLoaded", () => {
    ensureSuccessModal();

    document.querySelectorAll(".tab-button").forEach(btn => {
        btn.addEventListener("click", () => switchTab(btn.dataset.tab));
    });

    const currencyEl = document.getElementById("currency");
    if (currencyEl) {
        currencyEl.addEventListener("change", updateCurrencySymbol);
    }

    updateCurrencySymbol();
    loadDashboard();
    setInterval(loadDashboard, 5000);
    switchTab("upi");
});

document.getElementById("detailsModal").addEventListener("click", function (e) {
    if (e.target === this) closeModal();
});