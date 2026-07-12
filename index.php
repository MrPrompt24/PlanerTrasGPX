<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Planer Tras GPX - Twórz i eksportuj trasy na mapie OSM</title>
    
    <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%2306b6d4' d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z'/%3E%3C/svg%3E">
    <!-- Leaflet.js CSS -->
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" 
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin=""/>
    
    <!-- Custom Application CSS -->
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>

    <div id="app-container">
        
        <!-- Sidebar Dashboard -->
        <aside id="sidebar">
            
            <!-- Logo Section -->
            <div class="sidebar-header">
                <div class="logo-icon">
                    <!-- Custom Route Planner SVG Icon -->
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" stroke="#ffffff" stroke-width="0.5"/>
                        <path d="M9 9h6v6H9z" fill="none"/>
                        <path d="M19.4 14.5c-.3-.2-.5-.5-.6-.8L17 8.5c-.2-.5-.7-.8-1.2-.8H8.2c-.5 0-1 .3-1.2.8L5.2 13.7c-.1.3-.3.6-.6.8-.7.5-1.1 1.3-1.1 2.2 0 1.5 1.2 2.7 2.7 2.7h11.6c1.5 0 2.7-1.2 2.7-2.7 0-.9-.4-1.7-1.1-2.2z" fill="none"/>
                    </svg>
                </div>
                <div class="logo-text">
                    <h1>Planer Tras GPX</h1>
                    <span>Darmowe planowanie na mapie OSM</span>
                </div>
            </div>
            
            <!-- Sidebar Content -->
            <div class="sidebar-content">
                
                <!-- Search Box Panel -->
                <div class="panel">
                    <div class="panel-title">Wyszukaj miejscowość</div>
                    <div style="display: flex; gap: 8px;">
                        <input type="text" id="search-input" class="route-name-input" placeholder="Wpisz np. Zakopane, Kościuszki..." style="flex: 1;" autocomplete="off">
                        <button id="btn-search" class="btn btn-primary" style="padding: 10px 14px;" title="Szukaj">
                            <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" stroke="currentColor" fill="none" stroke-width="2.5"/><path d="M21 21l-4.35-4.35" stroke="currentColor" stroke-width="2.5"/></svg>
                        </button>
                    </div>
                    <div id="search-results" class="search-results-list" style="display: none;"></div>
                </div>

                <!-- Active Route Details -->
                <div class="panel">
                    <div class="panel-title">Planowanie Trasy</div>
                    
                    <input type="text" id="route-name" class="route-name-input" placeholder="Nazwa Twojej trasy..." autocomplete="off">
                    
                    <!-- Profile Pickers (BRouter compatible) -->
                    <div class="profile-selector">
                        <button class="profile-btn active" data-profile="hiking" title="Pieszo (BRouter hiking)">
                            <!-- Pedestrian Icon -->
                            <svg viewBox="0 0 24 24">
                                <path d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.3l1.8-.4"/>
                            </svg>
                            <span>Pieszo</span>
                        </button>
                        <button class="profile-btn" data-profile="trekking" title="Rower (BRouter trekking)">
                            <!-- Bicycle Icon -->
                            <svg viewBox="0 0 24 24">
                                <path d="M15.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm0-5c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm14 5c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm0-5c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-8.2-1.8L9.3 6H6v2h2.4l1.3 3.3L7 16h2.2l1.6-4.2L13 14v4h2v-5.2l-2.7-3z"/>
                            </svg>
                            <span>Rower</span>
                        </button>
                        <button class="profile-btn" data-profile="fastbike" title="Szosa (BRouter fastbike)">
                            <!-- Racing Bicycle Icon -->
                            <svg viewBox="0 0 24 24">
                                <path d="M19 15c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm0-5c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM5 15c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm0-5c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm7.5 1.5l1.6-3.8-3.1-3.2H8v1.5h2.4l2 2.1-2.2 4.4H5.5v1.5h3.6l1.6-3.2 2.1 2.2V15h1.5v-4h-1.8z"/>
                            </svg>
                            <span>Szosa</span>
                        </button>
                        <button class="profile-btn" data-profile="car-test" title="Auto (BRouter car-test)">
                            <!-- Car Icon -->
                            <svg viewBox="0 0 24 24">
                                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42.99L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.27-3.82c.14-.4.52-.68.96-.68h9.54c.44 0 .82.28.96.68L19 11H5z"/>
                            </svg>
                            <span>Auto</span>
                        </button>
                        <button class="profile-btn" data-profile="straight" title="Linia prosta">
                            <!-- Straight Line Icon -->
                            <svg viewBox="0 0 24 24">
                                <path d="M3 3h4v4H3zm14 14h4v4h-4zM6 6l12 12" stroke-width="2"/>
                            </svg>
                            <span>Prosto</span>
                        </button>
                    </div>

                    <!-- Statistics Info -->
                    <div class="route-stats">
                        <div class="stat-box">
                            <div class="stat-label">Dystans</div>
                            <div id="stat-distance" class="stat-value">0.00 km</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-label">Czas marszu/jazdy</div>
                            <div id="stat-duration" class="stat-value">--</div>
                        </div>
                    </div>
                </div>

                <!-- Waypoints list -->
                <div class="panel">
                    <div class="panel-title">Punkty trasy</div>
                    <div id="waypoints-list" class="waypoints-list-container">
                        <div class="empty-placeholder">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
                            <span>Kliknij na mapie, aby dodać punkty trasy</span>
                        </div>
                    </div>
                    
                    <div class="btn-group">
                        <button id="btn-clear" class="btn btn-secondary">
                            <svg viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7M10 11v6M14 11v6M4 7h16M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3"/></svg>
                            Wyczyść
                        </button>
                        <button id="btn-save" class="btn btn-primary">
                            <svg viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2zM17 21v-8H7v8M7 3v5h8"/></svg>
                            Zapisz
                        </button>
                        <button id="btn-export" class="btn btn-primary btn-full" style="background: linear-gradient(135deg, var(--color-accent), var(--color-success));">
                            <svg viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                            Eksportuj do GPX
                        </button>
                    </div>
                </div>

                <!-- Attractions Panel -->
                <div class="panel" id="panel-attractions">
                    <div class="panel-title">
                        <span>Atrakcje na trasie</span>
                        <span class="badge badge-accent" id="attractions-count" style="display: none; background: rgba(6, 182, 212, 0.2); color: var(--color-accent);">0</span>
                    </div>
                    
                    <div style="display: flex; flex-direction: column; gap: 10px;">
                        <div style="display: flex; gap: 8px; align-items: center;">
                            <label for="attraction-range" style="font-size: 0.8rem; color: var(--text-secondary); flex: 1;">Szukaj w promieniu:</label>
                            <select id="attraction-range" class="route-name-input" style="padding: 6px 10px; font-size: 0.8rem; background: rgba(15, 23, 42, 0.5);">
                                <option value="500">500 m</option>
                                <option value="1000" selected>1 km</option>
                                <option value="2000">2 km</option>
                                <option value="5000">5 km</option>
                            </select>
                        </div>
                        
                        <button id="btn-find-attractions" class="btn btn-secondary btn-full" style="background: rgba(6, 182, 212, 0.1); border-color: rgba(6, 182, 212, 0.3); color: var(--color-accent); font-weight: 600;">
                            <svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" stroke="currentColor" stroke-width="2" fill="none"/></svg>
                            Wyszukaj atrakcje
                        </button>
                    </div>

                    <div id="attractions-list" class="waypoints-list-container" style="max-height: 220px; display: none;">
                        <!-- Loaded dynamically -->
                    </div>
                </div>

                <!-- Saved Routes -->
                <div class="panel">
                    <div class="panel-title">Moje zapisane trasy</div>
                    <div id="saved-routes-list" class="saved-routes-list">
                        <!-- Loaded dynamically -->
                    </div>
                </div>

            </div>
        </aside>

        <!-- Interactive Map Container -->
        <main id="map"></main>

    </div>

    <!-- Leaflet.js JS -->
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" 
            integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
    
    <!-- Custom Application JS -->
    <script src="assets/js/app.js"></script>
</body>
</html>
