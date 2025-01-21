import React, { useState, useEffect } from "react";
import axios from "axios";

const SynonymFinder = () => {
  const [randomWords, setRandomWords] = useState([]);
  const [wordDetails, setWordDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Shuffle and get random words
  const getRandomWords = (wordsArray) => {
    let shuffled = [...wordsArray];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, 5); // Pick 5 random words
  };

  // Fetch random words from API
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

  // Fetch detailed information about the words
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
            return { word, error: "Definition not available" };
          }

          const wordData = response.data[0];

          // Extracting all necessary fields
          const phonetic = wordData.hwi?.prs?.[0]?.mw || "Phonetic not available";
          const origin = wordData.et?.[0]?.text || "Origin not available";
          const partOfSpeech = wordData.fl || "Part of speech not available";
          const date = wordData.date || "Date not available";
          const shortDef = wordData.shortdef || "No short definition available";
          
          // Extracting all definitions
          const definitions = wordData.def?.[0]?.sseq?.map((sense) => {
            const defEntries = sense[0]?.[1]?.dt?.map((item) => {
              if (item[0] === "text") {
                return item[1]
                  .replace(/{bc}/g, "") // Remove {bc} formatting
                  .replace(/{d_link\|([^|]+)\|[^}]+}/g, "$1") // Replace {d_link|word|link} with "word"
                  .replace(/{it}([^}]+){\/it}/g, "$1") // Replace {it}italic{/it} with "italic"
                  .trim();
              }
              return null;
            });
          
            return defEntries?.filter(Boolean).join(", ") || "No definition available";
          }) || [];
          

          // Extracting related words (like 'glorified', 'glorifier', etc.)
          const relatedWords = wordData.uros?.map((uro) => uro.ure) || [];

          return {
            word: wordData.meta.id || word,
            phonetic,
            origin,
            partOfSpeech,
            date,
            shortDef,
            definitions,
            relatedWords,
          };
        } catch (err) {
          console.error("Error fetching word details:", err);
          return { word, error: "Definition not available" };
        }
      })
    );
    setWordDetails(wordInfo);
  } catch (err) {
    console.error("Error in fetching word details:", err);
    setError("Failed to fetch word details. Please try again later.");
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
        {wordDetails.map((word, index) => (
          <div key={index}>
            <h3>{word.word}</h3>
            <p><strong>Phonetic:</strong> {word.phonetic}</p>
            <p><strong>Origin:</strong> {word.origin}</p>
            <p><strong>Part of Speech:</strong> {word.partOfSpeech}</p>
            <p><strong>Date:</strong> {word.date}</p>
            <p><strong>Short Definition:</strong> {word.shortDef.join(', ')}</p>

            <div>
              <strong>Definitions:</strong>
              <ul>
                {word.definitions.map((definition, idx) => (
                  <li key={idx}>{definition}</li>
                ))}
              </ul>
            </div>

            <div>
              <strong>Related Words:</strong>
              <ul>
                {word.relatedWords.length > 0 ? (
                  word.relatedWords.map((related, idx) => (
                    <li key={idx}>{related}</li>
                  ))
                ) : (
                  <li>No related words available</li>
                )}
              </ul>
            </div>
          </div>
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
  cccc 