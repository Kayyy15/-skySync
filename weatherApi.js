// Dictionary for WMO Codes
const WMO_CODES = {
    0: 'Clear Sky', 1: 'Mainly Clear', 2: 'Partly Cloudy', 3: 'Overcast',
    45: 'Fog', 48: 'Depositing Rime Fog',
    51: 'Light Drizzle', 53: 'Moderate Drizzle', 55: 'Dense Drizzle',
    61: 'Slight Rain', 63: 'Moderate Rain', 65: 'Heavy Rain',
    71: 'Slight Snow', 73: 'Moderate Snow', 75: 'Heavy Snow',
    95: 'Thunderstorm', 96: 'Thunderstorm / Hail', 99: 'Severe Thunderstorm'
};

async function fetchLiveWeather(lat, lng) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,weather_code&timezone=auto`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        return processBustProbability(data);
    } catch(err) {
        console.error("API Fetch Error:", err);
        return null;
    }
}

// AI Heuristic: Calculates forecast bust probability based on meteorological rules
function processBustProbability(data) {
    const daily = data.daily;
    const day0 = { // Grabbing Day 1 Data
        date: daily.time[0],
        tempMax: daily.temperature_2m_max[0],
        precip: daily.precipitation_sum[0],
        precipProb: daily.precipitation_probability_max[0],
        wind: daily.wind_speed_10m_max[0],
        wmo: daily.weather_code[0],
        wmoText: WMO_CODES[daily.weather_code[0]] || 'Unknown'
    };

    let bust = 10; // Baseline uncertainty
    let factors = [];

    // Rule 1: High uncertainty when precipitation probability is split
    if (day0.precipProb > 30 && day0.precipProb < 70) {
        bust += 25;
        factors.push({ name: 'Model Precip Variance', val: 25 });
    } else if (day0.precipProb >= 70) {
        bust += 10;
        factors.push({ name: 'System Dynamics', val: 10 });
    }

    // Rule 2: High wind indicates dynamic divergence
    if (day0.wind > 25) {
        bust += 20;
        factors.push({ name: 'Wind Field Divergence', val: 20 });
    }

    // Rule 3: Severe weather codes (Convective storms have high NWP error)
    if ([95, 96, 99, 65].includes(day0.wmo)) {
        bust += 30;
        factors.push({ name: 'Convective Storm Activity', val: 30 });
    }

    bust = Math.min(bust, 95);
    day0.bustProb = bust;
    day0.confidence = 100 - bust;
    day0.factors = factors.length ? factors : [{ name: 'Stable Synoptic Conditions', val: 10 }];
    
    day0.risk = bust >= 70 ? 'Critical' : bust >= 50 ? 'High' : bust >= 30 ? 'Moderate' : 'Low';
    return day0;
}