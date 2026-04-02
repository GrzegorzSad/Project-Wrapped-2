import React from "react";
import { handleLogin, handleLogout, usersTopTracks, usersTopArtists, getMostListenedToAlbums, getArtist, getUserProfile, getUsersGenres } from "../components/API";

const Wrap = () => {

    return (
        <>
            <a>debug area?</a>
            <button onClick={handleLogin}>Login Through Spotify</button>
            <button onClick={handleLogout}>Logout</button>
            <button onClick={usersTopTracks}>get users top tracks</button>
            <button onClick={()=>usersTopArtists('long_term')}>get users top artists</button>
            <button onClick={() => getArtist([{name: 'IDLES'},{name: 'Viagra Boys'}, {name: 'Sonic Youth'}, {name: 'Turnstile'}])}>get Idles</button>
            <button onClick={() =>getMostListenedToAlbums('long_term')}>get most listened albums</button>
            <button onClick={getUserProfile}>get user profile</button>
            <button onClick={()=>console.log(localStorage.getItem("token"), "token")}>token</button>
            <button onClick={()=>getUsersGenres('long_term')}>genres</button>
            <hr />
        </>
    )
}

export default Wrap