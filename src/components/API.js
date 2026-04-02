import React, { useState, useEffect } from "react";
import axios from "axios";

const clientId = process.env.CLIENT_ID;

const local='http://localhost:3000/callback'
const prod='https://projectwrapped2.web.app/callback'

const redirectUri = local// prod

const scopes = [
    'user-read-private',
    'user-read-email',
    'user-library-read',
    'user-top-read'
].join(' ');

export const handleLogin = () => {
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}&show_dialog=true`;
    window.location.href = authUrl
}

export const handleCallback = () => {
    const params = new URLSearchParams(window.location.hash.substring(1));
    const token = params.get('access_token');
    const expiresIn = parseInt(params.get('expires_in'), 10) || 3600; // Default to 1 hour if not specified
    if (token) {
        localStorage.setItem('token', token);
        const expiryTime = Date.now() + expiresIn * 1000;
        localStorage.setItem('tokenExpiry', expiryTime);
        window.location.hash = '';
        window.location.href = '/topTracks';
    } else {
        console.error("No token found in the callback URL.");
    }
};

export const checkToken = () => {
    const token = localStorage.getItem('token');
    const tokenExpiry = localStorage.getItem('tokenExpiry');

    if (token && tokenExpiry) {
        if (Date.now() < tokenExpiry) {
            return token; // Token is valid
        } else {
            console.warn('Token has expired.');
            handleLogout(); // Remove token and reload
            return null;
        }
    } else {
        console.warn('No token found.');
        return null;
    }
};

export const handleLogout = () => {
    localStorage.removeItem("token")
    window.location.hash = ""
    window.location.reload()
}

export const getUserProfile = async () => {
    const token = checkToken();
    if (!token) return;
    
    try {
        const response = await axios.get(
            `https://api.spotify.com/v1/me`,
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            }
        );
        console.log('User Profile:', response.data); // Output the profile data for debugging
        return response.data; // Return the user profile data
    } catch (error) {
        console.error('Error fetching user profile:', error);
    }
};

export const usersTopTracks = async (timeRange = "long_term") => {
    const token = checkToken();
    if (!token) return;

    try {
        const allTracks = [];
        const limit = 50;
        const totalTracks = 300;
        let offset = 0;

        for (let i = 0; i < totalTracks / limit; i++) {
            const response = await axios.get(
                `https://api.spotify.com/v1/me/top/tracks`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                    params: {
                        limit: limit,
                        offset: offset,
                        time_range: timeRange,
                    },
                }
            );

            // Assign position property to each track based on current allTracks length
            const tracksWithPosition = response.data.items.map((track, index) => ({
                ...track,
                position: allTracks.length + index + 1, // Maintain correct positioning across multiple pages
            }));

            allTracks.push(...tracksWithPosition);
            offset += limit;
        }

        console.log('allTracks from usersTopTracks', allTracks);
        return allTracks;
    } catch (error) {
        console.log("Error fetching usersTopTracks:", error);
    }
};

export const usersTopArtists = async (timeRange = "long_term") => {
    const token = checkToken();
    if (!token) return;

    try {
        const allArtists = [];
        const limit = 50;
        const totalArtists = 300;
        let offset = 0;

        for (let i = 0; i < totalArtists / limit; i++) {
            const response = await axios.get(
                `https://api.spotify.com/v1/me/top/artists`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                    params: {
                        limit: limit,
                        offset: offset,
                        time_range: timeRange,
                    },
                }
            );

            // Assign position property to each artist
            const artistsWithPosition = response.data.items.map((artist, index) => ({
                ...artist,
                position: allArtists.length + index + 1, // Maintain correct positioning
            }));

            allArtists.push(...artistsWithPosition);
            offset += limit;
        }

        console.log('allArtists from usersTopArtists', allArtists);
        return allArtists;
    } catch (error) {
        console.log("Error fetching usersTopArtists:", error);
    }
};

export const getArtist = async (artists) => {
    const token = checkToken();
    if (!token) return;

    try {
        // Create an array to hold the results
        const artistsWithMusicBrainz = await Promise.all(
            artists.map(async (artist) => {
                try {
                    // MusicBrainz API call using the artist name
                    const musicBrainzResponse = await axios.get(
                        `https://corsproxy.io/?https://musicbrainz.org/ws/2/artist?query=artist:${encodeURIComponent(artist.name)}&fmt=json`
                    );

                    const musicBrainzResults = musicBrainzResponse.data.artists;
                    const matchedArtist = musicBrainzResults.length > 0 ? musicBrainzResults[0] : null;  // Pick the first result

                    return {
                        ...artist,
                        musicBrainz: matchedArtist,
                    };
                } catch (error) {
                    console.error(`Error fetching artist data for ${artist.name}:`, error);
                    return {
                        ...artist,
                        musicBrainz: null,
                    };
                }
            })
        );

        console.log('Artists with MusicBrainz data:', artistsWithMusicBrainz);
        return artistsWithMusicBrainz;
    } catch (error) {
        console.error('Error fetching artist data:', error);
    }
};

