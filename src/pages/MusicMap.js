import React, { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { usersTopArtists, getArtist } from "../components/API"; // Adjusted API call
import CustomDropdown from "../components/CustomDropdown";
import axios from 'axios';

const MusicMap = ({ timeRange, setTimeRange, setBgImgArray, gottenData, setGottenData }) => {
    const [map, setMap] = useState(null);
    const [data, setData] = useState([]); // Raw data for filtering
    const [ApiData, setApiData] = useState([]); // Data currently displayed
    const [artistLimit, setArtistLimit] = useState(25); // Default artist limit
    const [sortOption, setSortOption] = useState("your_favourites"); // Default sorting option

    useEffect(() => {
        // Remove any existing Leaflet instance before creating a new one
        const existingMap = L.DomUtil.get("map");
        if (existingMap && existingMap._leaflet_id !== undefined) {
            existingMap.remove();
        }

        const mapInstance = L.map("map", {
            center: [51.505, -0.09],
            zoom: 2,
            dragging: true,
            touchZoom: true,
            scrollWheelZoom: true,
            doubleClickZoom: true,
            boxZoom: true,
            keyboard: true,
            minZoom: 2,  // 🔹 Prevents zooming out beyond level 2
            maxZoom: 18, // (Optional) Prevents zooming in too much
            maxBounds: [
                [-85, -180], // Southwest corner
                [85, 180],   // Northeast corner
            ],
            maxBoundsViscosity: 1.0
        });

        L.tileLayer(
            "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
            {
                attribution: '&copy; Esri &mdash; Esri, DeLorme, NAVTEQ     ///||||///  also low number of requests allowed because geocoding isnt free',
            }
        ).addTo(mapInstance);

        setMap(mapInstance);

        return () => {
            mapInstance.remove(); // Cleanup when component unmounts
        };
    }, []);

    useEffect(() => {
        const handleResize = () => {
            if (map) {
                map.invalidateSize();
            }
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [map]);

    useEffect(() => {
        const fetchData = async () => {
            if (gottenData?.artists?.[timeRange]?.data) {
                setData(gottenData.artists[timeRange].data);
            } else {
                const fetchedData = await usersTopArtists(timeRange);
                setData(fetchedData);
                setGottenData(prev => ({
                    ...prev,
                    artists: {
                        ...prev.artists,
                        [timeRange]: { data: fetchedData }
                    }
                }));
            }
        };

        setData([]); // Clear while loading
        fetchData();
    }, [timeRange]);

    // Function to get latitude and longitude from city name
    const getLatLng = async (cityName, country) => {
        let url = `https://api.opencagedata.com/geocode/v1/json?q=${cityName}&key=6c6d8cf05b584736a34ca454494a519a`;

        if (country) {
            url += `&countrycode=${country.toLowerCase()}`; // OpenCage requires lowercase country codes
        }

        try {
            const response = await axios.get(url);
            const data = response.data.results[0]; // Assuming the first result is the most relevant
            if (data) {
                return {
                    lat: data.geometry.lat,
                    lng: data.geometry.lng,
                };
            } else {
                console.log("City not found");
                return null;
            }
        } catch (error) {
            console.error("Error fetching latitude and longitude:", error);
            return null;
        }
    };

    const renderMarkers = (fetchedDataBrainz) => {
        if (!map) {
          console.warn("Map not initialized yet.");
          return;
        }
      
        const markers = [];
        for (const artist of fetchedDataBrainz) {
          if (!artist.musicBrainz) continue;
      
          const cityName = artist?.musicBrainz['begin-area']?.name;
          const country = artist?.musicBrainz.country;
      
          if (cityName && country) {
            getLatLng(cityName, country).then((location) => {
              if (location && map) { // ✅ double-check map before using it
                const { lat, lng } = location;
      
                const marker = L.marker([lat, lng], {
                  icon: L.divIcon({
                    className: "custom-marker",
                    html: `
                      <div style="width: 50px; height: 50px; border-radius: 50%; overflow: hidden; box-shadow: 0px 0px 5px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
                        <img src="${artist?.images?.[0]?.url}" style="width: 100%; height: 100%; object-fit: cover;" />
                      </div>
                    `,
                    iconSize: [50, 60],
                    iconAnchor: [25, 50],
                    popupAnchor: [0, -50],
                  }),
                })
                  .addTo(map)
                  .bindPopup(`<b>${artist.name}</b><br>${cityName}`);
      
                markers.push(marker);
              }
            });
          }
        }
      };
      
      

      useEffect(() => {
        const fetchDataBrainz = async (sortedData) => {
          const cachedData = gottenData?.musicBrainz?.[timeRange]?.data;
      
          if (cachedData) {
            setApiData(cachedData);
            renderMarkers(cachedData); // 👈 render from cache
            return;
          }
      
          try {
            const fetchedDataBrainz = await getArtist(sortedData);
            setApiData(fetchedDataBrainz);
            renderMarkers(fetchedDataBrainz); // 👈 render from fresh fetch
      
            setGottenData(prev => ({
              ...prev,
              musicBrainz: {
                ...prev.musicBrainz,
                [timeRange]: { data: fetchedDataBrainz }
              }
            }));
          } catch (error) {
            console.error("Error fetching data from Brainz:", error);
          }
        };
      
        const limitedData = data?.slice(0, artistLimit);
        const sortedData = [...limitedData];
      
        const bgImgArray = sortedData.map(artist => artist?.images?.[0]?.url).slice(0, 10);
        setBgImgArray(bgImgArray);
      
        fetchDataBrainz(sortedData);
      }, [artistLimit, sortOption, data]);
      

    const timeOptions = [
        { label: 'Last Month', value: 'short_term', onClick: () => setTimeRange("short_term") },
        { label: 'Last 6 Months', value: 'medium_term', onClick: () => setTimeRange("medium_term") },
        { label: 'Last Year', value: 'long_term', onClick: () => setTimeRange("long_term") },
    ];

    const numOptions = [
        { label: '25', value: 25, onClick: () => setArtistLimit(25) },
        { label: '15', value: 15, onClick: () => setArtistLimit(15) },
        { label: '10', value: 10, onClick: () => setArtistLimit(10) },
    ];

    const preselectedTimeItem = timeOptions.find(option => option.value === timeRange);
    const preselectedNumItem = numOptions.find(option => option.value === artistLimit);

    return (
        <>
            <div className="d-flex mb-2 flex-wrap">
                <h1 className="text-light fw-bold mt-2 me-2 text-shadow">Your Music In The World</h1>
                <div className="flex-fill flex-grow-container flex-wrap-reverse" style={{ maxWidth: '580px' }}>
                    <div className="buttonWrapper">
                        <CustomDropdown
                            title="Select Time Range"
                            items={timeOptions}
                            preselectedItem={preselectedTimeItem}
                        />
                    </div>
                    <div className="buttonWrapper">
                        <CustomDropdown
                            title="Num"
                            items={numOptions}
                            preselectedItem={preselectedNumItem}
                        />
                    </div>
                </div>
            </div>
            <div className='col-md-aut bg-darkerMine' style={{ overflow: 'hidden', maxHeight: '76vh', borderRadius: '35px', boxShadow: '0 4px 12px rgba(18, 18, 18, 0.4)' }}>
                <div id="map" style={{ margin: 12, width: "auto", height: "73vh", borderRadius: '25px', borderStyle: 'inset', borderWidth: '3px' }} />
            </div>
        </>
    );
};

export default MusicMap;
