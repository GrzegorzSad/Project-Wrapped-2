const GenreCard = ({ genreData, index = null }) => {
    const { genre, artists, tracks, score } = genreData;

    return (
        <div
            style={{
                borderRadius: "25px",
                padding: "10px",
                marginBottom: "5px",
                boxShadow: "0 2px 6px rgba(18, 18, 18, 0.4)"
            }}
            className="bg-darkMine"
        >
            <div className="d-flex flex-sm-nowrap flex-wrap">
                <div className="flex-grow-1 text-light">
                    <strong>{index + 1}. {genre.charAt(0).toUpperCase() + genre.slice(1)}</strong>
                    <div className="row me-1">
                        {[
                            // { label: "Artists", value: artists.length },
                            // { label: "Tracks", value: tracks.length },
                            { label: "Score", value: score },
                        ].map((item, idx) => (
                            <div 
                            //className="col-sm-12 col-md-6 col-lg-4 d-flex justify-content-between" 
                            className="d-flex"
                            key={idx}>
                                <strong className="me-2">{item.label}:</strong>
                                <div className="scrolling-text">
                                    <span>{item.value || "N/A"}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Display Top Contributors */}
                    <div className="row me-1">
                        {tracks.length > 0 && (
                            <div className="mt-2 col-sm-12 col-md-6 ">
                                <strong>{tracks.length} Contributing Tracks:</strong>
                                <div className="custom-scrollbar" style={{ maxHeight: '180px', overflowY: 'auto' }}>
                                    <ul className="list-unstyled ">
                                        {tracks.slice(0, 500).map((track) => (
                                            <li key={track.id} className="d-flex align-items-center mt-1">
                                                {track.image && (
                                                    <img
                                                        src={track.image}
                                                        alt={track.name}
                                                        style={{ width: "40px", height: "40px", borderRadius: "6px", marginRight: "8px" }}
                                                    />
                                                )}
                                                <div>
                                                    <strong>{track.name}</strong> <small style={{ color: "#ddd" }}> - {track.artist}</small>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}
                        {artists.length > 0 && (
                            <div className="mt-2 col-sm-12 col-md-6">
                                <strong>{artists.length} Contributing Artists:</strong>
                                <div className="custom-scrollbar" style={{ maxHeight: '180px', overflowY: 'auto' }}>
                                    <ul className="list-unstyled">
                                        {artists.slice(0, 200).map((artist) => (
                                            <li key={artist.id} className="d-flex align-items-center mt-1">
                                                {artist.images && (
                                                    <img
                                                        src={artist.images[0]?.url}
                                                        alt={artist.name}
                                                        style={{ width: "40px", height: "40px", borderRadius: "6px", marginRight: "8px" }}
                                                    />
                                                )}
                                                <div>
                                                    <strong>{artist.name}</strong>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GenreCard;
