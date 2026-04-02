import React, { useState, useEffect } from 'react';
import ScrollableCard from "../components/Card";
import { usersTopTracks } from "../components/API";
import CustomDropdown from "../components/CustomDropdown";
import SongCard from '../components/Song';

const TopTracks = ({ timeRange, setTimeRange, setBgImgArray, gottenData, setGottenData }) => {
    const [data, setData] = useState([]); // Raw data for filtering
    const [ApiData, setApiData] = useState([]); // Data currently displayed
    const [songLimit, setSongLimit] = useState(300); // State to control the song limit from slider
    const [sortOption, setSortOption] = useState("your_favourites"); // Default sorting option

    useEffect(() => {
        setData([])
        const fetchData = async () => {
            const fetchedData = await usersTopTracks(timeRange); // Assuming usersTopTracks is an async function
            setData(fetchedData); // Set raw data
            setGottenData(prev => ({
                ...prev,
                tracks: {
                    ...prev.tracks,
                    [timeRange]: { data: fetchedData }
                }
            }));
        };

        if 
        (gottenData?.tracks?.[timeRange]?.data) {
            setData(gottenData.tracks[timeRange].data)
        }
        else {
            fetchData(); // Call the async fetch function
        }

    }, [timeRange]); // When timeRange changes, re-fetch the data

    useEffect(() => {
        // First, limit the number of tracks based on the slider value (applied to "your_favourites")
        const limitedData = data?.slice(0, songLimit); // Limit the number of songs based on slider value

        // Apply sorting and other filters after limiting the data
        let sortedData = [...limitedData]; // Create a copy of the data to avoid mutating the original

        if (sortOption === "most_popular") {
            // Assuming popularity is based on track's `popularity` field (if available)
            sortedData = sortedData.sort((a, b) => b.popularity - a.popularity); // Sort by popularity descending
        } else if (sortOption === "newest") {
            sortedData = sortedData.sort((a, b) => new Date(b.album.release_date) - new Date(a.album.release_date)); // Sort by release year
        } else if (sortOption === "song_length") {
            sortedData = sortedData.sort((a, b) => b.duration_ms - a.duration_ms); // Sort by song length (duration in ms)
        }

        setApiData(sortedData); // Set the sorted and limited data

        const bgImgArray = [...new Set(sortedData
            .map(song => song?.album?.images[0]?.url)
            .filter(url => url) // Remove undefined/null values
          )].slice(0, 10);

        setBgImgArray(bgImgArray)

    }, [songLimit, sortOption, data]); // Re-run filtering and sorting when songLimit, sortOption, or data changes

    const handleTimeRange = (time) => {
        setTimeRange(time); // Update the selected time range
    };

    const handleSortOption = (sortOption) => {
        setSortOption(sortOption); // Update the sorting option
    };

    const handleSongLimit = (num) => {
        setSongLimit(num);
    };

    const timeOptions = [
        { label: 'Last Month', value: 'short_term', onClick: () => handleTimeRange("short_term") },
        { label: 'Last 6 Months', value: 'medium_term', onClick: () => handleTimeRange("medium_term") },
        { label: 'Last Year', value: 'long_term', onClick: () => handleTimeRange("long_term") },
    ];

    const sortOptions = [
        { label: 'Your Favourites', value: 'your_favourites', onClick: () => handleSortOption("your_favourites") },
        { label: 'Most Popular', value: 'most_popular', onClick: () => handleSortOption("most_popular") },
        { label: 'Newest', value: 'newest', onClick: () => handleSortOption("newest") },
        { label: 'Longest', value: 'song_length', onClick: () => handleSortOption("song_length") },
    ];

    const numOptions = [
        { label: '300', value: 300, onClick: () => handleSongLimit(300) },
        { label: '100', value: 100, onClick: () => handleSongLimit(100) },
        { label: '50', value: 50, onClick: () => handleSongLimit(50) },
        { label: '10', value: 10, onClick: () => handleSongLimit(10) },
    ]

    const preselectedTimeItem = timeOptions.find(option => option.value === timeRange);
    const preselectedSortItem = sortOptions.find(option => option.value === sortOption);
    const preselectedNumItem = numOptions.find(option => option.value === songLimit);

    return (
        <>
            <div className="d-flex mb-2 flex-wrap">
                <h1 className="text-light fw-bold mt-2 me-2 text-shadow">Your Top Tracks</h1>
                <div className="flex-fill flex-grow-container  flex-wrap-reverse" style={{ maxWidth: '580px' }}>  {/* custom max width so they dont spread too much ehh */}
                    <div className="buttonWrapper">
                        <CustomDropdown
                            title="Select Time Range"
                            items={timeOptions}
                            preselectedItem={preselectedTimeItem}
                        />
                    </div>
                    <div className="buttonWrapper">
                        <CustomDropdown
                            title="Sort By"
                            items={sortOptions}
                            preselectedItem={preselectedSortItem}
                        />
                    </div>
                    <div className="buttonWrapper">
                        <CustomDropdown
                            title="num"
                            items={numOptions}
                            preselectedItem={preselectedNumItem}
                        />
                    </div>
                </div>
            </div >

            <ScrollableCard>
                {ApiData?.length > 0 ? (
                    ApiData.map((track, index) => (
                        <SongCard song={track} index={index} />
                    ))
                ) : (
                    <div class="spinner-border text-light" role="status" />
                )}
            </ScrollableCard>
        </>
    );
};

export default TopTracks;
