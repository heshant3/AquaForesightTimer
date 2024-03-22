import React, { useState, useEffect } from "react";
import { ref, set, onValue } from "firebase/database";
import { db } from "./firebase"; // Import and initialize Firebase

function DataFetcher() {
  const [data, setData] = useState(null);
  const [timer, setTimer] = useState(null);
  const [turnontime, setturnontime] = useState(null);
  const initialTimer = data; // Initial value for the timer

  useEffect(() => {
    // Set up Firebase listener to fetch data from the database
    const dataRef = ref(db, "delays"); // Use 'ref' function to get reference to 'delays' node

    // Attach a listener to read the data from the database
    const unsubscribe = onValue(dataRef, (snapshot) => {
      const data = snapshot.val();
      if (data && typeof data === "object" && "timer" in data) {
        setData(data.timer);
        setTimer(data.timer); // Initialize timer countdown with fetched value
      }
    });

    const unsubscribe1 = onValue(dataRef, (snapshot) => {
      const data = snapshot.val();
      if (data && typeof data === "object" && "turnontime" in data) {
        setturnontime(data.turnontime);
        console.log(turnontime);
      }
    });

    // Cleanup function to remove Firebase listener when component unmounts
    return () => {
      unsubscribe(); // Unsubscribe from the dataRef listener
      unsubscribe1();
    };
  }, []);

  useEffect(() => {
    if (timer !== null && timer >= 0) {
      // Decrease timer countdown every second
      const countdownInterval = setInterval(() => {
        setTimer((prevTimer) => {
          // If timer reaches 0, reset it to the initial value
          if (prevTimer === 0) {
            clearInterval(countdownInterval); // Clear the interval
            setTimeout(() => {
              setTimer(initialTimer); // Restart the timer after 6 seconds delay
              console.log("0");
              set(ref(db, "switch"), 0);
            }, turnontime * 1000); // 6 seconds delay
            console.log("1");
            set(ref(db, "switch"), 1);
            return 0; // Set timer to 0
          }
          return prevTimer - 1;
        });
      }, 1000); // 1 second interval

      // Cleanup function to clear interval when component unmounts or when timer is reset
      return () => clearInterval(countdownInterval);
    }
  }, [timer, initialTimer]); // Run this effect when 'timer' state or 'initialTimer' changes

  // Update the 'Counter' object in the database with the timer value
  useEffect(() => {
    if (timer !== null) {
      set(ref(db, "count"), timer);
    }
  }, [timer]); // Run this effect when 'timer' state changes

  return (
    <div>
      <h1>Data from Firebase Realtime Database: {data}</h1>
      <h2>
        Timer Counter: {timer} | {turnontime}{" "}
      </h2>
    </div>
  );
}

export default DataFetcher;
