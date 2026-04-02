const SongCard = ({ song, index = null }) => {
    return (
        <div style={{ borderRadius: '25px', paddingTop: '10px', paddingBottom: '10px', paddingLeft:'10px', marginBottom: '5px', boxShadow: '0 2px 6px rgba(18, 18, 18, 0.4)' }}
        className="bg-darkMine">
            <div className='d-flex flex-sm-nowrap flex-wrap' key={song.id}>
                <img style={{ maxWidth: '70px', maxHeight:'70px', borderRadius: '12px', marginRight: '6px' }} src={song.album.images[0]?.url} alt={song.name} />
                <div className="flex-grow-1 text-light">
                    <strong>{index + 1}. {song.name}</strong>
                    <div className="row me-1" >
                        {[
                            { label: "Artist", value: song.artists.map(artist => artist.name).join(', ') },
                            { label: "Album", value: song.album.name },
                            { label: "Duration", value: `${Math.floor(song.duration_ms / 60000)}:${((song.duration_ms % 60000) / 1000).toFixed(0).padStart(2, '0')}` },
                            { label: "Popularity Score", value: song.popularity },
                            { label: "Release Date", value: song.album.release_date },
                            { label: "Position", value: song.position }
                        ].map((item, idx) => (
                            <div className="col-sm-12 col-md-6 col-lg-4 d-flex justify-content-between" key={idx}>
                                <strong className="me-2">{item.label}:</strong>
                                <div class='scrolling-text'>
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

export default SongCard;
