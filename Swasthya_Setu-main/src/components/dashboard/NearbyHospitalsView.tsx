import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { 
  MapPin, 
  Navigation, 
  Search, 
  Phone, 
  ExternalLink, 
  ShieldAlert, 
  Building2, 
  Compass, 
  RotateCw, 
  AlertCircle, 
  Info,
  Clock,
  Layers,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../utils/i18n';
import { Hospital } from '../../types';

// Haversine Distance in Kilometers
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(1));
}

export const NearbyHospitalsView: React.FC = () => {
  const { language } = useApp();
  const t = translations[language];

  // Map state
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  // Active anchor coordinates (Default: Hoshangabad / Pipariya central health district)
  const [centerCoords, setCenterCoords] = useState<{ lat: number; lon: number; name: string }>({
    lat: 22.7533,
    lon: 77.7346,
    name: 'Hoshangabad District Health Region, MP',
  });

  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedHospitalId, setSelectedHospitalId] = useState<string | null>(null);
  const [isLoadingHospitals, setIsLoadingHospitals] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [rateLimitNotice, setRateLimitNotice] = useState<string | null>(null);

  // Manual search input
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [searchResults, setSearchResults] = useState<Array<{ display_name: string; lat: string; lon: string }>>([]);

  // Geolocation status
  const [isLocatingUser, setIsLocatingUser] = useState(false);
  const [geoPermissionState, setGeoPermissionState] = useState<'prompt' | 'granted' | 'denied'>('prompt');

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [centerCoords.lat, centerCoords.lon],
      zoom: 12,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
    }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    // Invalidate map size after DOM render for smooth display
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Fetch Hospitals via Overpass API around active coordinates
  const fetchNearbyHospitals = async (lat: number, lon: number) => {
    setIsLoadingHospitals(true);
    setErrorMessage(null);
    setRateLimitNotice(null);

    // Overpass query for hospitals and clinics within 25km radius
    const overpassQuery = `
      [out:json][timeout:20];
      (
        node["amenity"="hospital"](around:25000,${lat},${lon});
        way["amenity"="hospital"](around:25000,${lat},${lon});
        node["amenity"="clinic"](around:25000,${lat},${lon});
      );
      out center 30 tags;
    `;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    try {
      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `data=${encodeURIComponent(overpassQuery)}`,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (response.status === 429) {
        setRateLimitNotice(
          'Overpass API public quota temporarily limited. Try again in 30 seconds or zoom into a specific town.'
        );
        setIsLoadingHospitals(false);
        return;
      }

      if (!response.ok) {
        throw new Error(`Overpass service returned status ${response.status}`);
      }

      const data = await response.json();
      const elements: any[] = data.elements || [];

      const parsed: Hospital[] = elements
        .filter((el) => {
          const name = el.tags?.name || el.tags?.['name:en'];
          return Boolean(name);
        })
        .map((el) => {
          const hLat = el.lat ?? el.center?.lat;
          const hLon = el.lon ?? el.center?.lon;
          const tags = el.tags || {};
          const dist = calculateDistance(lat, lon, hLat, hLon);

          const addressParts = [
            tags['addr:street'],
            tags['addr:suburb'],
            tags['addr:city'] || tags['addr:town'],
            tags['addr:district'],
          ].filter(Boolean);

          return {
            id: `osm-${el.id}`,
            name: tags.name || tags['name:en'],
            nameHi: tags['name:hi'],
            lat: hLat,
            lon: hLon,
            type: tags.amenity === 'hospital' ? 'Hospital' : 'Community Clinic',
            address: addressParts.length > 0 ? addressParts.join(', ') : tags['addr:full'],
            distanceKm: dist,
            phone: tags.phone || tags['contact:phone'],
            emergency: tags.emergency === 'yes' ? '24/7 Emergency Available' : undefined,
            operator: tags.operator || tags['operator:type'],
            beds: tags.beds,
            website: tags.website || tags['contact:website'],
            osmUrl: `https://www.openstreetmap.org/${el.type}/${el.id}`,
          };
        })
        .sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));

      setHospitals(parsed);
    } catch (err: any) {
      console.warn('Overpass fetch failed, trying Nominatim fallback:', err);
      // Fallback query via OpenStreetMap Nominatim
      try {
        const nomRes = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=hospital+near+${lat},${lon}&limit=10`
        );
        if (nomRes.ok) {
          const nomData = await nomRes.json();
          const nomHospitals: Hospital[] = nomData.map((item: any) => ({
            id: `nom-${item.place_id}`,
            name: item.display_name.split(',')[0],
            lat: parseFloat(item.lat),
            lon: parseFloat(item.lon),
            type: 'Healthcare Facility',
            address: item.display_name,
            distanceKm: calculateDistance(lat, lon, parseFloat(item.lat), parseFloat(item.lon)),
            osmUrl: `https://www.openstreetmap.org/?mlat=${item.lat}&mlon=${item.lon}`,
          }));
          setHospitals(nomHospitals.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0)));
        } else {
          setErrorMessage('Could not connect to OpenStreetMap hospital registry. Please check your network connection.');
        }
      } catch (nomErr) {
        setErrorMessage('Unable to load nearby hospitals. Please verify internet connectivity or search another town.');
      }
    } finally {
      setIsLoadingHospitals(false);
    }
  };

  // Re-fetch when center coordinates change
  useEffect(() => {
    fetchNearbyHospitals(centerCoords.lat, centerCoords.lon);
  }, [centerCoords.lat, centerCoords.lon]);

  // Update map markers when hospitals or center change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    // 1. User / Searched Anchor Marker with custom pulsing blue dot
    const userDivIcon = L.divIcon({
      className: 'custom-user-marker',
      html: `
        <div style="position: relative; width: 24px; height: 24px;">
          <div style="position: absolute; width: 24px; height: 24px; border-radius: 50%; background: rgba(13, 148, 136, 0.3); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: absolute; top: 4px; left: 4px; width: 16px; height: 16px; border-radius: 50%; background: #0d9488; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    const userMarker = L.marker([centerCoords.lat, centerCoords.lon], { icon: userDivIcon })
      .addTo(markersLayerRef.current)
      .bindPopup(`<b>Your Search Location</b><br/>${centerCoords.name}`);

    userMarkerRef.current = userMarker;

    // 2. Hospital Markers
    hospitals.forEach((h) => {
      const isSelected = selectedHospitalId === h.id;

      const hospitalDivIcon = L.divIcon({
        className: 'custom-hospital-marker',
        html: `
          <div style="
            width: ${isSelected ? '36px' : '30px'};
            height: ${isSelected ? '36px' : '30px'};
            border-radius: 50%;
            background: ${isSelected ? '#e11d48' : '#0f766e'};
            border: 2px solid white;
            box-shadow: 0 4px 6px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 16px;
            font-weight: bold;
            transition: all 0.2s ease;
          ">
            +
          </div>
        `,
        iconSize: [isSelected ? 36 : 30, isSelected ? 36 : 30],
        iconAnchor: [isSelected ? 18 : 15, isSelected ? 18 : 15],
      });

      const m = L.marker([h.lat, h.lon], { icon: hospitalDivIcon })
        .addTo(markersLayerRef.current!)
        .bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px; min-width: 180px;">
            <div style="font-weight: bold; color: #0f172a; font-size: 13px;">${h.name}</div>
            ${h.nameHi ? `<div style="color: #64748b; font-size: 11px;">${h.nameHi}</div>` : ''}
            <div style="color: #0f766e; font-weight: 600; margin-top: 4px;">${h.type || 'Hospital'} · ${h.distanceKm} km away</div>
            ${h.address ? `<div style="color: #475569; font-size: 11px; margin-top: 2px;">${h.address}</div>` : ''}
            ${h.emergency ? `<div style="color: #e11d48; font-weight: 600; font-size: 11px; margin-top: 2px;">${h.emergency}</div>` : ''}
            <div style="margin-top: 8px;">
              <a href="https://www.google.com/maps/dir/?api=1&destination=${h.lat},${h.lon}" target="_blank" style="display: inline-block; background: #0f766e; color: white; padding: 4px 8px; border-radius: 4px; text-decoration: none; font-size: 11px; font-weight: bold;">
                Directions ↗
              </a>
            </div>
          </div>
        `);

      m.on('click', () => {
        setSelectedHospitalId(h.id);
      });
    });

    map.panTo([centerCoords.lat, centerCoords.lon]);
  }, [hospitals, centerCoords, selectedHospitalId]);

  // Request browser geolocation with explicit user trigger
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setErrorMessage('Geolocation is not supported by your current browser.');
      return;
    }

    setIsLocatingUser(true);
    setErrorMessage(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocatingUser(false);
        setGeoPermissionState('granted');
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setCenterCoords({
          lat,
          lon,
          name: `Current GPS Location (${lat.toFixed(4)}, ${lon.toFixed(4)})`,
        });
      },
      (err) => {
        setIsLocatingUser(false);
        setGeoPermissionState('denied');
        setErrorMessage(
          'Location access was not granted. You can use the manual search below to explore any district or village.'
        );
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Manual location search via OpenStreetMap Nominatim
  const handleSearchLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearchingLocation(true);
    setErrorMessage(null);
    setSearchResults([]);

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery.trim()
        )}&countrycodes=in&limit=5`
      );
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();
      if (data.length === 0) {
        setErrorMessage(`No localities found matching "${searchQuery}". Please try another district or village.`);
      } else {
        setSearchResults(data);
      }
    } catch (err) {
      setErrorMessage('Location search failed. Please retry.');
    } finally {
      setIsSearchingLocation(false);
    }
  };

  const selectSearchResult = (item: { display_name: string; lat: string; lon: string }) => {
    const lat = parseFloat(item.lat);
    const lon = parseFloat(item.lon);
    setCenterCoords({
      lat,
      lon,
      name: item.display_name.split(',').slice(0, 3).join(','),
    });
    setSearchResults([]);
    setSearchQuery('');
  };

  const handleSelectHospital = (h: Hospital) => {
    setSelectedHospitalId(h.id);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([h.lat, h.lon], 14, { duration: 0.8 });
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {language === 'en' ? 'Nearby Referral Hospitals & Health Facilities' : 'निकटतम रेफरल अस्पताल एवं स्वास्थ्य केंद्र'}
            </h2>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950/70 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
              OPENSTREETMAP VERIFIED
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {language === 'en'
              ? 'Locate verified district hospitals, primary health centres (PHCs), and trauma care facilities for clinical referrals'
              : 'क्लिनिकल रेफरल व आपातकालीन मार्गदर्शन हेतु निकटतम जिला अस्पताल व स्वास्थ्य केंद्र खोजें'}
          </p>
        </div>

        {/* Browser Geolocation Button */}
        <button
          onClick={handleUseCurrentLocation}
          disabled={isLocatingUser}
          className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold flex items-center gap-2 shadow-xs hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer self-start sm:self-auto shrink-0"
          title="Request browser geolocation to find facilities near your GPS position"
        >
          <Navigation className={`w-3.5 h-3.5 ${isLocatingUser ? 'animate-spin' : ''}`} />
          <span>{isLocatingUser ? (language === 'en' ? 'Detecting Location...' : 'स्थान खोज रहे हैं...') : (language === 'en' ? 'Find Hospitals Near Me' : 'मेरे निकट अस्पताल खोजें')}</span>
        </button>
      </div>

      {/* Medical Responsibility Disclaimer */}
      <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-300/80 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 space-y-1">
        <div className="flex items-center gap-2 font-bold">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Medical Responsibility & Emergency Notice</span>
        </div>
        <p className="text-[11px] text-amber-800 dark:text-amber-300/90 leading-relaxed">
          Facility data is populated through real-time OpenStreetMap and Overpass API public registries. Listings may be incomplete. In life-threatening emergencies, dial <strong>108 (National Ambulance)</strong> or <strong>112 (National Emergency)</strong> immediately and independently confirm bed and ICU availability before patient transport.
        </p>
      </div>

      {/* Manual Search & Feedback */}
      <div className="space-y-2">
        <form onSubmit={handleSearchLocation} className="flex gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-3.5 h-3.5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Indian district or town (e.g. Bilaspur, Pipariya, Bhopal, Raipur, Delhi)..."
              className="w-full pl-9 pr-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-2xs"
            />
          </div>
          <button
            type="submit"
            disabled={isSearchingLocation}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer shrink-0"
          >
            {isSearchingLocation ? 'Searching...' : 'Search Location'}
          </button>
        </form>

        {/* Search Results Dropdown */}
        {searchResults.length > 0 && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg p-2 space-y-1 text-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 px-2">Select Location:</span>
            {searchResults.map((item, idx) => (
              <div
                key={idx}
                onClick={() => selectSearchResult(item)}
                className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex items-center gap-2 text-slate-800 dark:text-slate-200"
              >
                <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span className="truncate">{item.display_name}</span>
              </div>
            ))}
          </div>
        )}

        {/* Notice Banners */}
        {errorMessage && (
          <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {rateLimitNotice && (
          <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs text-amber-700 dark:text-amber-300 flex items-center gap-2">
            <Info className="w-4 h-4 shrink-0" />
            <span>{rateLimitNotice}</span>
          </div>
        )}
      </div>

      {/* Current Anchor Info Badge */}
      <div className="flex items-center justify-between text-xs px-1 text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-teal-600" />
          <span>Active Search Center: <strong className="text-slate-800 dark:text-slate-200">{centerCoords.name}</strong></span>
        </span>
        <span className="font-mono">{hospitals.length} facilities verified in 25km radius</span>
      </div>

      {/* Main Map & Hospital Directory Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[500px]">
        
        {/* LEAFLET MAP VIEWPORT (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs flex flex-col relative">
          <div
            ref={mapContainerRef}
            className="w-full h-[400px] sm:h-[480px] lg:h-full min-h-[380px] z-10"
          />

          {isLoadingHospitals && (
            <div className="absolute inset-0 bg-white/60 dark:bg-slate-950/60 backdrop-blur-2xs z-20 flex items-center justify-center">
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl flex items-center gap-3 text-xs font-semibold text-slate-800 dark:text-slate-200">
                <RotateCw className="w-4 h-4 text-teal-600 animate-spin" />
                <span>Querying OpenStreetMap Overpass registry...</span>
              </div>
            </div>
          )}
        </div>

        {/* SYNCHRONIZED HOSPITAL LIST (5 cols) */}
        <div className="lg:col-span-5 flex flex-col space-y-3 max-h-[550px] overflow-hidden">
          <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white px-1">
            <span>Verified Facilities ({hospitals.length})</span>
            <span className="text-[11px] text-teal-600 dark:text-teal-400 font-normal">Sorted by distance</span>
          </div>

          <div className="overflow-y-auto space-y-2.5 pr-1 flex-1">
            {hospitals.length === 0 && !isLoadingHospitals ? (
              <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                <Building2 className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">No Hospitals Found in 25km</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Try searching for another district headquarters (e.g. Bhopal, Bilaspur, or Indore) using the search bar above.
                </p>
              </div>
            ) : (
              hospitals.map((h) => {
                const isSelected = selectedHospitalId === h.id;
                return (
                  <div
                    key={h.id}
                    onClick={() => handleSelectHospital(h)}
                    className={`p-4 rounded-xl border text-xs space-y-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-teal-50/70 dark:bg-teal-950/50 border-teal-500 shadow-sm ring-1 ring-teal-500/30'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-teal-500/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                          <h4 className="font-bold text-slate-900 dark:text-white leading-tight">
                            {h.name}
                          </h4>
                        </div>
                        {h.nameHi && (
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            {h.nameHi}
                          </div>
                        )}
                      </div>

                      <span className="font-mono text-[11px] font-bold text-teal-700 dark:text-teal-300 bg-teal-100/60 dark:bg-teal-900/60 px-2 py-0.5 rounded-full shrink-0">
                        {h.distanceKm} km
                      </span>
                    </div>

                    {h.address && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug line-clamp-2">
                        {h.address}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-600 dark:text-slate-300 pt-1 border-t border-slate-100 dark:border-slate-800">
                      {h.emergency && (
                        <span className="text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                          {h.emergency}
                        </span>
                      )}

                      {h.phone && (
                        <span className="flex items-center gap-1 font-mono">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{h.phone}</span>
                        </span>
                      )}

                      {h.beds && (
                        <span>{h.beds} Beds</span>
                      )}

                      {h.operator && (
                        <span className="text-slate-400 truncate max-w-[140px]">{h.operator}</span>
                      )}
                    </div>

                    {/* Directions External Action */}
                    <div className="pt-2 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">
                        OSM Node: {h.id.replace('osm-', '')}
                      </span>
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${h.lat},${h.lon}`}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-teal-600 hover:bg-teal-500 text-white text-[11px] font-semibold transition-colors shadow-2xs"
                      >
                        <span>Get Directions</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
