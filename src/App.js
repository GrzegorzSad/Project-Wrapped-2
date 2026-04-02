import React, { useState, useEffect, useRef } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Container } from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';

import Home from "./pages/Home";
import NavbarMine from "./components/Navbar";
import Wrap from "./pages/Wrap";
import TopTracks from "./pages/TopTracks";
import Callback from "./pages/Callback";
import ProtectedRoute from "./components/ProtectedRoute";
import TopArtists from "./pages/TopArtists";
import TopAlbums from "./pages/TopAlbums";
import TopGenres from "./pages/TopGenres";
import MusicMap from "./pages/MusicMap";
import FunFacts from "./pages/FunFacts";

function App() {
  const [timeRange, setTimeRange] = useState("long_term");
  const [authenticated, setAuthenticated] = useState(false);
  const [bgImgArray, setBgImgArray] = useState([]);
  const [bgImg, setBgImg] = useState('/undefined.png');
  const [time, setTime] = useState(7);
  const [gottenData, setGottenData] = useState(
    {
      "tracks": {
        "short_term": { "data": null },
        "medium_term": { "data": null },
        "long_term": { "data": null }
      },
      "artists": {
        "short_term": { "data": null },
        "medium_term": { "data": null },
        "long_term": { "data": null }
      },
      "albums": {
        "short_term": { "data": null },
        "medium_term": { "data": null },
        "long_term": { "data": null }
      },
      "genres": {
        "short_term": { "data": null },
        "medium_term": { "data": null },
        "long_term": { "data": null }
      },
      "musicBrainz": {
        "short_term": { "data": null },
        "medium_term": { "data": null },
        "long_term": { "data": null }
      },
      "musicBrainzFF": {
        "short_term": { "data": null },
        "medium_term": { "data": null },
        "long_term": { "data": null }
      }
    }
  )

  const timeoutRef = useRef(null); // Ref to store timeout ID

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    setAuthenticated(!!token);
  }, []);

  useEffect(() => {
    if (!bgImgArray || bgImgArray.length === 0) return;

    let index = 0;

    const updateImage = () => {
      setBgImg(bgImgArray[index]);
      index = (index + 1) % bgImgArray.length;
    };

    // Clear any existing timeout if bgImgArray changes
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (bgImg === "/undefined.png" || time >= 7) {
      updateImage();
      setTime(0);
    } else {
      timeoutRef.current = setTimeout(() => {
        updateImage();
        setTime(0);
      }, 7000 - time * 1000);
    }

    // Timer for tracking time within a cycle
    const timer = setInterval(() => {
      setTime((prev) => prev + 1);
    }, 1000);

    // Cycle images every 24s
    const interval = setInterval(() => {
      setTime(0);
      updateImage();
    }, 24000);

    return () => {
      clearInterval(interval);
      clearInterval(timer);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [bgImgArray]);

  return (
    <Router>
      <div className="bg-container bg-dark">
        <div className="bg-overlay" style={{ backgroundImage: `url(${bgImg})` }}></div>

        <Container className="content">
          <NavbarMine authenticated={authenticated} />
          <Routes>
            <Route path="/" element={<Home authenticated={authenticated} />} />
            <Route path="/debug" element={<Wrap />} />
            <Route path="/callback" element={<Callback />} />
            <Route path="/" element={<ProtectedRoute />} >
              <Route path="/TopTracks" element={<TopTracks timeRange={timeRange} setTimeRange={setTimeRange} setBgImgArray={setBgImgArray} gottenData={gottenData} setGottenData={setGottenData} />} />
              <Route path="/TopArtists" element={<TopArtists timeRange={timeRange} setTimeRange={setTimeRange} setBgImgArray={setBgImgArray} gottenData={gottenData} setGottenData={setGottenData} />} />
              <Route path="/TopAlbums" element={<TopAlbums timeRange={timeRange} setTimeRange={setTimeRange} setBgImgArray={setBgImgArray} gottenData={gottenData} setGottenData={setGottenData} />} />
              <Route path="/TopGenres" element={<TopGenres timeRange={timeRange} setTimeRange={setTimeRange} setBgImgArray={setBgImgArray} gottenData={gottenData} setGottenData={setGottenData} />} />
              <Route path="/MusicMap" element={<MusicMap timeRange={timeRange} setTimeRange={setTimeRange} setBgImgArray={setBgImgArray} gottenData={gottenData} setGottenData={setGottenData} />} />
              <Route path="/FunFacts" element={<FunFacts timeRange={timeRange} setTimeRange={setTimeRange} setBgImgArray={setBgImgArray} gottenData={gottenData} setGottenData={setGottenData} />} />
            </Route>
          </Routes>
        </Container>
      </div>
    </Router>
  );
}

export default App;
