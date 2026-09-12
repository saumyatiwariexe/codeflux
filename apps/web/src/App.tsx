import React, { useEffect, useState, useMemo, useRef } from 'react';
import Map, { Marker, NavigationControl, GeolocateControl, MapRef } from 'react-map-gl/mapbox';
import { MapPin, Search, Menu, User, Calendar, MessageSquare, Zap, Eye, EyeOff, Layers } from 'lucide-react';
import { PaladeiumLogo } from './components/PaladeiumLogo';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_KEY || '';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Match mobile app initial coords but more zoomed in
const INITIAL_VIEW_STATE = {
  longitude: 75.7051,
  latitude: 31.2560,
  zoom: 16.5,
  pitch: 45,
  bearing: 0
};

// Bounding box for LPU to prevent panning away
const LPU_BOUNDS: [[number, number], [number, number]] = [
  [75.6900, 31.2400], // Southwest coordinates
  [75.7200, 31.2700]  // Northeast coordinates
];

interface Quest {
  id: string;
  title: string;
  type: string;
  xpReward: number;
  targetLocation?: { lat: number; lng: number };
}

export default function App() {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showQuests, setShowQuests] = useState(true);
  const [questMenuOpen, setQuestMenuOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  
  const mapRef = useRef<MapRef>(null);
  const [is3D, setIs3D] = useState(true);

  const toggle3DMode = () => {
    const map = mapRef.current?.getMap();
    if (map) {
      if (is3D) {
        map.flyTo({ pitch: 0, duration: 800 });
        setIs3D(false);
      } else {
        map.flyTo({ pitch: 60, duration: 800 });
        setIs3D(true);
      }
    }
  };

  useEffect(() => {
    // We try to fetch from backend. 
    // If it fails (due to no JWT logic set up in web yet), we fallback to the mock array.
    const fetchQuests = async () => {
      try {
        const res = await fetch(`${API_URL}/api/v1/quests`);
        if (!res.ok) throw new Error('API auth needed');
        const data = await res.json();
        setQuests(data.data.filter((q: Quest) => q.targetLocation));
      } catch (err) {
        console.warn('Using fallback quests for web demo:', err);
        setQuests([
          { id: 'mq1', title: 'The Library Lurker', type: 'academic', xpReward: 150, targetLocation: { lat: 31.2572, lng: 75.7042 } },
          { id: 'mq2', title: 'Campus Cartographer', type: 'explorer', xpReward: 300, targetLocation: { lat: 31.2565, lng: 75.7058 } },
          { id: 'mq3', title: 'Food Court Champion', type: 'social', xpReward: 100, targetLocation: { lat: 31.2548, lng: 75.7028 } },
        ]);
      }
    };
    fetchQuests();
  }, []);

  const pins = useMemo(
    () =>
      quests.map((q, index) => {
        if (!q.targetLocation) return null;
        return (
          <Marker
            key={`marker-${index}`}
            longitude={q.targetLocation.lng}
            latitude={q.targetLocation.lat}
            anchor="bottom"
          >
            <div className="quest-pin-container">
              <div className="quest-pin">
                <MapPin size={24} color="#FAFAFA" />
              </div>
              <div className="quest-popup">
                <h4>{q.title}</h4>
                <p>+{q.xpReward} XP</p>
              </div>
            </div>
          </Marker>
        );
      }),
    [quests]
  );

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <nav className="glass-nav">
        <div className="nav-left">
          <button className="icon-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <Menu size={24} color="#121324" />
          </button>
          <div className="brand-logo">
            <PaladeiumLogo size={32} tint="#6C63FF" />
            <span className="brand-text">Paladeium Web</span>
          </div>
        </div>
        <div className="nav-search">
          <Search size={18} color="#6B7280" />
          <input type="text" placeholder="Search for Quests, Events or Squads..." />
        </div>
        <div className="nav-right">
          <button className="btn-primary">
            <Zap size={16} /> Login
          </button>
        </div>
      </nav>

      <div className="main-content">
        {/* Sidebar */}
        <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-item active">
            <MapPin size={20} />
            <span>Quest Map</span>
          </div>
          <div className="sidebar-item">
            <Calendar size={20} />
            <span>Events</span>
          </div>
          <div className="sidebar-item">
            <User size={20} />
            <span>SquadUp</span>
          </div>
          <div className="sidebar-item">
            <MessageSquare size={20} />
            <span>Pulse Chat</span>
          </div>
        </aside>

        {/* Map Container */}
        <main className="map-area">
          <Map
            ref={mapRef}
            initialViewState={INITIAL_VIEW_STATE}
            mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
            mapboxAccessToken={MAPBOX_TOKEN}
            maxBounds={LPU_BOUNDS}
            minZoom={15}
            maxZoom={20}
          >
            <NavigationControl position="top-right" />
            <GeolocateControl 
              position="top-right" 
              trackUserLocation={true} 
              showUserLocation={false}
              showUserHeading={true} 
              positionOptions={{ enableHighAccuracy: true }} 
              onGeolocate={(e) => setUserLocation({ lat: e.coords.latitude, lng: e.coords.longitude })}
            />
            {showQuests && pins}

            {/* Custom User Avatar Marker */}
            {userLocation && (
              <Marker
                longitude={userLocation.lng}
                latitude={userLocation.lat}
                anchor="center"
              >
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '22px',
                  border: '3px solid #6C63FF',
                  boxShadow: '0 0 15px rgba(108, 99, 255, 0.8)',
                  overflow: 'hidden',
                  backgroundColor: '#121324',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <img 
                    src="https://i.pravatar.cc/150?img=11" 
                    alt="User Avatar" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                </div>
              </Marker>
            )}

            {/* 3D/2D Mode Toggle */}
            <div style={{ position: 'absolute', top: 16, left: 16, zIndex: 10 }}>
              <button 
                className="btn-primary" 
                style={{ 
                  backgroundColor: 'var(--bg-elevated)', 
                  color: 'var(--text-primary)', 
                  border: '1px solid var(--border-color)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
                onClick={toggle3DMode}
              >
                <Layers size={18} />
                {is3D ? 'Switch to 2D' : 'Switch to 3D'}
              </button>
            </div>
          </Map>

        </main>
      </div>
    </div>
  );
}
