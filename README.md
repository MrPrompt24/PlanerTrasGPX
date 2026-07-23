<div align="center">

# Planer Tras GPX

Darmowa aplikacja webowa do planowania tras pieszych, rowerowych i samochodowych na mapie OpenStreetMap, z eksportem do plików GPX.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![PHP](https://img.shields.io/badge/PHP-8.x-777bb4.svg)](https://www.php.net/)
[![SQLite](https://img.shields.io/badge/DB-SQLite-003b57.svg)](https://www.sqlite.org/)

**[Polski](#-polski) | [English](#-english)**

</div>

---

## 🇵🇱 Polski

### Spis treści
- [O projekcie](#o-projekcie)
- [Funkcje](#funkcje)
- [Stack technologiczny](#stack-technologiczny)
- [Wymagania](#wymagania)
- [Instalacja](#instalacja)
- [Uruchomienie](#uruchomienie)
- [Użycie](#użycie)
- [Struktura projektu](#struktura-projektu)
- [API](#api)
- [Licencja](#licencja)
- [Kontakt](#kontakt)

### O projekcie
**Planer Tras GPX** to aplikacja webowa pozwalająca zaplanować trasę pieszą,
rowerową lub samochodową bezpośrednio na interaktywnej mapie (OpenStreetMap /
Esri), a następnie wyeksportować ją do standardowego pliku **GPX**, gotowego
do wgrania na urządzenie GPS lub do aplikacji turystycznych. Trasa jest
"przyklejana" do rzeczywistych dróg i szlaków dzięki silnikowi routingu
**BRouter**, a użytkownik może dodatkowo wyszukać atrakcje turystyczne
(zabytki, punkty widokowe, muzea, rezerwaty przyrody itd.) w zadanym
promieniu wzdłuż wyznaczonej trasy, korzystając z danych **OpenStreetMap
(Overpass API)**.

Projekt jest przeznaczony dla turystów, rowerzystów i osób planujących
wycieczki, które chcą szybko wyznaczyć trasę, zobaczyć dystans i szacowany
czas przejścia/przejazdu, zapisać ją na później oraz wyeksportować do GPX
bez zakładania konta i bez opłat.

### Funkcje
- 🗺️ Interaktywna mapa (Leaflet) z warstwami: OSM ciemna, OSM jasna, satelita
  (Esri) i mapa topograficzna (Esri).
- 📍 Dodawanie punktów trasy kliknięciem na mapie, z możliwością
  przeciągania, zmiany kolejności i usuwania.
- 🚶🚴🚗 Wybór profilu trasy (pieszo, rower trekkingowy, rower szosowy, auto,
  linia prosta) — routing po realnych drogach przez **BRouter**.
- 📏 Automatyczne wyliczanie dystansu i szacowanego czasu marszu/jazdy.
- 🔎 Wyszukiwanie miejscowości i adresów (Nominatim) oraz automatyczne
  rewersyjne geokodowanie nazw punktów.
- ⭐ Wyszukiwanie atrakcji turystycznych wzdłuż trasy w wybranym promieniu
  (Overpass API): zabytki, muzea, zamki, punkty widokowe, parki, rezerwaty,
  miejsca kultu itd. — z możliwością dodania ich jednym kliknięciem do trasy.
- 💾 Zapisywanie, wczytywanie i usuwanie tras w lokalnej bazie danych.
- 📤 Eksport trasy do pliku **GPX** (waypointy + ślad trasy) gotowego do
  użycia w urządzeniach GPS i aplikacjach turystycznych.
- 📱 Responsywny interfejs z chowanym panelem bocznym na urządzeniach
  mobilnych.

### Stack technologiczny
- **Backend:** PHP (API REST w `api.php`, natywne PDO)
- **Baza danych:** SQLite (plik tworzony automatycznie w `data/database.sqlite`)
- **Frontend:** czysty HTML/CSS/JavaScript (bez frameworka i bez buildu)
- **Mapa:** [Leaflet.js](https://leafletjs.com/)
- **Routing:** [BRouter](https://brouter.de/)
- **Geokodowanie / wyszukiwanie:** [Nominatim (OpenStreetMap)](https://nominatim.org/)
- **Punkty zainteresowania:** [Overpass API (OpenStreetMap)](https://overpass-api.de/)
- **Kafelki map:** OpenStreetMap, Esri (satelita, topograficzna)

### Wymagania
- PHP 8.x z rozszerzeniem **PDO SQLite** (`pdo_sqlite`)
- Serwer WWW obsługujący PHP, np. **XAMPP** / Apache / wbudowany serwer PHP
- Dostęp do internetu w przeglądarce (aplikacja korzysta z zewnętrznych API:
  BRouter, Nominatim, Overpass oraz kafelków map)

### Instalacja
1. Skopiuj folder projektu do katalogu serwera WWW, np. w XAMPP:
   `C:\xampp\htdocs\PlanerTrasGPX`
2. Upewnij się, że rozszerzenie `pdo_sqlite` jest włączone w PHP
   (w `php.ini`: `extension=pdo_sqlite`).
3. Nie jest wymagany żaden `composer install` ani `npm install` — projekt
   nie ma zewnętrznych zależności backendowych/frontendowych do instalacji
   (Leaflet ładowany jest z CDN w [index.php](index.php)).

### Uruchomienie
1. Uruchom Apache (np. z panelu XAMPP Control Panel).
2. Otwórz w przeglądarce:
   ```
   http://localhost/PlanerTrasGPX/
   ```
3. Baza danych SQLite (`data/database.sqlite`) oraz tabela `routes` zostaną
   utworzone automatycznie przy pierwszym żądaniu do API ([db.php](db.php)).

### Użycie
1. Kliknij na mapie, aby dodać punkty trasy (min. 2 punkty).
2. Wybierz profil trasy (pieszo / rower / auto / linia prosta) — trasa
   przeliczy się automatycznie po realnych drogach (BRouter).
3. Nadaj trasie nazwę i kliknij **Zapisz**, aby zachować ją w bazie danych.
4. Kliknij **Wyszukaj atrakcje**, aby znaleźć punkty turystyczne w pobliżu
   trasy i dodać wybrane do planu jednym kliknięciem.
5. Kliknij **Eksportuj do GPX**, aby pobrać plik `.gpx` z trasą i punktami.

### Struktura projektu
```
PlanerTrasGPX/
├── index.php           # Główny widok aplikacji (UI)
├── api.php              # REST API: list / get / save / delete tras
├── db.php               # Połączenie z SQLite + tworzenie tabeli routes
├── assets/
│   ├── css/style.css     # Style interfejsu
│   └── js/app.js         # Logika aplikacji (mapa, routing, GPX, atrakcje)
└── data/
    └── database.sqlite   # Baza danych (tworzona automatycznie)
```

### API
Proste REST API oparte o parametr `?action=`, zaimplementowane w
[api.php](api.php):

| Metoda | Endpoint | Opis |
|---|---|---|
| GET | `api.php?action=list` | Lista zapisanych tras |
| GET | `api.php?action=get&id=<id>` | Szczegóły pojedynczej trasy |
| POST | `api.php?action=save` | Zapis nowej trasy lub aktualizacja istniejącej |
| POST | `api.php?action=delete&id=<id>` | Usunięcie trasy |

Wszystkie odpowiedzi mają format `{ "success": bool, "data"/"error": ... }`.

### Licencja
Ten projekt jest objęty licencją MIT — zobacz plik [LICENSE](LICENSE).

### Kontakt
Repozytorium: https://github.com/MrPrompt24/PlanerTrasGPX

---

## 🇬🇧 English

### Table of Contents
- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Requirements](#requirements)
- [Installation](#installation)
- [Running the App](#running-the-app)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [API](#api-1)
- [License](#license)
- [Contact](#contact)

### About
**Planer Tras GPX** ("GPX Route Planner") is a web application for planning
hiking, cycling, and driving routes directly on an interactive map
(OpenStreetMap / Esri), then exporting them to a standard **GPX** file ready
to be loaded onto a GPS device or into hiking/cycling apps. Routes are
snapped to real roads and trails using the **BRouter** routing engine, and
users can additionally search for tourist attractions (landmarks, viewpoints,
museums, nature reserves, etc.) within a given radius along the route, using
**OpenStreetMap (Overpass API)** data.

The project is aimed at hikers, cyclists, and trip planners who want to
quickly draw a route, see its distance and estimated travel time, save it for
later, and export it to GPX — with no account and no fees.

### Features
- 🗺️ Interactive map (Leaflet) with multiple base layers: dark OSM, light
  OSM, Esri satellite imagery, and Esri topographic map.
- 📍 Add route points by clicking the map, with support for dragging,
  reordering, and deleting waypoints.
- 🚶🚴🚗 Route profile selection (hiking, trekking bike, road bike, car,
  straight line) — routed along real roads via **BRouter**.
- 📏 Automatic distance and estimated travel-time calculation.
- 🔎 Place/address search (Nominatim) and automatic reverse geocoding of
  waypoint names.
- ⭐ Search for tourist attractions along the route within a chosen radius
  (Overpass API): landmarks, museums, castles, viewpoints, parks, nature
  reserves, places of worship, etc. — addable to the route in one click.
- 💾 Save, load, and delete routes in a local database.
- 📤 Export the route to a **GPX** file (waypoints + track) ready to use on
  GPS devices and in hiking/cycling apps.
- 📱 Responsive UI with a collapsible sidebar on mobile devices.

### Tech Stack
- **Backend:** PHP (REST API in `api.php`, native PDO)
- **Database:** SQLite (file auto-created at `data/database.sqlite`)
- **Frontend:** plain HTML/CSS/JavaScript (no framework, no build step)
- **Map:** [Leaflet.js](https://leafletjs.com/)
- **Routing:** [BRouter](https://brouter.de/)
- **Geocoding / search:** [Nominatim (OpenStreetMap)](https://nominatim.org/)
- **Points of interest:** [Overpass API (OpenStreetMap)](https://overpass-api.de/)
- **Map tiles:** OpenStreetMap, Esri (satellite, topographic)

### Requirements
- PHP 8.x with the **PDO SQLite** extension (`pdo_sqlite`)
- A PHP-capable web server, e.g. **XAMPP** / Apache / the built-in PHP server
- Internet access in the browser (the app relies on external APIs: BRouter,
  Nominatim, Overpass, and map tile providers)

### Installation
1. Copy the project folder into your web server directory, e.g. with XAMPP:
   `C:\xampp\htdocs\PlanerTrasGPX`
2. Make sure the `pdo_sqlite` extension is enabled in PHP
   (in `php.ini`: `extension=pdo_sqlite`).
3. No `composer install` or `npm install` is required — the project has no
   external backend/frontend dependencies to install (Leaflet is loaded from
   a CDN in [index.php](index.php)).

### Running the App
1. Start Apache (e.g. from the XAMPP Control Panel).
2. Open in your browser:
   ```
   http://localhost/PlanerTrasGPX/
   ```
3. The SQLite database (`data/database.sqlite`) and the `routes` table are
   created automatically on the first API request ([db.php](db.php)).

### Usage
1. Click on the map to add route points (at least 2 points).
2. Pick a route profile (hiking / bike / car / straight line) — the route is
   recalculated automatically along real roads (BRouter).
3. Name the route and click **Zapisz** ("Save") to store it in the database.
4. Click **Wyszukaj atrakcje** ("Find Attractions") to discover points of
   interest near the route and add selected ones to the plan with one click.
5. Click **Eksportuj do GPX** ("Export to GPX") to download a `.gpx` file
   with the route and waypoints.

### Project Structure
```
PlanerTrasGPX/
├── index.php           # Main application view (UI)
├── api.php              # REST API: list / get / save / delete routes
├── db.php               # SQLite connection + routes table creation
├── assets/
│   ├── css/style.css     # UI styles
│   └── js/app.js         # App logic (map, routing, GPX, attractions)
└── data/
    └── database.sqlite   # Database (created automatically)
```

### API
A simple REST API based on the `?action=` parameter, implemented in
[api.php](api.php):

| Method | Endpoint | Description |
|---|---|---|
| GET | `api.php?action=list` | List saved routes |
| GET | `api.php?action=get&id=<id>` | Get a single route's details |
| POST | `api.php?action=save` | Create or update a route |
| POST | `api.php?action=delete&id=<id>` | Delete a route |

All responses follow the `{ "success": bool, "data"/"error": ... }` shape.

### License
This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

### Contact
Repository: https://github.com/MrPrompt24/PlanerTrasGPX


