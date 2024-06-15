import { React, useEffect, useRef, useState } from "react";
import { Row, Col } from "react-bootstrap";
import * as GrIcons from "react-icons/gr";
import sourceImg from "../../start-location.svg";
import destinationImg from "../../pin-location.svg";
import dtImg from "../../date-and-time.svg";
import groupImg from "../../group.svg";
import "./getRide.css";
import Cookies from "js-cookie";
import Geocode, { fromLatLng, setKey } from "react-geocode";
import axios from "axios";
import { Navigate, useNavigate } from "react-router-dom";

import { useRideContext } from "../../RideContext";
import jsonp from "jsonp";

setKey(process.env.REACT_APP_MAPS_API_KEY);

export default function GetRide() {
  const divRef = useRef(null);
  const [dataObject1, setDataObject] = useState({});
  const navigate = useNavigate();
  const { setRideDetails } = useRideContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredTripDetails, setFilteredTripDetails] = useState([]);
  const [tripDetails, setTripDetails] = useState([]);
  const [source, setsrcName] = useState("");
  const [destination, setdestName] = useState("");
  const [price, setPrice] = useState(0);

  // Your existing code
  // const predictFare = async (formdata) => {
  //   try {
  //     const response = await fetch("http://127.0.0.1:5000/predict_fare", {
  //       method: "POST",
  //       body: JSON.stringify(formdata),
  //       mode: "cors",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //     });
  //     const data = await response.json();
  //     return Math.round(data.fare_amount);
  //   } catch (error) {
  //     console.error("Error:", error);
  //     throw error;
  //   }
  // };

  useEffect(() => {
    // Filter trip details based on search term
    const filtered = tripDetails.filter((trip) =>
      trip.source.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredTripDetails(filtered);
    // console.log("ff", filtered);
  }, [searchTerm, tripDetails]);

  const getLocFromCoords = async (coords) => {
    let lat = coords["lat"];
    let long = coords["lng"];

    const res = await fromLatLng(lat, long);
    const location = await res.results[0].formatted_address;
    return location.slice(0, 40) + "....";
  };

  const getDateandTime = (dtString) => {
    const d = new Date(dtString);
    let date = d.toDateString();
    dtString = d.toTimeString();
    let time = dtString.split(" ")[0].split(":");
    return date + " @ " + time[0] + ":" + time[1];
  };

  const fetchData = async () => { 
    const response = await fetch("http://localhost:8000/api/trip/allRide", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Coookie: Cookies.get("tokken"),
      },
    });
    const rides = await response.json();

    // console.log("GEtRide ",rides);

    const data = rides?.allRide;
    let tempArray = [];

    for (let i = 0; i < data?.length; i++) {
      let thisTrip = data[i];
      let newTrip = {};
      let loc;

      loc = await getLocFromCoords(thisTrip["source"]);
      newTrip["source"] = loc;
      loc = await getLocFromCoords(thisTrip["destination"]);
      newTrip["destination"] = loc;
      newTrip["tripDate"] = getDateandTime(thisTrip["dateTime"]);
      newTrip["riderCount"] = thisTrip["riders"].length;
      // console.log(thisTrip['max_riders']);
      newTrip["avilable_seat"] = thisTrip['max_riders'];
      newTrip["completed"] = thisTrip["completed"];
      newTrip["rideId"] = thisTrip["_id"];

      const dateData = newTrip["tripDate"];

      const date = new Date(dateData);

      // Extract day, month, and year
      const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thur", "Fri", "Sat"];
      const monthNumberMap = {
        January: 1,
        February: 2,
        March: 3,
        April: 4,
        May: 5,
        June: 6,
        July: 7,
        August: 8,
        September: 9,
        October: 10,
        November: 11,
        December: 12,
      };

      const weekdayIndex = date.getDay();
      const day = date.getDate();
      const month = date.toLocaleString("default", { month: "long" });
      const monthNumber = monthNumberMap[month];
      const year = date.getFullYear();
      const hour = date.getHours(); 

      const formData = {
        pickup_latitude: thisTrip["source"].lat,
        pickup_longitude: thisTrip["source"].lng,
        dropoff_latitude: thisTrip["destination"].lat, // Corrected: use lat instead of lng
        dropoff_longitude: thisTrip["destination"].lng,
        passenger_count: newTrip["riderCount"],
        pickup_day: day,
        pickup_hour: hour,
        pickup_day_of_week: weekdayIndex,
        pickup_month: monthNumber,
        pickup_year: year,
      };

      // console.log(formData.passenger_count);
      // const price = await predictFare(formData);
      const price = 12;
      newTrip["Price"] = price;
      // console.log("pp", newTrip["Price"]);
      tempArray.push(newTrip);
    }

    setTripDetails(tempArray);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const [selectedRide, setSelectedRide] = useState(null);

  const bookRide = async (rideInfo) => {
    // if (divRef.current) {
    //   const sourceElement = divRef.current.querySelector(".source-info");
    //   const destinationElement =
    //     divRef.current.querySelector(".destination-info");
    //   const dateElement = divRef.current.querySelector(".date-info");
    //   const rideElement = divRef.current.querySelector(".ride-info");
    //   const rideElement2 = divRef.current.querySelector(".ride-info2");

    //   const sourceInfo = sourceElement ? sourceElement.textContent : "N/A";
    //   const destinationInfo = destinationElement
    //     ? destinationElement.textContent
    //     : "N/A";
    //   const dateInfo = dateElement ? dateElement.textContent : "N/A";
    //   const rideInfo1 = rideElement ? rideElement.textContent : "N/A";
    //   const rideInfo2 = rideElement2 ? rideElement2.textContent : "0";

    //   const rideInfo = {
    //     source: sourceInfo,
    //     destination: destinationInfo,
    //     date: dateInfo,
    //     rideId: rideInfo1,
    //   };

    //   console.log("RideInfo", rideInfo);
    // }
    if (rideInfo) {
      // console.log("RideInfo", rideInfo);
      return fetch("http://localhost:8000/api/trip/bookRide", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + Cookies.get("tokken"), //another working solution
          Coookie: Cookies.get("tokken"),
        },
        body: JSON.stringify(rideInfo),
      })
        .then((response) => {
          if (response.ok) return response.json();
          else if (response.status === 401)
            // setToken(null);
            throw new Error(response.statusText);
        })
        .then((responseJson) => {
          // const rideId = responseJson._id;
          // console.log("CC",rideInfo?.cost);
          const rideId = responseJson?._id
          const cost = rideInfo?.cost;
          setRideDetails({ rideId, cost});
          // console.log();
          navigate("/active-ride");
          // history.push("/active-ride");
        })
        .catch((error) => {
          console.log(error);
          alert(error);
          // window.location.reload();
        });
    }
  };

  const handleCardClick = (data) => {
    bookRide(data);
  };

  const handleButtonClick = (e, data) => {
    e.stopPropagation();
    bookRide(data);
  };

  // console.log("Filter",filteredTripDetails)

  const CardView = ({
    source = "Default Title",
    destination = "Default Text",
    tripDate = "defaultDate",
    rideID,
    cost,
    onCardClick,
    onButtonClick,
    avilable_seat,
  }) => (
    <div>
      <div className="card-body mb-4 mt-4 mx-4 text-black" onClick={onCardClick}>
        <div className="detail-container">
          <div className="detail-row">
            <img className="tripImage" src={sourceImg}></img>
            <h6 className="detail-heading">Source: </h6>
            <h6 className="detail-heading source-info">{source}</h6>
          </div>
        </div>

        <div className="detail-container">
          <div className="detail-row">
            <img className="tripImage" src={destinationImg}></img>
            <h6 className="detail-heading">Destiation: </h6>
            <h6 className="detail-heading destination-info">{destination}</h6>
          </div>
        </div>

        <hr></hr>

        <div className="detail-container">
          <div className="detail-row">
            <img className="tripImage" src={dtImg}></img>
            <h6 className="detail-heading">Date and time: </h6>
            <h6 className="detail-heading date-info">{tripDate}</h6>
          </div>
        </div>

        <div className="detail-container">
          <div className="detail-row">
            <img className="tripImage" src={groupImg}></img>
            <h6 className="detail-heading">RideId: </h6>
            <h6 className="detail-heading ride-info">{rideID}</h6>
          </div>
        </div>

        {/* <div className="detail-container">
          <div className="detail-row">
            <img className="tripImage" src={groupImg}></img>
            <h6 className="detail-heading">Available Seat: </h6>
            <h6 className="detail-heading ride-info">{avilable_seat}</h6>
          </div>
        </div> */}

        <div className="detail-container">
          <div className="detail-row">
            <img className="tripImage" src={groupImg}></img>
            <h6 className="detail-heading">Price </h6>
            <h6 className="detail-heading ride-info2">$ {cost}</h6>
          </div>
        </div>

        <div className="detail-container">
          <div className="detail-row book-ride-row">
            <button className="book-ride" onClick={(e) => onButtonClick(e, { source, destination, tripDate, rideID, cost })}>
              Book Ride
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="search-container">
        <input
          type="text"
          placeholder="Search by location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        </div>
        {tripDetails?.length === 0 ? (
        <h1
          style={{
            width: "100%",
            height: "100%",
            textAlign: "center",
            marginTop: "30vh",
          }}
        >
          No rides available
        </h1>
      ) : ( 
        // (""):("")
        filteredTripDetails?.map((data, index) => (
          <CardView
            key={index}
            {...data}
            rideID={data.rideId}
            cost={filteredTripDetails[index].Price}
            onCardClick={() => handleCardClick(data)}
            onButtonClick={handleButtonClick}
            avilable_seat={data.avilable_seat}
          />
        ))
      )}
      
      {/* {filteredTripDetails?.length === 0 ? (
        <h1
          style={{
            width: "100%",
            height: "100%",
            textAlign: "center",
            marginTop: "30vh",
          }}
        >
          No rides available for the entered location
        </h1> */}
      {/* ) : (
        filteredTripDetails?.map((data, index) => {
          return (
            <CardView
              key={index}
              {...data}
              rideID={data.rideId}
              cost={filteredTripDetails[index].Price}
              onCardClick={() => handleCardClick(data)}
              onButtonClick={handleButtonClick}
            />
          );
        })
    
      )} */}
    </>
  );
}
