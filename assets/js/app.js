// assets/js/app.js

document.addEventListener('DOMContentLoaded', () => {
    // Application State
    const state = {
        routeId: null,
        routeName: 'Nowa trasa',
        waypoints: [], // Array of { lat, lng, name }
        routeGeometry: null, // GeoJSON coordinates
        distance: 0, // In km
        duration: 0, // In seconds
        profile: 'hiking', // Default to BRouter hiking
        savedRoutes: [],
        map: null,
        routeLine: null,
        markers: [],
        attractions: [], // Array of POI objects
        attractionMarkers: [] // Array of Leaflet markers
    };

    let searchMarker = null;

    // DOM Elements
    const routeNameInput = document.getElementById('route-name');
    const waypointsContainer = document.getElementById('waypoints-list');
    const statDistance = document.getElementById('stat-distance');
    const statDuration = document.getElementById('stat-duration');
    const profileButtons = document.querySelectorAll('.profile-btn');
    const btnSave = document.getElementById('btn-save');
    const btnClear = document.getElementById('btn-clear');
    const btnExport = document.getElementById('btn-export');
    const savedRoutesList = document.getElementById('saved-routes-list');
    
    // Attractions DOM Elements
    const btnFindAttractions = document.getElementById('btn-find-attractions');
    const attractionsRange = document.getElementById('attraction-range');
    const attractionsContainer = document.getElementById('attractions-list');
    const attractionsCount = document.getElementById('attractions-count');
    
    // Initialize Map
    function initMap() {
        // Center on Poland by default (Warsaw)
        state.map = L.map('map', {
            zoomControl: false // We will add it manually in a better position
        }).setView([52.2297, 21.0122], 7);

        // Add Leaflet Zoom Control to Top Right
        L.control.zoom({
            position: 'topright'
        }).addTo(state.map);

        // Define Base Layers
        const osmDark = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap contributors'
        });

        const osmStandard = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap contributors'
        });

        const esriSatellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            maxZoom: 19,
            attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
        });

        const esriTopo = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
            maxZoom: 19,
            attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
        });

        // Set default layer to Dark OSM
        osmDark.addTo(state.map);

        // Apply dark-tiles filter only to the osmDark container on demand when tiles load
        osmDark.on('tileload', () => {
            const container = osmDark.getContainer();
            if (container) {
                L.DomUtil.addClass(container, 'dark-tiles');
            }
        });

        // Setup Map Layers Control
        const baseMaps = {
            "<span style='color:#94a3b8;font-weight:600;'>Ciemna (OSM)</span>": osmDark,
            "<span style='color:#94a3b8;font-weight:600;'>Jasna (OSM)</span>": osmStandard,
            "<span style='color:#94a3b8;font-weight:600;'>Satelita (Esri)</span>": esriSatellite,
            "<span style='color:#94a3b8;font-weight:600;'>Topograficzna (Esri)</span>": esriTopo
        };

        L.control.layers(baseMaps, null, {
            position: 'topright'
        }).addTo(state.map);

        // Geolocation: try to locate user
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    state.map.setView([lat, lng], 13);
                },
                () => {
                    // Falling back to the default view is expected when geolocation is denied or unavailable.
                }
            );
        }

        // Map Click Event
        state.map.on('click', (e) => {
            // Remove search marker if active
            if (searchMarker) {
                state.map.removeLayer(searchMarker);
                searchMarker = null;
            }
            const { lat, lng } = e.latlng;
            addWaypoint(lat, lng);
        });

        // Setup popup open event to bind the dynamically created "+ Dodaj do trasy" button
        state.map.on('popupopen', (e) => {
            const btn = document.getElementById('btn-add-search-wp');
            if (btn) {
                const lat = parseFloat(btn.getAttribute('data-lat'));
                const lng = parseFloat(btn.getAttribute('data-lng'));
                const name = btn.getAttribute('data-name');
                btn.onclick = () => {
                    addWaypoint(lat, lng, name);
                    state.map.closePopup();
                    if (searchMarker) {
                        state.map.removeLayer(searchMarker);
                        searchMarker = null;
                    }
                };
            }

            // Handle attraction addition
            const popupNode = e.popup.getElement();
            if (popupNode) {
                const addAttractionBtn = popupNode.querySelector('[id^="btn-add-attraction-"]');
                if (addAttractionBtn) {
                    const attractionId = addAttractionBtn.id.replace('btn-add-attraction-', '');
                    const attraction = state.attractions.find(a => a.id.toString() === attractionId);
                    if (attraction) {
                        const lat = attraction.lat || attraction.center.lat;
                        const lng = attraction.lon || attraction.center.lon;
                        const name = attraction.tags.name;
                        addAttractionBtn.onclick = () => {
                            addWaypoint(lat, lng, name);
                            state.map.closePopup();
                        };
                    }
                }
            }
        });
    }

    // Add Waypoint
    async function addWaypoint(lat, lng, name = null) {
        const index = state.waypoints.length;
        const defaultName = name || `Punkt ${index + 1}`;
        
        const wp = { lat, lng, name: defaultName };
        state.waypoints.push(wp);
        
        // Render Marker immediately
        renderMarker(wp, index);
        
        // Update UI
        updateWaypointsUI();
        
        // Calculate Route
        calculateRoute();

        // Asynchronously fetch reverse geocoding for better names
        if (!name) {
            fetchAddress(lat, lng, index);
        }
    }

    // Fetch Address using OpenStreetMap Nominatim (Reverse Geocoding)
    async function fetchAddress(lat, lng, index) {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`, {
                headers: {
                    'Accept-Language': 'pl,en-US;q=0.7,en;q=0.3'
                }
            });
            if (response.ok) {
                const data = await response.json();
                let addressName = '';
                
                // Get readable part of address
                if (data.address) {
                    const addr = data.address;
                    const road = addr.road || addr.pedestrian || addr.suburb || '';
                    const houseNumber = addr.house_number || '';
                    const city = addr.city || addr.town || addr.village || '';
                    
                    if (road) {
                        addressName = road + (houseNumber ? ` ${houseNumber}` : '') + (city ? `, ${city}` : '');
                    } else if (city) {
                        addressName = city;
                    }
                }
                
                if (!addressName && data.display_name) {
                    addressName = data.display_name.split(',').slice(0, 2).join(',');
                }
                
                if (addressName && state.waypoints[index]) {
                    state.waypoints[index].name = addressName;
                    
                    // Update input in sidebar without full redraw to avoid losing focus
                    const inputs = waypointsContainer.querySelectorAll('.waypoint-name');
                    if (inputs[index]) {
                        inputs[index].value = addressName;
                    }
                    
                    // Update marker tooltip/popup if exists
                    if (state.markers[index]) {
                        state.markers[index].bindPopup(`<b>${index + 1}. ${addressName}</b><br><span style="color:var(--text-muted);font-size:0.75rem;">${lat.toFixed(5)}, ${lng.toFixed(5)}</span>`);
                    }
                }
            }
        } catch (error) {
            console.log('Reverse geocoding failed, using coordinates name:', error);
        }
    }

    // Render Leaflet Marker for a Waypoint
    function renderMarker(wp, index) {
        // Decide icon type based on position
        let markerClass = 'custom-marker';
        if (index === 0) {
            markerClass += ' custom-marker-start';
        } else if (index === state.waypoints.length - 1 && state.waypoints.length > 1) {
            // Update previous end marker to regular marker style if needed
            updateMarkerStyles();
            markerClass += ' custom-marker-end';
        }

        const icon = L.divIcon({
            className: 'custom-div-icon',
            html: `<div class="${markerClass}" id="marker-icon-${index}"><span>${index + 1}</span></div>`,
            iconSize: [28, 28],
            iconAnchor: [14, 28],
            popupAnchor: [0, -30]
        });

        const marker = L.marker([wp.lat, wp.lng], {
            icon: icon,
            draggable: true
        }).addTo(state.map);

        // Bind popup
        marker.bindPopup(`<b>${index + 1}. ${wp.name}</b><br><span style="color:var(--text-muted);font-size:0.75rem;">${wp.lat.toFixed(5)}, ${wp.lng.toFixed(5)}</span>`);

        // Drag events
        marker.on('dragend', (e) => {
            const newLatLng = marker.getLatLng();
            state.waypoints[index].lat = newLatLng.lat;
            state.waypoints[index].lng = newLatLng.lng;
            
            // Re-fetch address for new coordinates
            fetchAddress(newLatLng.lat, newLatLng.lng, index);
            
            // Recalculate route
            calculateRoute();
        });

        // Click event - double click deletes waypoint
        marker.on('dblclick', () => {
            deleteWaypoint(index);
        });

        state.markers.push(marker);
    }

    // Update marker styles (fixing start/end colors dynamically)
    function updateMarkerStyles() {
        state.markers.forEach((marker, idx) => {
            const el = document.getElementById(`marker-icon-${idx}`);
            if (el) {
                // Clear specialized classes
                el.className = 'custom-marker';
                if (idx === 0) {
                    el.classList.add('custom-marker-start');
                } else if (idx === state.waypoints.length - 1 && state.waypoints.length > 1) {
                    el.classList.add('custom-marker-end');
                }
            }
        });
    }

    // Recalculate and Draw Route
    async function calculateRoute() {
        // Clear previous attractions as the route geometry is changing
        clearAttractions();

        if (state.waypoints.length < 2) {
            // Clear route line
            if (state.routeLine) {
                state.map.removeLayer(state.routeLine);
                state.routeLine = null;
            }
            state.routeGeometry = null;
            state.distance = 0;
            state.duration = 0;
            updateStatsUI();
            return;
        }

        // Draw Straight Lines
        if (state.profile === 'straight') {
            const coords = state.waypoints.map(wp => [wp.lat, wp.lng]);
            
            // Calculate straight distance
            let dist = 0;
            for (let i = 0; i < coords.length - 1; i++) {
                dist += state.map.distance(coords[i], coords[i+1]); // in meters
            }
            
            state.distance = dist / 1000; // to km
            // Average walking speed: 4.5 km/h -> 1.25 m/s
            state.duration = dist / 1.25; 
            
            // Prepare geometry in GeoJSON coordinates [lon, lat] format
            state.routeGeometry = state.waypoints.map(wp => [wp.lng, wp.lat]);
            
            drawRouteLine(coords);
            updateStatsUI();
            return;
        }

        // Snap to road/path routing using BRouter
        try {
            // BRouter expects: longitude,latitude separated by pipes (|)
            const coordsString = state.waypoints.map(wp => `${wp.lng},${wp.lat}`).join('|');
            const url = `https://brouter.de/brouter?lonlats=${coordsString}&profile=${state.profile}&alternativeidx=0&format=geojson`;

            const response = await fetch(url);
            if (!response.ok) throw new Error('BRouter API Error');

            const data = await response.json();
            if (!data.features || data.features.length === 0) {
                throw new Error('No route found');
            }

            const routeFeature = data.features[0];
            const props = routeFeature.properties;
            state.distance = parseFloat(props['track-length']) / 1000; // meters to km
            state.duration = parseInt(props['total-time']); // seconds
            state.routeGeometry = routeFeature.geometry.coordinates; // Array of [lon, lat, elevation]

            // Convert GeoJSON coords [lon, lat, elev] to Leaflet [lat, lon]
            const leafletCoords = state.routeGeometry.map(coord => [coord[1], coord[0]]);
            drawRouteLine(leafletCoords);
            updateStatsUI();

        } catch (error) {
            console.error('BRouter API routing failed. Falling back to straight lines:', error);
            showToast('Błąd połączenia z serwerem map. Rysowanie linii prostych.', 'error');
            
            // Fallback to straight lines
            const coords = state.waypoints.map(wp => [wp.lat, wp.lng]);
            let dist = 0;
            for (let i = 0; i < coords.length - 1; i++) {
                dist += state.map.distance(coords[i], coords[i+1]);
            }
            state.distance = dist / 1000;
            state.duration = dist / 1.25;
            state.routeGeometry = state.waypoints.map(wp => [wp.lng, wp.lat]);
            drawRouteLine(coords);
            updateStatsUI();
        }
    }

    // Draw route polyline on map
    function drawRouteLine(latlngs) {
        if (state.routeLine) {
            state.map.removeLayer(state.routeLine);
        }

        // Draw a glowing, thick route line matching the theme
        state.routeLine = L.polyline(latlngs, {
            color: '#06b6d4',
            weight: 5,
            opacity: 0.85,
            lineJoin: 'round',
            className: 'route-polyline'
        }).addTo(state.map);

        // Customize style of route line (glowing cyan effect)
        state.routeLine.setStyle({
            shadowColor: '#3b82f6',
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowOffsetY: 0
        });
    }

    // Update Waypoints sidebar list
    function updateWaypointsUI() {
        waypointsContainer.innerHTML = '';
        
        if (state.waypoints.length === 0) {
            waypointsContainer.innerHTML = `
                <div class="empty-placeholder">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
                    <span>Kliknij na mapie, aby dodać punkty trasy</span>
                </div>`;
            return;
        }

        state.waypoints.forEach((wp, index) => {
            const item = document.createElement('div');
            item.className = 'waypoint-item';
            
            // Build movement action buttons based on index
            const upDisabled = index === 0 ? 'disabled style="opacity:0.3;pointer-events:none;"' : '';
            const downDisabled = index === state.waypoints.length - 1 ? 'disabled style="opacity:0.3;pointer-events:none;"' : '';

            item.innerHTML = `
                <div class="waypoint-index">${index + 1}</div>
                <input type="text" class="waypoint-name" value="${wp.name}" data-index="${index}" title="Kliknij, aby zmienić nazwę">
                <div class="waypoint-actions">
                    <button class="waypoint-btn up-btn" ${upDisabled} title="Przesuń w górę">
                        <svg viewBox="0 0 24 24"><path d="M18 15l-6-6-6 6"/></svg>
                    </button>
                    <button class="waypoint-btn down-btn" ${downDisabled} title="Przesuń w dół">
                        <svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>
                    </button>
                    <button class="waypoint-btn delete-btn" title="Usuń punkt">
                        <svg viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </button>
                </div>
            `;

            // Event Listeners for actions inside item
            const input = item.querySelector('.waypoint-name');
            input.addEventListener('change', (e) => {
                state.waypoints[index].name = e.target.value;
                // Update marker popup content
                if (state.markers[index]) {
                    state.markers[index].bindPopup(`<b>${index + 1}. ${e.target.value}</b><br><span style="color:var(--text-muted);font-size:0.75rem;">${wp.lat.toFixed(5)}, ${wp.lng.toFixed(5)}</span>`);
                }
            });

            // Reorder up
            item.querySelector('.up-btn').addEventListener('click', () => {
                if (index > 0) {
                    swapWaypoints(index, index - 1);
                }
            });

            // Reorder down
            item.querySelector('.down-btn').addEventListener('click', () => {
                if (index < state.waypoints.length - 1) {
                    swapWaypoints(index, index + 1);
                }
            });

            // Delete
            item.querySelector('.delete-btn').addEventListener('click', () => {
                deleteWaypoint(index);
            });

            waypointsContainer.appendChild(item);
        });
    }

    // Swap Waypoints
    function swapWaypoints(idx1, idx2) {
        // Swap waypoints array items
        const tempWp = state.waypoints[idx1];
        state.waypoints[idx1] = state.waypoints[idx2];
        state.waypoints[idx2] = tempWp;

        // Recreate markers list to match indices
        clearMarkers();
        state.waypoints.forEach((wp, idx) => {
            renderMarker(wp, idx);
        });

        updateWaypointsUI();
        calculateRoute();
    }

    // Delete Waypoint
    function deleteWaypoint(index) {
        state.waypoints.splice(index, 1);
        
        // Remove and recreate all markers to reset ordering index
        clearMarkers();
        state.waypoints.forEach((wp, idx) => {
            renderMarker(wp, idx);
        });

        updateWaypointsUI();
        calculateRoute();
    }

    // Clear all markers from map
    function clearMarkers() {
        state.markers.forEach(m => state.map.removeLayer(m));
        state.markers = [];
    }

    // Clear all attraction markers and list
    function clearAttractions() {
        state.attractionMarkers.forEach(m => state.map.removeLayer(m));
        state.attractionMarkers = [];
        state.attractions = [];
        attractionsContainer.innerHTML = '';
        attractionsContainer.style.display = 'none';
        attractionsCount.textContent = '0';
        attractionsCount.style.display = 'none';
    }

    // Clear current active route plan
    function clearActiveRoute() {
        state.routeId = null;
        state.routeName = 'Nowa trasa';
        routeNameInput.value = '';
        state.waypoints = [];
        state.routeGeometry = null;
        state.distance = 0;
        state.duration = 0;
        
        clearMarkers();
        clearAttractions();
        if (state.routeLine) {
            state.map.removeLayer(state.routeLine);
            state.routeLine = null;
        }

        updateWaypointsUI();
        updateStatsUI();
        
        // Remove active class from saved routes items
        document.querySelectorAll('.saved-route-item').forEach(item => {
            item.classList.remove('active');
        });
    }

    // Update Statistics Panel
    function updateStatsUI() {
        // Distance
        statDistance.innerText = state.distance > 0 ? `${state.distance.toFixed(2)} km` : '0.00 km';
        
        // Duration
        if (state.duration > 0) {
            const hrs = Math.floor(state.duration / 3600);
            const mins = Math.round((state.duration % 3600) / 60);
            if (hrs > 0) {
                statDuration.innerText = `${hrs}h ${mins}m`;
            } else {
                statDuration.innerText = `${mins} min`;
            }
        } else {
            statDuration.innerText = '--';
        }
    }

    // Change profile
    profileButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            profileButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            state.profile = btn.getAttribute('data-profile');
            calculateRoute();
        });
    });



    btnClear.addEventListener('click', clearActiveRoute);

    // Save route to database (PHP API)
    async function saveRoute() {
        const name = routeNameInput.value.trim() || `Trasa ${new Date().toLocaleDateString()}`;
        
        if (state.waypoints.length < 2) {
            showToast('Dodaj co najmniej 2 punkty na mapie, aby zapisać trasę.', 'error');
            return;
        }

        const payload = {
            id: state.routeId,
            name: name,
            waypoints: state.waypoints,
            geometry: state.routeGeometry,
            distance: state.distance,
            profile: state.profile
        };

        try {
            const response = await fetch('api.php?action=save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error('API save error');

            const result = await response.json();
            if (result.success) {
                state.routeId = result.id;
                state.routeName = name;
                routeNameInput.value = name;
                showToast(result.message || 'Trasa zapisana pomyślnie!', 'success');
                loadSavedRoutesList(); // refresh saved routes
            } else {
                showToast(result.error || 'Wystąpił błąd podczas zapisu.', 'error');
            }
        } catch (error) {
            console.error('Error saving route:', error);
            showToast('Błąd komunikacji z serwerem PHP.', 'error');
        }
    }

    btnSave.addEventListener('click', saveRoute);

    // Load saved routes list from API
    async function loadSavedRoutesList() {
        try {
            const response = await fetch('api.php?action=list');
            if (!response.ok) throw new Error('API list error');

            const result = await response.json();
            if (result.success) {
                state.savedRoutes = result.data;
                renderSavedRoutesUI();
            }
        } catch (error) {
            console.error('Error loading saved routes:', error);
        }
    }

    // Render Saved Routes sidebar list
    function renderSavedRoutesUI() {
        savedRoutesList.innerHTML = '';

        if (state.savedRoutes.length === 0) {
            savedRoutesList.innerHTML = '<div class="empty-placeholder" style="padding: 10px 0;">Brak zapisanych tras</div>';
            return;
        }

        state.savedRoutes.forEach(route => {
            const item = document.createElement('div');
            item.className = 'saved-route-item';
            if (state.routeId === parseInt(route.id)) {
                item.classList.add('active');
            }

            // Map profiles to Polish labels (BRouter profiles)
            const profileLabels = {
                hiking: 'Pieszo',
                trekking: 'Rower trekkingowy',
                fastbike: 'Rower szosowy',
                'car-test': 'Samochód',
                straight: 'Linia prosta',
                // backward compat
                foot: 'Pieszo',
                bicycle: 'Rower',
                driving: 'Samochód'
            };
            const profileLabel = profileLabels[route.profile] || route.profile;

            // Format date
            const createdDate = new Date(route.created_at).toLocaleDateString('pl-PL', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            item.innerHTML = `
                <div class="route-info-header">
                    <div class="route-title-text" title="${route.name}">${route.name}</div>
                    <button class="route-delete-action" title="Usuń trasę">
                        <svg viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </button>
                </div>
                <div class="route-meta-row">
                    <div class="route-meta-badges">
                        <span class="badge badge-profile">${profileLabel}</span>
                        <span class="badge badge-distance">${parseFloat(route.distance).toFixed(2)} km</span>
                    </div>
                    <div class="route-date">${createdDate}</div>
                </div>
            `;

            // Click item to load route
            item.addEventListener('click', (e) => {
                // If clicked on delete button, do not load
                if (e.target.closest('.route-delete-action')) return;
                loadRouteDetails(route.id);
            });

            // Delete action
            item.querySelector('.route-delete-action').addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm(`Czy na pewno chcesz usunąć trasę "${route.name}"?`)) {
                    deleteSavedRoute(route.id);
                }
            });

            savedRoutesList.appendChild(item);
        });
    }

    // Load Specific Route Details
    async function loadRouteDetails(id) {
        try {
            const response = await fetch(`api.php?action=get&id=${id}`);
            if (!response.ok) throw new Error('API load details error');

            const result = await response.json();
            if (result.success) {
                const route = result.data;
                
                state.routeId = parseInt(route.id);
                state.routeName = route.name;
                routeNameInput.value = route.name;
                state.waypoints = route.waypoints;
                state.profile = route.profile;
                state.distance = parseFloat(route.distance);
                state.routeGeometry = route.geometry;
                
                // Update profile button states
                profileButtons.forEach(btn => {
                    if (btn.getAttribute('data-profile') === state.profile) {
                        btn.classList.add('active');
                    } else {
                        btn.classList.remove('active');
                    }
                });

                // Recreate map markers
                clearMarkers();
                state.waypoints.forEach((wp, idx) => {
                    renderMarker(wp, idx);
                });

                // Draw route line
                if (state.routeGeometry) {
                    // Convert GeoJSON coords [lon, lat] to Leaflet [lat, lon]
                    const leafletCoords = state.routeGeometry.map(coord => [coord[1], coord[0]]);
                    drawRouteLine(leafletCoords);
                }
                
                // Adjust map bounds to show full route
                if (state.routeLine) {
                    state.map.fitBounds(state.routeLine.getBounds(), { padding: [50, 50] });
                }

                updateWaypointsUI();
                updateStatsUI();
                
                // Set active class in sidebar items
                document.querySelectorAll('.saved-route-item').forEach(item => {
                    item.classList.remove('active');
                });
                renderSavedRoutesUI(); // Re-render list to show active highlight
                
                showToast('Trasa wczytana pomyślnie.', 'success');
            } else {
                showToast(result.error || 'Wczytywanie trasy nie powiodło się.', 'error');
            }
        } catch (error) {
            console.error('Error loading route details:', error);
            showToast('Błąd podczas pobierania danych trasy.', 'error');
        }
    }

    // Delete Saved Route
    async function deleteSavedRoute(id) {
        try {
            const response = await fetch(`api.php?action=delete&id=${id}`, {
                method: 'POST'
            });
            if (!response.ok) throw new Error('API delete error');

            const result = await response.json();
            if (result.success) {
                showToast('Trasa została usunięta.', 'success');
                if (state.routeId === parseInt(id)) {
                    clearActiveRoute();
                }
                loadSavedRoutesList();
            } else {
                showToast(result.error || 'Nie udało się usunąć trasy.', 'error');
            }
        } catch (error) {
            console.error('Error deleting route:', error);
            showToast('Błąd serwera podczas usuwania.', 'error');
        }
    }

    // Export Active Route to GPX
    function exportToGPX() {
        if (state.waypoints.length < 2) {
            showToast('Trasa musi mieć przynajmniej 2 punkty, aby ją wyeksportować.', 'error');
            return;
        }

        const name = routeNameInput.value.trim() || 'Trasa';
        const dateStr = new Date().toISOString();

        // 1. Build GPX Metadata and headers
        let gpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="PlanerTrasGPX" 
     xmlns="http://www.topografix.com/GPX/1/1" 
     xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
     xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">
  <metadata>
    <name>${escapeXml(name)}</name>
    <desc>Trasa wygenerowana w aplikacji PlanerTrasGPX</desc>
    <time>${dateStr}</time>
  </metadata>
`;

        // 2. Add Waypoints (wpt) - These appear as pins/markers in GPS apps
        state.waypoints.forEach((wp, index) => {
            gpx += `  <wpt lat="${wp.lat.toFixed(6)}" lon="${wp.lng.toFixed(6)}">
    <name>${escapeXml(wp.name)}</name>
    <desc>Punkt trasy nr ${index + 1}</desc>
  </wpt>\n`;
        });

        // 3. Add Route Track (trk) - Standard route path line
        gpx += `  <trk>
    <name>${escapeXml(name)}</name>
    <desc>Tryb planowania: ${state.profile} (BRouter)</desc>
    <trkseg>\n`;

        // If we have calculated BRouter high-resolution geometry, use it
        if (state.routeGeometry && state.routeGeometry.length > 0) {
            state.routeGeometry.forEach(coord => {
                // GeoJSON has [lon, lat], GPX wants lat, lon
                gpx += `      <trkpt lat="${coord[1].toFixed(6)}" lon="${coord[0].toFixed(6)}"/>\n`;
            });
        } else {
            // Fallback: use only the main waypoint pins for track points
            state.waypoints.forEach(wp => {
                gpx += `      <trkpt lat="${wp.lat.toFixed(6)}" lon="${wp.lng.toFixed(6)}"/>\n`;
            });
        }

        gpx += `    </trkseg>
  </trk>
</gpx>`;

        // Trigger file download
        const blob = new Blob([gpx], { type: 'application/gpx+xml;charset=utf-8;' });
        const link = document.createElement('a');
        const fileName = name.replace(/[/\\?%*:|"<>\s]+/g, '_') + '.gpx';
        
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        link.click();
        
        showToast('Trasa wyeksportowana do pliku GPX!', 'success');
    }

    // Helper to escape XML special characters
    function escapeXml(unsafe) {
        return unsafe.replace(/[<>&'"]/g, function (c) {
            switch (c) {
                case '<': return '&lt;';
                case '>': return '&gt;';
                case '&': return '&amp;';
                case '\'': return '&apos;';
                case '"': return '&quot;';
            }
        });
    }

    btnExport.addEventListener('click', exportToGPX);

    // Toast Notifications helper
    function showToast(message, type = 'success') {
        // Create container if not exists
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        // Add matching icon
        let iconHtml = '';
        if (type === 'success') {
            iconHtml = `<svg viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" stroke-width="3" style="width:16px;height:16px;"><path d="M20 6L9 17l-5-5"/></svg>`;
        } else {
            iconHtml = `<svg viewBox="0 0 24 24" fill="none" stroke="var(--color-danger)" stroke-width="3" style="width:16px;height:16px;"><path d="M18 6L6 18M6 6l12 12"/></svg>`;
        }

        toast.innerHTML = `${iconHtml}<span>${message}</span>`;
        container.appendChild(toast);

        // Remove element after animation completes
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    // Sidebar Toggle handling (mobile)
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'sidebar-toggle';
    toggleBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"/></svg>';
    document.getElementById('app-container').appendChild(toggleBtn);

    toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });

    // ==========================================
    // Attractions Along Route (Overpass API)
    // ==========================================

    // Map OSM tags to readable Polish labels and emoji icons
    function getAttractionMeta(tags) {
        const t = tags.tourism;
        const h = tags.historic;
        const a = tags.amenity;
        const l = tags.leisure;

        if (t === 'viewpoint')        return { label: 'Punkt widokowy',   icon: '🏔️' };
        if (t === 'museum')           return { label: 'Muzeum',           icon: '🏛️' };
        if (t === 'castle')           return { label: 'Zamek',            icon: '🏰' };
        if (t === 'attraction')       return { label: 'Atrakcja',         icon: '⭐' };
        if (t === 'theme_park')       return { label: 'Park rozrywki',    icon: '🎡' };
        if (t === 'artwork')          return { label: 'Dzieło sztuki',    icon: '🎨' };
        if (t === 'gallery')          return { label: 'Galeria',          icon: '🖼️' };
        if (h === 'castle')           return { label: 'Zamek/Ruiny',      icon: '🏯' };
        if (h === 'ruins')            return { label: 'Ruiny',            icon: '🏚️' };
        if (h === 'monument')         return { label: 'Pomnik',           icon: '🗿' };
        if (h === 'memorial')         return { label: 'Memoriał',         icon: '🕌' };
        if (h === 'archaeological_site') return { label: 'Stanowisko arch.', icon: '⛏️' };
        if (l === 'nature_reserve')   return { label: 'Rezerwat',         icon: '🌿' };
        if (l === 'park')             return { label: 'Park',             icon: '🌳' };
        if (a === 'place_of_worship') return { label: 'Kościół/Świątynia',icon: '⛪' };
        return { label: 'Inne', icon: '📍' };
    }

    function getRouteBounds(geometryCoords, paddingMeters) {
        let south = Infinity;
        let west = Infinity;
        let north = -Infinity;
        let east = -Infinity;

        geometryCoords.forEach(coord => {
            const lon = Number(coord[0]);
            const lat = Number(coord[1]);
            if (!Number.isFinite(lat) || !Number.isFinite(lon)) return;

            south = Math.min(south, lat);
            west = Math.min(west, lon);
            north = Math.max(north, lat);
            east = Math.max(east, lon);
        });

        const centerLat = (south + north) / 2;
        const latPadding = paddingMeters / 111320;
        const lonPadding = paddingMeters / (111320 * Math.cos(centerLat * Math.PI / 180) || 1);

        return {
            south: south - latPadding,
            west: west - lonPadding,
            north: north + latPadding,
            east: east + lonPadding
        };
    }

    function buildOverpassQuery(geometryCoords, radiusMeters) {
        const bounds = getRouteBounds(geometryCoords, Math.max(radiusMeters, 300));

        return `
[out:json][timeout:60];
(
  nwr["tourism"~"^(viewpoint|museum|castle|attraction|theme_park|artwork|gallery)$"](${bounds.south.toFixed(6)},${bounds.west.toFixed(6)},${bounds.north.toFixed(6)},${bounds.east.toFixed(6)});
  nwr["historic"~"^(castle|ruins|monument|memorial|archaeological_site)$"](${bounds.south.toFixed(6)},${bounds.west.toFixed(6)},${bounds.north.toFixed(6)},${bounds.east.toFixed(6)});
  nwr["leisure"~"^(nature_reserve|park)$"]["name"](${bounds.south.toFixed(6)},${bounds.west.toFixed(6)},${bounds.north.toFixed(6)},${bounds.east.toFixed(6)});
  nwr["amenity"="place_of_worship"]["name"](${bounds.south.toFixed(6)},${bounds.west.toFixed(6)},${bounds.north.toFixed(6)},${bounds.east.toFixed(6)});
);
out center qt;`;
    }

    function pointToSegmentDistanceMeters(pointLat, pointLng, a, b) {
        const latScale = 111320;
        const lonScale = 111320 * Math.cos(pointLat * Math.PI / 180) || 1;

        const px = pointLng * lonScale;
        const py = pointLat * latScale;
        const ax = a[0] * lonScale;
        const ay = a[1] * latScale;
        const bx = b[0] * lonScale;
        const by = b[1] * latScale;

        const abx = bx - ax;
        const aby = by - ay;
        const apx = px - ax;
        const apy = py - ay;
        const abLenSq = abx * abx + aby * aby;
        const t = abLenSq === 0 ? 0 : Math.max(0, Math.min(1, (apx * abx + apy * aby) / abLenSq));
        const cx = ax + t * abx;
        const cy = ay + t * aby;

        return Math.hypot(px - cx, py - cy);
    }

    function isPointNearRoute(lat, lng, routeCoords, radiusMeters) {
        if (!routeCoords || routeCoords.length < 2) return false;

        const point = [lng, lat];
        for (let i = 0; i < routeCoords.length - 1; i++) {
            if (pointToSegmentDistanceMeters(lat, lng, routeCoords[i], routeCoords[i + 1]) <= radiusMeters) {
                return true;
            }
        }

        return false;
    }

    function filterAttractionsNearRoute(elements, routeCoords, radiusMeters) {
        return elements.filter(el => {
            const lat = el.lat ?? el.center?.lat;
            const lng = el.lon ?? el.center?.lon;
            if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false;
            return isPointNearRoute(lat, lng, routeCoords, radiusMeters);
        });
    }

    // Fetch attractions from Overpass API and display on map + sidebar
    async function fetchAttractions() {
        if (!state.routeGeometry || state.routeGeometry.length < 2) {
            showToast('Najpierw wyznacz trasę, aby wyszukać atrakcje.', 'error');
            return;
        }

        const radius = parseInt(attractionsRange.value) || 1000;

        // Loading state on button
        btnFindAttractions.disabled = true;
        btnFindAttractions.innerHTML = `
            <svg viewBox="0 0 50 50" style="width:16px;height:16px;animation:spin 1s linear infinite;stroke:currentColor;fill:none;">
              <circle cx="25" cy="25" r="20" stroke-width="5" stroke-dasharray="80,200" stroke-dashoffset="0" stroke-linecap="round"/>
            </svg>
            Szukam atrakcji...`;
        if (!document.getElementById('spin-keyframes')) {
            const style = document.createElement('style');
            style.id = 'spin-keyframes';
            style.innerHTML = `@keyframes spin { 100% { transform: rotate(360deg); } }`;
            document.head.appendChild(style);
        }

        clearAttractions();

        try {
            const query = buildOverpassQuery(state.routeGeometry, radius);
            const response = await fetch('https://overpass-api.de/api/interpreter', {
                method: 'POST',
                body: query
            });

            if (!response.ok) {
                const errorText = await response.text().catch(() => '');
                throw new Error(`Overpass API Error${errorText ? `: ${errorText}` : ''}`);
            }

            const data = await response.json();
            const elements = data.elements || [];

            // Filter out POIs with no name
            const named = filterAttractionsNearRoute(
                elements.filter(el => el.tags && el.tags.name),
                state.routeGeometry,
                radius
            );

            if (named.length === 0) {
                showToast('Brak atrakcji w wybranym promieniu. Spróbuj zwiększyć zasięg.', 'error');
                return;
            }

            state.attractions = named;

            // Render on map and in sidebar
            renderAttractionMarkers(named);
            renderAttractionsList(named);

            showToast(`Znaleziono ${named.length} atrakcji wzdłuż trasy!`, 'success');

        } catch (error) {
            console.error('Overpass API error:', error);
            showToast('Błąd wyszukiwania atrakcji. Spróbuj ponownie.', 'error');
        } finally {
            btnFindAttractions.disabled = false;
            btnFindAttractions.innerHTML = `
                <svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" stroke="currentColor" stroke-width="2" fill="none"/></svg>
                Wyszukaj atrakcje`;
        }
    }

    // Place attraction markers on the Leaflet map
    function renderAttractionMarkers(attractions) {
        attractions.forEach(el => {
            const lat = el.lat || (el.center && el.center.lat);
            const lng = el.lon || (el.center && el.center.lon);
            if (!lat || !lng) return;

            const meta = getAttractionMeta(el.tags);
            const name = el.tags.name || 'Bez nazwy';

            const icon = L.divIcon({
                className: 'custom-div-icon',
                html: `<div class="custom-marker custom-marker-attraction" id="attraction-icon-${el.id}" style="font-size:0.85rem;">${meta.icon}</div>`,
                iconSize: [28, 28],
                iconAnchor: [14, 28],
                popupAnchor: [0, -32]
            });

            const marker = L.marker([lat, lng], { icon }).addTo(state.map);
            marker.bindPopup(`
                <div style="font-size:0.85rem;color:var(--text-primary);min-width:170px;">
                    <b style="font-size:0.95rem;display:block;margin-bottom:3px;">${meta.icon} ${name}</b>
                    <span style="color:var(--text-muted);font-size:0.75rem;display:block;margin-bottom:8px;">${meta.label}</span>
                    <button id="btn-add-attraction-${el.id}" class="btn btn-primary" style="padding:6px 12px;font-size:0.75rem;width:100%;font-weight:600;">
                        + Dodaj do trasy
                    </button>
                </div>
            `);

            state.attractionMarkers.push(marker);
        });
    }

    // Render the sidebar attraction list
    function renderAttractionsList(attractions) {
        attractionsContainer.innerHTML = '';

        attractions.forEach(el => {
            const lat = el.lat || (el.center && el.center.lat);
            const lng = el.lon || (el.center && el.center.lon);
            if (!lat || !lng) return;

            const meta = getAttractionMeta(el.tags);
            const name = el.tags.name || 'Bez nazwy';

            const item = document.createElement('div');
            item.className = 'attraction-item';
            item.innerHTML = `
                <div class="attraction-icon-container">${meta.icon}</div>
                <div class="attraction-info">
                    <span class="attraction-name" title="${name}">${name}</span>
                    <span class="attraction-type">${meta.label}</span>
                </div>
                <div class="attraction-actions">
                    <button class="attraction-btn" data-lat="${lat}" data-lng="${lng}" data-name="${name}" title="Pokaż na mapie">🗺</button>
                    <button class="attraction-btn add-to-route-btn" data-lat="${lat}" data-lng="${lng}" data-name="${name}" title="Dodaj do trasy">+</button>
                </div>
            `;

            // Fly to marker on map icon click
            item.querySelector('.attraction-btn').addEventListener('click', () => {
                state.map.setView([lat, lng], 16);
                // Find and open popup for this marker
                const markerIdx = state.attractions.findIndex(a => a.id === el.id);
                if (markerIdx !== -1 && state.attractionMarkers[markerIdx]) {
                    state.attractionMarkers[markerIdx].openPopup();
                }
            });

            // Add to route button
            item.querySelector('.add-to-route-btn').addEventListener('click', () => {
                addWaypoint(lat, lng, name);
                showToast(`Dodano „${name}" do trasy.`, 'success');
            });

            attractionsContainer.appendChild(item);
        });

        // Show list and update counter badge
        attractionsContainer.style.display = 'flex';
        attractionsCount.textContent = attractions.length;
        attractionsCount.style.display = 'inline-block';
    }

    // Wire up "Find Attractions" button
    btnFindAttractions.addEventListener('click', fetchAttractions);

    // Initialize Everything
    initMap();
    loadSavedRoutesList();

    // ==========================================
    // Location Search Logic (Nominatim API)
    // ==========================================
    const searchInput = document.getElementById('search-input');
    const btnSearch = document.getElementById('btn-search');
    const searchResults = document.getElementById('search-results');

    async function performSearch() {
        const query = searchInput.value.trim();
        if (!query) {
            showToast('Wpisz nazwę miejscowości do wyszukania.', 'error');
            return;
        }

        btnSearch.disabled = true;
        btnSearch.innerHTML = `<svg viewBox="0 0 50 50" style="width:16px;height:16px;animation:spin 1s linear infinite;stroke:currentColor;fill:none;"><circle cx="25" cy="25" r="20" stroke-width="5" stroke-dasharray="80, 200" stroke-dashoffset="0" stroke-linecap="round"/></svg>`;
        
        // Add spin animation CSS to document dynamically if missing
        if (!document.getElementById('spin-keyframes')) {
            const style = document.createElement('style');
            style.id = 'spin-keyframes';
            style.innerHTML = `@keyframes spin { 100% { transform: rotate(360deg); } }`;
            document.head.appendChild(style);
        }

        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`, {
                headers: {
                    'Accept-Language': 'pl,en;q=0.5'
                }
            });

            if (!response.ok) throw new Error('Search API Error');
            const data = await response.json();

            renderSearchResults(data);
        } catch (error) {
            console.error('Search failed:', error);
            showToast('Błąd wyszukiwania. Spróbuj ponownie później.', 'error');
        } finally {
            btnSearch.disabled = false;
            btnSearch.innerHTML = `<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" stroke="currentColor" fill="none" stroke-width="2.5"/><path d="M21 21l-4.35-4.35" stroke="currentColor" stroke-width="2.5"/></svg>`;
        }
    }

    function renderSearchResults(results) {
        searchResults.innerHTML = '';
        if (!results || results.length === 0) {
            searchResults.innerHTML = '<div style="color:var(--text-muted);font-size:0.8rem;text-align:center;padding:8px 0;">Nie znaleziono takiego miejsca.</div>';
            searchResults.style.display = 'flex';
            return;
        }

        results.forEach(result => {
            const item = document.createElement('div');
            item.className = 'search-result-item';
            
            const displayName = result.display_name;
            item.innerText = displayName;
            item.title = displayName;

            item.addEventListener('click', () => {
                const lat = parseFloat(result.lat);
                const lon = parseFloat(result.lon);
                
                // Pan map to location
                state.map.setView([lat, lon], 14);

                // Add search marker
                if (searchMarker) {
                    state.map.removeLayer(searchMarker);
                }

                const searchIcon = L.divIcon({
                    className: 'custom-div-icon',
                    html: `<div class="custom-marker" style="background: linear-gradient(135deg, var(--color-accent), var(--color-primary)); border-color: gold;"><span>🔍</span></div>`,
                    iconSize: [28, 28],
                    iconAnchor: [14, 28],
                    popupAnchor: [0, -30]
                });

                let simpleName = displayName.split(',')[0];

                searchMarker = L.marker([lat, lon], { icon: searchIcon }).addTo(state.map);
                searchMarker.bindPopup(`
                    <div style="font-size:0.85rem;color:var(--text-primary);min-width:160px;">
                        <b style="font-size:0.9rem;display:block;margin-bottom:4px;">${simpleName}</b>
                        <span style="color:var(--text-muted);display:block;margin-bottom:8px;font-size:0.75rem;max-height:60px;overflow-y:auto;white-space:normal;">${displayName}</span>
                        <button id="btn-add-search-wp" class="btn btn-primary" data-lat="${lat}" data-lng="${lon}" data-name="${simpleName}" style="padding: 6px 12px; font-size: 0.75rem; width: 100%; font-weight:600;">
                            + Dodaj do trasy
                        </button>
                    </div>
                `).openPopup();

                searchResults.style.display = 'none';
            });

            searchResults.appendChild(item);
        });

        searchResults.style.display = 'flex';
    }

    btnSearch.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    // Close search list on clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('#search-input') && !e.target.closest('#btn-search') && !e.target.closest('#search-results')) {
            searchResults.style.display = 'none';
        }
    });
});
