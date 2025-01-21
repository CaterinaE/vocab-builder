import React, { useState, useEffect } from "react";
import axios from "axios";

const SynonymFinder = () => {
  const [randomWords, setRandomWords] = useState([]);
  const [wordDetails, setWordDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getRandomWords = (wordsArray) => {
    let shuffled = [...wordsArray];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, 5);
  };

  const fetchRandomWords = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get("https://random-word-api.herokuapp.com/all");
      const randomWordsFromApi = getRandomWords(response.data);
      setRandomWords(randomWordsFromApi);
      fetchWordDetails(randomWordsFromApi);
    } catch (err) {
      setError("Failed to fetch words. Please try again later.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWordDetails = async (words) => {
    setLoading(true);

    try {
      const wordInfo = await Promise.all(
        words.map(async (word) => {
          try {
            const response = await axios.get(
              `https://www.dictionaryapi.com/api/v3/references/collegiate/json/${word}?key=0cd21cfd-8d29-4e25-b7be-220ee8e8a318`
            );
            if (response.data.length === 0) {
              throw new Error("No definition found.");
            }
            const wordData = response.data[0];
            return {
              word: wordData.meta.id || word,
              phonetic: wordData.hwi?.prs?.[0]?.mw || "N/A",
              origin: wordData.et?.[0]?.text || "Origin not available",
              meanings: wordData.def || [],
            };
          } catch (err) {
            return { word, error: "Definition not available" };
          }
        })
      );
      setWordDetails(wordInfo);
    } catch (err) {
      setError("Failed to fetch word details. Please try again later.");
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
      <h2>Random Words with Definitions</h2>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      <ul>
        {wordDetails.map((wordData, index) => (
          <li key={index}>
            <h3>{wordData.word}</h3>
            <p>
              <strong>Phonetic:</strong> {wordData.phonetic || "Not Available"}
            </p>
            <p>
              <strong>Origin:</strong> {wordData.origin || "Not Available"}
            </p>
            {wordData.error ? (
              <p style={{ fontStyle: "italic", color: "gray" }}>
                {wordData.error}
              </p>
            ) : (
              wordData.meanings.map((meaning, idx) => (
                <div key={idx}>
                  <h4>{meaning.fl}</h4>
                  {meaning.dt.map((definitionGroup, defIdx) => (
                    <p key={defIdx}>
                      <strong>Definition:</strong> {definitionGroup[1]}
                      <br />
                      <strong>Example:</strong>{" "}
                      {definitionGroup[2] || "No example available"}
                    </p>
                  ))}
                </div>
              ))
            )}
          </li>
        ))}
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
