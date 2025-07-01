import React, { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import toast from 'react-hot-toast';

mapboxgl.accessToken = 'pk.eyJ1Ijoic2F2YWQyMDA0IiwiYSI6ImNtYzNvNnVodzA3ZmYya3F4ajg5ZXl0YjUifQ.2RCVKV1UwBMXnw9paZ5gZA';

export interface IDropCoordinates {
    latitude: number;
    longitude: number;
}

interface Props {
    dropCoordinates: IDropCoordinates;
    onClose: () => void;
}

const LocationTrackingComponent: React.FC<Props> = ({ dropCoordinates, onClose }) => {

    const mapRef = useRef<HTMLDivElement | null>(null);
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);


    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setUserLocation([position.coords.longitude, position.coords.latitude]);
            },
            (error) => {
                toast.error('Unable to fetch your location')
                console.error(error)
            }
        )
    }, [])

    useEffect(() => {
        if (!userLocation || !mapRef.current) return;

        const map = new mapboxgl.Map({
            container: mapRef.current,
            style: 'mapbox://styles/mapbox/streets-v12',
            center: userLocation,
            zoom: 12,
        })

        new mapboxgl.Marker({ color: 'green' })
            .setLngLat(userLocation)
            .setPopup(new mapboxgl.Popup().setText("Your Location"))
            .addTo(map);

        new mapboxgl.Marker({ color: 'red' })
            .setLngLat([dropCoordinates.longitude, dropCoordinates.latitude])
            .setPopup(new mapboxgl.Popup().setText("Drop Location"))
            .addTo(map);

        const drawRoute = async () => {
            const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${userLocation[0]},${userLocation[1]};${dropCoordinates.longitude},${dropCoordinates.latitude}?geometries=geojson&access_token=${mapboxgl.accessToken}`;
            const res = await fetch(url);
            const data = await res.json();
            const route = data.routes[0].geometry;

            map.addSource('route', {
                type: 'geojson',
                data: {
                    type: 'Feature',
                    properties: {},
                    geometry: route,
                },
            });

            map.addLayer({
                id: 'route',
                type: 'line',
                source: 'route',
                layout: {
                    'line-join': 'round',
                    'line-cap': 'round',
                },
                paint: {
                    'line-color': '#3b82f6',
                    'line-width': 5,
                },
            });
        };

        map.on('load', drawRoute);

        return () => {
            map.remove();
        };
    }, [userLocation, dropCoordinates])

    return (
       <div className="fixed inset-0 z-50  bg-opacity-40 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-3xl h-[80vh] relative">
                <button onClick={onClose} className="absolute top-2 right-2 text-white bg-red-500 p-2 rounded z-50">
                    Close
                </button>
                <div ref={mapRef} className="w-full h-full rounded-xl" />
            </div>
        </div>
    );

}

export default LocationTrackingComponent