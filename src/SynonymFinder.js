import React, { useState, useEffect } from "react";
import axios from "axios";

const SynonymFinder = () => {
  const [randomWords, setRandomWords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch random words from the API
  const fetchRandomWords = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get("https://random-word-api.herokuapp.com/all");
      setRandomWords(response.data.slice(0, 5)); // Fetch first 5 words
    } catch (err) {
      setError("Failed to fetch words. Please try again later.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRandomWords();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Random Words</h2>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      <ul>
        {randomWords.map((word, index) => (
          <li key={index}>{word}</li>
        ))}
      </ul>
      <button onClick={fetchRandomWords} style={{ marginTop: "10px", padding: "5px 10px" }}>
        Refresh Words
      </button>
    </div>
  );
};

export default SynonymFinder;

