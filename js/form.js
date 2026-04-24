document.getElementById('donateForm').addEventListener('submit', async (e) => {
    e.preventDefault(); // This stops the page from refreshing or going to Formspree

    // 1. Gather the data from your form
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const fullName = `${firstName} ${lastName}`; // Combine names for the DB
    const bloodType = document.getElementById('bloodType').value;
    const city = document.getElementById('city').value; // Matches our updated HTML ID
    const phone = document.getElementById('phone').value;

    // 2. Create the JSON object to send to the waiter (API)
    const donorData = {
        name: fullName,
        bloodType: bloodType,
        city: city,
        phone: phone
    };

    try {
        // 3. Send the data to your local server
        const response = await fetch('http://localhost:5000/donors', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(donorData)
        });

        if (response.ok) {
            // 4. Show success message if everything went well
            document.getElementById('donateForm').style.display = 'none';
            document.getElementById('formSuccess').style.display = 'block';
        } else {
            alert("Something went wrong. Please try again.");
        }
    } catch (error) {
        console.error('Error:', error);
        alert("Server is not running! Make sure to start index.js.");
    }
});