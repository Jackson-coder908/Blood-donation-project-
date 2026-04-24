// 1. DATA: List of major hospitals across Kerala
const campData = [
    { name: "General Hospital, Mavelikara", lat: 9.2435, lng: 76.5492 },
    { name: "TD Medical College, Vandanam", lat: 9.4623, lng: 76.3507 },
    { name: "Taluk Hospital, Kottarakkara", lat: 8.9987, lng: 76.7801 },
    { name: "District Hospital, Kollam", lat: 8.8878, lng: 76.5888 },
    { name: "General Hospital, Ernakulam", lat: 9.9763, lng: 76.2803 },
    { name: "Medical College, TVM", lat: 8.5241, lng: 76.9272 },
    { name: "Medical College, Kozhikode", lat: 11.2742, lng: 75.8344 }
    // Tip: Add more hospitals here to cover all areas of Kerala!
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

// 6. SUBMISSION: Send to Backend
document.getElementById('donateForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const bloodType = document.getElementById('bloodType').value;
    const city = document.getElementById('city').value; // This is the hidden input filled by the map
    const phone = document.getElementById('phone').value;

    // Validation: Ensure a camp was actually selected
    if (!city) {
        alert("Please click 'Find Nearest Camp' or select a location on the map first!");
        return;
    }

    const donorData = {
        name: `${firstName} ${lastName}`,
        bloodType: bloodType,
        city: city,
        phone: phone
    };

    try {
        const response = await fetch('http://localhost:5000/donors', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(donorData)
        });

        if (response.ok) {
            document.getElementById('donateForm').style.display = 'none';
            document.getElementById('formSuccess').style.display = 'block';
        } else {
            alert("Submission failed. Check if server is running.");
        }
    } catch (error) {
        console.error('Error:', error);
        alert("Connection Error: Is index.js running on port 5000?");
    }
});