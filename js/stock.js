let inventoryChartInstance = null; // Holds the live chart engine state

// 🔥 RUN IMMEDIATELY: Injected dynamically on successful admin key verification
fetchDashboardMetrics();

// Wire up the event listener for the district dropdown select menu
const districtFilter = document.getElementById('city-filter');
if (districtFilter) {
    districtFilter.addEventListener('change', (e) => {
        fetchDashboardMetrics(e.target.value);
    });
}

// Fetch and update dashboard metrics cards dynamically from live donor records
async function fetchDashboardMetrics(selectedDistrict = "ALL") {
    try {
        // 1. Grab your ACTUAL registered donors array from browser client cache
        // (This matches the exact data storage engine of your donor registration forms)
        const realDonors = JSON.parse(localStorage.getItem('lifeFlowDonors')) || [];

        // 2. Map out ALL 14 Districts of Kerala with realistic base active hospital requests
        const matrix = {
            "Thiruvananthapuram": { activeRequests: 4, totalUnits: 0, predictedRisk: "Critical Shortage" },
            "Kollam": { activeRequests: 3, totalUnits: 0, predictedRisk: "Critical Shortage" },
            "Pathanamthitta": { activeRequests: 1, totalUnits: 0, predictedRisk: "Critical Shortage" },
            "Alappuzha": { activeRequests: 2, totalUnits: 0, predictedRisk: "Critical Shortage" },
            "Kottayam": { activeRequests: 2, totalUnits: 0, predictedRisk: "Critical Shortage" },
            "Idukki": { activeRequests: 0, totalUnits: 0, predictedRisk: "Critical Shortage" },
            "Ernakulam": { activeRequests: 5, totalUnits: 0, predictedRisk: "Critical Shortage" },
            "Thrissur": { activeRequests: 3, totalUnits: 0, predictedRisk: "Critical Shortage" },
            "Palakkad": { activeRequests: 2, totalUnits: 0, predictedRisk: "Critical Shortage" },
            "Malappuram": { activeRequests: 4, totalUnits: 0, predictedRisk: "Critical Shortage" },
            "Kozhikode": { activeRequests: 4, totalUnits: 0, predictedRisk: "Critical Shortage" },
            "Wayanad": { activeRequests: 1, totalUnits: 0, predictedRisk: "Critical Shortage" },
            "Kannur": { activeRequests: 3, totalUnits: 0, predictedRisk: "Critical Shortage" },
            "Kasaragod": { activeRequests: 1, totalUnits: 0, predictedRisk: "Critical Shortage" }
        };

        // 3. DYNAMIC CALCULATOR: Loop through real registrations and increment counters instantly
        realDonors.forEach(donor => {
            const donorDistrict = donor.district; // Maps to form field 'district' select input value
            if (matrix[donorDistrict]) {
                matrix[donorDistrict].totalUnits += 1; 
            }
        });

        // 4. Calculate dashboard summary metrics totals and risk states dynamically
        let totalActiveNodes = 0;
        let globalUnitsTotal = 0;

        Object.keys(matrix).forEach(district => {
            const units = matrix[district].totalUnits;
            globalUnitsTotal += units;
            if (units > 0) totalActiveNodes += 1;

            // Live Logistics Threshold Risk Engine
            if (units === 0) {
                matrix[district].predictedRisk = "Critical Shortage";
            } else if (units < 3) {
                matrix[district].predictedRisk = "Elevated Risk";
            } else {
                matrix[district].predictedRisk = "Stable";
            }
        });

        const data = {
            totalNodes: totalActiveNodes,
            activeStrains: 2, // Holds the active infrastructure network flags count
            globalUnits: globalUnitsTotal,
            matrix: matrix
        };

        // 🎯 DOM Elements for Top Status Cards
        const nodeCard = document.getElementById('total-districts-count');
        const strainCard = document.getElementById('active-alerts-count');
        const unitCard = document.getElementById('global-units-count');

        if (nodeCard) nodeCard.textContent = data.totalNodes;
        if (strainCard) strainCard.textContent = data.activeStrains;

        // 🎯 Render the Regional ML Forecast Matrix Table Layout
        const matrixContainer = document.getElementById('ml-matrix-body');
        const alertZone = document.getElementById('critical-alert-zone');
        const alertMessage = document.getElementById('alert-message');

        if (matrixContainer) {
            let tableHTML = `
                <h3 style="margin-top: 35px; margin-bottom: 15px; font-family: sans-serif; color: #1a202c;">🔮 Regional Forecast Risk Matrix</h3>
                <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.01); border: 1px solid #e2e8f0; font-family: sans-serif;">
                    <thead>
                        <tr style="background: #f7fafc; border-bottom: 2px solid #e2e8f0; text-align: left;">
                            <th style="padding: 12px 16px; color: #4a5568; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.5px;">District Node</th>
                            <th style="padding: 12px 16px; color: #4a5568; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.5px;">Active Pressure Nodes</th>
                            <th style="padding: 12px 16px; color: #4a5568; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.5px;">Volume Tracked</th>
                            <th style="padding: 12px 16px; color: #4a5568; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.5px;">ML Risk Forecast</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            let severeShortages = [];
            let dynamicUnitsTotal = 0; 

            Object.keys(data.matrix).forEach(district => {
                if (selectedDistrict !== "ALL" && selectedDistrict !== district) return;

                const row = data.matrix[district];
                dynamicUnitsTotal += Number(row.totalUnits || 0);

                let badgeColor = "#38a169"; 
                if (row.predictedRisk === "Critical Shortage") {
                    badgeColor = "#de2910"; // Crimson alert theme color match
                    severeShortages.push(district);
                } else if (row.predictedRisk === "Elevated Risk") {
                    badgeColor = "#dd6b20"; 
                }

                tableHTML += `
                    <tr style="border-bottom: 1px solid #edf2f7; font-size: 0.95rem; color: #2d3748;">
                        <td style="padding: 14px 16px; font-weight: 600;">${district}</td>
                        
                        <td style="padding: 14px 16px;">${row.activeRequests} ${row.activeRequests === 1 ? 'hospital' : 'hospitals'}</td>
                        
                        <td style="padding: 14px 16px; font-weight: 500;">${row.totalUnits} Units</td>
                        <td style="padding: 14px 16px;">
                            <span style="display: inline-block; padding: 4px 10px; border-radius: 20px; color: white; background: ${badgeColor}; font-size: 0.75rem; font-weight: bold; text-transform: uppercase;">
                                ${row.predictedRisk}
                            </span>
                        </td>
                    </tr>
                `;
            });

            tableHTML += `</tbody></table></div>`;
            matrixContainer.innerHTML = tableHTML;

            // Update the global unit tracker counts based on live matching matrix states
            if (unitCard) {
                unitCard.textContent = (selectedDistrict === "ALL") ? (dynamicUnitsTotal || data.globalUnits) : dynamicUnitsTotal;
            }

            // Dynamically Trigger Distribution Emergency Alerts Box Node
            if (alertZone && alertMessage) {
                if (severeShortages.length > 0) {
                    alertZone.style.display = "block";
                    alertZone.style.background = "#fff5f5";
                    alertZone.style.border = "1px solid #fed7d7";
                    alertZone.style.borderLeft = "4px solid #de2910";
                    alertZone.style.padding = "15px";
                    alertZone.style.borderRadius = "8px";
                    alertZone.style.marginBottom = "20px";
                    alertMessage.innerHTML = `<strong>Logistical Alert:</strong> High critical shortages detected in <strong>${severeShortages.join(', ')}</strong>. Coordinate regional distribution paths immediately.`;
                } else {
                    alertZone.style.display = "none";
                }
            }
        }

        // ==========================================
        // 📊 DYNAMIC CHART.JS GRAPH ENGINE INJECTION
        // ==========================================
        const chartCtx = document.getElementById('inventoryChart');
        if (chartCtx) {
            const labels = [];
            const chartData = [];

            Object.keys(data.matrix).forEach(district => {
                if (selectedDistrict !== "ALL" && selectedDistrict !== district) return;
                labels.push(district);
                chartData.push(data.matrix[district].totalUnits);
            });

            // Wipe out old graph buffers so they don't overlap or flicker on filter updates
            if (inventoryChartInstance) {
                inventoryChartInstance.destroy();
            }

            // Draw the structural Chart canvas engine context layer
            inventoryChartInstance = new Chart(chartCtx.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Volume Tracked (Units)',
                        data: chartData,
                        backgroundColor: 'rgba(222, 41, 16, 0.75)', // Clean Crimson LifeFlow Identity
                        borderColor: '#de2910',
                        borderWidth: 1.5,
                        borderRadius: 6,
                        barThickness: selectedDistrict === "ALL" ? 18 : 35 // Slims bars down if rendering all 14 nodes side-by-side
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false } // Hides generic legend layout boxes
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: { stepSize: 1, color: '#4a5568' }, // Step resolution 1 is perfect for testing low volumes
                            grid: { color: '#edf2f7' }
                        },
                        x: {
                            ticks: { 
                                color: '#4a5568', 
                                font: { weight: '600', size: 10 },
                                maxRotation: 45,
                                minRotation: 45 
                            },
                            grid: { display: false }
                        }
                    }
                }
            });
        }
    } catch (error) {
        console.error("Could not populate administrative tracking streams:", error);
    }
}