import './App.css';
import React, { useCallback, useEffect, useState } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF, BicyclingLayerF, InfoWindowF} from '@react-google-maps/api';


const containerStyle = {
  width: '100vw',
  height: '100vh',
};

const center = {
  lat: 29.717305869520487, 
  lng: -95.40327808240264
};

const pos = {
  lat: 29.7187296,
  lng: -95.4035656
}

const printMarker = marker => {
  console.log('marker: ', marker);
}

const parseWKTToLatLng = (wkt) => {
  const regex = /POINT \(([-\d.]+) ([-\d.]+)\)/;
  const match = wkt.match(regex);
  if (match) {
    return { lat: parseFloat(match[2]), lng: parseFloat(match[1]) };
  }
  return null;
};

function Header() {
  return (
    <div className='header'>
      <h1>Rice University's Bike Rack Finder</h1>
      <h3>Looking for a bike rack next to a campus building? Look no further</h3>
    </div>
  );
}

function MyComponent() {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_API_KEY, 
    id: 'google-map-script',
    version: 'weekly'
  });

  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [data, setData] = useState(null);
  const [openInfoWindowIndex, setOpenInfoWindowIndex] = useState(null);

  useEffect(() => {
    fetch("/api/data")
      .then((res) => res.json())
      .then((data) => {
        // Add additional properties to each marker
      const markersWithAdditionalInfo = data.map((marker) => ({
        ...marker,
        imageUrl: 'https://transportation.rice.edu/sites/g/files/bxs3961/files/inline-images/SouthServery1.jpg',
        availabilityStatus: 'Available',
        lastUpdated: '5 minutes ago',
        totalSpots: 10,
        peakHours: '12 PM - 2 PM',
        securityRating: 'High',
      }));
        //console.log('markersWithAdditionalInfo:', markersWithAdditionalInfo);
        setData(markersWithAdditionalInfo);
        setMarkers(markersWithAdditionalInfo)
      });
  }, []);

  const handleMarkerClick = (index) => {
    setOpenInfoWindowIndex(index);
  };

  const onLoad = useCallback(function callback(map) {
    // This is just an example of getting and using the map instance!!! don't just blindly copy!
    const bounds = new window.google.maps.LatLngBounds(center);
    map.setZoom(16);

    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback() {
    setMap(null);
  }, []);

  return (
    <div>
      <Header />
      {isLoaded ? (
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={16}
          onLoad={onLoad}
          onUnmount={onUnmount}
        >
          <BicyclingLayerF
          />
          {markers.map((marker, index) => {
            const position = parseWKTToLatLng(marker.WKT);
            if (position) {
              return (
                <MarkerF
                icon={"https://mt.google.com/vt/icon/name=icons/onion/SHARED-mymaps-container_4x.png,icons/onion/1522-bicycle_4x.png"}
                onLoad={printMarker}
                key={index}
                position={position}
                title={marker.name}
                onClick={() => handleMarkerClick(index)}
                >
                  {openInfoWindowIndex === index && ( // Conditionally render the InfoWindow
                    <InfoWindowF onCloseClick={() => setOpenInfoWindowIndex(null)}>
                       <div>
                      <h3>{marker.name}</h3>
                      <p>GPS location: {position.lat}, {position.lng}</p>
                      <img src={marker.imageUrl} alt="Bike rack" style={{ width: '200px', height: 'auto' }} />
                      <p>Availability Status: {marker.availabilityStatus} (last updated {marker.lastUpdated})</p>
                      <p>Total Spots: {marker.totalSpots}</p>
                      <p>Peak Hours: {marker.peakHours}</p>
                      <p>Security Rating: {marker.securityRating}</p>
                    </div>
                    </InfoWindowF>
                  )}
                </MarkerF>
              );
            }
            return null; // Return null if the WKT string cannot be parsed
          })}
        </GoogleMap>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
}

export default React.memo(MyComponent);