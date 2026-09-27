let leafletMap;
let geoJsonLayer;

// We use a verified, lightweight GeoJSON for Indian States
const INDIA_GEOJSON_URL = 'https://raw.githubusercontent.com/india-in-data/india-states-2019/master/india_states.geojson';

async function initMap() {
    leafletMap = L.map('map').setView([22.5, 79.0], 4);
    
    // Dark mode basemap
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 8
    }).addTo(leafletMap);

    try {
        const res = await fetch(INDIA_GEOJSON_URL);
        const data = await res.json();
        
        geoJsonLayer = L.geoJSON(data, {
            style: function(feature) {
                return { color: '#1e2c47', weight: 1.5, fillColor: '#3ecbe0', fillOpacity: 0.1 };
            },
            onEachFeature: function(feature, layer) {
                layer.on('click', async function(e) {
                    const bounds = layer.getBounds();
                    const lat = bounds.getCenter().lat;
                    const lng = bounds.getCenter().lng;
                    const stateName = feature.properties.ST_NM || "Selected Region";
                    
                    // Trigger global app update
                    window.updateRegionData(lat, lng, stateName);
                    
                    // Visual highlight
                    geoJsonLayer.resetStyle();
                    layer.setStyle({ fillColor: '#f0563d', fillOpacity: 0.4, color: '#f0563d' });
                });
            }
        }).addTo(leafletMap);
    } catch(err) {
        console.error("Map Data Load Error:", err);
    }
}