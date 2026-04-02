import React from "react";
import { useNavigate } from "react-router";
import { Button } from "react-bootstrap";
import { handleLogin } from "../components/API";

const Home = ({ authenticated }) => {
    let navigate = useNavigate();
    return (
        <div className="center-screen">
            {!authenticated && (
                <Button onClick={handleLogin} variant="primary" className='buttonMine'>Login With Your Spotify Account</Button> //center this later 
            )}
        </div>
    )
}

export default Home