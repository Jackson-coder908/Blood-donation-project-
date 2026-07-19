const donationHistory = [
    { date: "Jan 10, 2026", type: "Whole Blood", center: "City Hospital", units: "1", status: "Completed" },
    { date: "Oct 12, 2025", type: "Plasma", center: "Red Cross", units: "1", status: "Completed" },
    { date: "Jun 05, 2025", type: "Whole Blood", center: "Downtown Medical", units: "1", status: "Completed" }
];

function renderDonationHistory() {
    const tableBody = document.getElementById('history-body');
    tableBody.innerHTML = '';
    
    // 1. Calculate values
    const totalDonations = donationHistory.length;
    const livesImpacted = totalDonations * 3;
    const totalUnits = donationHistory.reduce((sum, d) => sum + parseInt(d.units), 0);

    // 2. Inject into the DOM
    document.getElementById('statDonations').innerText = totalDonations;
    document.getElementById('statImpact').innerText = livesImpacted;
    document.getElementById('statVolume').innerText = totalUnits;
    
    // 3. Render the Table (as you had before)
    donationHistory.forEach(donation => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${donation.date}</td>
            <td>${donation.type}</td>
            <td>${donation.center}</td>
            <td>${donation.units}</td>
            <td><span class="status-tag">${donation.status}</span></td>
        `;
        tableBody.appendChild(row);
    });
}
function onLoginSuccess() {
    document.getElementById('loginView').style.display = 'none';
    document.getElementById('profileView').style.display = 'block';
    
    // Now call the function to fill the table
    renderDonationHistory();
}
document.addEventListener('DOMContentLoaded', () => {
    const savedUser = localStorage.getItem('currentUser');
    
    if (savedUser) {
        const user = JSON.parse(savedUser);
        
        // Show Profile View, Hide Login View
        document.getElementById('loginView').style.display = 'none';
        document.getElementById('profileView').style.display = 'block';

        // Inject Profile Details
        document.getElementById('profileName').textContent = user.name;
        document.getElementById('profileEmail').textContent = user.username;
        
        // Inject Dynamic Stats (if stats exist in the data)
        if (user.stats) {
            document.getElementById('statDonations').textContent = user.stats.total;
            document.getElementById('statImpact').textContent = user.stats.impact;
            document.getElementById('statVolume').textContent = user.stats.volume;
            document.getElementById('statEligibility').textContent = user.stats.daysLeft + 'd';
        }
        
        // Inject Appointment Center
        const center = sessionStorage.getItem('selectedCenterName');
        if (center) document.getElementById('dashboardApptCenter').textContent = center;
    }
});

// Auth Logic
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('loginEmail').value; // Fixed variable name
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('currentUser', JSON.stringify(data.user));
            window.location.reload();
        } else {
            // This will show you exactly what the server error is
            alert('Login failed: ' + (data.error || 'Unknown error'));
            console.error('Server error:', data);
        }
    } catch (err) {
        alert('Could not connect to server. Check terminal.');
        console.error('Fetch error:', err);
    }
});

// This ensures the table renders when the page finishes loading
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM loaded. Attempting to render history...");
    
    // Check if the element exists first
    const tableBody = document.getElementById('history-body');
    if (tableBody) {
        // Run the function
        renderDonationHistory();
        console.log("Function called!");
    } else {
        console.warn("Element #history-body not found yet.");
    }
});