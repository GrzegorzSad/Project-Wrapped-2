import React, { useState, useEffect } from "react";
import ScrollableCard from "../components/Card";
import { getUsersGenres } from "../components/API"; // Fetch genres instead of albums
import CustomDropdown from "../components/CustomDropdown";
import GenreCard from "../components/Genre"; // New component for displaying genres

const TopGenres = ({ timeRange, setTimeRange, setBgImgArray, gottenData, setGottenData }) => {
    const [data, setData] = useState([]); // Raw genre data
    const [ApiData, setApiData] = useState([]); // Filtered and sorted genre data
    const [genresLimit, setGenresLimit] = useState(300); // Default genres limit
    const [sortOption, setSortOption] = useState("highest_score"); // Default sorting option

    useEffect(() => {
        setData([]);
        const fetchData = async () => {
            const fetchedData = await getUsersGenres(timeRange); // Fetch top genres
            setData(fetchedData);
            setGottenData(prev => ({
                ...prev,
                genres: {
                    ...prev.genres,
                    [timeRange]: { data: fetchedData }
                }
            }));
        };
        if 
        (gottenData?.genres?.[timeRange]?.data) {
            setData(gottenData.genres[timeRange].data)
        }
        else {
            fetchData(); // Call the async fetch function
        }
    }, [timeRange]);

    useEffect(() => {
        let limitedData = data?.slice(0, genresLimit);
        let sortedData = [...limitedData];

        if (sortOption === "most_artists") {
            sortedData = sortedData.sort((a, b) => b.artists.length - a.artists.length);
        } else if (sortOption === "most_popular") {
            sortedData = sortedData.sort((a, b) => {
                const avgPopularityA = a.artists.reduce((sum, artist) => sum + artist.popularity, 0) / a.artists.length;
                const avgPopularityB = b.artists.reduce((sum, artist) => sum + artist.popularity, 0) / b.artists.length;
                return avgPopularityB - avgPopularityA;
            });
        } else if (sortOption === "highest_score") {
            sortedData = sortedData.sort((a, b) => (b.score || 0) - (a.score || 0)); // Sorting by highest score
        } else if (sortOption === "alphabetical") {
            sortedData = sortedData.sort((a, b) => a.genre.localeCompare(b.genre));
        }

        setApiData(sortedData);

        const bgImgArray = [...new Set(sortedData
            .map(genre => genre.tracks[0]?.image)
            .filter(image => image) // Remove undefined/null values
          )].slice(0, 12);

        setBgImgArray(bgImgArray)

    }, [sortOption, data, genresLimit]);

    const timeOptions = [
        { label: "Last Month", value: "short_term", onClick: () => setTimeRange("short_term") },
        { label: "Last 6 Months", value: "medium_term", onClick: () => setTimeRange("medium_term") },
        { label: "Last Year", value: "long_term", onClick: () => setTimeRange("long_term") },
    ];

    const sortOptions = [
        { label: "Most Artists", value: "most_artists", onClick: () => setSortOption("most_artists") },
        { label: "Most Popular", value: "most_popular", onClick: () => setSortOption("most_popular") },
        { label: "Your Favourites", value: "highest_score", onClick: () => setSortOption("highest_score") }, // New sorting option
        { label: "Alphabetical", value: "alphabetical", onClick: () => setSortOption("alphabetical") },
    ];

    const numOptions = [
        { label: '300', value: 300, onClick: () => setGenresLimit(300) },
        { label: '100', value: 100, onClick: () => setGenresLimit(100) },
        { label: '50', value: 50, onClick: () => setGenresLimit(50) },
        { label: '10', value: 10, onClick: () => setGenresLimit(10) }
    ];

    const preselectedTimeItem = timeOptions.find(option => option.value === timeRange);
    const preselectedSortItem = sortOptions.find(option => option.value === sortOption);
    const preselectedNumItem = numOptions.find(option => option.value === genresLimit);

    return (
        <>
            <div className="d-flex mb-2 flex-wrap">
                <h1 className="text-light fw-bold mt-2 me-2 text-shadow">Your Top Genres</h1>
                <div className="flex-fill flex-grow-container flex-wrap-reverse" style={{ maxWidth: "580px" }}>
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
                    ApiData.map((genreData, index) => (
                        <GenreCard key={genreData.genre} genreData={genreData} index={index} />
                    ))
                ) : (
                    <div className="spinner-border text-light" role="status" />
                )}
            </ScrollableCard>
        </>
    );
};

export default TopGenres;
