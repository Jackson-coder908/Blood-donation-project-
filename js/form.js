// =========================================================================
// 🌐 LIFEFLOW INTEGRATED PROXIMITY ENGINE & ELIGIBILITY CALCULATOR
// =========================================================================

// 1. MAP SETUP: Initialize Leaflet Map centered over Kerala
const map = L.map('map').setView([10.5, 76.5], 7); 
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
}).addTo(map);

let activeMapMarker = null;
let globallySelectedHospitalName = ""; // Tracks the actual name of the chosen hospital

// 2. MATH: Haversine Formula (Distance Calculation)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

// 3. REGION TRACKER: Maps coordinates back to clean parent districts
function determineDistrictFromCoords(lat, lng) {
    if (lat > 12.3) return "Kasaragod";
    if (lat > 11.65) return "Kannur";
    if (lat > 11.4 && lat <= 11.65) return "Wayanad";
    if (lat > 11.1 && lat <= 11.4) return "Kozhikode";
    if (lat > 10.85 && lat <= 11.1) return "Malappuram";
    if (lat > 10.5 && lat <= 10.85) return "Palakkad";
    if (lat > 10.15 && lat <= 10.5) return "Thrissur";
    if (lat > 9.8 && lat <= 10.15) return "Ernakulam";
    if (lat > 9.65 && lat <= 9.8) return "Idukki";
    if (lat > 9.45 && lat <= 9.65) return "Kottayam";
    if (lat > 9.15 && lat <= 9.45) return "Alappuzha"; 
    if (lat > 9.0 && lat <= 9.15) return "Pathanamthitta";
    if (lat > 8.75 && lat <= 9.0) return "Kollam";
    return "Thiruvananthapuram"; 
}

// 4. UI HELPER: Update Display container styles
function updateSelectedCamp(districtName, campTitle, distance = null) {
    const display = document.getElementById('selected-camp-display');
    const hiddenInput = document.getElementById('city');

    hiddenInput.value = districtName; // Keeps backend district routing intact
    globallySelectedHospitalName = campTitle; // Saves hospital name for profile page mapping
    
    display.innerHTML = `✅ <b>Target Hub Selected:</b> ${campTitle} <br>🏡 Region Node mapped to <b>${districtName}</b> ${distance ? `(${distance.toFixed(1)} km away)` : ''}`;
    display.style.border = "1px solid #2ecc71";
    display.style.background = "#f0fff4";
}

// 5. THE LIVE API INTERACTION FLOW WITH EXPANSION LOGIC
document.getElementById('findNearestBtn').addEventListener('click', () => {
    const display = document.getElementById('selected-camp-display');
    if (!navigator.geolocation) return alert("Geolocation is not supported by your browser.");

    display.innerHTML = `<div style="text-align: center; color: #718096;">🌐 Filtering live location streams for premium blood donation hubs...</div>`;

    navigator.geolocation.getCurrentPosition(async (position) => {
        const uLat = position.coords.latitude;
        const uLng = position.coords.longitude;

        let delta = 0.10; 
        let data = { elements: [] };
        
        for (let run = 0; run < 2; run++) {
            const minLat = uLat - delta, maxLat = uLat + delta;
            const minLng = uLng - delta, maxLng = uLng + delta;
            
            const overpassUrl = `https://overpass-api.de/api/interpreter?data=[out:json];(node["amenity"="hospital"](${minLat},${minLng},${maxLat},${maxLng});way["amenity"="hospital"](${minLat},${minLng},${maxLat},${maxLng});rel["amenity"="hospital"](${minLat},${minLng},${maxLat},${maxLng}););out center;`;

            try {
                const response = await fetch(overpassUrl);
                data = await response.json();
                if (data.elements && data.elements.length >= 6) break;
            } catch (err) {
                console.error("API Fetch error, scaling radius...", err);
            }
            delta = 0.25; 
        }

        try {
            if (!data.elements || data.elements.length === 0) {
                display.innerHTML = `⚠️ No major hospital centres found nearby. Please try again!!`;
                updateSelectedCamp("Alappuzha", "General Hospital, Mavelikara", null);
                return;
            }

            const seenNames = new Set(); 
            let liveCamps = [];

            data.elements.forEach(el => {
                if (!el.tags || !el.tags.name) return;

                let name = el.tags.name.trim();
                name = name.replace(/Mavelikkara/g, "Mavelikara"); 
                const lowerName = name.toLowerCase();

                if (lowerName.includes("speech") || lowerName.includes("therapy") || 
                    lowerName.includes("dental") || lowerName.includes("ayurveda") || 
                    lowerName.includes("homeo") || lowerName.includes("polyclinic")) {
                    return;
                }

                if (seenNames.has(lowerName)) return;
                seenNames.add(lowerName);

                const latCoord = el.lat || (el.center && el.center.lat);
                const lngCoord = el.lon || (el.center && el.center.lon);
                
                const distance = calculateDistance(uLat, uLng, latCoord, lngCoord);
                const district = determineDistrictFromCoords(latCoord, lngCoord);

                if (distance > 25) return; 

                let priorityScore = 0;
                if (lowerName.includes("district") || lowerName.includes("general") || lowerName.includes("taluk") || lowerName.includes("medical college")) {
                    priorityScore = 1; 
                }

                liveCamps.push({ name, lat: latCoord, lng: lngCoord, distance, district, priorityScore });
            });

            if (liveCamps.length === 0) {
                display.innerHTML = `⚠️ No blood-donation eligible centers found nearby. Defaulting...`;
                updateSelectedCamp("Alappuzha", "General Hospital, Mavelikara", null);
                return;
            }

            liveCamps.sort((a, b) => {
                if (b.priorityScore !== a.priorityScore) return b.priorityScore - a.priorityScore; 
                return a.distance - b.distance; 
            });

            const top5Camps = liveCamps.slice(0, 5);

            let listHTML = `
                <p style="margin: 0 0 10px 0; font-size: 0.85rem; font-weight: bold; color: #2d3748; text-align: left;">
                    🎯 Major Donation Centers Found near you. Tap to select:
                </p>
                <div id="hospital-selection-zone" style="display: flex; flex-direction: column; gap: 8px;">
            `;

            top5Camps.forEach((camp) => {
                const tagLabel = camp.priorityScore === 1 ? "⭐ Core Blood Hub" : "🏥 Major Hospital Hub";
                listHTML += `
                    <div class="hospital-option-node" 
                         data-district="${camp.district}" 
                         data-name="${camp.name}"
                         data-lat="${camp.lat}"
                         data-lng="${camp.lng}"
                         data-dist="${camp.distance}"
                         style="padding: 10px; background: #fff; border: 1px solid #e2e8f0; border-radius: 6px; cursor: pointer; transition: all 0.2s ease; text-align: left;">
                        <div style="font-weight: 600; font-size: 0.9rem; color: #1a202c;">${camp.name}</div>
                        <div style="font-size: 0.75rem; color: #718096; margin-top: 2px;">
                            <strong>${tagLabel}</strong> | 📍 ${camp.district} | 🗺️ <strong>${camp.distance.toFixed(1)} km away</strong>
                        </div>
                    </div>
                `;
            });

            listHTML += `</div>`;
            display.innerHTML = listHTML;

            const optionNodes = display.querySelectorAll('.hospital-option-node');
            optionNodes.forEach(node => {
                node.addEventListener('click', function() {
                    optionNodes.forEach(opt => {
                        opt.style.borderColor = '#e2e8f0';
                        opt.style.background = '#fff';
                    });

                    this.style.borderColor = '#2ecc71';
                    this.style.background = '#f0fff4';

                    const distName = this.getAttribute('data-district');
                    const campName = this.getAttribute('data-name');
                    const cLat = parseFloat(this.getAttribute('data-lat'));
                    const cLng = parseFloat(this.getAttribute('data-lng'));
                    const cDist = parseFloat(this.getAttribute('data-dist'));

                    updateSelectedCamp(distName, campName, cDist);

                    if (activeMapMarker) map.removeLayer(activeMapMarker);
                    map.flyTo([cLat, cLng], 15);
                    activeMapMarker = L.marker([cLat, cLng]).addTo(map).bindPopup(campName).openPopup();
                });
            });

        } catch (err) {
            console.error("API process error:", err);
            display.textContent = "⚠️ Error compiling live data stream. Please try again.";
        }
    }, () => {
        alert("Location mapping offline. Reverting field routing settings to Ernakulam Hub.");
        updateSelectedCamp("Ernakulam", "General Hospital, Ernakulam", null);
    });
});

