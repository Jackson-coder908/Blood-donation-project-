// Add this to your top-level JS file
document.addEventListener('DOMContentLoaded', () => {
    const session = sessionStorage.getItem('lifeFlowSession');
    // If they are on a login/register page but ALREADY have a session, push them to dashboard
    if (session && (window.location.pathname.includes('login') || window.location.pathname.includes('register'))) {
        window.location.href = "donor-portal.html"; // Your dashboard page
    }
});
// --- EXISTING UI FEATURES ---
console.log("LifeFlow Dashboard Script Connected & Running!");

const navbar = document.getElementById('navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  });
}

// Hamburger menu
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
    document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
  });
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

// Scroll reveal
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.card, .step, .testimonial, .elig-col').forEach(el => {
  el.classList.add('reveal');
  observer.observe(el);
});

const style = document.createElement('style');
style.textContent = `
  .reveal { opacity: 0; transform: translateY(20px); transition: opacity 0.6s ease, transform 0.6s ease; }
  .reveal.visible { opacity: 1; transform: translateY(0); }
`;
document.head.appendChild(style);


// --- CORE SYSTEM DASHBOARD LOGIC ---
document.addEventListener('DOMContentLoaded', () => {
    const currentPath = window.location.pathname;
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    // 1. Clear Confusion: Dynamic Navigation Links Based on User Type
    manageNavigationLinks(currentUser);

    if (currentUser) {
        // 2. Map & Sync Real User Profiles into Forms/Dashboards
        syncProfileDashboard(currentUser);
    }

    // 3. Route Security Guard
    if (currentPath.includes('blood-stock.html')) {
        const sessionToken = localStorage.getItem('token');
        const userRole = localStorage.getItem('role');
        if (!sessionToken || userRole !== 'recipient') {
            alert("Access Denied: Recipient/Administrative account required.");
            window.location.href = "../index.html"; 
        }
    }

    // 4. Set Up Dynamic Event Listeners (Simulation Buttons, Canceling, and Deleting)
    setupActionListeners();
});


// --- HELPER OPERATIONS ---

// Clears layout confusion by hiding/showing valid links for logged in users
function manageNavigationLinks(user) {
    const navDashboardLink = document.getElementById('navDashboardLink');
    if (!navDashboardLink || !user) return;

    // Remove "Recipient" or "Donor" labels, just show "Dashboard: Name"
    navDashboardLink.textContent = `Dashboard: ${user.name || user.username}`;
}
function desktopCtaUpdate(text) {
    const desktopCta = document.querySelector('.nav-cta');
    const mobileCta = document.querySelector('.mobile-cta');
    if (desktopCta) desktopCta.innerHTML = text;
    if (mobileCta) mobileCta.innerHTML = text;
}

// Automatically binds database values to elements to prevent blank states
function syncProfileDashboard(user) {
    // Map your user object fields to the HTML Input IDs
    const fieldMap = {
        'firstNameInput': user.firstName,
        'lastNameInput': user.lastName,
        'emailInput': user.email,
        'phoneInput': user.phone,
        'dobInput': user.dob,
        'weightInput': user.weight,
        'bloodTypeInput': user.bloodGroup
    };

    // Loop through the map and fill if the element exists
    for (const [id, value] of Object.entries(fieldMap)) {
        const element = document.getElementById(id);
        if (element && element.tagName === 'INPUT') {
            element.value = value || "";
            // Optional: Disable these inputs if you don't want them edited during donation
            // element.disabled = true; 
        }
    }
}
// Unified Event Handling for interactive elements
function setupActionListeners() {
    // Main target document click tree
    document.addEventListener('click', (e) => {
        
        // A. Handle Simulation Action Trigger
        if (e.target && e.target.classList.contains('simulate-btn')) {
            alert("Success: Donation simulation process started for " + (e.target.dataset.hospital || "Selected Facility"));
        }

        // B. FIX: Handle "Cancel / Delete Next Donation" Operation
        if (e.target && (e.target.id === 'cancelDonationBtn' || e.target.classList.contains('cancel-btn'))) {
            e.preventDefault();
            if (confirm("Are you sure you want to cancel your upcoming scheduled donation?")) {
                // Update interface to confirm cancel without requiring hard refresh
                const statusCard = e.target.closest('.card') || e.target.parentElement;
                if (statusCard) {
                    statusCard.innerHTML = `<h3 style="color: #dc3545;">⚠️ No Active Donations Scheduled</h3><p>You can book or simulate a new transaction below.</p>`;
                }
                alert("Appointment cleanly canceled.");
            }
        }

        // C. Complete Dashboard Profile Deletion/Logout Execution
        if (e.target && (e.target.id === 'deleteBtn' || e.target.classList.contains('account-delete-btn'))) {
            e.preventDefault();
            if (confirm("Are you sure you want to clear your current session and sign out?")) {
                localStorage.removeItem('currentUser');
                localStorage.removeItem('token');
                localStorage.removeItem('role');
                alert("Logged out successfully.");
                window.location.href = "../index.html"; 
            }
        }
    });
}