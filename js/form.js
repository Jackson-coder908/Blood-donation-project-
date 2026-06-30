document.getElementById('donateForm').addEventListener('submit', async function(e) {
    e.preventDefault(); 

    // 1. Gather all data including fields required by your dashboard
    const formData = {
        firstName: document.getElementById('firstName').value.trim(),
        lastName: document.getElementById('lastName').value.trim(),
        email: document.getElementById('email').value.trim(),
        password: document.getElementById('password').value,
        bloodType: document.getElementById('bloodType').value,
        district: document.getElementById('city').value,
        dob: document.getElementById('dob').value,
        weight: document.getElementById('weight').value,
        selectedCenter: globallySelectedHospitalName,
        nextDonationDate: calculateEligibility() 
    };

    const fullName = `${formData.firstName} ${formData.lastName}`;

    // 2. Validate selection
    if (!formData.district || !formData.selectedCenter) {
        alert("Please pick a clinic from the map before confirming!");
        return;
    }

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            // 🌟 THE CRITICAL FIX: Use localStorage so the dashboard can read it 🌟
            localStorage.setItem('currentUser', JSON.stringify({
                ...formData,
                name: fullName
            }));
            
            // Set role so your security guard in main.js doesn't block you
            localStorage.setItem('role', 'recipient'); 

            alert(`🎉 Registration Successful, ${fullName}!`);
            window.location.href = "donor-portal.html"; 
        } else {
            alert('Database storage error. Please try again.');
        }
    } catch (error) {
        console.error('Network Error:', error);
        alert('Could not connect to the registration server.');
    }
});

// Helper for medical cooldown
function calculateEligibility() {
    const donatedYes = document.getElementById('donatedYes').checked;
    if (donatedYes) {
        const lastDonationValue = document.getElementById('lastDonationDate').value;
        if (!lastDonationValue) return new Date().toISOString().split('T')[0];
        
        let lastDate = new Date(lastDonationValue);
        lastDate.setDate(lastDate.getDate() + 90);
        return lastDate.toISOString().split('T')[0];
    }
    return document.getElementById('date').value || new Date().toISOString().split('T')[0];
}