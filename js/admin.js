const API_URL = 'http://localhost:5000/donors';

async function fetchDonors() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json(); // This is the JSON coming from the server
        
        const tableBody = document.getElementById('donorTableBody');
        tableBody.innerHTML = ''; // Clear old data

        data.forEach(donor => {
            tableBody.innerHTML += `
                <tr>
                    <td>${donor.name}</td>
                    <td>${donor.bloodType}</td>
                    <td>${donor.city}</td>
                    <td>${donor.phone}</td>
                    <td>
                        <button onclick="deleteDonor(${donor.id})" style="background:red; color:white;">Delete</button>
                    </td>
                </tr>
            `;
        });
    } catch (err) {
        console.error("Error loading donors:", err);
    }
}

async function deleteDonor(id) {
    if (confirm("Delete this donor?")) {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        fetchDonors(); // Reload the list
    }
}

// Load data when page opens
window.onload = fetchDonors;