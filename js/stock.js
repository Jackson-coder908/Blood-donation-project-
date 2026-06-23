let inventoryChartInstance = null;

async function fetchDashboardMetrics() {
    const timeEl = document.getElementById('timestamp');
if (timeEl) {
    timeEl.textContent = "Last sync: " + new Date().toLocaleTimeString();
}
    try {
        const response = await fetch('/api/requests');
        const data = await response.json();

        if (!data || data.length === 0) {
            console.warn("No data received from API.");
            return;
        }

        // AUTO-DETECT FIELD NAMES
        // This checks if your data uses 'district' or 'location' or 'hospitalName'
        const firstItem = data[0];
        const districtKey = Object.keys(firstItem).find(k => 
            ['district', 'location', 'hospitalName', 'hospital'].includes(k.toLowerCase())
        ) || 'district'; 
        
        const unitsKey = Object.keys(firstItem).find(k => 
            ['unitsrequested', 'units', 'quantity', 'amount'].includes(k.toLowerCase())
        ) || 'unitsRequested';

        // GROUPING
        const totals = {};
        data.forEach(item => {
            const key = item[districtKey] || "Unknown";
            const val = parseInt(item[unitsKey]) || 0;
            totals[key] = (totals[key] || 0) + val;
        });

        // UPDATE UI
        const totalNodes = Object.keys(totals).length;
        const totalUnits = Object.values(totals).reduce((a, b) => a + b, 0);
        
        const nodeEl = document.getElementById('total-districts-count');
        const unitEl = document.getElementById('global-units-count');
        if (nodeEl) nodeEl.textContent = totalNodes;
        if (unitEl) unitEl.textContent = totalUnits;

        renderChart(Object.keys(totals), Object.values(totals));

    } catch (error) {
        console.error("Dashboard error:", error);
    }
}

function renderChart(labels, values) {
    const ctx = document.getElementById('inventoryChart');
    if (!ctx) return; 
    
    if (inventoryChartInstance) inventoryChartInstance.destroy();

    inventoryChartInstance = new Chart(ctx.getContext('2d'), {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{ 
                label: 'Volume Tracked (Units)', 
                data: values, 
                backgroundColor: '#de2910',
                borderRadius: 6 
            }]
        },
        options: { 
            responsive: true, 
            maintainAspectRatio: false,
            scales: { y: { beginAtZero: true } }
        }
    });
}

fetchDashboardMetrics();