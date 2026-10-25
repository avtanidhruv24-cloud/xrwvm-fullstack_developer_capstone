
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "./Dealers.css";
import "../assets/style.css";
import "./PostReview.css";
import Header from "../Header/Header";

const PostReview = () => {
  const { id } = useParams();

  const [dealer, setDealer] = useState({});
  const [review, setReview] = useState("");
  const [selectedCarId, setSelectedCarId] = useState("");
  const [year, setYear] = useState("");
  const [date, setDate] = useState("");
  const [carmodels, setCarmodels] = useState([]);
  const [loadingCars, setLoadingCars] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const dealerUrl = `/djangoapp/dealer/${id}`;
  const reviewUrl = "/djangoapp/add_review";
  const carsUrl = "/djangoapp/get_cars";

  // Fetch dealership details.
  useEffect(() => {
    let cancelled = false;

    const getDealer = async () => {
      try {
        const response = await fetch(dealerUrl);

        if (!response.ok) {
          throw new Error(
            `Dealership request failed: ${response.status}`
          );
        }

        const data = await response.json();

        if (cancelled) return;

        if (data.status === 200 && data.dealer) {
          setDealer(data.dealer);
        } else {
          setError("Unable to find dealership details.");
        }
      } catch (err) {
        console.error("Error fetching dealership:", err);

        if (!cancelled) {
          setError(
            "Unable to load dealership details. Please refresh."
          );
        }
      }
    };

    getDealer();

    return () => {
      cancelled = true;
    };
  }, [dealerUrl]);

  // Fetch cars for the dropdown.
  useEffect(() => {
    let cancelled = false;

    const getCars = async () => {
      setLoadingCars(true);

      try {
        const response = await fetch(carsUrl, {
          headers: { Accept: "application/json" },
        });

        if (!response.ok) {
          throw new Error(
            `Cars API returned HTTP ${response.status}`
          );
        }

        const data = await response.json();

        const cars = Array.isArray(data)
          ? data
          : Array.isArray(data?.cars)
            ? data.cars
            : null;

        if (!cars) {
          console.error("Unexpected cars API response:", data);
          throw new Error(
            "The cars API did not return a valid cars array."
          );
        }

        const validCars = cars.filter(
          (car) =>
            car &&
            car._id !== undefined &&
            car._id !== null &&
            car.make &&
            car.model
        );

        if (!cancelled) {
          setCarmodels(validCars);
          setSelectedCarId("");

          if (validCars.length === 0) {
            setError("No cars were found in the inventory.");
          }
        }
      } catch (err) {
        console.error("Error fetching cars:", err);

        if (!cancelled) {
          setCarmodels([]);
          setError(
            "Unable to load cars. Check that the Django server and Node.js backend are running."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingCars(false);
        }
      }
    };

    getCars();

    return () => {
      cancelled = true;
    };
  }, []);

  // Submit a review.
  const postreview = async (event) => {
    event.preventDefault();
    setError("");

    if (!review.trim() || !date || !selectedCarId || !year) {
      setError(
        "Please complete all fields before submitting your review."
      );
      return;
    }

    const selectedCar = carmodels.find(
      (car) => String(car._id) === String(selectedCarId)
    );

    if (!selectedCar) {
      setError("Please select a valid car.");
      return;
    }

    const numericYear = Number(year);

    if (
      !Number.isInteger(numericYear) ||
      numericYear < 2015 ||
      numericYear > 2023
    ) {
      setError("Please enter a car year between 2015 and 2023.");
      return;
    }

    const username = sessionStorage.getItem("username");

    if (!username) {
      setError("Please log in before submitting a review.");
      return;
    }

    const firstName = sessionStorage.getItem("firstname");
    const lastName = sessionStorage.getItem("lastname");

    const name =
      [firstName, lastName]
        .filter(
          (part) =>
            part &&
            part !== "null" &&
            part !== "undefined"
        )
        .join(" ")
        .trim() || username;

    const reviewData = {
      name,
      dealership: Number(id),
      review: review.trim(),
      purchase: true,
      purchase_date: date,
      car_make: selectedCar.make,
      car_model: selectedCar.model,
      car_year: numericYear,
    };

    try {
      setSubmitting(true);

      const response = await fetch(reviewUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify(reviewData),
      });

      const data = await response.json();

      if (!response.ok || data.status !== 200) {
        throw new Error(
          data.error ||
            data.message ||
            "Review submission failed."
        );
      }

      window.location.href = `/dealer/${id}`;
    } catch (err) {
      console.error("Error submitting review:", err);
      setError(
        err.message ||
          "Unable to submit review. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Header />

      <main className="review-page">
        <section className="review-card">
          <h1 className="review-title">
            {dealer.full_name || "Loading dealership..."}
          </h1>

          {error && (
            <p className="review-error" role="alert">
              {error}
            </p>
          )}

          <form
            className="review-form"
            onSubmit={postreview}
          >
            <div className="review-form-group">
              <label htmlFor="review">Your Review</label>

              <textarea
                id="review"
                name="review"
                rows={5}
                value={review}
                onChange={(event) =>
                  setReview(event.target.value)
                }
                placeholder="Write your experience with this dealership..."
                required
              />
            </div>

            <div className="review-form-group">
              <label htmlFor="purchaseDate">
                Purchase Date
              </label>

              <input
                id="purchaseDate"
                name="purchaseDate"
                type="date"
                value={date}
                onChange={(event) =>
                  setDate(event.target.value)
                }
                required
              />
            </div>

            <div className="review-form-group">
              <label htmlFor="cars">
                Car Make and Model
              </label>

              <select
                id="cars"
                name="cars"
                value={selectedCarId}
                onChange={(event) =>
                  setSelectedCarId(event.target.value)
                }
                required
                disabled={
                  loadingCars || carmodels.length === 0
                }
              >
                <option value="" disabled>
                  {loadingCars
                    ? "Loading cars..."
                    : carmodels.length === 0
                      ? "No cars available"
                      : "Choose Car Make and Model"}
                </option>

                {carmodels.map((car) => (
                  <option
                    key={String(car._id)}
                    value={String(car._id)}
                  >
                    {car.make} {car.model}
                    {car.year ? ` (${car.year})` : ""}
                  </option>
                ))}
              </select>

              {!loadingCars && carmodels.length > 0 && (
                <small>
                  {carmodels.length} cars available
                </small>
              )}
            </div>

            <div className="review-form-group">
              <label htmlFor="carYear">Car Year</label>

              <input
                id="carYear"
                name="carYear"
                type="number"
                value={year}
                onChange={(event) =>
                  setYear(event.target.value)
                }
                min="2015"
                max="2023"
                step="1"
                placeholder="2015–2023"
                required
              />
            </div>

            <button
              className="review-submit"
              type="submit"
              disabled={
                submitting ||
                loadingCars ||
                carmodels.length === 0
              }
            >
              {submitting
                ? "Submitting..."
                : "Post Review"}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
};

export default PostReview;
