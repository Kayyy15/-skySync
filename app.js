window.currentWeatherData = null;
window.currentRegionName = null;
let chartsRendered = false; // Prevent re-rendering charts continuously

document.addEventListener("DOMContentLoaded", () => {
    // Modal Logic
    const modal = document.getElementById('locationModal');
    const btnDetect = document.getElementById('btnDetect');
    const btnProceed = document.getElementById('btnProceed');
    const stateSelect = document.getElementById('stateSelect');

    btnDetect.addEventListener('click', () => {
        btnDetect.textContent = "Requesting access...";
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                modal.style.opacity = 0;
                setTimeout(() => modal.style.display = 'none', 300);
                initMap();
                updateRegionData(pos.coords.latitude, pos.coords.longitude, "Your Detected Location");
            },
            (err) => {
                alert("Location access denied. Please select from the dropdown.");
                btnDetect.textContent = "Auto-Detect My Location";
            }
        );
    });

    btnProceed.addEventListener('click', () => {
        const [lat, lng, name] = stateSelect.value.split(',');
        modal.style.opacity = 0;
        setTimeout(() => modal.style.display = 'none', 300);
        initMap();
        updateRegionData(lat, lng, name);
    });

    // Sidebar Navigation & View Routing Logic
    const navItems = document.querySelectorAll('.navitem');
    const views = document.querySelectorAll('.view-section');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            // Update Active Nav State
            navItems.forEach(n => n.classList.remove('active'));
            e.currentTarget.classList.add('active');
            
            // Update Title
            const targetName = e.currentTarget.querySelector('.navlabel').textContent;
            document.getElementById('pageTitle').textContent = targetName;

            // Route View
            const viewId = e.currentTarget.getAttribute('data-view');
            views.forEach(v => v.classList.remove('active'));
            document.getElementById(`view-${viewId}`).classList.add('active');

            // Initialize Charts if opening Compare or Risk views
            if ((viewId === 'compare' || viewId === 'risk') && !chartsRendered) {
                initCharts();
                chartsRendered = true;
            }
        });
    });

    // Sidebar Collapse Logic
    const collapseBtn = document.getElementById('collapseBtn');
    const sidebar = document.getElementById('sidebar');
    collapseBtn.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
    });

    // Alerts Threshold Slider Logic
    const slider = document.getElementById('threshSlider');
    const threshVal = document.getElementById('threshVal');
    slider.addEventListener('input', (e) => {
        threshVal.textContent = e.target.value + '%';
        updateAlerts(e.target.value);
    });
});

// Global Function triggered by Map Clicks or Initial Load
window.updateRegionData = async function(lat, lng, regionName) {
    document.getElementById('currentRegionHeader').textContent = `Loading ${regionName}...`;
    
    const weather = await fetchLiveWeather(lat, lng);
    if (!weather) return;

    window.currentWeatherData = weather;
    window.currentRegionName = regionName;

    document.getElementById('currentRegionHeader').textContent = regionName;

    /* UPDATE OVERVIEW TAB */
    document.getElementById('kpi-conf').textContent = `${weather.confidence}%`;
    const bustEl = document.getElementById('kpi-bust');
    bustEl.textContent = `${weather.bustProb}%`;
    bustEl.style.color = weather.bustProb >= 60 ? 'var(--red)' : (weather.bustProb >= 30 ? 'var(--amber)' : 'var(--text)');
    document.getElementById('kpi-risk').textContent = `${weather.risk} Risk`;
    document.getElementById('kpi-wmo').textContent = weather.wmoText;
    document.getElementById('kpi-wind').textContent = weather.wind;
    document.getElementById('kpi-precip').textContent = weather.precip;

    const factorHtml = weather.factors.map(f => `
        <div class="factor-wrap">
            <div class="factor-name"><span>${f.name}</span><span class="num">+${f.val}% error</span></div>
            <div class="factor-track"><div class="factor-fill" style="width:${Math.min(100, f.val * 3)}%"></div></div>
        </div>
    `).join('');
    
    document.getElementById('ai-explanation').innerHTML = `In <b>${regionName}</b>, NWP forecast confidence is <b>${weather.confidence}%</b>. Expected: ${weather.wmoText}. Model uncertainty is categorized as <b>${weather.risk}</b>.`;
    document.getElementById('factor-bars').innerHTML = factorHtml;

    /* UPDATE BUST DETECTION TAB */
    const riskBadgeClass = weather.bustProb >= 60 ? 'b-crit' : (weather.bustProb >= 30 ? 'b-mod' : 'b-low');
    const dynamicRow = `<tr style="background: rgba(62,203,224,0.05); border-left: 3px solid var(--cyan);">
        <td>1</td>
        <td><b>${regionName} (Selected)</b></td>
        <td class="num">${weather.confidence}%</td>
        <td class="num" style="color:var(--red); font-weight:bold;">${weather.bustProb}%</td>
        <td>Wind & Precip</td>
        <td><span class="badge ${riskBadgeClass}">${weather.risk}</span></td>
    </tr>`;
    const tbody = document.getElementById('bust-table-body');
    // Prepend dynamic row, keeping the dummy ones for demo purposes
    tbody.innerHTML = dynamicRow + `
        <tr><td>2</td><td>Odisha</td><td class="num">45.0%</td><td class="num">55.0%</td><td>Precipitation</td><td><span class="badge b-high">High</span></td></tr>
        <tr><td>3</td><td>Assam</td><td class="num">62.0%</td><td class="num">38.0%</td><td>Precipitation</td><td><span class="badge b-mod">Moderate</span></td></tr>
        <tr><td>4</td><td>Delhi</td><td class="num">88.0%</td><td class="num">12.0%</td><td>Temperature</td><td><span class="badge b-low">Low</span></td></tr>
    `;

    /* UPDATE EXPLAINABILITY TAB */
    document.getElementById('deep-ai-text').innerHTML = `The ensemble spread over <b>${regionName}</b> indicates significant divergence. The primary driver of the <b>${weather.bustProb}%</b> bust probability is rapidly changing wind vectors (${weather.wind} km/h) clashing with localized topography, causing NWP models to miscalculate convective precipitation.`;
    document.getElementById('deep-factor-bars').innerHTML = factorHtml;

    /* UPDATE ALERTS TAB */
    updateAlerts(document.getElementById('threshSlider').value);
};

