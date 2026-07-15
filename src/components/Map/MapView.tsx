import React,{ useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
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
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

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

  // popup layers
  const [activePopups, setActivePopups] = useState([]);
  
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
      map.setView([37.75454, -122.44254], 13);
    }

    return () => {
       if (mapInstanceRef.current) {
         mapInstanceRef.current.remove();
         mapInstanceRef.current = null;
       }
     };    
  }, []);

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
  }, [polyString, rawCoords]);    

  // build VDM map layer with coordinates
  useEffect(() => {
    if (currMapType == "vdm") {
      const map = mapInstanceRef.current;
      if (!map || !recentLocations || recentLocations.length == 0) return;
      // center point for map initialization
      const firstPoint = recentLocations[0][1];
      map.setView([firstPoint.lat, firstPoint.lon], 17);

      // iterate through all most recent points and add them to the map
      const markers = [];
      for (let point of recentLocations) {
        const marker = L.marker([point[1].lat, point[1].lon]).bindPopup(`Vehicle Name: ${point[0]}<br>Last seen at: ${point[1].address}`);
        const popupDiv = document.createElement('div');
        marker.bindPopup(popupDiv, { minWidth: 160});

        marker.on('popupopen', () => {
          setActivePopups((prev) => [
            ...prev,
            { id: point[0], data: point[1].address, container: popupDiv }
          ]);
          setSelectedVehicle(point[0])
          setSelectedTrip(point[1].trip_id);
          setSelectedDate(point[1].timestamp);
        });

        marker.on('popupclose', () => {
          setActivePopups((prev) => prev.filter((p) => p.container !== popupDiv));
        });
        
        markers.push(marker);
      }
      const markersGroup = L.featureGroup(markers).addTo(map);
      return () => {
        map.removeLayer(markersGroup);
      };
    }
  }, [recentLocations]);
   

  function handleColorChange() {
      const currMapLayer = (mapStyleLayer as any).getMaplibreMap()
      const currColor = mapColor ? "positron" : "dark"
      currMapLayer.setStyle("https://tiles.openfreemap.org/styles/" + currColor);
      setMapColor(!mapColor);
      
  }

  function handleMapTypeSwitch() {
      setActivePopups([]); // clear active popups state without drawing a new map
      if (currMapType == "vdm") {
        setCurrMapType("vlm");
      } else if (currMapType == "vlm") {
        setCurrMapType("vdm");        
      }
  }
  
  return (
    <div style={{ width:'100%', height:'95%' }}>
      <h1 style={{height: '5%'}}>Map View</h1>
      <label htmlFor="map-color">Make Map Dark Mode</label>
      <input type="checkbox" id="map-color"
        onChange={handleColorChange}
        />
      <div ref={mapContainerRef} style={{ width: '100%', height: '95%'}} />
      {activePopups.map(({ id, data, container}) =>
        createPortal(
          <VehiclePopupCard id={id} data={data} changeType={handleMapTypeSwitch} popupType={currMapType}/>, container
        )
      )}
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