export const getMostListenedToAlbums = async (timeRange = "long_term") => {
    const token = checkToken();
    if (!token) return;

    try {
        const albums = {};
        const limit = 50;
        const totalTracks = 300;
        let offset = 0;
        const allTracks = [];

        // Collect all tracks first
        for (let i = 0; i < totalTracks / limit; i++) {
            const response = await axios.get(
                `https://api.spotify.com/v1/me/top/tracks`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                    params: {
                        limit: limit,
                        offset: offset,
                        time_range: timeRange,
                    },
                }
            );

            allTracks.push(...response.data.items);
            offset += limit;
        }

        // Process tracks after all data is collected
        allTracks.forEach((track) => {
            const albumId = track.album.id;
            const albumName = track.album.name;
            const albumUri = track.album.uri;
            const artistName = track.album.artists[0].name;
            const releaseDate = track.album.release_date;
            const trackDuration = track.duration_ms;
            const trackPopularity = track.popularity;

            if (trackDuration > 12000) { 
                const trackScore = totalTracks - allTracks.indexOf(track); 

                if (albums[albumId]) {
                    albums[albumId].score += trackScore;
                } else {
                    albums[albumId] = {
                        name: albumName,
                        artist: artistName,
                        releaseDate: releaseDate,
                        score: trackScore,
                        trackCount: 0,
                        albumUri: albumUri,
                        images: track.album.images,
                        duration: trackDuration,
                        popularity: trackPopularity,
                        albumType: null, // Placeholder for album type
                    };
                }
            }
        });

        // Fetch album details in batches of 20
        const albumIds = Object.keys(albums);
        const batchSize = 20;

        for (let i = 0; i < albumIds.length; i += batchSize) {
            const batch = albumIds.slice(i, i + batchSize);

            try {
                const albumResponse = await axios.get(
                    `https://api.spotify.com/v1/albums?ids=${batch.join(",")}`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    }
                );

                albumResponse.data.albums.forEach((album) => {
                    if (albums[album.id]) {
                        albums[album.id].trackCount = album.tracks.total;
                        albums[album.id].albumType = album.album_type; // Store album type
                    }
                });
            } catch (error) {
                console.error("Error fetching album details:", error);
            }
        }

        // Filter and normalize albums
        const filteredAlbums = Object.values(albums)
            .filter(album => album.albumType !== "single"); // ✅ Exclude singles

        const normalizedAlbums = filteredAlbums.map(album => ({
            ...album,
            normalizedScore: album.trackCount > 0 ? album.score / album.trackCount : 0,
        }));

        // Sort and assign position
        const sortedAlbums = normalizedAlbums
            .sort((a, b) => b.normalizedScore - a.normalizedScore)
            .map((album, index) => ({ ...album, position: index + 1 }));

        console.log('sortedAlbums from getMostListenedToAlbums', sortedAlbums);
        return sortedAlbums;

    } catch (error) {
        console.error('Error fetching top tracks:', error);
    }
};

export const getUsersGenres = async (timeRange = "long_term") => {
    const token = checkToken();
    if (!token) return;

    try {
        const limit = 50;
        const totalTracks = 300;
        let offset = 0;
        const allTracks = [];
        const artistMap = new Map(); // Stores artist details
        const genresMap = {}; // Stores genres with associated tracks/artists

        // Fetch top tracks
        for (let i = 0; i < totalTracks / limit; i++) {
            const response = await axios.get(
                `https://api.spotify.com/v1/me/top/tracks`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                    params: { limit, offset, time_range: timeRange },
                }
            );
            allTracks.push(...response.data.items);
            offset += limit;
        }

        // Collect unique artist IDs
        const artistIds = [...new Set(allTracks.flatMap(track => track.artists.map(artist => artist.id)))];

        // Fetch artist details in batches (max 50 per request)
        const batchSize = 50;
        for (let i = 0; i < artistIds.length; i += batchSize) {
            const batch = artistIds.slice(i, i + batchSize);
            const response = await axios.get(
                `https://api.spotify.com/v1/artists?ids=${batch.join(",")}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            response.data.artists.forEach(artist => {
                artistMap.set(artist.id, { 
                    id: artist.id,
                    name: artist.name,
                    genres: artist.genres,
                    followers: artist.followers.total,
                    popularity: artist.popularity,
                    images: artist.images, // Array of images
                });
            });
        }

        // Process tracks with fetched artist genres
        allTracks.forEach((track, index) => {
            const trackScore = totalTracks - index; // Higher-ranked songs have more weight
            const trackArtists = track.artists.map(artist => artistMap.get(artist.id)).filter(Boolean); // Get full artist objects

            trackArtists.forEach(artist => {
                artist.genres.forEach(genre => {
                    if (!genresMap[genre]) {
                        genresMap[genre] = { 
                            score: 0, 
                            tracks: new Map(), // Use Map to prevent duplicate tracks
                            artists: new Map() 
                        };
                    }

                    genresMap[genre].score += trackScore;

                    // Add track only if it's not already added
                    if (!genresMap[genre].tracks.has(track.id)) {
                        genresMap[genre].tracks.set(track.id, {
                            id: track.id,
                            name: track.name,
                            artist: trackArtists.map(a => a.name).join(", "),
                            album: track.album.name,
                            popularity: track.popularity,
                            image: track.album.images[0]?.url,
                        });
                    }

                    // Add artist (avoid duplicates)
                    if (!genresMap[genre].artists.has(artist.id)) {
                        genresMap[genre].artists.set(artist.id, artist); // Store full artist object
                    }
                });
            });
        });

        // Convert genresMap to an array and sort by score
        const sortedGenres = Object.entries(genresMap)
            .map(([genre, data]) => ({
                genre,
                score: data.score,
                tracks: Array.from(data.tracks.values()), // Convert Map back to an array of track objects
                artists: Array.from(data.artists.values()), // Convert Map back to an array of artist objects
            }))
            .sort((a, b) => b.score - a.score); // Sort by score

        console.log('sortedGenres from getUsersGenres', sortedGenres);
        return sortedGenres;
    } catch (error) {
        console.log("Error fetching usersTopTracks:", error);
    }
};









