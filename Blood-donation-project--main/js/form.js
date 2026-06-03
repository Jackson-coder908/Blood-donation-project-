// 1. DATA: List of major hospitals across Kerala
const campData = [
    { name: "General Hospital, Mavelikara", lat: 9.2435, lng: 76.5492 },
    { name: "TD Medical College, Vandanam", lat: 9.4623, lng: 76.3507 },
    { name: "Taluk Hospital, Kottarakkara", lat: 8.9987, lng: 76.7801 },
    { name: "District Hospital, Kollam", lat: 8.8878, lng: 76.5888 },
    { name: "General Hospital, Ernakulam", lat: 9.9763, lng: 76.2803 },
    { name: "Medical College, TVM", lat: 8.5241, lng: 76.9272 },
    { name: "Medical College, Kozhikode", lat: 11.2742, lng: 75.8344 }
];

// 2. MAP SETUP: Initialize Leaflet Map
const map = L.map('map').setView([10.5, 76.5], 7); 
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
}).addTo(map);

// 3. UI HELPER: Update the Display and Hidden Input
function updateSelectedCamp(campName, distance = null) {
    const display = document.getElementById('selected-camp-display');
    const hiddenInput = document.getElementById('city');

    hiddenInput.value = campName;
    display.innerHTML = `✅ <b>Target Center:</b> ${campName} ${distance ? `<br>(${distance.toFixed(1)} km away)` : ''}`;
    display.style.border = "1px solid #2ecc71";
    display.style.background = "#f0fff4";
}

// 4. MATH: Haversine Formula to find the closest point
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

// 5. GEOLOCATION: The "Find Nearest" Button Logic
document.getElementById('findNearestBtn').addEventListener('click', () => {
    if (!navigator.geolocation) return alert("Geolocation is not supported by your browser.");

    navigator.geolocation.getCurrentPosition(position => {
        const uLat = position.coords.latitude;
        const uLng = position.coords.longitude;

        let closest = null;
        let minDest = Infinity;

        campData.forEach(camp => {
            const d = calculateDistance(uLat, uLng, camp.lat, camp.lng);
            if (d < minDest) {
                minDest = d;
                closest = camp;
            }
        });

        if (closest) {
            updateSelectedCamp(closest.name, minDest);
            map.flyTo([closest.lat, closest.lng], 15);
            L.marker([closest.lat, closest.lng]).addTo(map).bindPopup(closest.name).openPopup();
        }
    }, () => {
        alert("Unable to retrieve location. Please select manually on the map.");
    });
});

// 6. SUBMISSION & ELIGIBILITY VERIFICATION
document.getElementById('donateForm').addEventListener('submit', async function(e) {
    e.preventDefault(); 

    // --- ELIGIBILITY CHECK 1: Age Evaluation (18 to 65) ---
    const dobValue = document.getElementById('dob').value;
    const dobDate = new Date(dobValue);
    const today = new Date();
    
    let age = today.getFullYear() - dobDate.getFullYear();
    const monthDiff = today.getMonth() - dobDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dobDate.getDate())) {
        age--;
    }

    if (age < 18 || age > 65) {
        alert(`❌ Eligibility Denied: You must be between 18 and 65 years old to donate blood safely. Your calculated age is ${age}.`);
        return;
    }

    // --- ELIGIBILITY CHECK 2: Weight Evaluation (Minimum 50kg) ---
    const weight = parseInt(document.getElementById('weight').value, 10);
    if (weight < 50) {
        alert("❌ Eligibility Denied: You must weigh at least 50 kg to donate blood safely.");
        return;
    }

    // --- ELIGIBILITY CHECK 3: 90-Day Cooldown Timeline Evaluation ---
    const isPriorDonor = document.getElementById('donatedYes').checked;
    let lastDonationDate = "";

    if (isPriorDonor) {
        lastDonationDate = document.getElementById('lastDonationDate').value;
        const preferredAppointmentDate = new Date(document.getElementById('date').value);
        const pastDonationDate = new Date(lastDonationDate);

        // Convert the difference from milliseconds into calendar days
        const timeDiff = preferredAppointmentDate.getTime() - pastDonationDate.getTime();
        const daysSinceLastDonation = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

        if (daysSinceLastDonation < 90) {
            alert(`❌ Eligibility Denied: A minimum interval of 90 days is required between blood donations. It has only been ${daysSinceLastDonation} days since your last donation.`);
            return;
        }
    }

    // --- DATA PACKAGING ---
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const fullName = `${firstName} ${lastName}`;

    const formData = {
        name: fullName,
        bloodType: document.getElementById('bloodType').value,
        city: document.getElementById('city').value || "Unknown",
        phone: document.getElementById('phone').value,
        age: age,
        weight: weight,
        lastDonationDate: lastDonationDate
    };

    try {
        // Send data straight to your updated better-sqlite3 backend
        const response = await fetch('http://localhost:5000/donors', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            const result = await response.json();
            console.log('Donor validated and saved successfully:', result);
            
            // Hide the form interface and reveal success panel
            document.getElementById('donateForm').style.display = 'none';
            document.getElementById('formSuccess').style.display = 'block';
        } else {
            alert('Server error saving appointment. Please try again.');
        }
    } catch (error) {
        console.error('Network Error:', error);
        alert('Could not connect to the local server. Is your backend running?');
    }
});

// --- ELIGIBILITY CONDITIONAL FORM FIELDS TOGGLE ---
document.addEventListener('DOMContentLoaded', () => {
    const donatedYes = document.getElementById('donatedYes');
    const donatedNo = document.getElementById('donatedNo');
    const lastDonationGroup = document.getElementById('lastDonationGroup');
    const lastDonationInput = document.getElementById('lastDonationDate');

    if (donatedYes && donatedNo && lastDonationGroup) {
        donatedYes.addEventListener('change', () => {
            if (donatedYes.checked) {
                lastDonationGroup.style.display = 'block';
                lastDonationInput.setAttribute('required', 'true');
            }
        });

        donatedNo.addEventListener('change', () => {
            if (donatedNo.checked) {
                lastDonationGroup.style.display = 'none';
                lastDonationInput.removeAttribute('required');
                lastDonationInput.value = ''; 
            }
        });
    }
});