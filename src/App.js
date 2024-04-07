import './App.css';
import { useState, useCallback, useMemo } from 'react';

const NPM_URL = `https://api.npms.io/v2/search/suggestions`;
const MAX_DESC_LEN = 50;

function App() {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [showResults, setShowResults] = useState(false);
  /**
   * simple debounce function to trigger function only after no activity for delay.
   */
  const debounce = (fn, delay) => {
    var timeoutId;
    return (...args) => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        fn(...args);
      }, delay);
    };
  };

  /**
   * function that use useCallback hook to use api to search and set the suggestions.
   * used useCallback to trigger only once so it can be used with useMemo for debounce.
   */
  const getNpmSuggestions = useCallback(async (query) => {
    try {
      if (query && query.length) {
        setLoading(true);
        setError(false);
        const response = await fetch(`${NPM_URL}?q=${query}`);

        if (!response.ok) throw new Error(response.statusText);

        const data = await response.json();
        setSuggestions(data);
        setShowResults(true);
        console.log(data);
      }
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * useMemo to return debounced function which only get created once and used after.
   */
  const debouncedFetch = useMemo(() => {
    return debounce(getNpmSuggestions, 500);
  }, [getNpmSuggestions]);

  const onChange = (e) => {
    e.preventDefault();
    setInputValue(e.target.value);
    debouncedFetch(e.target.value);
  };

  /**
   *function to add elipsis if description is more than max length
   */
  const getMaxDescription = (desc) => {
    return desc && desc.length > MAX_DESC_LEN
      ? desc.substr(0, MAX_DESC_LEN) + '...'
      : desc;
  };

  return (
    <div className="App">
      <header className="App-header">
        <h4>NPM SEARCH TOOL</h4>
        <div className="input-and-sugg-wrapper">
          <div className="container">
            <h3 className="npm-input-title">npm</h3>
            <div className="input-wrapper">
              <input
                data-testid="test-id-input"
                title="Search Packages"
                placeholder="Search Packages"
                value={inputValue}
                onChange={onChange}
                onBlur={() => {
                  setShowResults(false);
                }}
              />
              <button type="button" data-testid="test-id-search-button">
                Search
              </button>
            </div>
          </div>
          <ul className="suggestions" role="listbox">
            {loading && <span className="loading">...</span>}
            {error && (
              <span className="error" data-testid="test-id-error">
                Error getting results, please try again!
              </span>
            )}
            {!loading &&
              !error &&
              suggestions.length > 0 &&
              showResults &&
              suggestions.slice(0, 10).map((suggestion, idx) => (
                <li
                  data-testid="suggestion"
                  className="suggestion-container"
                  key={idx}
                >
                  <a
                    href={suggestion?.package.links.npm}
                    className="pac-name-desc-container"
                  >
                    <div className="package-name">
                      {suggestion?.package.name}
                    </div>
                    <div className="pacakge-desc">
                      {getMaxDescription(suggestion?.package.description)}
                    </div>
                  </a>
                  <div className="package-version">
                    {suggestion?.package.version}
                  </div>
                </li>
              ))}
          </ul>
        </div>
      </header>
      <main></main>
    </div>
  );
}

export default App;
