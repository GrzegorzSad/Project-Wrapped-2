import Navbar from 'react-bootstrap/Navbar';
import { Link } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import { handleLogin, handleLogout, getUserProfile } from './API';
import { useEffect, useState } from 'react';
import CustomDropdown from './CustomDropdown';

const NavbarMine = ({ authenticated }) => {
    let [profile, setProfile] = useState();
    useEffect(() => {
        const fetchUserProfile = async () => {
            const userProfile = await getUserProfile();
            setProfile(userProfile);
        };
        fetchUserProfile();
    }, []);

    return (
        <>
    <Navbar />
    <div className="d-flex flex-wrap justify-content-between flex-wrap-reverse w-100">
        {/* Left Side Buttons */}
        <div className="flex-fill flex-grow-container">
            {/* <div className="buttonWrapper"><Link to="/"><Button variant="success" className='buttonMine'>Home</Button></Link></div>
            <div className="buttonWrapper"><Link to="/debug"><Button variant="success" className='buttonMine'>Debug</Button></Link></div> */}
            {authenticated && (
                <>
                    <div className="buttonWrapper"><Link to="/TopTracks"><Button variant="success" className='buttonMine'>Tracks</Button></Link></div>
                    <div className="buttonWrapper"><Link to="/TopArtists"><Button variant="success" className='buttonMine'>Artists</Button></Link></div>
                    <div className="buttonWrapper"><Link to="/TopAlbums"><Button variant="success" className='buttonMine'>Albums</Button></Link></div>
                    <div className="buttonWrapper"><Link to="/TopGenres"><Button variant="success" className='buttonMine'>Genres</Button></Link></div>
                    <div className="buttonWrapper"><Link to="/MusicMap"><Button variant="success" className='buttonMine'>Music Map</Button></Link></div>
                    <div className="buttonWrapper"><Link to="/FunFacts"><Button variant="success" className='buttonMine'>Fun Facts</Button></Link></div>
                </>
            )}
        </div>

        {/* Right Side (Profile & Logout) */}
        {authenticated && (
            <div className="flex-fill flex-grow-container mb-xl-0" style={{justifyContent:'end'}}>
                {/* <div className="buttonWrapper"><CustomDropdown variant="primary" className='buttonMine' title="Your Top Music" items={[]}></CustomDropdown></div> */}
                <div className="buttonWrapper"><Button onClick={handleLogout} variant="primary" className='buttonMine '>Logout</Button></div>

                {profile && (
                    <div className="d-flex align-items-center">
                        <img style={{ width: '60px', borderRadius: '100px', boxShadow: '0 4px 12px rgba(18, 18, 18, 0.8)' }} src={profile.images[0].url} alt="Profile" />
                        <div className='text-light ms-2 text-shadow'>{profile?.display_name}</div>
                    </div>
                )}
            </div>
        )}
    </div>
</>
    );
}

export default NavbarMine;
