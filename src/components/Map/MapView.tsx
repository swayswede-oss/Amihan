import React,{ useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Search, Maximize, Minimize2 } from 'lucide-react';
import { Vehicle } from '../../App';
import 'leaflet/dist/leaflet.css';
import polyline from '@mapbox/polyline';
import L from 'leaflet';
import 'maplibre-gl/dist/maplibre-gl.css';
import '@maplibre/maplibre-gl-leaflet';
import { api } from '../../services/api';

type MapViewProps = {
  mapType: string;
}

// Header palette matched to design reference (cool dark slate-gray)
const MAP_HEADER_BG = '#4A5364';
const MAP_HEADER_CONTROL_BG = '#3F4756';
const MAP_HEADER_BORDER = '#454E5E';
const MAP_HEADER_MUTED_TEXT = '#A0AEC0';
const MAP_HEADER_CONTROL_HEIGHT = 36;

const mapHeaderControlStyle: React.CSSProperties = {
  height: `${MAP_HEADER_CONTROL_HEIGHT}px`,
  color: '#E2E8F0',
  backgroundColor: MAP_HEADER_CONTROL_BG,
  border: `1px solid ${MAP_HEADER_BORDER}`,
  lineHeight: 1,
  fontSize: '14px',
  boxSizing: 'border-box',
};

const MAP_ATTRIBUTION =
  '&copy; <a href="https://openfreemap.org">OpenFreeMap</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

const MAP_STYLE_URLS = {
  light: 'https://tiles.openfreemap.org/styles/positron',
  dark: 'https://tiles.openfreemap.org/styles/dark',
} as const;

const MAP_FOCUS_ZOOM = 15;

function elevateLeafletOverlayPanes(map: L.Map) {
  const paneZIndexes: Record<string, string> = {
    overlayPane: '450',
    markerPane: '600',
    tooltipPane: '650',
    popupPane: '700',
  };

  Object.entries(paneZIndexes).forEach(
    ([paneName, zIndex]) => {
      const pane = map.getPane(paneName);
      if (pane) {
        pane.style.zIndex = zIndex;
      }
    },
  );
}

function VehiclePopupCard({ id, data, changeType, popupType })  {
  if (popupType == "vdm") {
    return (
      <div style={{ minWidth: '160px'}}>
        <p>Vehicle Name: {id}</p>
        <p>Last Seen: {data}</p>
        <button onClick={() => changeType()} style={{ cursor: 'pointer' }}>View Most Recent Trip</button>
      </div>
    )    
  } else if (popupType == "vlm") {
      const rawDate = new Date(data[1]);
      const formattedDate = new Intl.DateTimeFormat('en-US').format(rawDate);
      return (
        <div style={{ minWidth: '160px'}}>
          <p>Vehicle Name: {id}</p>
          <p>Trip ID: {data[0]}</p>
          <p>Trip Date: {formattedDate}</p>
          <button onClick={() => changeType()} style={{ cursor: 'pointer' }}>View Most Recent Locations</button>
        </div>
      )     
  }
}

