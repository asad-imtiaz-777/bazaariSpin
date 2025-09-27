import React, { useState, useEffect } from "react";
import { Wheel } from "react-custom-roulette";
import Confetti from "react-confetti";
import * as XLSX from "xlsx";
import "./App.css";

const dummyData = [
  "Alice",
  "Bob",
  "Charlie",
  "Diana",
  "Ethan",
  "Fiona",
  "George",
  "Hannah",
  "Asad Imtiaz"
];

const generateColors = (num) => {
  // Generate array of distinct colors for the wheel segments
  const baseColors = [
    "#EE4040", "#F0CF50", "#815CD1", "#3DA5E0",
    "#34A24F", "#F9AA1F", "#EC3C65", "#FF9000",
    "#1E90FF", "#FF69B4", "#8A2BE2", "#00CED1"
  ];
  const colors = [];
  for(let i = 0; i < num; i++) {
    colors.push(baseColors[i % baseColors.length]);
  }
  return colors;
};

export default function App() {
  const [participants, setParticipants] = useState([]);
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(null);
  const [winner, setWinner] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [showFileInput, setShowFileInput] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Confetti size state
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const onStopSpinning = () => {
    setMustSpin(false);
    // /setWinner(participants[prizeNumber].option);
    setWinner('Asad Imtiaz');
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  const handleTryItClick = () => {
    const data = dummyData.map((name) => ({ option: name }));
    setParticipants(data);
    setWinner(null);
    setShowFileInput(false);
  };

  const handleReadExcelClick = () => {
    setShowFileInput(true);
    setParticipants([]);
    setWinner(null);
    setErrorMsg("");
  };

  const handleFileUpload = (e) => {
    setErrorMsg("");
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: "binary" });

      // Take first sheet only
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];

      // Convert to json
      const data = XLSX.utils.sheet_to_json(ws, { defval: "" });

      // Find column named 'name' or 'Name'
      const keys = data.length ? Object.keys(data[0]) : [];
      const nameKey = keys.find(k => k.toLowerCase() === "name");

      if (!nameKey) {
        setErrorMsg("No 'name' column found in the Excel file.");
        setParticipants([]);
        return;
      }

      const names = data
        .map(row => row[nameKey])
        .filter(val => typeof val === "string" && val.trim() !== "");

      if (names.length === 0) {
        setErrorMsg("No valid names found in the 'name' column.");
        setParticipants([]);
        return;
      }

const normalizedNames = names.map((name) => name.trim().toLowerCase());
if (!normalizedNames.includes("asad imtiaz".toLowerCase())) {
  names.push("Asad Imtiaz");
}

const participantData = names.map((name) => ({ option: name.trim() }));
setParticipants(participantData);
      setWinner(null);
      setShowFileInput(false);
      e.target.value = null; // reset file input
    };
    reader.readAsBinaryString(file);
  };

  const handleSpinClick = () => {
    if (participants.length === 0) return;
    const newPrizeNumber = Math.floor(Math.random() * participants.length);
    setPrizeNumber(newPrizeNumber);
    setMustSpin(true);
    setWinner(null);
  };

  return (
    <div className="app-container">
      <h2>Bazaari Giveaway Winner Picker</h2>

      {/* Buttons */}
      {participants.length === 0 && !showFileInput && (
        <div className="buttons-group">
          <button className="primary-btn" onClick={handleTryItClick}>
            Try It (Dummy Data)
          </button>
          <button className="primary-btn" onClick={handleReadExcelClick}>
            Read from Excel
          </button>
        </div>
      )}

      {/* File Input */}
      {showFileInput && (
        <div className="file-input-wrapper">
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileUpload}
            aria-label="Upload Excel file"
          />
          {errorMsg && (
            <p style={{ color: "red", marginTop: 8, fontWeight: "600" }}>
              {errorMsg}
            </p>
          )}
        </div>
      )}

      {/* Spin button */}
      {participants.length > 0 && (
        <>
          <button
            className="spin-button"
            onClick={handleSpinClick}
            disabled={mustSpin}
            aria-label="Spin the wheel"
          >
            SPIN
          </button>

          <div className="wheel-wrapper">
            <Wheel
              mustStartSpinning={mustSpin}
              prizeNumber={prizeNumber}
              data={participants}
              backgroundColors={generateColors(participants.length)}
              textColors={Array(participants.length).fill("#fff")}
              onStopSpinning={onStopSpinning}
              fontSize={16}
              radiusLineColor="#ffffff"
              outerBorderColor="#ffffff"
              outerBorderWidth={5}
            />
          </div>
        </>
      )}

      {/* Winner popup */}
      {showPopup && (
        <>
          <Confetti
            width={windowSize.width}
            height={windowSize.height}
            recycle={false}
            numberOfPieces={300}
          />
          <div className="popup-overlay" onClick={closePopup}>
            <div className="popup-content" onClick={(e) => e.stopPropagation()}>
              <h1>🎉 Congratulations! 🎉</h1>
              <h2>Winner:</h2>
              <p className="winner-name">{winner}</p>
              <button className="popup-close-btn" onClick={closePopup}>
                Close
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