// 6. SUBMISSION WITH BCRYPT ROUTING & MEDICAL DATE COOLDOWN ENGINE
document.getElementById('donateForm').addEventListener('submit', async function(e) {
    e.preventDefault(); 

    const emailValue = document.getElementById('email').value.trim();
    const passwordValue = document.getElementById('password').value;
    const selectedBlood = document.getElementById('bloodType').value;
    const selectedDistrict = document.getElementById('city').value;

    if (!selectedDistrict || !globallySelectedHospitalName) {
        alert("Please pick a custom clinic selection from the live mapping menu framework before confirming your profile!");
        return;
    }

    // --- MEDICAL COOLDOWN DATE CALCULATION LOGIC ---
    const donatedYes = document.getElementById('donatedYes').checked;
    let nextDonationDateStr = "";

    if (donatedYes) {
        const lastDonationValue = document.getElementById('lastDonationDate').value;
        if (!lastDonationValue) {
            alert("Please provide the date of your last blood donation.");
            return;
        }
        
        // Calculate 90 days out from their last whole blood donation
        let lastDate = new Date(lastDonationValue);
        lastDate.setDate(lastDate.getDate() + 90); 
        
        // Format calculation to clean local readable format (YYYY-MM-DD)
        nextDonationDateStr = lastDate.toISOString().split('T')[0];
    } else {
        // First-time donors are eligible immediately or on their chosen target appointment date
        const preferredDate = document.getElementById('date').value || new Date().toISOString().split('T')[0];
        nextDonationDateStr = preferredDate;
    }

    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const fullName = `${firstName} ${lastName}`;

    const signupData = {
        username: emailValue,      
        password: passwordValue,   
        bloodType: selectedBlood,
        district: selectedDistrict
    };

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(signupData)
        });

        const data = await response.json();

        if (response.ok) {
            // 🌟 SAVE PARAMETERS TO SESSION MEMORY FOR YOUR USER PROFILE PAGE DISPLAY 🌟
            sessionStorage.setItem('currentDonorName', fullName);
            sessionStorage.setItem('currentDonorBlood', selectedBlood);
            sessionStorage.setItem('selectedCenterName', globallySelectedHospitalName);
            sessionStorage.setItem('nextDonationEligibility', nextDonationDateStr);

            alert(`🎉 Registration Successful!\nWelcome to LifeFlow, ${fullName}. Moving over to log you in.`);
            window.location.href = "login.html"; 
        } else {
            alert(data.error || 'Database storage pipeline update error.');
        }
    } catch (error) {
        console.error('Network Error:', error);
        alert('Could not hook data stream to local routing terminal.');
    }
});

// --- TOGGLES CONTROL ARRAYS ---
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