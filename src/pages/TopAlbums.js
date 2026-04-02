import React, { useState, useEffect } from 'react';
import ScrollableCard from "../components/Card";
import { getMostListenedToAlbums } from "../components/API"; // Adjusted API call
import CustomDropdown from "../components/CustomDropdown";
import AlbumCard from "../components/Album"; // New component for displaying albums

const TopAlbums = ({ timeRange, setTimeRange, setBgImgArray, gottenData, setGottenData }) => {
    const [data, setData] = useState([]); // Raw data for filtering
    const [ApiData, setApiData] = useState([]); // Data currently displayed
    const [albumLimit, setAlbumLimit] = useState(300); // Default album limit
    const [sortOption, setSortOption] = useState("highest_score"); // Default sorting option

    useEffect(() => {
        setData([]);
        const fetchData = async () => {
            const fetchedData = await getMostListenedToAlbums(timeRange); // Fetch top albums
            setData(fetchedData);
            setGottenData(prev => ({
                ...prev,
                albums: {
                    ...prev.albums,
                    [timeRange]: { data: fetchedData }
                }
            }));
        };
        if 
        (gottenData?.albums?.[timeRange]?.data) {
            setData(gottenData.albums[timeRange].data)
        }
        else {
            fetchData(); // Call the async fetch function
        }
    }, [timeRange]);

    useEffect(() => {
        let limitedData = data?.slice(0, albumLimit);
        let sortedData = [...limitedData];

        if (sortOption === "most_popular") {
            sortedData = sortedData.sort((a, b) => b.popularity - a.popularity);
        } else if (sortOption === "newest") {
            sortedData = sortedData.sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));
        } else if (sortOption === "highest_score") {
            sortedData = sortedData.sort((a, b) => b.normalizedScore - a.normalizedScore);
        }

        setApiData(sortedData);

        const bgImgArray = sortedData.map(album => album?.images[0]?.url).splice(0, 10)

        setBgImgArray(bgImgArray)

    }, [albumLimit, sortOption, data]);

    const timeOptions = [
        { label: 'Last Month', value: 'short_term', onClick: () => setTimeRange("short_term") },
        { label: 'Last 6 Months', value: 'medium_term', onClick: () => setTimeRange("medium_term") },
        { label: 'Last Year', value: 'long_term', onClick: () => setTimeRange("long_term") },
    ];

    const sortOptions = [
        { label: 'Your Favourites', value: 'highest_score', onClick: () => setSortOption("highest_score") },
        { label: 'Most Popular', value: 'most_popular', onClick: () => setSortOption("most_popular") },
        { label: 'Newest', value: 'newest', onClick: () => setSortOption("newest") },
    ];

    const numOptions = [
        { label: '300', value: 300, onClick: () => setAlbumLimit(300) },
        { label: '100', value: 100, onClick: () => setAlbumLimit(100) },
        { label: '50', value: 50, onClick: () => setAlbumLimit(50) },
        { label: '10', value: 10, onClick: () => setAlbumLimit(10) },
    ];

    const preselectedTimeItem = timeOptions.find(option => option.value === timeRange);
    const preselectedSortItem = sortOptions.find(option => option.value === sortOption);
    const preselectedNumItem = numOptions.find(option => option.value === albumLimit);

    return (
        <>
            <div className="d-flex mb-2 flex-wrap">
                <h1 className="text-light fw-bold mt-2 me-2 text-shadow">Your Top Albums</h1>
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
                            title="Sort By"
                            items={sortOptions}
                            preselectedItem={preselectedSortItem}
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

            <ScrollableCard>
                {ApiData?.length > 0 ? (
                    ApiData.map((album, index) => (
                        <AlbumCard key={album.albumUri || album.name} album={album} index={index} />
                    ))
                ) : (
                    <div className="spinner-border text-light" role="status" />
                )}
            </ScrollableCard>
        </>
    );
};

export default TopAlbums;