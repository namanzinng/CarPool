// import { React, useState, useEffect, useRef } from 'react';
// import { Button, Col, Container, Row } from 'react-bootstrap';
// import { GoogleMap, DirectionsRenderer, DirectionsService, Marker } from '@react-google-maps/api';
// import Cookies from 'js-cookie';
// import Geocode, { fromLatLng, setKey } from "react-geocode";

// import './ActiveTrip.css'
// import Footer from "../footer/Footer"

// // Geocode.setApiKey("AIzaSyDzHhUntfNJsOCijbQhPiXEvuih17_fE3U");
// setKey("AIzaSyBHTIk1UfmtCLrZvuMJoOU8XVqx8OUwUhs")
// // Map options
// const mapContainerStyle = {
//     height: "35vh",
//     width: "100%",
// };
// const options = {
//     disableDefaultUI: true,
//     zoomControl: true,
// };
// const center = {
//     lat: 43.473078230478336,
//     lng: -80.54225947407059,
// };
// export default function ActiveTrip({ setActiveTrip }) {
//     // For Map
//     const [mapCoords, setMapCoords] = useState({})
//     const [routeResp, setRouteResp] = useState();
//     const [waypoints, setWaypoints] = useState([]);
//     const mapRef = useRef();

//     const onMapLoad = (map) => {
//         mapRef.current = map;
//     };

//     const directionsCallback = (response) => {
//         if (response !== null) {
//             if (response.status === 'OK')
//                 setRouteResp(response)
//             else
//                 alert('Problem fetching directions')
//         } else alert('Problem fetching directions')
//     }

//     // Format date and time
//     const getDateandTime = (dtString) => {
//         const d = new Date(dtString);
//         let date = d.toDateString();
//         dtString = d.toTimeString();
//         let time = dtString.split(' ')[0].split(':')
//         return date + ' @ ' + time[0] + ':' + time[1]
//     }

//     const setWaypointsFn = (localWaypoints) => {
//         localWaypoints.forEach(function(part, index) {
//             this[index] = {location: this[index], stopover: false}
//           }, localWaypoints);
//         setWaypoints(localWaypoints);
//     }

//     // To convert location coordinates into names
//     const getLocFromCoords = (coords, type) => {
//         let lat = coords['lat']
//         let long = coords['lng']

//         fromLatLng(lat, long).then(
//             (res) => {
//                 const location = res.results[0].formatted_address;
//                 if (type === 'src') {
//                     setsource(location)
//                 }
//                 else {
//                     setdestination(location)
//                 }
//             },
//             (err) => {
//                 console.error(err);
//                 if (type === 'src') {
//                     setsource(lat + ',' + long)
//                 }
//                 else {
//                     setdestination(lat + ',' + long)
//                 }
//             }
//         );
//     }

//     const [isDriver, setIsDriver] = useState(false);

//     // Enable 'Done' button only in driver mode
//     useEffect(() => {
//         fetch('http://localhost:8000/api/trip/isdriver', {
//             method: 'GET',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Coookie': Cookies.get('tokken')
//             }
//         }).then((response) => {
//             if (response.ok) {
//                 return response.json();
//             }
//         }).then((responseJson) => {
//             if (responseJson.isdriver) {
//                 setIsDriver(true)
//             }
//         }).catch((error) => {
//             alert(error);
//         });
//     }, []);

//     // Handle 'Cancel' button
//     const handleCancel = (e) => {
//         e.preventDefault();

//         return fetch('http://localhost:8000/api/trip', {
//             method: 'DELETE',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Coookie': Cookies.get('tokken')
//             },
//         }).then((response) => {
//             if (response.ok) {
//                 setActiveTrip(null);
//                 alert("Trip cancelled successfully");
//                 window.location.reload();
//                 return;
//             }
//             throw new Error(response.statusText);
//         }).catch((error) => {
//             console.log(error);
//             alert(error);
//         });
//     }

//     // Handle 'Done' button
//     const handleDone = (e) => {
//         e.preventDefault();

//         return fetch('http://localhost:8000/api/trip/done', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Coookie': Cookies.get('tokken')
//             },
//         }).then((response) => {
//             console.log(response)
//             if (response.ok) {
//                 setActiveTrip(null);
//                 alert("Trip marked completed");
//                 window.location.reload();
//                 return;
//             }
//             throw new Error(response.statusText);
//         }).catch((error) => {
//             console.log(error);
//             alert(error);
//         });
//     }

