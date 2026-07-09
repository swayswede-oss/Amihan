import { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';
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

/*
export function getVehicleMarkerPosition(index: number) {
  return {
    left: 15 + (index % 4) * 20,
    top: 20 + Math.floor(index / 4) * 25,
  };
}
*/

export function MapView({ mapType }) {

  // map container and instance references  
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // display data layers
  const [polyString, setPolyString] = useState<string>("");
  const [recentLocations, setRecentLocations] = useState<Array<[number, number]> | null>(null);

  // set map tile layer
  const [mapStyleLayer, setMapStyleLayer] = useState<any>(null);
  const [mapColor, setMapColor] = useState<boolean>(false);

  useEffect(() => {
      // only init map if the DOM element exists but the map hasn't been built yet
      if (mapContainerRef.current && !mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current)
        mapInstanceRef.current = map;
        const newMapStyle = (L as any).maplibreGL({
          style:'https://tiles.openfreemap.org/styles/positron',
          attribution: '&copy; <a href="https://openfreemap.org">OpenFreeMap</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);
        setMapStyleLayer(newMapStyle);
      }

      if (mapType == "vlm") {
        // fetch polyline data
        async function loadPolyString() {
          const data = await api.getTestPolyline();
          setPolyString(data);
        }        
        loadPolyString();
      } else if (mapType == "vdm") {
        // fetch recent location data
        async function loadRecentLocations() {
          const data = await api.getMostRecentLocations();
          setRecentLocations(data);
        }      
        loadRecentLocations();        
      }

      
       return () => {
         if (mapInstanceRef.current) {
           mapInstanceRef.current.remove();
           mapInstanceRef.current = null;
         }
       };
      
  }, []);

  // build VLM map layer with polyline
  if (mapType == "vlm") {
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map || polyString == "") return;

        const coords: Array<[number, number]> = polyline.decode(polyString);
        const firstPoint = coords[0];
        map.setView([firstPoint[0], firstPoint[1]], 17);
        
        // set parameters for the polyline
        const fetchedLine = L.polyline(coords, {
            color: '#FF0000',
            weight: 5,
            opacity: 0.75,
            lineJoin: 'round',
            lineCap: 'round'
        }).addTo(map);
        return () => {
            map.removeLayer(fetchedLine);
        
        };
    }, [polyString]);    
  }

  // build VDM map layer with coordinates
  if (mapType == "vdm") {
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map || !recentLocations) return;

        const firstPoint = recentLocations[0][1];
        console.log(firstPoint);
        map.setView([firstPoint.lat, firstPoint.lon], 17);

        const markers = [];
        for (let point of recentLocations) {
          const marker = L.marker([point[1].lat, point[1].lon]).bindPopup(`Vehicle Name: ${point[0]}<br>Last seen at: ${point[1].address}`);
          markers.push(marker);
        }
        const markersGroup = L.featureGroup(markers).addTo(map);
        return () => {
          map.removeLayer(markersGroup);
        };
    }, [recentLocations]);
  }
  

  function handleColorChange() {
      const currMapLayer = (mapStyleLayer as any).getMaplibreMap()
      const currColor = mapColor ? "positron" : "dark"
      currMapLayer.setStyle("https://tiles.openfreemap.org/styles/" + currColor);
      setMapColor(!mapColor);
      
  }
  return (
    <div style={{ width:'100%', height:'95%' }}>
      <h1 style={{height: '5%'}}>Map View</h1>
      <label htmlFor="map-color">Make Map Dark Mode</label>
      <input type="checkbox" id="map-color"
        onChange={handleColorChange}
        />
      <div ref={mapContainerRef} style={{ width: '100%', height: '95%'}} />
    </div>
  )
}

/*
export function MapView({ vehicles, onSelectVehicle, focusedVehicleId }: MapViewProps) {
  const [zoomTransform, setZoomTransform] = useState({ scale: 1, originX: 50, originY: 50 });

  useEffect(() => {
    if (!focusedVehicleId) {
      setZoomTransform({ scale: 1, originX: 50, originY: 50 });
      return;
    }

    const index = vehicles.findIndex((vehicle) => vehicle.id === focusedVehicleId);
    if (index === -1) return;

    const { left, top } = getVehicleMarkerPosition(index);
    setZoomTransform({ scale: ZOOM_SCALE, originX: left, originY: top });
  }, [focusedVehicleId, vehicles]);

  const statusColors = {
    active: 'bg-green-500',
    idle: 'bg-yellow-500',
    maintenance: 'bg-red-500',
    offline: 'bg-gray-400',
  };
  // below line 19, figure leaflet library
  return (
    <div className="relative bg-gray-100 w-full h-full overflow-hidden">
      <div className="absolute top-4 left-4 z-10">
        <h3 className="text-gray-900 text-xl font-semibold">Live Vehicle Map</h3>
        <p className="text-xs lg:text-sm text-gray-600">Real-time tracking of all vehicles</p>
      </div>

      <div
        className="relative bg-gray-100 w-full h-full transition-transform duration-500 ease-out"
        style={{
          transform: `scale(${zoomTransform.scale})`,
          transformOrigin: `${zoomTransform.originX}% ${zoomTransform.originY}%`,
        }}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="grid grid-cols-8 grid-rows-8 h-full">
            {Array.from({ length: 64 }).map((_, i) => (
              <div key={i} className="border border-gray-300"></div>
            ))}
          </div>
        </div>

        {vehicles.map((vehicle, index) => {
          const { left, top } = getVehicleMarkerPosition(index);
          const isFocused = vehicle.id === focusedVehicleId;

          return (
          <button
            key={vehicle.id}
            onClick={() => onSelectVehicle(vehicle)}
            className="absolute group"
            style={{
              left: `${left}%`,
              top: `${top}%`,
            }}
          >
            <div className="relative">
              <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-full ${statusColors[vehicle.status]} flex items-center justify-center shadow-lg border-2 border-white transition-transform group-hover:scale-110 ${isFocused ? 'ring-4 ring-blue-500 scale-125' : ''}`}>
                <MapPin className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
              </div>
              
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap">
                  <div>{vehicle.name}</div>
                  <div className="text-gray-400">{vehicle.driver}</div>
                  <div className="text-gray-400">{vehicle.speed} mph</div>
                </div>
                <div className="w-2 h-2 bg-gray-900 absolute left-1/2 -translate-x-1/2 -bottom-1 rotate-45"></div>
              </div>
            </div>
          </button>
          );
        })}

        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-2 lg:p-3 space-y-1 lg:space-y-2">
          <p className="text-xs text-gray-900">Status</p>
          {Object.entries(statusColors).map(([status, color]) => (
            <div key={status} className="flex items-center gap-2">
              <div className={`w-2 h-2 lg:w-3 lg:h-3 rounded-full ${color}`}></div>
              <span className="text-xs text-gray-700 capitalize">{status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

}
*/
