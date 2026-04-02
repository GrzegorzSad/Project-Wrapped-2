import React, { useState, useEffect } from 'react';
import ScrollableCard from "../components/Card";
import { usersTopArtists } from "../components/API"; // Adjusted API call
import CustomDropdown from "../components/CustomDropdown";
import ArtistCard from "../components/Artist"; // New component for displaying artists

const TopArtists = ({ timeRange, setTimeRange, setBgImgArray, gottenData, setGottenData }) => {
    const [data, setData] = useState([]); // Raw data for filtering
    const [ApiData, setApiData] = useState([]); // Data currently displayed
    const [artistLimit, setArtistLimit] = useState(300); // Default artist limit
    const [sortOption, setSortOption] = useState("your_favourites"); // Default sorting option

    useEffect(() => {
        setData([])
        const fetchData = async () => {
            const fetchedData = await usersTopArtists(timeRange); // Fetch top artists
            setData(fetchedData);
            setGottenData(prev => ({
                ...prev,
                artists: {
                    ...prev.artists,
                    [timeRange]: { data: fetchedData }
                }
            }));
        };

        if 
        (gottenData?.artists?.[timeRange]?.data) {
            setData(gottenData.artists[timeRange].data)
        }
        else {
            fetchData(); // Call the async fetch function
        }
    }, [timeRange]);

    useEffect(() => {
        let limitedData = data.slice(0, artistLimit);
        let sortedData = [...limitedData];

        if (sortOption === "most_popular") {
            sortedData = sortedData.sort((a, b) => b.popularity - a.popularity);
        } else if (sortOption === "most_followers") {
            sortedData = sortedData.sort((a, b) => b.followers.total - a.followers.total);
        }

        setApiData(sortedData);

        const bgImgArray = sortedData.map(artist => artist?.images[0]?.url).splice(0, 10)

        setBgImgArray(bgImgArray)

    }, [artistLimit, sortOption, data]);

    const timeOptions = [
        { label: 'Last Month', value: 'short_term', onClick: () => setTimeRange("short_term") },
        { label: 'Last 6 Months', value: 'medium_term', onClick: () => setTimeRange("medium_term") },
        { label: 'Last Year', value: 'long_term', onClick: () => setTimeRange("long_term") },
    ];

    const sortOptions = [
        { label: 'Your Favourites', value: 'your_favourites', onClick: () => setSortOption("your_favourites") },
        { label: 'Most Popular', value: 'most_popular', onClick: () => setSortOption("most_popular") },
        { label: 'Most Followers', value: 'most_followers', onClick: () => setSortOption("most_followers") },
    ];

    const numOptions = [
        { label: '300', value: 300, onClick: () => setArtistLimit(300) },
        { label: '100', value: 100, onClick: () => setArtistLimit(100) },
        { label: '50', value: 50, onClick: () => setArtistLimit(50) },
        { label: '10', value: 10, onClick: () => setArtistLimit(10) }
    ];

    const preselectedTimeItem = timeOptions.find(option => option.value === timeRange);
    const preselectedSortItem = sortOptions.find(option => option.value === sortOption);
    const preselectedNumItem = numOptions.find(option => option.value === artistLimit);

    return (
        <>
            <div className="d-flex mb-2 flex-wrap">
                <h1 className="text-light fw-bold mt-2 me-2 text-shadow">Your Top Artists</h1>
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
            </div>

            <ScrollableCard>
                {ApiData?.length > 0 ? (
                    ApiData.map((artist, index) => (
                        <ArtistCard key={artist.id} artist={artist} index={index} />
                    ))
                ) : (
                    <div class="spinner-border text-light" role="status"/>
                )}
            </ScrollableCard>
        </>
    );
};

export default TopArtists;