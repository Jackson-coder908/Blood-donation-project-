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