export function MapView({ mapType }) {

  // map container and instance references
  const mapModuleRef = useRef<HTMLDivElement | null>(null);  
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const vehicleMarkersRef = useRef<Map<string, L.Marker>>(
    new Map(),
  );
  const markersLayerRef = useRef<L.FeatureGroup | null>(null);
  const searchContainerRef = useRef<HTMLDivElement | null>(null);
  const [mapReady, setMapReady] = useState<boolean>(false);

  // VDM vs VLM state toggle
  const [currMapType, setCurrMapType] = useState<string>(mapType);

  // display data layers
  const [polyString, setPolyString] = useState<string>(""); // VLM polyline
  const [rawCoords, setRawCoords] = useState<Array<[number, number]> | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<string>("") // User selected Vehicle
  const [selectedTrip, setSelectedTrip] = useState<string>("") 
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [recentLocations, setRecentLocations] = useState<Array<[number, number]> | null>(null); // VDM coordinate array

  // set map tile layer
  const [mapStyleLayer, setMapStyleLayer] = useState<any>(null);
  const [mapColor, setMapColor] = useState<boolean>(false);

  // toggle states
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showSearchResults, setShowSearchResults] = useState<boolean>(false);
  const [highlightedVehicle, setHighlightedVehicle] = useState<string | null>(null);

  const lastMarkerFitLocationsRef = useRef<Array<number, number> | null>(null);
    
  // popup layers
  const [activePopups, setActivePopups] = useState([]);
  
  useEffect(() => {
    // only init map if the DOM element exists but the map hasn't been built yet
    if (mapContainerRef.current && !mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current)
      mapInstanceRef.current = map;
      const newMapStyle = (L as any).maplibreGL({
        style: MAP_STYLE_URLS.light,
        attribution: MAP_ATTRIBUTION,
      }).addTo(map);
      setMapStyleLayer(newMapStyle);
      map.setView([37.75454, -122.44254], 13);
      setMapReady(true);
    }

    return () => {
       if (mapInstanceRef.current) {
         mapInstanceRef.current.remove();
         mapInstanceRef.current = null;
         setMapReady(false);
       }
     };    
  }, []);

  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    const resizeMap = () => {
      mapInstanceRef.current?.invalidateSize();
    };

    const observer = new ResizeObserver(resizeMap);
    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isActive =
        document.fullscreenElement === mapModuleRef.current;

      setIsFullscreen(isActive);
      mapInstanceRef.current?.invalidateSize();
    };

    document.addEventListener(
      'fullscreenchange',
      handleFullscreenChange,
    );

    return () => {
      document.removeEventListener(
        'fullscreenchange',
        handleFullscreenChange,
      );
    };
  }, []);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(
          event.target as Node,
        )
      ) {
        setShowSearchResults(false);
      }
    }

    document.addEventListener(
      'mousedown',
      handlePointerDown,
    );

    return () => {
      document.removeEventListener(
        'mousedown',
        handlePointerDown,
      );
    };
  }, []);

  useEffect(() => {
    if (!highlightedVehicle) {
      return;
    }

    const marker = vehicleMarkersRef.current.get(
      highlightedVehicle,
    );
    const markerElement = marker?.getElement();

    if (markerElement) {
      markerElement.classList.add(
        'map-marker-highlighted',
      );
    }
  }, [highlightedVehicle, recentLocations]);

  useEffect(() => {
    if (currMapType == "vlm") {
      setRecentLocations(null); // reset state
      // fetch polyline data
      async function loadPolyString() {
        const data = await api.getPolyline(selectedTrip);
        if (data == "INVALID") {
          const defaultTrips = await api.getTripLocations(selectedTrip);
          setRawCoords(defaultTrips);
        }
        setPolyString(data);
      }        
      loadPolyString();
    } else if (currMapType == "vdm") {
      // fetch recent location data
      async function loadRecentLocations() {
        setPolyString(""); // reset state
        setRawCoords(null); // reset state
        const data = await api.getMostRecentLocations();
        setRecentLocations(data);
      }
      loadRecentLocations();
      const timer = setInterval(() => {
        loadRecentLocations();        
      }, 5000);
      return () => clearInterval(timer);
    }
    
  }, [currMapType]);
  
  // build VLM map layer with polyline
  useEffect(() => {
    if (currMapType == "vlm") {
      const map = mapInstanceRef.current;
      if (!map || polyString == "") return;

      // handle "not enough points" case;
      var coords: Array<[number, number]>;
      var fetchedLine;
      if (polyString != "INVALID") {
          coords = polyline.decode(polyString);
      } else {
          coords = rawCoords;
      }
      const firstPoint = coords[0];
      // set parameters for the polyline
      if (polyString != "INVALID") {
        map.setView([firstPoint[0], firstPoint[1]], 17);
        fetchedLine = L.polyline(coords, {
          color: '#FF0000',
          weight: 5,
          opacity: 0.75,
          lineJoin: 'round',
          lineCap: 'round'
        }).addTo(map);        
      } else {
        map.setView([firstPoint.lat, firstPoint.lon], 17);
        fetchedLine = L.marker([firstPoint.lat, firstPoint.lon], 17).addTo(map);
      }
      
      const popupDiv = document.createElement('div');
      fetchedLine.bindPopup(popupDiv, { minWidth: 160} );
      fetchedLine.on('popupopen', () => {
          setActivePopups((prev) => [
            ...prev,
            { id: selectedVehicle, data: [selectedTrip, selectedDate], container: popupDiv }
          ]);
        });

        fetchedLine.on('popupclose', () => {
          setActivePopups((prev) => prev.filter((p) => p.container !== popupDiv));
        })        
      return () => {
          map.removeLayer(fetchedLine);
          setPolyString("");
      };
    }
  }, [polyString, rawCoords, currMapType, selectedTrip]);    

  // build VDM map layer with coordinates
    const renderVehicleMarkers = useCallback(
    (fitToFleet = false) => {
      const map = mapInstanceRef.current;
      const locations = recentLocations;

      if (!map || !mapReady) {
        return;
      }

      if (currMapType !== 'vdm') {
        if (markersLayerRef.current) {
          map.removeLayer(markersLayerRef.current);
          markersLayerRef.current = null;
        }

        vehicleMarkersRef.current.clear();
        return;
      }

      if (markersLayerRef.current) {
        map.removeLayer(markersLayerRef.current);
        markersLayerRef.current = null;
      }

      vehicleMarkersRef.current.clear();

      if (!locations || locations.length === 0) {
        return;
      }

      const markers: L.Marker[] = [];
      const firstPoint = locations[0][1];

      for (const point of locations) {
        const marker = L.marker([
          point[1].lat,
          point[1].lon,
        ]);

        vehicleMarkersRef.current.set(
          point[0],
          marker,
        );

        const popupDiv =
          document.createElement('div');

        marker.bindPopup(popupDiv, {
          minWidth: 160,
        });

        marker.on('popupopen', () => {
          setActivePopups((prev) => [
            ...prev,
            {
              id: point[0],
              data: point[1].address,
              container: popupDiv,
            },
          ]);

          setSelectedVehicle(point[0]);
          setSelectedTrip(point[1].trip_id);
          setSelectedDate(point[1].timestamp);
        });

        marker.on('popupclose', () => {
          setActivePopups((prev) =>
            prev.filter(
              (popup) =>
                popup.container !== popupDiv,
            ),
          );
        });

        markers.push(marker);
      }

      markersLayerRef.current = L.featureGroup(markers).addTo(map);
      elevateLeafletOverlayPanes(map);

      const shouldFitBounds =
        fitToFleet ||
        lastMarkerFitLocationsRef.current !== locations;

      if (shouldFitBounds) {
        if (locations.length > 1) {
          map.fitBounds(
            markersLayerRef.current
              .getBounds()
              .pad(0.12),
          );
        } else {
          map.setView(
            [firstPoint.lat, firstPoint.lon],
            17,
          );
        }
        lastMarkerFitLocationsRef.current = locations;
      }
    }, [currMapType, mapReady, recentLocations]);

  useEffect(() => {
    renderVehicleMarkers(true);
  }, [renderVehicleMarkers]);

  const renderVehicleMarkersRef = useRef(
    renderVehicleMarkers,
  );
  renderVehicleMarkersRef.current = renderVehicleMarkers;

  function getSearchMatches(): Array<[number, number]>{
    const query = searchQuery.trim().toLowerCase();
    if (!query || !recentLocations) {
      return [];
    }

    return recentLocations.filter(([name]) =>
      name.toLowerCase().includes(query),
    );
  }

  function clearMarkerHighlight() {
    vehicleMarkersRef.current.forEach((marker) => {
      marker
        .getElement()
        ?.classList.remove('map-marker-highlighted');
    });
  }

  function focusVehicle(vehicleName: string) {
    const map = mapInstanceRef.current;
    const marker = vehicleMarkersRef.current.get(
      vehicleName,
    );
    const locationEntry = recentLocations.find(
      ([name]) => name === vehicleName,
    );

    if (
      !map ||
      !marker ||
      !locationEntry ||
      currMapType !== 'vdm'
    ) {
      return;
    }

    const { lat, lon } = locationEntry[1];

    clearMarkerHighlight();
    setHighlightedVehicle(vehicleName);

    map.setView([lat, lon], MAP_FOCUS_ZOOM, {
      animate: true,
    });

    marker.getElement()?.classList.add(
      'map-marker-highlighted',
    );
    marker.openPopup();
  }

  function selectSearchResult(vehicleName: string) {
    setSearchQuery(vehicleName);
    setShowSearchResults(false);
    focusVehicle(vehicleName);
  }

  function handleSearchKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>,
  ) {
    if (event.key !== 'Enter') {
      return;
    }

    event.preventDefault();

    const query = searchQuery.trim().toLowerCase();
    const exactMatch = recentLocations.find(
      ([name]) => name.toLowerCase() === query,
    );

    if (exactMatch) {
      selectSearchResult(exactMatch[0]);
    }
  }

  const searchMatches = getSearchMatches();

  function setMapStyle(useDark: boolean) {
    const map = mapInstanceRef.current;
    const currentStyleLayer = mapStyleLayer;

    if (!map || !currentStyleLayer || mapColor === useDark) {
      return;
    }

    const maplibreMap =
      currentStyleLayer.getMaplibreMap?.();

    if (!maplibreMap) {
      return;
    }

    const nextStyleUrl = useDark
      ? MAP_STYLE_URLS.dark
      : MAP_STYLE_URLS.light;

    const restoreMapView = () => {
      if (!mapInstanceRef.current) {
        return;
      }

      const mapCanvas = maplibreMap.getCanvas?.();

      if (mapCanvas?.parentElement) {
        mapCanvas.parentElement.style.zIndex = '1';
      }

      map.invalidateSize();
      elevateLeafletOverlayPanes(map);
      renderVehicleMarkersRef.current(false);
    };

    maplibreMap.once('idle', restoreMapView);
    maplibreMap.setStyle(nextStyleUrl);
    setMapColor(useDark);
  }

  function toggleVlmMode() {
    setIsVlmToggleActive((prev) => !prev);
  }

  async function toggleFullscreen() {
    const mapModule = mapModuleRef.current;
    if (!mapModule) {
      return;
    }

    try {
      if (document.fullscreenElement === mapModule) {
        await document.exitFullscreen();
      } else {
        await mapModule.requestFullscreen();
      }
    } catch (error) {
      console.error('Unable to toggle fullscreen:', error);
    }
  }

  function handleMapTypeSwitch() {
    setActivePopups([]);

    if (currMapType == 'vdm') {
      setCurrMapType('vlm');
    } else if (currMapType == 'vlm') {
      setCurrMapType('vdm');
    }
  }

  function handleColorChange() {
      const currMapLayer = (mapStyleLayer as any).getMaplibreMap()
      const currColor = mapColor ? "positron" : "dark"
      currMapLayer.setStyle("https://tiles.openfreemap.org/styles/" + currColor);
      setMapColor(!mapColor);
      
  }
  
  return (
    <div
      ref={mapModuleRef}
      className="flex flex-col h-full min-h-0 overflow-hidden"
      style={{ backgroundColor: MAP_HEADER_BG }}
    >
      <header
        className="map-view-header flex flex-shrink-0 items-center gap-4 px-4 lg:px-6"
        style={{
          height: '72px',
          backgroundColor: MAP_HEADER_BG,
          borderBottom: `1px solid ${MAP_HEADER_BORDER}`,
        }}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="min-w-0">
            <h1
              className="text-base lg:text-lg truncate"
              style={{
                color: '#ffffff',
                fontWeight: 600,
                lineHeight: 1.2,
                margin: 0,
              }}
            >
              {currMapType == "vlm"
                ? 'Vehicle Line Map'
                : 'Vehicle Detail Map'}
            </h1>
            <p
              className="text-xs truncate"
              style={{
                color: '#C5CEDB',
                marginTop: '4px',
                marginBottom: 0,
                lineHeight: 1.2,
              }}
            >
              {/* list active vehicles here */}
              {/* 12 vehicles active · Updated just now */}
            </p>
          </div>
          
        </div>
        <div className="flex items-center gap-2 flex-1 justify-end min-w-0">
          <div
            ref={searchContainerRef}
            style={{
              position: 'relative',
              width: '220px',
              maxWidth: '100%',
            }}
          >
            <label
              className="flex items-center rounded-full"
              style={{
                ...mapHeaderControlStyle,
                width: '100%',
                paddingLeft: '12px',
                paddingRight: '12px',
                gap: '8px',
              }}
            >
              <Search
                className="w-4 h-4 flex-shrink-0 block"
                style={{ color: MAP_HEADER_MUTED_TEXT }}
                aria-hidden="true"
              />
              <input
                type="search"
                placeholder="Search vehicles"
                aria-label="Search vehicles"
                aria-expanded={showSearchResults}
                aria-controls="map-vehicle-search-results"
                aria-autocomplete="list"
                role="combobox"
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                  setShowSearchResults(true);
                }}
                onFocus={() => {
                  if (searchQuery.trim()) {
                    setShowSearchResults(true);
                  }
                }}
                onKeyDown={handleSearchKeyDown}
                className="map-header-search-input w-full focus:outline-none"
                style={{
                  flex: 1,
                  minWidth: 0,
                  height: '100%',
                  padding: 0,
                  margin: 0,
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: '#ffffff',
                  lineHeight: 1,
                  fontSize: '14px',
                }}
              />
            </label>

            {showSearchResults &&
              searchQuery.trim().length > 0 && (
                <ul
                  id="map-vehicle-search-results"
                  role="listbox"
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 4px)',
                    left: 0,
                    right: 0,
                    margin: 0,
                    padding: '4px 0',
                    listStyle: 'none',
                    backgroundColor: MAP_HEADER_CONTROL_BG,
                    border: `1px solid ${MAP_HEADER_BORDER}`,
                    borderRadius: '8px',
                    zIndex: 1100,
                    maxHeight: '240px',
                    overflowY: 'auto',
                    boxShadow:
                      '0 8px 24px rgba(0, 0, 0, 0.25)',
                  }}
                >
                  {searchMatches.length > 0 ? (
                    searchMatches.map(([name, location]) => (
                      <li key={name} role="presentation">
                        <button
                          type="button"
                          role="option"
                          aria-selected={
                            highlightedVehicle === name
                          }
                          onMouseDown={(event) => {
                            event.preventDefault();
                          }}
                          onClick={() =>
                            selectSearchResult(name)
                          }
                          style={{
                            display: 'block',
                            width: '100%',
                            padding: '8px 12px',
                            border: 'none',
                            backgroundColor:
                              highlightedVehicle === name
                                ? '#4A5364'
                                : 'transparent',
                            color: '#FFFFFF',
                            textAlign: 'left',
                            cursor: 'pointer',
                            fontSize: '13px',
                            lineHeight: 1.3,
                          }}
                        >
                          <span
                            style={{
                              display: 'block',
                              fontWeight: 500,
                            }}
                          >
                            {name}
                          </span>
                          <span
                            style={{
                              display: 'block',
                              marginTop: '2px',
                              color: MAP_HEADER_MUTED_TEXT,
                              fontSize: '11px',
                            }}
                          >
                            {location.address}
                          </span>
                        </button>
                      </li>
                    ))
                  ) : (
                    <li
                      style={{
                        padding: '8px 12px',
                        color: MAP_HEADER_MUTED_TEXT,
                        fontSize: '13px',
                      }}
                    >
                      No matching vehicles on map
                    </li>
                  )}
                </ul>
              )}
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={mapColor}
            aria-label="Toggle between light and dark map style"
            onClick={() => setMapStyle(!mapColor)}
            className="rounded-lg transition-colors"
            style={{
              ...mapHeaderControlStyle,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '56px',
              padding: 0,
            }}
          >
            <span
              style={{
                position: 'relative',
                display: 'block',
                width: '40px',
                height: '18px',
                borderRadius: '9999px',
                border: `1px solid ${MAP_HEADER_BORDER}`,
                backgroundColor: '#2F3642',
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  top: '1px',
                  left: mapColor ? '25px' : '1px',
                  width: '14px',
                  height: '14px',
                  borderRadius: '9999px',
                  backgroundColor: '#FFFFFF',
                  transition: 'left 0.2s ease',
                }}
              />
            </span>
          </button>

          {isFullscreen ? (
            <button
              type="button"
              aria-label="Exit fullscreen"
              onClick={toggleFullscreen}
              className="rounded-lg transition-colors"
              style={{
                ...mapHeaderControlStyle,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '0 12px',
                whiteSpace: 'nowrap',
              }}
            >
              <Minimize2 className="w-4 h-4 block" aria-hidden="true" />
              Exit fullscreen
            </button>
          ) : (
            <button
              type="button"
              aria-label="Enter fullscreen"
              onClick={toggleFullscreen}
              className="rounded-lg transition-colors"
              style={{
                ...mapHeaderControlStyle,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: `${MAP_HEADER_CONTROL_HEIGHT}px`,
                padding: 0,
              }}
            >
              <Maximize className="w-4 h-4 block" aria-hidden="true" />
            </button>
          )}
        </div>
      </header>

      <div
        className={`map-view-map-area relative flex-1 min-h-0 w-full${
          mapColor ? ' map-zoom-dark-mode' : ''
        }`}
      >
        <div
          ref={mapContainerRef}
          className="h-full w-full map-view-container"
        />
      </div>

      {activePopups.map(
        ({ id, data, container }) =>
          createPortal(
            <VehiclePopupCard
              key={`${id}-${data}`}
              id={id}
              data={data}
              changeType={
                handleMapTypeSwitch
              }
              popupType={currMapType}
            />,
            container,
          ),
      )}
    </div>
  );
}
