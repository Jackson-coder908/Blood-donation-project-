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
    const navLinksContainer = document.querySelector('.nav-links'); // Target your header row
    if (!navLinksContainer || !user) return;

    // Check what role they have inside the database object
    const role = user.role || localStorage.getItem('role');

    if (role === 'donor') {
        // Donors don't need administrative tables; show setup for scheduling/history
        desktopCtaUpdate(`👤 Donor: ${user.name || user.username}`);
    } else if (role === 'recipient') {
        // Recipients see match options and inventory systems
        desktopCtaUpdate(`🏥 Recipient: ${user.name || user.username}`);
    }
}

function desktopCtaUpdate(text) {
    const desktopCta = document.querySelector('.nav-cta');
    const mobileCta = document.querySelector('.mobile-cta');
    if (desktopCta) desktopCta.innerHTML = text;
    if (mobileCta) mobileCta.innerHTML = text;
}

// Automatically binds database values to elements to prevent blank states
function syncProfileDashboard(user) {
    // Top banner dynamic display tags
    const txtName = document.getElementById('donorName');
    const txtBlood = document.getElementById('donorBloodGroup');
    
    if (txtName) txtName.textContent = user.name || user.username || "Active User";
    if (txtBlood) txtBlood.textContent = user.bloodGroup || "O+";

    // Input fields inside forms/simulations
    const inputName = document.getElementById("donorNameInput") || document.getElementById("donorName");
    const inputBlood = document.getElementById("bloodFilter") || document.getElementById("donorBloodGroupInput");
    const inputDist = document.getElementById("districtFilter");
    const inputWeight = document.getElementById("donorWeight");

    // Handle inputs versus plain text elements safely
    if (inputName && inputName.tagName === 'INPUT') inputName.value = user.name || user.username || "";
    if (inputBlood && inputBlood.tagName === 'INPUT') inputBlood.value = user.bloodGroup || "";
    if (inputDist && inputDist.tagName === 'INPUT') inputDist.value = user.district || "";
    if (inputWeight && inputWeight.tagName === 'INPUT') inputWeight.value = user.weight || "65"; // Fills placeholder static data
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