function updateAlerts(threshold) {
    const data = window.currentWeatherData;
    const region = window.currentRegionName;
    const alertList = document.getElementById('alertList');
    
    if (data && data.bustProb >= threshold) {
        alertList.innerHTML = `
        <div class="card" style="border-left:4px solid var(--red)">
            <div style="display:flex;justify-content:space-between;align-items:center">
                <div>
                    <span class="badge b-crit">CRITICAL BUST RISK</span>
                    <div style="font-weight:700;margin-top:8px; font-size:16px;">${region} — Next 24h Forecast</div>
                    <div class="small" style="margin-top:4px">Bust Probability: ${data.bustProb}% • Driven by: ${data.factors[0]?.name || 'System Dynamics'}</div>
                </div>
            </div>
        </div>`;
    } else {
        alertList.innerHTML = `<div class="empty" style="color:var(--mute); padding: 20px; text-align:center;">No active alerts above ${threshold}% threshold.</div>`;
    }
}

// Chart.js initialization for hackathon demo visualizations
function initCharts() {
    Chart.defaults.color = '#8fa2c2';
    Chart.defaults.font.family = 'Inter';
    
    // 1. Forecast Comparison Chart
    const ctxCmp = document.getElementById('cmpCanvas');
    if(ctxCmp) {
        new Chart(ctxCmp, {
            type: 'line',
            data: {
                labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'],
                datasets: [
                    { label: 'Model Forecast', data: [30, 31, 34, 38, 42, 35, 33], borderColor: '#3ecbe0', tension: 0.3 },
                    { label: 'Actual Observed', data: [31, 31, 45, 55, 30, 32, 33], borderColor: '#f0563d', tension: 0.3, borderDash: [5, 5] }
                ]
            },
            options: { responsive: true, maintainAspectRatio: false, scales: { x: { grid: { color: '#16223c' } }, y: { grid: { color: '#16223c' } } } }
        });
    }

    // 2. Risk Analysis Chart (Lead Time)
    const ctxRisk1 = document.getElementById('riskCanvas1');
    if(ctxRisk1) {
        new Chart(ctxRisk1, {
            type: 'line',
            data: {
                labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'],
                datasets: [{ label: 'Average Confidence %', data: [92, 85, 78, 65, 50, 42, 30], borderColor: '#2ecc8f', backgroundColor: 'rgba(46,204,143,0.1)', tension: 0.4, fill: true }]
            },
            options: { responsive: true, maintainAspectRatio: false, scales: { x: { grid: { color: '#16223c' } }, y: { grid: { color: '#16223c' }, min: 0, max: 100 } } }
        });
    }

    // 3. Risk Analysis Chart (Distribution)
    const ctxRisk2 = document.getElementById('riskCanvas2');
    if(ctxRisk2) {
        new Chart(ctxRisk2, {
            type: 'bar',
            data: {
                labels: ['Maharashtra', 'Delhi', 'Karnataka', 'W. Bengal', 'Tamil Nadu'],
                datasets: [{ label: 'Historical Bust Freq %', data: [15, 8, 22, 45, 30], backgroundColor: ['#3ecbe0', '#2ecc8f', '#f0a63e', '#f0563d', '#a078ff'] }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } }, y: { grid: { color: '#16223c' } } } }
        });
    }
}