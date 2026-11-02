import BASE_URL from "./config.js";

let pendingCartAction = null;
let leadModalLoadInProgress = false;

async function ensureLeadModalIsLoaded() {
    let modal = document.getElementById('leadModal');
    if (modal) return modal;

    let container = document.getElementById('lead-modal-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'lead-modal-container';
        document.body.appendChild(container);
    }

    if (leadModalLoadInProgress) return null;
    leadModalLoadInProgress = true;

    try {
        const isFile = location.protocol === "file:";
        const leadUrl = isFile ? "./lead.html" : "/lead.html";
        const response = await fetch(leadUrl);
        const html = await response.text();
        container.innerHTML = html;
        modal = document.getElementById('leadModal');
        return modal;
    } catch (err) {
        console.error('Lead modal load failed:', err);
        return null;
    } finally {
        leadModalLoadInProgress = false;
    }
}

window.openLeadModal = async function(actionElement = null) {
    if (actionElement) {
        pendingCartAction = actionElement;
    }
    let modal = document.getElementById('leadModal');
    if (!modal) {
        modal = await ensureLeadModalIsLoaded();
    }
    if (modal) {
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
        // Reset to form view if not submitted
        const formContainer = document.getElementById('leadFormContainer');
        const successContainer = document.getElementById('leadSuccessContainer');
        if (formContainer && successContainer) {
            if (localStorage.getItem('leadFilled') === 'true') {
                formContainer.classList.add('hidden');
                successContainer.classList.remove('hidden');
            } else {
                formContainer.classList.remove('hidden');
                successContainer.classList.add('hidden');
            }
        }
    }
};

window.closeLeadModal = function() {
    const modal = document.getElementById('leadModal');
    if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';
    }
    sessionStorage.setItem('diwaliPopupSeen', 'true');
    pendingCartAction = null;
};

window.copyDiwaliCoupon = function() {
    const code = "DIWALI20";
    navigator.clipboard.writeText(code).then(() => {
        const btn = document.getElementById('copyCouponBtn');
        if (btn) {
            const originalHtml = btn.innerHTML;
            btn.innerHTML = `<i class="fa-solid fa-check"></i> <span>COPIED! 🎉</span>`;
            btn.classList.add('bg-emerald-600');
            setTimeout(() => {
                btn.innerHTML = originalHtml;
                btn.classList.remove('bg-emerald-600');
            }, 2500);
        }
    }).catch(() => {
        alert("Coupon Code: " + code);
    });
};

document.addEventListener('click', (event) => {
    const isCloseBtn = event.target.closest('#closeLeadModal') || 
                       event.target.closest('.close-modal-btn') || 
                       event.target.innerText === '×' || 
                       event.target.textContent.trim() === '×';
    if (isCloseBtn) {
        event.preventDefault();
        event.stopPropagation();
        window.closeLeadModal();
        return;
    }
    const modal = document.getElementById('leadModal');
    if (modal && event.target === modal) {
        window.closeLeadModal();
    }
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        window.closeLeadModal();
    }
});

window.handleCartButtonClick = function(buttonElement) {
    const isLeadFilled = localStorage.getItem('leadFilled');
    if (isLeadFilled === 'true') {
        if (typeof window.toggleCartState === 'function') {
            window.toggleCartState(buttonElement);
        } else if (typeof toggleCartState === 'function') {
            toggleCartState(buttonElement);
        } else {
            console.error("Critical: toggleCartState handler missing on this layout viewport.");
        }
    } else {
        window.openLeadModal(buttonElement);
    }
};

window.handleLeadSubmit = async function(event) {
    event.preventDefault();
    const nameInput = document.getElementById('leadName');
    const emailInput = document.getElementById('leadEmail');
    const errorEl = document.getElementById('leadFormError');
    const submitBtn = document.getElementById('leadSubmitBtn');

    const name = nameInput?.value?.trim();
    const email = emailInput?.value?.trim();

    if (errorEl) {
        errorEl.classList.add('hidden');
        errorEl.innerText = '';
    }

    if (!name || !email) {
        if (errorEl) {
            errorEl.innerText = "Please fill both Name and Email to claim your 20% OFF!";
            errorEl.classList.remove('hidden');
        } else {
            alert("Please fill both Name and Email.");
        }
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        if (errorEl) {
            errorEl.innerText = "Please enter a valid email address.";
            errorEl.classList.remove('hidden');
        } else {
            alert("Please enter a valid email address.");
        }
        return;
    }

    let originalBtnText = "";
    if (submitBtn) {
        originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> <span>Claiming Discount...</span>`;
        submitBtn.disabled = true;
    }

    try {
        const response = await fetch(`${BASE_URL}/api/lead/newlead`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name,
                email,
                source: "Diwali 20% OFF Popup"
            })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            localStorage.setItem('leadFilled', 'true');
            localStorage.setItem('diwaliCoupon', 'DIWALI20');
            sessionStorage.setItem('diwaliPopupSeen', 'true');

            // Switch to Celebratory Coupon Code Screen
            const formContainer = document.getElementById('leadFormContainer');
            const successContainer = document.getElementById('leadSuccessContainer');
            if (formContainer && successContainer) {
                formContainer.classList.add('hidden');
                successContainer.classList.remove('hidden');
            }

            // If user was triggering a cart button action, continue
            if (pendingCartAction) {
                if (typeof window.toggleCartState === 'function') {
                    window.toggleCartState(pendingCartAction);
                } else if (typeof toggleCartState === 'function') {
                    toggleCartState(pendingCartAction);
                }
            }
        } else {
            const msg = data.error || data.message || "Could not claim offer. Please check your details.";
            if (errorEl) {
                errorEl.innerText = msg;
                errorEl.classList.remove('hidden');
            } else {
                alert(msg);
            }
        }
    } catch (err) {
        console.error("Lead submission network error:", err);
        const msg = "Network error. Please try again or check connection.";
        if (errorEl) {
            errorEl.innerText = msg;
            errorEl.classList.remove('hidden');
        } else {
            alert(msg);
        }
    } finally {
        if (submitBtn) {
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
        }
    }
};

// 🪔 Auto-trigger Diwali Special Popup on Customer Pages
function initDiwaliPopupAutoTrigger() {
    const path = (window.location.pathname || "").toLowerCase();
    const isAdmin = path.includes("admin") || path.includes("login") || path.includes("register");
    if (isAdmin) return;

    const alreadyClaimed = localStorage.getItem('leadFilled') === 'true';
    const seenThisSession = sessionStorage.getItem('diwaliPopupSeen') === 'true';

    if (!alreadyClaimed && !seenThisSession) {
        // Show after 3.5 seconds
        setTimeout(async () => {
            const stillNotSeen = sessionStorage.getItem('diwaliPopupSeen') !== 'true';
            const stillNotClaimed = localStorage.getItem('leadFilled') !== 'true';
            if (stillNotSeen && stillNotClaimed) {
                await window.openLeadModal();
            }
        }, 3500);
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initDiwaliPopupAutoTrigger);
} else {
    initDiwaliPopupAutoTrigger();
}
