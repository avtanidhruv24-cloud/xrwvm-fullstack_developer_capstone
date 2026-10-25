
import React, { useState, useEffect } from "react";
import "./Dealers.css";
import "../assets/style.css";
import Header from "../Header/Header";
import review_icon from "../assets/reviewicon.png";

const Dealers = () => {
  const [dealersList, setDealersList] = useState([]);
  const [states, setStates] = useState([]);
  const [selectedState, setSelectedState] = useState("All");
  const [error, setError] = useState("");

  useEffect(() => {
    const getDealers = async () => {
      try {
        const response = await fetch("/djangoapp/get_dealers");
        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`);
        }

        const data = await response.json();

        if (data.status !== 200 || !Array.isArray(data.dealers)) {
          throw new Error("Invalid dealership data received.");
        }

        setDealersList(data.dealers);

        const uniqueStates = [
          ...new Set(data.dealers.map((dealer) => dealer.state)),
        ];
        setStates(uniqueStates);
      } catch (err) {
        console.error("Failed to load dealerships:", err);
        setError("Unable to load dealerships. Please refresh the page.");
      }
    };

    getDealers();
  }, []);

  const filterDealers = async (state) => {
    setSelectedState(state);
    setError("");

    try {
      const endpoint =
        state === "All"
          ? "/djangoapp/get_dealers"
          : `/djangoapp/get_dealers/${encodeURIComponent(state)}`;

      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const data = await response.json();

      if (data.status !== 200 || !Array.isArray(data.dealers)) {
        throw new Error("Invalid dealership data received.");
      }

      setDealersList(data.dealers);
    } catch (err) {
      console.error("Failed to filter dealerships:", err);
      setError("Unable to filter dealerships. Please try again.");
    }
  };

  const isLoggedIn = sessionStorage.getItem("username") !== null;

  return (
    <div>
      <Header />

      <h2>Car Dealerships</h2>

      {error && <p role="alert">{error}</p>}

      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Dealer Name</th>
            <th>City</th>
            <th>Address</th>
            <th>Zip</th>
            <th>
              <select
                name="state"
                id="state"
                value={selectedState}
                onChange={(event) => filterDealers(event.target.value)}
              >
                <option value="All">All States</option>
                {states.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </th>
            {isLoggedIn && <th>Review Dealer</th>}
          </tr>
        </thead>

        <tbody>
          {dealersList.map((dealer) => (
            <tr key={dealer.id}>
              <td>{dealer.id}</td>
              <td>
                <a href={`/dealer/${dealer.id}`}>{dealer.full_name}</a>
              </td>
              <td>{dealer.city}</td>
              <td>{dealer.address}</td>
              <td>{dealer.zip}</td>
              <td>{dealer.state}</td>
              {isLoggedIn && (
                <td>
                  <a href={`/postreview/${dealer.id}`}>
                    <img
                      src={review_icon}
                      className="review_icon"
                      alt="Post Review"
                    />
                  </a>
                </td>
              )}
            </tr>
          ))}

          {dealersList.length === 0 && !error && (
            <tr>
              <td colSpan={isLoggedIn ? 7 : 6}>Loading dealerships...</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Dealers;
