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
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });

    if (response.ok) {
        const data = await response.json();
        // Save user AND stats to localStorage
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        window.location.reload();
    }
});