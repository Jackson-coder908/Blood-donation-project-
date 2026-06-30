// --- Add this to your existing main.js ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Existing Navigation Logic
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
        manageNavigationLinks(currentUser);
        
        // 2. TRIGGER THE FILLING OF FIELDS
        fillDonorProfile(currentUser);
    }
});

function fillDonorProfile(user) {
    // Fill text elements if they exist
    const ageEl = document.getElementById('ageDisplay');
    const weightEl = document.getElementById('weightDisplay');
    const nameEl = document.querySelector('.donor-name'); // Ensure your HTML class matches

    if (ageEl && user.dob) {
        const birthDate = new Date(user.dob);
        const age = new Date().getFullYear() - birthDate.getFullYear();
        ageEl.textContent = `Age: ${age}`;
    }
    
    if (weightEl && user.weight) {
        weightEl.textContent = `Weight: ${user.weight} kg`;
    }
    
    if (nameEl && user.name) {
        nameEl.textContent = user.name;
    }
    
    console.log("Profile Data Loaded:", user); // Check the console!
}
// --- 1. CORE SYSTEM DASHBOARD LOGIC ---
document.addEventListener('DOMContentLoaded', () => {
    const currentPath = window.location.pathname;
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    // Dynamic Navigation
    manageNavigationLinks(currentUser);

    // Auto-fill logic (Unified)
    if (currentUser) {
        syncProfileData(currentUser);
    }

    // Route Security
    if (currentPath.includes('blood-stock.html')) {
        const sessionToken = localStorage.getItem('token');
        const userRole = localStorage.getItem('role');
        if (!sessionToken || userRole !== 'recipient') {
            alert("Access Denied: Recipient account required.");
            window.location.href = "../index.html"; 
        }
    }

    setupActionListeners();
});

// --- 2. PROFILE SYNC (Autofill) ---
function syncProfileData(user) {
    // MAPPING: HTML Input ID -> User Object Key
    // Adjust the right side if your object keys are different (e.g., 'name' instead of 'firstName')
    const fieldMap = {
        'firstName': 'firstName',
        'lastName': 'lastName',
        'email': 'email',
        'phone': 'phone',
        'dob': 'dob',
        'weight': 'weight',
        'firstNameInput': 'firstName',
        'lastNameInput': 'lastName',
        'emailInput': 'email',
        'phoneInput': 'phone',
        'weightInput': 'weight'
    };

    Object.keys(fieldMap).forEach(id => {
        const input = document.getElementById(id);
        if (input && input.value === "") {
            input.value = user[fieldMap[id]] || "";
        }
    });
}

// --- 3. NAVIGATION & UI HELPERS ---
function manageNavigationLinks(user) {
    const navDashboardLink = document.getElementById('navDashboardLink');
    if (navDashboardLink && user) {
        navDashboardLink.textContent = `Dashboard: ${user.name || user.username || 'User'}`;
    }
}

// --- 4. ACTION LISTENERS (Simulation, Cancel, Delete) ---
function setupActionListeners() {
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('simulate-btn')) {
            alert("Donation simulation started for: " + (e.target.dataset.hospital || "Selected Facility"));
        }

        if (e.target.id === 'cancelDonationBtn' || e.target.classList.contains('cancel-btn')) {
            e.preventDefault();
            if (confirm("Cancel upcoming donation?")) {
                const statusCard = e.target.closest('.card') || e.target.parentElement;
                if (statusCard) statusCard.innerHTML = `<h3>⚠️ No Active Donations</h3>`;
            }
        }

        if (e.target.id === 'deleteBtn' || e.target.classList.contains('account-delete-btn')) {
            e.preventDefault();
            if (confirm("Clear session and sign out?")) {
                localStorage.clear(); // Clear all data
                window.location.href = "../index.html";
            }
        }
    });
}

// --- 5. GLOBAL UI EFFECTS (Scroll, Menu) ---
window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 40);
});

const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
        mobileMenu.classList.toggle('open');
        document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
    });
}