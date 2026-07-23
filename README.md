<div align="center">

# Planer Tras GPX

Darmowa aplikacja webowa do planowania tras pieszych, rowerowych i samochodowych na mapie OpenStreetMap, z eksportem do plik贸w GPX.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![PHP](https://img.shields.io/badge/PHP-8.x-777bb4.svg)](https://www.php.net/)
[![SQLite](https://img.shields.io/badge/DB-SQLite-003b57.svg)](https://www.sqlite.org/)

**[Polski](#-polski) | [English](#-english)**

</div>

---

## 馃嚨馃嚤 Polski

### Spis tre艣ci
- [O projekcie](#o-projekcie)
- [Funkcje](#funkcje)
- [Stack technologiczny](#stack-technologiczny)
- [Wymagania](#wymagania)
- [Instalacja](#instalacja)
- [Uruchomienie](#uruchomienie)
- [U偶ycie](#u偶ycie)
- [Struktura projektu](#struktura-projektu)
- [API](#api)
- [Licencja](#licencja)
- [Kontakt](#kontakt)

### O projekcie
**Planer Tras GPX** to aplikacja webowa pozwalaj膮ca zaplanowa膰 tras臋 piesz膮,
rowerow膮 lub samochodow膮 bezpo艣rednio na interaktywnej mapie (OpenStreetMap /
Esri), a nast臋pnie wyeksportowa膰 j膮 do standardowego pliku **GPX**, gotowego
do wgrania na urz膮dzenie GPS lub do aplikacji turystycznych. Trasa jest
"przyklejana" do rzeczywistych dr贸g i szlak贸w dzi臋ki silnikowi routingu
**BRouter**, a u偶ytkownik mo偶e dodatkowo wyszuka膰 atrakcje turystyczne
(zabytki, punkty widokowe, muzea, rezerwaty przyrody itd.) w zadanym
promieniu wzd艂u偶 wyznaczonej trasy, korzystaj膮c z danych **OpenStreetMap
(Overpass API)**.

Projekt jest przeznaczony dla turyst贸w, rowerzyst贸w i os贸b planuj膮cych
wycieczki, kt贸re chc膮 szybko wyznaczy膰 tras臋, zobaczy膰 dystans i szacowany
czas przej艣cia/przejazdu, zapisa膰 j膮 na p贸藕niej oraz wyeksportowa膰 do GPX
bez zak艂adania konta i bez op艂at.

### Funkcje
- 馃椇锔?Interaktywna mapa (Leaflet) z warstwami: OSM ciemna, OSM jasna, satelita
  (Esri) i mapa topograficzna (Esri).
- 馃搷 Dodawanie punkt贸w trasy klikni臋ciem na mapie, z mo偶liwo艣ci膮
  przeci膮gania, zmiany kolejno艣ci i usuwania.
- 馃毝馃毚馃殫 Wyb贸r profilu trasy (pieszo, rower trekkingowy, rower szosowy, auto,
  linia prosta) 鈥?routing po realnych drogach przez **BRouter**.
- 馃搹 Automatyczne wyliczanie dystansu i szacowanego czasu marszu/jazdy.
- 馃攷 Wyszukiwanie miejscowo艣ci i adres贸w (Nominatim) oraz automatyczne
  rewersyjne geokodowanie nazw punkt贸w.
- 猸?Wyszukiwanie atrakcji turystycznych wzd艂u偶 trasy w wybranym promieniu
  (Overpass API): zabytki, muzea, zamki, punkty widokowe, parki, rezerwaty,
  miejsca kultu itd. 鈥?z mo偶liwo艣ci膮 dodania ich jednym klikni臋ciem do trasy.
- 馃捑 Zapisywanie, wczytywanie i usuwanie tras w lokalnej bazie danych.
- 馃摛 Eksport trasy do pliku **GPX** (waypointy + 艣lad trasy) gotowego do
  u偶ycia w urz膮dzeniach GPS i aplikacjach turystycznych.
- 馃摫 Responsywny interfejs z chowanym panelem bocznym na urz膮dzeniach
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
- Serwer WWW obs艂uguj膮cy PHP, np. **XAMPP** / Apache / wbudowany serwer PHP
- Dost臋p do internetu w przegl膮darce (aplikacja korzysta z zewn臋trznych API:
  BRouter, Nominatim, Overpass oraz kafelk贸w map)

### Instalacja
1. Skopiuj folder projektu do katalogu serwera WWW, np. w XAMPP:
   `C:\xampp\htdocs\PlanerTrasGPX`
2. Upewnij si臋, 偶e rozszerzenie `pdo_sqlite` jest w艂膮czone w PHP
   (w `php.ini`: `extension=pdo_sqlite`).
3. Nie jest wymagany 偶aden `composer install` ani `npm install` 鈥?projekt
   nie ma zewn臋trznych zale偶no艣ci backendowych/frontendowych do instalacji
   (Leaflet 艂adowany jest z CDN w [index.php](index.php)).

### Uruchomienie
1. Uruchom Apache (np. z panelu XAMPP Control Panel).
2. Otw贸rz w przegl膮darce:
   ```
   http://localhost/PlanerTrasGPX/
   ```
3. Baza danych SQLite (`data/database.sqlite`) oraz tabela `routes` zostan膮
   utworzone automatycznie przy pierwszym 偶膮daniu do API ([db.php](db.php)).

### U偶ycie
1. Kliknij na mapie, aby doda膰 punkty trasy (min. 2 punkty).
2. Wybierz profil trasy (pieszo / rower / auto / linia prosta) 鈥?trasa
   przeliczy si臋 automatycznie po realnych drogach (BRouter).
3. Nadaj trasie nazw臋 i kliknij **Zapisz**, aby zachowa膰 j膮 w bazie danych.
4. Kliknij **Wyszukaj atrakcje**, aby znale藕膰 punkty turystyczne w pobli偶u
   trasy i doda膰 wybrane do planu jednym klikni臋ciem.
5. Kliknij **Eksportuj do GPX**, aby pobra膰 plik `.gpx` z tras膮 i punktami.

### Struktura projektu
```
PlanerTrasGPX/
鈹溾攢鈹€ index.php           # G艂贸wny widok aplikacji (UI)
鈹溾攢鈹€ api.php              # REST API: list / get / save / delete tras
鈹溾攢鈹€ db.php               # Po艂膮czenie z SQLite + tworzenie tabeli routes
鈹溾攢鈹€ assets/
鈹?  鈹溾攢鈹€ css/style.css     # Style interfejsu
鈹?  鈹斺攢鈹€ js/app.js         # Logika aplikacji (mapa, routing, GPX, atrakcje)
鈹斺攢鈹€ data/
    鈹斺攢鈹€ database.sqlite   # Baza danych (tworzona automatycznie)
```

### API
Proste REST API oparte o parametr `?action=`, zaimplementowane w
[api.php](api.php):

| Metoda | Endpoint | Opis |
|---|---|---|
| GET | `api.php?action=list` | Lista zapisanych tras |
| GET | `api.php?action=get&id=<id>` | Szczeg贸艂y pojedynczej trasy |
| POST | `api.php?action=save` | Zapis nowej trasy lub aktualizacja istniej膮cej |
| POST | `api.php?action=delete&id=<id>` | Usuni臋cie trasy |

Wszystkie odpowiedzi maj膮 format `{ "success": bool, "data"/"error": ... }`.

### Licencja
Ten projekt jest obj臋ty licencj膮 MIT 鈥?zobacz plik [LICENSE](LICENSE).

### Kontakt
Repozytorium: https://github.com/MrPrompt24/PlanerTrasGPX

---

## 馃嚞馃嚙 English

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
later, and export it to GPX 鈥?with no account and no fees.

### Features
- 馃椇锔?Interactive map (Leaflet) with multiple base layers: dark OSM, light
  OSM, Esri satellite imagery, and Esri topographic map.
- 馃搷 Add route points by clicking the map, with support for dragging,
  reordering, and deleting waypoints.
- 馃毝馃毚馃殫 Route profile selection (hiking, trekking bike, road bike, car,
  straight line) 鈥?routed along real roads via **BRouter**.
- 馃搹 Automatic distance and estimated travel-time calculation.
- 馃攷 Place/address search (Nominatim) and automatic reverse geocoding of
  waypoint names.
- 猸?Search for tourist attractions along the route within a chosen radius
  (Overpass API): landmarks, museums, castles, viewpoints, parks, nature
  reserves, places of worship, etc. 鈥?addable to the route in one click.
- 馃捑 Save, load, and delete routes in a local database.
- 馃摛 Export the route to a **GPX** file (waypoints + track) ready to use on
  GPS devices and in hiking/cycling apps.
- 馃摫 Responsive UI with a collapsible sidebar on mobile devices.

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
3. No `composer install` or `npm install` is required 鈥?the project has no
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
2. Pick a route profile (hiking / bike / car / straight line) 鈥?the route is
   recalculated automatically along real roads (BRouter).
3. Name the route and click **Zapisz** ("Save") to store it in the database.
4. Click **Wyszukaj atrakcje** ("Find Attractions") to discover points of
   interest near the route and add selected ones to the plan with one click.
5. Click **Eksportuj do GPX** ("Export to GPX") to download a `.gpx` file
   with the route and waypoints.

### Project Structure
```
PlanerTrasGPX/
鈹溾攢鈹€ index.php           # Main application view (UI)
鈹溾攢鈹€ api.php              # REST API: list / get / save / delete routes
鈹溾攢鈹€ db.php               # SQLite connection + routes table creation
鈹溾攢鈹€ assets/
鈹?  鈹溾攢鈹€ css/style.css     # UI styles
鈹?  鈹斺攢鈹€ js/app.js         # App logic (map, routing, GPX, attractions)
鈹斺攢鈹€ data/
    鈹斺攢鈹€ database.sqlite   # Database (created automatically)
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
This project is licensed under the MIT License 鈥?see the [LICENSE](LICENSE) file for details.

### Contact
Repository: https://github.com/MrPrompt24/PlanerTrasGPX

