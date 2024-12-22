import React, { useState, useEffect } from "react";
import axios from "axios";

const SynonymFinder = () => {
  const [randomWords, setRandomWords] = useState([]);
  const [definitions, setDefinitions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Function to get a random set of 5 words
  const getRandomWords = (wordsArray) => {
    let shuffled = [...wordsArray];
    // Shuffle the array
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, 5); // Return only the first 5 words from the shuffled list
  };

  // Fetch random words from the API
  const fetchRandomWords = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get("https://random-word-api.herokuapp.com/all");
      const randomWordsFromApi = getRandomWords(response.data);
      setRandomWords(randomWordsFromApi);
      // Fetch definitions for these random words
      fetchDefinitions(randomWordsFromApi);
    } catch (err) {
      setError("Failed to fetch words. Please try again later.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch definitions for the random words
  const fetchDefinitions = async (words) => {
    setLoading(true);

    try {
      const wordDefinitions = await Promise.all(
        words.map(async (word) => {
          const response = await axios.get(`https://wordsapiv1.p.rapidapi.com/words/${word}/definitions`, {
            headers: {
              "x-rapidapi-key": "8fe764d300mshbb40fea542dafb4p11ace8jsn712739cdfaf4", // Replace with your RapidAPI key
              "x-rapidapi-host": "wordsapiv1.p.rapidapi.com",
            },
          });
          return { word, definition: response.data.definitions[0]?.definition };
        })
      );
      setDefinitions(wordDefinitions);
    } catch (err) {
      setError("Failed to fetch definitions. Please try again later.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRandomWords(); // Fetch words on component mount
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Random Words with Definitions</h2>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      <ul>
        {randomWords.length > 0 ? (
          randomWords.map((word, index) => {
            const definition = definitions.find((def) => def.word === word);
            return (
              <li key={index}>
                <strong>{word}</strong>
                <p>{definition ? definition.definition : "No definition found"}</p>
              </li>
            );
          })
        ) : (
          <p>No words available.</p>
        )}
      </ul>
      <button
        onClick={fetchRandomWords}
        style={{ marginTop: "10px", padding: "5px 10px" }}
      >
        Refresh Words
      </button>
    </div>
  );
};

export default SynonymFinder;
