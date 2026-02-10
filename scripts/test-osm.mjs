import fetch from 'node-fetch';

async function testOSM() {
    console.log("🚀 Testing OpenStreetMap (Nominatim + Overpass) for Tehran...");

    // 1. Geocode "Vanak Square, Tehran"
    const address = "Vanak Square, Tehran, Iran";
    const geocodeUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;
    
    try {
        console.log(`📍 Geocoding: ${address}...`);
        const geoRes = await fetch(geocodeUrl, {
            headers: { 'User-Agent': 'Karnex-Test-Script/1.0' } // OSM requires User-Agent
        });
        const geoData = await geoRes.json();

        if (!geoData || geoData.length === 0) {
            console.error("❌ Geocoding failed: No results found.");
            return;
        }

        const { lat, lon, display_name } = geoData[0];
        console.log(`✅ Found: ${display_name}`);
        console.log(`Coords: ${lat}, ${lon}`);

        // 2. Search for Competitors (e.g. Cafes) within 500m
        console.log("\n🔍 Searching for Cafes within 500m...");
        // Overpass QL: node["amenity"="cafe"](around:500, LAT, LON); out;
        const overpassQuery = `
            [out:json];
            (
              node["amenity"="cafe"](around:500,${lat},${lon});
              way["amenity"="cafe"](around:500,${lat},${lon});
              relation["amenity"="cafe"](around:500,${lat},${lon});
            );
            out center;
        `;
        
        const overpassUrl = "https://overpass-api.de/api/interpreter";
        const placesRes = await fetch(overpassUrl, {
            method: "POST",
            body: overpassQuery
        });
        const placesData = await placesRes.json();

        if (!placesData.elements || placesData.elements.length === 0) {
            console.warn("⚠️ No cafes found in OSM for this location.");
        } else {
            console.log(`✅ Found ${placesData.elements.length} cafes!`);
            placesData.elements.slice(0, 5).forEach((el, i) => {
                const name = el.tags?.name || el.tags?.["name:fa"] || "Unknown Name";
                console.log(`${i+1}. ${name} (${el.tags?.amenity})`);
            });
        }

    } catch (error) {
        console.error("❌ Error:", error);
    }
}

testOSM();
