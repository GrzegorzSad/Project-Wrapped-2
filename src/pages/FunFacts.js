import React, { useState, useEffect } from 'react';
import ScrollableCard from "../components/Card";
import { usersTopArtists, usersTopTracks, getArtist, getMostListenedToAlbums } from "../components/API";
import CustomDropdown from "../components/CustomDropdown";
import { BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const FunFacts = ({ timeRange, setTimeRange, setBgImgArray, gottenData, setGottenData }) => {
    const [dataArtists, setDataArtists] = useState([]);
    const [dataTracks, setDataTracks] = useState([]);
    const [dataAlbums, setDataAlbums] = useState([]);
    const [ApiDataArtists, setApiDataArtists] = useState([]);
    const [ApiDataTracks, setApiDataTracks] = useState([]);
    const [ApiDataAlbums, setApiDataAlbums] = useState([]);
    //const [artistLimit, setArtistLimit] = useState(25);
    const [dataForChart1, setDataForChart1] = useState(null);
    const [dataForChart2, setDataForChart2] = useState(null);
    const [dataForChart3, setDataForChart3] = useState(null);
    const [dataForChart4, setDataForChart4] = useState(null);

    const [avgTrackLength, setAvgTrackLength] = useState(0);
    const [avgPopularity, setAvgPopularity] = useState(0);
    const [unplayableTracks, setUnplayableTracks] = useState(0);
    const [explicitTracks, setExplicitTracks] = useState(0);

    useEffect(() => {
        setDataArtists([]);
        setDataTracks([]);
        setDataAlbums([]);

        const fetchData = async () => {
            
            if (gottenData?.artists?.[timeRange]?.data) {
                setDataArtists(gottenData.artists[timeRange].data)
            } else {
                const fetchedArtists = await usersTopArtists(timeRange);
                setDataArtists(fetchedArtists);
                setGottenData(prev => ({
                    ...prev,
                    artists: {
                        ...prev.artists,
                        [timeRange]: { data: fetchedArtists }
                    }
                }));
            }

            if (gottenData?.tracks?.[timeRange]?.data) {
                setDataTracks(gottenData.tracks[timeRange].data)
            } else {
                const fetchedTracks = await usersTopTracks(timeRange);
                setDataTracks(fetchedTracks);
                setGottenData(prev => ({
                    ...prev,
                    tracks: {
                        ...prev.tracks,
                        [timeRange]: { data: fetchedTracks }
                    }
                }));
            }

            if (gottenData?.albums?.[timeRange]?.data) {
                setDataAlbums(gottenData.albums[timeRange].data)
            } else {
                const fetchedAlbums = await getMostListenedToAlbums(timeRange);
                setDataAlbums(fetchedAlbums);
                setGottenData(prev => ({
                    ...prev,
                    albums: {
                        ...prev.albums,
                        [timeRange]: { data: fetchedAlbums }
                    }
                }));
            }
        };

        fetchData();
    }, [timeRange]);

    useEffect(() => {
        const fetchDataBrainz = async (limitedDataArtists) => {
            try {
                const fetchedDataBrainz = await getArtist(limitedDataArtists.slice(0, 25));
                setApiDataArtists(fetchedDataBrainz);
            } catch (error) {
                console.error("Error fetching MusicBrainz data:", error);
            }
        };

        let limitedDataArtists = dataArtists;
        setApiDataArtists(limitedDataArtists);

        let limitedDataTracks = dataTracks
        setApiDataTracks(limitedDataTracks);

        let limitedDataAlbums = dataAlbums
        setApiDataAlbums(limitedDataAlbums);

        const bgImgArray = [...new Set(limitedDataTracks
            .map(song => song?.album?.images[0]?.url)
            .filter(url => url) // Remove undefined/null values
        )].slice(0, 100);

        setBgImgArray(bgImgArray)

        fetchDataBrainz(limitedDataArtists);

    }, [dataArtists, dataTracks, dataAlbums]);

    useEffect(() => {

        function countArtistTypes(artists) {
            const counts = {
                groups: { count: 0, artists: [] },
                solo: { count: 0, artists: [] },
            };

            artists.forEach(artist => {
                const artistData = {
                    name: artist.name,
                    img: artist.images?.[0]?.url || 'https://via.placeholder.com/40',  // Handle missing images
                };

                // Count by type (Group vs Solo)
                if (artist.musicBrainz?.type === "Group") {
                    counts.groups.count++;
                    counts.groups.artists.push(artistData);
                } else if (artist.musicBrainz?.type === "Person") {
                    counts.solo.count++;
                    counts.solo.artists.push(artistData);
                }
            });

            return [
                { name: "Groups", artists: counts.groups.count, contributingArtists: counts.groups.artists },
                { name: "Solo", artists: counts.solo.count, contributingArtists: counts.solo.artists },
            ];
        }

        function countGender(artists) {
            const counts = {
                male: { count: 0, artists: [] },
                female: { count: 0, artists: [] },
                other: { count: 0, artists: [] },  // For artists with unknown or non-binary gender
            };

            artists.forEach(artist => {
                const artistData = {
                    name: artist.name,
                    img: artist.images?.[0]?.url || 'https://via.placeholder.com/40',  // Handle missing images
                };

                // Count by gender
                const gender = artist.musicBrainz?.gender?.toLowerCase();  // Assuming 'gender' is available
                if (gender && gender === 'male') {
                    counts.male.count++;
                    counts.male.artists.push(artistData);
                } else if (gender && gender === 'female') {
                    counts.female.count++;
                    counts.female.artists.push(artistData);
                } else {
                    counts.other.count++;
                    counts.other.artists.push(artistData);
                }
            });

            return [
                { name: "Male", artists: counts.male.count, contributingArtists: counts.male.artists },
                { name: "Female", artists: counts.female.count, contributingArtists: counts.female.artists },
                { name: "Other", artists: counts.other.count, contributingArtists: counts.other.artists },
            ];
        }


        function countTrackYears(tracks) {
            const counts = tracks.reduce((counts, track) => {
                const releaseYear = new Date(track.album?.release_date).getFullYear();

                const trackData = {
                    name: track.name,
                    artist: track.artists?.map(a => a.name).join(", "), // Get all artists
                    img: track.album?.images?.[0]?.url || 'https://via.placeholder.com/40' // Handle missing image
                };

                if (releaseYear in counts) {
                    counts[releaseYear].count++;
                    counts[releaseYear].tracks.push(trackData);
                } else {
                    counts[releaseYear] = { count: 1, tracks: [trackData] };
                }
                return counts;
            }, {});

            // Get min and max years
            const years = Object.keys(counts).map(Number);
            const minYear = Math.min(...years);
            const maxYear = Math.max(...years);

            for (let year = minYear; year <= maxYear; year++) {
                if (!counts[year]) {
                    counts[year] = { count: 0, tracks: [] };
                }
            }

            return Object.entries(counts).map(([year, data]) => ({
                name: year,
                tracks: data.count,
                uv: 0, // Placeholder for other data if needed
                contributingTracks: data.tracks // Pass entire track objects for tooltip
            }));
        }

        function countAlbumYears(albums) {
            const counts = albums.reduce((counts, album) => {
                const releaseYear = album.releaseDate ? new Date(album.releaseDate).getFullYear() : "Unknown";

                if (releaseYear === "Unknown") return counts; // Skip albums without valid release years

                const albumData = {
                    name: album.name,
                    artist: album.artist || "Unknown Artist",
                    img: album.images?.[0]?.url || 'https://via.placeholder.com/40'
                };

                if (!counts[releaseYear]) {
                    counts[releaseYear] = { count: 0, albums: [] };
                }

                counts[releaseYear].count++;
                counts[releaseYear].albums.push(albumData);

                return counts;
            }, {});

            // Get min and max years
            const years = Object.keys(counts).map(Number);
            const minYear = Math.min(...years);
            const maxYear = Math.max(...years);

            // Fill in missing years with 0 albums
            for (let year = minYear; year <= maxYear; year++) {
                if (!counts[year]) {
                    counts[year] = { count: 0, albums: [] };
                }
            }

            return Object.entries(counts).map(([year, data]) => ({
                name: year,
                albums: data.count, // Ensure this exists for the chart
                contributingAlbums: data.albums
            }));
        }

        // 1. Calculate the average track length (in milliseconds)
        const getAverageTrackLength = (tracks) => {
            if (!tracks.length) return 0;
            const totalDuration = tracks.reduce((sum, track) => sum + track.duration_ms, 0);
            return totalDuration / tracks.length;
        };

        // 2. Calculate the average popularity of tracks
        const getAveragePopularity = (tracks) => {
            if (!tracks.length) return 0;
            const totalPopularity = tracks.reduce((sum, track) => sum + track.popularity, 0);
            return totalPopularity / tracks.length;
        };

        // 3. Count the number of songs where is_playable is false
        const countUnplayableTracks = (tracks) => {
            return tracks.filter(track => track.is_playable === false).length;
        };

        // 4. Count the number of explicit songs
        const countExplicitTracks = (tracks) => {
            return tracks.filter(track => track.explicit).length;
        };

        // Set data for the charts
        setDataForChart1(countArtistTypes(ApiDataArtists));
        setDataForChart2(countTrackYears(ApiDataTracks));
        setDataForChart3(countAlbumYears(ApiDataAlbums));
        setDataForChart4(countGender(ApiDataArtists));

        setAvgTrackLength(getAverageTrackLength(ApiDataTracks));
        setAvgPopularity(getAveragePopularity(ApiDataTracks));
        setUnplayableTracks(countUnplayableTracks(ApiDataTracks));
        setExplicitTracks(countExplicitTracks(ApiDataTracks));

    }, [ApiDataArtists, ApiDataTracks, ApiDataAlbums]);

    const timeOptions = [
        { label: 'Last Month', value: 'short_term', onClick: () => setTimeRange("short_term") },
        { label: 'Last 6 Months', value: 'medium_term', onClick: () => setTimeRange("medium_term") },
        { label: 'Last Year', value: 'long_term', onClick: () => setTimeRange("long_term") },
    ];

    // const numOptions = [
    //     { label: '50', value: 50, onClick: () => setArtistLimit(50) },
    //     { label: '25', value: 25, onClick: () => setArtistLimit(25) },
    //     { label: '10', value: 10, onClick: () => setArtistLimit(10) }
    // ];

    const preselectedTimeItem = timeOptions.find(option => option.value === timeRange);
    // const preselectedNumItem = numOptions.find(option => option.value === artistLimit);

    const colors = ["#8884d8", "#82ca9d"]; // Purple & Green (Group vs Solo)

    const genderColors = ["#8884d8", "#82ca9d", "#72ca6d"];

    return (
        <>
            <div className="d-flex mb-2 flex-wrap">
                <h1 className="text-light fw-bold mt-2 me-2 text-shadow">Fun Facts About Your Taste</h1>
                <div className="flex-fill flex-grow-container flex-wrap-reverse" style={{ maxWidth: '580px' }}>
                    <div className="buttonWrapper">
                        <CustomDropdown
                            title="Select Time Range"
                            items={timeOptions}
                            preselectedItem={preselectedTimeItem}
                        />
                    </div>
                    {/* <div className="buttonWrapper">
                        <CustomDropdown
                            title="Number of Artists"
                            items={numOptions}
                            preselectedItem={preselectedNumItem}
                        />
                    </div> */}
                </div>
            </div>

            <ScrollableCard>
                {ApiDataArtists?.length > 0 && ApiDataTracks.length > 0 && ApiDataAlbums.length > 0 ? (
                    <>
                        <div className="row gx-1 d-flex">
                            <div className="col-12 col-md-6">
                                <div style={{
                                    borderRadius: '25px', paddingTop: '10px', paddingBottom: '10px', paddingLeft: '10px', marginBottom: '5px',
                                    boxShadow: '0 2px 6px rgba(18, 18, 18, 0.4)'
                                }} className="bg-darkMine">
                                    <div className='d-flex flex-column flex-md-row justify-content-center gap-5'>
                                        <div className="d-flex flex-column flex-sm-1 justify-content-center mr-3">
                                            <div className="text-light text-center mb-3 mt-3">
                                                <h2>Groups or Solo Artists?</h2>
                                                <strong>based on your top 25</strong>
                                            </div>

                                            <ResponsiveContainer width="98%" height={300}>
                                                <PieChart>
                                                    <Pie
                                                        data={dataForChart1}
                                                        dataKey="artists"
                                                        nameKey="name"
                                                        cx="50%"
                                                        cy="50%"
                                                        outerRadius={100}
                                                        label
                                                        fill={({ index }) => colors[index % colors.length]} // Assign colors dynamically
                                                    >
                                                        {dataForChart1.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip
                                                        wrapperStyle={{ pointerEvents: 'none', zIndex: 9999 }}
                                                        content={({ payload }) => {
                                                            if (!payload || payload.length === 0) return null;

                                                            const { name, contributingArtists } = payload[0].payload;

                                                            return (
                                                                <div className="custom-tooltip" style={{
                                                                    backgroundColor: 'rgba(0, 0, 0, 0.75)', padding: '10px', borderRadius: '8px',
                                                                    color: 'white', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)'
                                                                }}>
                                                                    <strong>{name} - {contributingArtists.length} Contributing Artists:</strong>
                                                                    <div style={{ maxHeight: '525px', overflowY: 'hidden' }}>
                                                                        <ul className="list-unstyled">
                                                                            {contributingArtists?.slice(0, 12).map((artist, index) => (
                                                                                <li key={index} className="d-flex align-items-center mt-1">
                                                                                    <img
                                                                                        src={artist.img}
                                                                                        alt={artist.name}
                                                                                        style={{ width: "40px", height: "40px", borderRadius: "6px", marginRight: "8px" }}
                                                                                    />
                                                                                    <div>
                                                                                        <strong>{artist.name}</strong>
                                                                                    </div>
                                                                                </li>
                                                                            ))}
                                                                        </ul>
                                                                    </div>
                                                                </div>
                                                            );
                                                        }}
                                                    />
                                                    <Legend style={{ fill: 'white' }} />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="col-12 col-md-6">
                                <div style={{
                                    borderRadius: '25px', paddingTop: '10px', paddingBottom: '10px', paddingLeft: '10px', marginBottom: '5px',
                                    boxShadow: '0 2px 6px rgba(18, 18, 18, 0.4)'
                                }} className="bg-darkMine">
                                    <div className='d-flex flex-column flex-md-row justify-content-center gap-5'>
                                        <div className="d-flex flex-column flex-sm-1 justify-content-center">
                                            <div className="text-light text-center mb-3 mt-3">
                                                <h2>Gender Distribution</h2>
                                                <strong>based on your top 25</strong>
                                            </div>

                                            <ResponsiveContainer width="98%" height={300}>
                                                <PieChart>
                                                    <Pie
                                                        data={dataForChart4} // Assume this data is formatted with gender categories
                                                        dataKey="artists"
                                                        nameKey="name"
                                                        cx="50%"
                                                        cy="50%"
                                                        outerRadius={100}
                                                        label
                                                        fill={({ index }) => genderColors[index % genderColors.length]} // Assign colors dynamically for gender
                                                    >
                                                        {dataForChart4.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={genderColors[index % genderColors.length]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip
                                                        wrapperStyle={{ pointerEvents: 'none', zIndex: 9999 }}
                                                        content={({ payload }) => {
                                                            if (!payload || payload.length === 0) return null;

                                                            const { name, contributingArtists } = payload[0].payload;

                                                            return (
                                                                <div className="custom-tooltip" style={{
                                                                    backgroundColor: 'rgba(0, 0, 0, 0.75)', padding: '10px', borderRadius: '8px',
                                                                    color: 'white', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)'
                                                                }}>
                                                                    <strong>{name} - {contributingArtists.length} Contributing Artists:</strong>
                                                                    <div style={{ maxHeight: '525px', overflowY: 'hidden' }}>
                                                                        <ul className="list-unstyled">
                                                                            {contributingArtists?.slice(0, 12).map((artist, index) => (
                                                                                <li key={index} className="d-flex align-items-center mt-1">
                                                                                    <img
                                                                                        src={artist.img}
                                                                                        alt={artist.name}
                                                                                        style={{ width: "40px", height: "40px", borderRadius: "6px", marginRight: "8px" }}
                                                                                    />
                                                                                    <div>
                                                                                        <strong>{artist.name}</strong>
                                                                                    </div>
                                                                                </li>
                                                                            ))}
                                                                        </ul>
                                                                    </div>
                                                                </div>
                                                            );
                                                        }}
                                                    />
                                                    <Legend style={{ fill: 'white' }} />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                        <div style={{ borderRadius: '25px', paddingTop: '10px', paddingBottom: '10px', paddingLeft: '10px', marginBottom: '5px', boxShadow: '0 2px 6px rgba(18, 18, 18, 0.4)' }}
                            className="bg-darkMine">
                            <div className='d-flex flex-column flex-sm-nowrap flex-wrap justify-content-center'>
                                <div>
                                    <div className="text-light text-center mb-3 mt-3">
                                        <h3>Your Favourite Tracks by Year</h3>
                                        <strong>based on your top 300</strong>
                                    </div>
                                </div>
                                <ResponsiveContainer width="98%" height={300}>
                                    <BarChart data={dataForChart2}>
                                        <XAxis dataKey="name" style={{ fill: 'white' }} />
                                        <YAxis style={{ fill: 'white' }} />
                                        <Legend style={{ fill: 'white' }} />
                                        <Bar dataKey="tracks" fill="#8884d8" />
                                        <Tooltip
                                            wrapperStyle={{ pointerEvents: 'none', zIndex: 9999 }}
                                            content={({ payload }) => {
                                                if (!payload || payload.length === 0) return null;

                                                const { name, contributingTracks } = payload[0].payload;

                                                return (
                                                    <div
                                                        className="custom-tooltip"
                                                        style={{
                                                            backgroundColor: 'rgba(0, 0, 0, 0.85)',
                                                            padding: '12px',
                                                            borderRadius: '8px',
                                                            color: 'white',
                                                            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
                                                        }}
                                                    >
                                                        <strong>{name} - {contributingTracks.length} Tracks:</strong>
                                                        <div style={{ maxHeight: '525px', overflowY: 'hidden' }}>
                                                            <ul className="list-unstyled">
                                                                {contributingTracks.slice(0, 12).map((track, index) => (
                                                                    <li key={index} className="d-flex align-items-center mt-1">
                                                                        {/* Track Image */}
                                                                        <img
                                                                            src={track.img}
                                                                            alt={track.name}
                                                                            style={{ width: "40px", height: "40px", borderRadius: "6px", marginRight: "8px" }}
                                                                        />
                                                                        <div>
                                                                            {/* Track Name */}
                                                                            <strong>{track.name}</strong>
                                                                            <small style={{ color: "#ddd" }}> - {track.artist}</small>
                                                                        </div>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    </div>
                                                );
                                            }}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>


                            </div>
                        </div>
                        <div style={{ borderRadius: '25px', paddingTop: '10px', paddingBottom: '10px', paddingLeft: '10px', marginBottom: '5px', boxShadow: '0 2px 6px rgba(18, 18, 18, 0.4)' }}
                            className="bg-darkMine">
                            <div className='d-flex flex-column flex-sm-nowrap flex-wrap justify-content-center'>
                                <div>
                                    <div className="text-light text-center mb-3 mt-3">
                                        <h3>Your Favourite Albums by Year</h3>
                                    </div>
                                </div>
                                <ResponsiveContainer width="98%" height={300}>
                                    <BarChart data={dataForChart3}>
                                        <XAxis dataKey="name" style={{ fill: 'white' }} />
                                        <YAxis style={{ fill: 'white' }} />
                                        <Legend style={{ fill: 'white' }} />
                                        <Bar dataKey="albums" fill="#8884d8" />
                                        <Tooltip
                                            wrapperStyle={{ pointerEvents: 'none', zIndex: 9999 }}
                                            content={({ payload }) => {
                                                if (!payload || payload.length === 0) return null;

                                                const { name, contributingAlbums = [] } = payload[0]?.payload || {};

                                                return (
                                                    <div
                                                        className="custom-tooltip"
                                                        style={{
                                                            backgroundColor: 'rgba(0, 0, 0, 0.85)',
                                                            padding: '12px',
                                                            borderRadius: '8px',
                                                            color: 'white',
                                                            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
                                                        }}
                                                    >
                                                        <strong>{name} - {contributingAlbums.length} Albums:</strong>
                                                        <div style={{ maxHeight: '525px', overflowY: 'hidden' }}>
                                                            <ul className="list-unstyled">
                                                                {contributingAlbums.slice(0, 12).map((album, index) => (
                                                                    <li key={index} className="d-flex align-items-center mt-1">
                                                                        {/* Track Image */}
                                                                        <img
                                                                            src={album.img}
                                                                            alt={album.name}
                                                                            style={{ width: "40px", height: "40px", borderRadius: "6px", marginRight: "8px" }}
                                                                        />
                                                                        <div>
                                                                            {/* Track Name */}
                                                                            <strong>{album.name}</strong>
                                                                            <small style={{ color: "#ddd" }}> - {album.artist}</small>
                                                                        </div>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    </div>
                                                );
                                            }}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        <div style={{ borderRadius: '25px', paddingTop: '10px', paddingBottom: '10px', paddingLeft: '10px', marginBottom: '5px', boxShadow: '0 2px 6px rgba(18, 18, 18, 0.4)' }}
                            className="bg-darkMine">
                            <div className='d-flex flex-column flex-sm-nowrap flex-wrap justify-content-center'>
                                <div>
                                    <div className="text-light text-center mb-3 mt-3">
                                        <h3>Other Curiosities</h3>
                                        <strong>based on your top 300</strong>
                                    </div>
                                </div>
                                <div className="row me-1 ms-1 mb-3 text-light" >
                                        {[
                                            { label: "Average Track Length", value: `${Math.floor(avgTrackLength / 60000)}:${((avgTrackLength % 60000) / 1000).toFixed(0).padStart(2, '0')}`},
                                            { label: "Average Popularity", value: Math.round(avgPopularity) },
                                            { label: "Track Not Available Anymore", value: unplayableTracks },
                                            { label: "Explicit Tracks", value: explicitTracks }
                                        ].map((item, idx) => (
                                            <div className="col-sm-12 col-md-6 d-flex justify-content-between" key={idx}>
                                                <strong className="me-2">{item.label}:</strong>
                                                <div class='scrolling-text'>
                                                    <span>{item.value}</span>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        </div>
                        <div style={{ borderRadius: '25px', paddingTop: '10px', paddingBottom: '10px', paddingLeft: '10px', marginBottom: '5px', boxShadow: '0 2px 6px rgba(18, 18, 18, 0.4)' }}
                            className="bg-darkMine">
                            <div className='d-flex flex-column flex-sm-nowrap flex-wrap justify-content-center'>
                                <div>
                                    <div className="text-light text-center mb-3 mt-3">
                                        <h3>That's About It</h3>
                                        <strong>at least for now</strong>
                                    </div>
                                </div>
                                <div className="row me-1 ms-1 text-light" >
                                       <p>Thanks for checking my website out.</p>
                                       <p>Sometimes the ammount of entries is way lower than 300 (like on the map or some charts here), that's because it used different APIs then spotify, and those are more restrictive with how much you can ask for, or how much can you ask for without paying.</p>
                                       <p>When it comes to albums, Spotify doesn't give you albums, so the album score is calculated based on top 300 tracks. (ex. album A has a song in your favourites on spot 1 and 5, thats 300 + 295 points divided by the album's track count (to not favour longer albums). Same goes for genres.</p>
                                       <p>Made by: Grzegorz Sadowski</p>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="spinner-border text-light" role="status" />
                )}


            </ScrollableCard>
        </>
    );
};

export default FunFacts;