//     // Active Trip details
//     const [source, setsource] = useState("")
//     const [destination, setdestination] = useState("")
//     const [datetime, setdatetime] = useState("")
//     const [driver, setdriver] = useState("")
//     const [riders, setriders] = useState("")

//     useEffect(() => {
//         fetch('http://localhost:8000/api/trip/activetrip', {
//             method: 'GET',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Coookie': Cookies.get('tokken')
//             }
//         }).then((response) => {
//             if (response.ok) {
//                 return response.json();
//             }
//         }).then((responseJson) => {
//             console.log(responseJson)
//             setWaypointsFn(responseJson.waypoints)
//             setdatetime(getDateandTime(responseJson.dateTime))
//             setdriver(responseJson.driver)
//             getLocFromCoords(responseJson.source, 'src')
//             getLocFromCoords(responseJson.destination, 'dest')
//             let all_riders = responseJson.riders
//             var temp_riders = ""
//             for (let i = 0; i < all_riders.length - 1; i++) {
//                 temp_riders += all_riders[i] + ', '
//             }
//             temp_riders += all_riders[all_riders.length - 1]
//             if (temp_riders === "") {
//                 temp_riders = "No rider currently"
//             }
//             setriders(temp_riders)

//             // Set Map Coords
//             mapCoords['src'] = responseJson.source
//             mapCoords['dst'] = responseJson.destination
//             setMapCoords(mapCoords)
//             console.log(mapCoords)

//         }).catch((error) => {
//             alert(error);
//         });
//     }, []);

//     // console.log(process.env.REACT_APP_MAPS_API_KEY)

//     return (
//         <>
//             <GoogleMap
//                 mapContainerStyle={mapContainerStyle}
//                 zoom={15}
//                 center={center}
//                 options={options}
//                 onLoad={onMapLoad}>
//                 {
//                     (routeResp == null && mapCoords['src'] != null && mapCoords['dst'] != null) && (
//                         <DirectionsService
//                             // required
//                             options={{
//                                 destination: mapCoords['dst'],
//                                 origin: mapCoords['src'],
//                                 travelMode: 'DRIVING',
//                                 waypoints: waypoints,
//                                 optimizeWaypoints: true,
//                             }}
//                             callback={directionsCallback}
//                         />
//                     )
//                 }
//                 {
//                     routeResp !== null && (
//                         <DirectionsRenderer
//                             options={{
//                                 directions: routeResp
//                             }}
//                         />
//                     )
//                 }
//             </GoogleMap>
//             <Container id="activeTripContainer" fluid="lg">
//                 <Row style={{ marginTop: '1rem' }}>
//                     <Col md="10">
//                         <h1>Active Trip Details</h1>
//                         <Row>
//                             <h3 style={{ marginTop: '1rem' }}><span className='trip-attributes'>Source</span>: {source}</h3>
//                             <h3><span className='trip-attributes'>Destination</span>: {destination}</h3>
//                             <h3><span className='trip-attributes'>Date</span>: {datetime}</h3>
//                             <h3 style={{ marginTop: '1rem' }}><span className='trip-attributes'>Driver</span>: {driver}</h3>
//                             <h3><span className='trip-attributes'>Rider(s)</span>: {riders}</h3>
//                         </Row>
//                     </Col>
//                     <Col md="2">
//                         <Row>
//                             {isDriver ? <Button variant='primary' id='doneTripButton' onClick={handleDone}> Done </Button> : null}
//                             <Button variant='danger' id='cancelTripButton' onClick={handleCancel}> Cancel trip </Button>
//                         </Row>
//                     </Col>
//                 </Row>
//             </Container>
//             <Footer/>
//         </>
//     )
// }

import { React, useState, useEffect, useRef } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import {
  GoogleMap,
  DirectionsRenderer,
  DirectionsService,
  Marker,
} from "@react-google-maps/api";
import Cookies from "js-cookie";
import Geocode, { fromLatLng, setKey } from "react-geocode";

import "./ActiveTrip.css";
import axios from "axios";
import StripeCheckout from "react-stripe-checkout";

// Map options
const mapContainerStyle = {
  height: "35vh",
  width: "100%",
};
const options = {
  disableDefaultUI: true,
  zoomControl: true,
};

