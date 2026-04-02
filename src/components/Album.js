const AlbumCard = ({ album, index = null }) => {
    return (
        <div style={{ borderRadius: '25px', padding: '10px', marginBottom: '5px', boxShadow: '0 2px 6px rgba(18, 18, 18, 0.4)' }}
            className="bg-darkMine">
            <div className='d-flex flex-sm-nowrap flex-wrap' key={album.albumUri}>
                <img style={{ maxWidth: '70px', maxHeight: '70px', borderRadius: '12px', marginRight: '6px' }}
                    src={album.images[0]?.url} alt={album.name} />
                <div className="flex-grow-1 text-light">
                    <strong>{index + 1}. {album.name}</strong>
                    <div className="row me-1">
                        {[ 
                            { label: "Artist", value: album.artist },
                            { label: "Release Date", value: album.releaseDate },
                            { label: "Popularity", value: album.popularity },
                            { label: "Tracks", value: album.trackCount },
                            { label: "Score", value: Math.round(album.normalizedScore) },
                            { label: "Position", value: album.position }
                        ].map((item, idx) => (
                            <div className="col-sm-12 col-md-6 col-lg-4 d-flex justify-content-between" key={idx}>
                                <strong className="me-2">{item.label}:</strong>
                                <div className='scrolling-text'>
                                    <span>{item.value}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AlbumCard;