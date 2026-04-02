const ArtistCard = ({ artist, index = null }) => {
    return (
        <div style={{ borderRadius: '25px', paddingTop: '10px', paddingBottom: '10px', paddingLeft:'10px', marginBottom: '5px', boxShadow: '0 2px 6px rgba(18, 18, 18, 0.4)' }}
        className="bg-darkMine">
            <div className='d-flex flex-sm-nowrap flex-wrap' key={artist.id}>
                <img style={{ maxWidth: '70px', maxHeight:'70px', borderRadius: '12px', marginRight: '6px' }} src={artist.images[0]?.url} alt={artist.name} />
                <div className="flex-grow-1 text-light">
                    <strong>{index + 1}. {artist.name}</strong>
                    <div className="row me-1" >
                        {[ 
                            { label: "Genres", value: artist.genres.join(', ') },
                            { label: "Followers", value: artist.followers.total.toLocaleString() },
                            { label: "Popularity Score", value: artist.popularity },
                            { label: "Position", value: artist.position }
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

export default ArtistCard;