const center = {
  lat: 40.73061,
  lng: -73.935242,
};
export default function ActiveTrip({ setActiveTrip }) {
  // For Map
  const [mapCoords, setMapCoords] = useState({});
  const [routeResp, setRouteResp] = useState();
  const [waypoints, setWaypoints] = useState([]);
  const mapRef = useRef();

  const onMapLoad = (map) => {
    mapRef.current = map;
  };

  const directionsCallback = (response) => {
    if (response !== null) {
      if (response.status === "OK") setRouteResp(response);
      else alert("Problem fetching directions");
    } else alert("Problem fetching directions");
  };

  // Format date and time
  const getDateandTime = (dtString) => {
    const d = new Date(dtString);
    let date = d.toDateString();
    dtString = d.toTimeString();
    let time = dtString.split(" ")[0].split(":");
    return date + " @ " + time[0] + ":" + time[1];
  };

  const setWaypointsFn = (localWaypoints) => {
    localWaypoints.forEach(function (part, index) {
      this[index] = { location: this[index], stopover: false };
    }, localWaypoints);
    setWaypoints(localWaypoints);
  };

  // To convert location coordinates into names
  const getLocFromCoords = (coords, type) => {
    let lat = coords["lat"];
    let long = coords["lng"];

    fromLatLng(lat, long).then(
      (res) => {
        const location = res.results[0].formatted_address;
        if (type === "src") {
          setsource(location);
        } else {
          setdestination(location);
        }
      },
      (err) => {
        console.error(err);
        if (type === "src") {
          setsource(lat + "," + long);
        } else {
          setdestination(lat + "," + long);
        }
      }
    );
  };

  const [isDriver, setIsDriver] = useState(false);

  // Enable 'Done' button only in driver mode
  useEffect(() => {
    fetch("http://localhost:8000/api/trip/isdriver", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Coookie: Cookies.get("tokken"),
      },
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
      })
      .then((responseJson) => {
        if (responseJson.isdriver) {
          setIsDriver(true);
        }
      })
      .catch((error) => {
        alert(error);
      });
  }, []);

  // Handle 'Cancel' button
  const handleCancel = (e) => {
    e.preventDefault();

    return fetch("http://localhost:8000/api/trip", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Coookie: Cookies.get("tokken"),
      },
    })
      .then((response) => {
        if (response.ok) {
          setActiveTrip(null);
          alert("Trip cancelled successfully");
          window.location.reload();
          return;
        }
        throw new Error(response.statusText);
      })
      .catch((error) => {
        console.log(error);
        alert(error);
      });
  };

  // Handle 'Done' button
  const handleDone = (e) => {
    e.preventDefault();

    return fetch("http://localhost:8000/api/trip/done", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Coookie: Cookies.get("tokken"),
      },
    })
      .then((response) => {
        console.log(response);
        if (response.ok) {
          setActiveTrip(null);
          alert("Trip marked completed");
          window.location.reload();
          return;
        }
        throw new Error(response.statusText);
      })
      .catch((error) => {
        console.log(error);
        alert(error);
      });
  };

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

  // Active Trip details
  const [source, setsource] = useState("");
  const [destination, setdestination] = useState("");
  const [datetime, setdatetime] = useState("");
  const [driver, setdriver] = useState("");
  const [riders, setriders] = useState("No Rider");
  const [ridePrice, setRidePrice] = useState(0);

  useEffect(() => {
    fetch("http://localhost:8000/api/trip/activetrip", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Coookie: Cookies.get("tokken"),
      },
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
      })
      .then((responseJson) => {
        console.log(responseJson);
        setWaypointsFn(responseJson.waypoints);
        setdatetime(getDateandTime(responseJson.dateTime));
        setdriver(responseJson.driver);
        getLocFromCoords(responseJson.source, "src");
        getLocFromCoords(responseJson.destination, "dest");
        let all_riders = responseJson.riders;

        const dateData = getDateandTime(responseJson.dateTime);

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
          pickup_latitude: responseJson.source["lat"],
          pickup_longitude: responseJson.source["lng"],
          dropoff_latitude: responseJson.destination["lat"], // Corrected: use lat instead of lng
          dropoff_longitude: responseJson.destination["lng"],
          passenger_count: responseJson.riders.length,
          pickup_day: day,
          pickup_hour: hour,
          pickup_day_of_week: weekdayIndex,
          pickup_month: monthNumber,
          pickup_year: year,
        };

        console.log("FormData ", formData);
        // const price = await predictFare(formData);
        const price = 12;
        setRidePrice(price);

        var temp_riders = "";
        for (let i = 0; i < all_riders.length - 1; i++) {
          temp_riders += all_riders[i] + ", ";
        }
        temp_riders += all_riders[all_riders.length - 1];
        if (temp_riders === "") {
          temp_riders = "No rider currently";
        }
        setriders(temp_riders);

        // Set Map Coords
        mapCoords["src"] = responseJson.source;
        mapCoords["dst"] = responseJson.destination;
        setMapCoords(mapCoords);
        // console.log(mapCoords);
      })
      .catch((error) => {
        alert(error);
      });
  }, []);

  // payment methods
  const KEY =
    "pk_test_51Mj5ZDSAj0EIjVubJGOehQ8kTZes4xSWiUFqZcWmBf3yFoOn7flyyqZJFt3WxqEKIF07jA7EvSGWh6zlCnteBGWY00EfjfQ4SS";
  const [stripeToken, setStripeToken] = useState(null);
  const [amountPaid, setPaid] = useState(false);

  const onToken = async (token) => {
    setStripeToken(token);
    // try {

      // console.log(response.data.message); // Log success message
      // Refresh the page after successful payment and update
      // setRideDetails({});
      setActiveTrip(null)
      window.location.reload();
    // } catch (error) {
    //   console.error(
    //     "Error updating payment status:",
    //     error.response.data.error
    //   ); // Log error message
      // Handle error as needed
    }
  // };

  return (
    <>
      {/* <h1 id="pageTitle">Active Trip</h1> */}
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={15}
        center={center}
        options={options}
        onLoad={onMapLoad}
      >
        {routeResp == null &&
          mapCoords["src"] != null &&
          mapCoords["dst"] != null && (
            <DirectionsService
              // required
              options={{
                destination: mapCoords["dst"],
                origin: mapCoords["src"],
                travelMode: "DRIVING",
                waypoints: waypoints,
                optimizeWaypoints: true,
              }}
              callback={directionsCallback}
            />
          )}
        {routeResp !== null && (
          <DirectionsRenderer
            options={{
              directions: routeResp,
            }}
          />
        )}
      </GoogleMap>
      <Container id="activeTripContainer" fluid="lg">
        <Row style={{ marginTop: "1rem" }}>
          <Col md="10">
            <h1>Active Trip Details</h1>
            <Row style={{ marginBottom: "10px" }}>
              <h3 style={{ marginTop: "1rem" }}>
                <span className="trip-attributes">Source</span>: {source}
              </h3>
              <h3>
                <span className="trip-attributes">Destination</span>:{" "}
                {destination}
              </h3>
              <h3>
                <span className="trip-attributes">Date</span>: {datetime}
              </h3>
              <h3 style={{ marginTop: "1rem" }}>
                <span className="trip-attributes">Driver</span>: {driver}
              </h3>
              
              <h3>
                <span className="trip-attributes">Rider's</span>: {riders}
              </h3>
              
              {/* <h3>
                <span className="trip-attributes">Price(s)</span>: {ridePrice}
              </h3> */}
            </Row>
            {!isDriver && (
              <div className="payment">
                <div className="paymentDetails">
                  <h4>Amount To be Paid: ${ridePrice}</h4>
                </div>
                {false ? (
                  "Amount Paid"
                ) : (
                  <StripeCheckout
                    name="Car Pooling"
                    image="https://api.freelogodesign.org/assets/thumb/logo/6294672_400.png?t=637945524870000000"
                    billingAddress
                    shippingAddress
                    description={`Your Total Amout is $ ${ridePrice}`}
                    amount={ridePrice * 100}
                    token={onToken}
                    stripeKey={KEY}
                  >
                    <Button>CheckOut</Button>
                  </StripeCheckout>
                )}
              </div>
            )}
          </Col>
          <Col md="2">
            <Row>
              {isDriver ? (
                <Button
                  variant="primary"
                  id="doneTripButton"
                  onClick={handleDone}
                >
                  {" "}
                  Done{" "}
                </Button>
              ) : null}
              <Button
                variant="danger"
                id="cancelTripButton"
                onClick={handleCancel}
              >
                {" "}
                Cancel trip{" "}
              </Button>
            </Row>
          </Col>
        </Row>
      </Container>
    </>
  );
}
