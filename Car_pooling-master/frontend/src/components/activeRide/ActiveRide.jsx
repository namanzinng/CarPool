import "./activeRide.css";
import { React, useState, useEffect, useRef } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import {
  GoogleMap,
  DirectionsRenderer,
  DirectionsService, 
  Marker,
} from "@react-google-maps/api";
// import Cookies from 'js-cookie';
import Geocode, { fromLatLng, setKey } from "react-geocode";
import { useLocation } from "react-router-dom";
import { useRideContext } from "../../RideContext";
import Footer from "../footer/Footer";
import StripeCheckout from "react-stripe-checkout";
import axios from "axios";

const mapContainerStyle = {
  height: "35vh",
  width: "100%",
};
const options = {
  disableDefaultUI: true,
  zoomControl: true,
};
const center = {
  lat: 40.706001,
  lng: -73.997002,
};

const ActiveRide = () => {
  const mapRef = useRef();
  const onMapLoad = (map) => {
    mapRef.current = map;
  };

  const { rideInfo ,setRideDetails } = useRideContext();

  const { rideInfo: rideInfo1 } = rideInfo;
  // console.log(rideInfo.rideInfo2);
  // console.log("rideId"+rideInfo.cost)

  const getDateandTime = (dtString) => {
    const d = new Date(dtString);
    let date = d.toDateString();
    dtString = d.toTimeString();
    let time = dtString.split(" ")[0].split(":");
    return date + " @ " + time[0] + ":" + time[1];
  };
  // Active Trip details
  const [source, setsource] = useState("");
  const [destination, setdestination] = useState("");
  const [datetime, setdatetime] = useState("");
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [tripDateTime, setTripDateTime] = useState(null);

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const data = await axios.get(
          `http://localhost:8000/api/trip/${rideInfo.rideId}`
        );

        // console.log(data.data);
        setsource(data.data.ride.source);
        setdestination(data.data.ride.destination);
        setdatetime(getDateandTime(data.data.ride.dateTime));
        setPaid(data.data.ride.payment);
        // setTripDateTime(data.data.ride.dateTime)
        setOrderId(data.data.ride?._id);
        setEmail(data.data.ride.email);
        // console.log("Emial ",email)
      } catch (error) {
        console.log(error);
      }
    };
    fetchTrip();

    //   method: "GET",
    //   headers: {
    //     "Content-Type": "application/json",
    //     // 'Coookie': Cookies.get('tokken')
    //   },
    // })
    //   .then((response) => {
    //     // console.log(response);
    //     if (response.ok) {
    //       return response.json();
    //     }

    //   })
    //   .then((responseJson) => {
    //     // console.log("AllData"+responseJson.ride);
    //     // setWaypointsFn(responseJson.waypoints)
    //     const length = responseJson.ride.length
    //     console.log(length)
    //     setsource(responseJson.ride[length-1].source);
    //     setdestination(responseJson.ride[length-1].destination);
    //     setdatetime(getDateandTime(responseJson.ride[length-1].dateTime));
    //     setPaid(responseJson.ride[length-1].payment);
    //     // console.log(responseJson.ride[length-1].payment)
    //     setOrderId(responseJson.ride[length-1]._id)
    //     // console.log("orderId"+orderId)
    //   })
    //   .catch((error) => {
    //     // alert(error);
    //     console.log(error);
    //   });
  }, [rideInfo.rideId]);

  // payment methods
  const KEY =
    "pk_test_51Mj5ZDSAj0EIjVubJGOehQ8kTZes4xSWiUFqZcWmBf3yFoOn7flyyqZJFt3WxqEKIF07jA7EvSGWh6zlCnteBGWY00EfjfQ4SS";
  const [stripeToken, setStripeToken] = useState(null);
  const [amountPaid, setPaid] = useState(false);

  const onToken = async (token) => {
    setStripeToken(token);
    try {
      // Send a POST request to your backend server to update payment status
      const response = await axios.post(
        `http://localhost:8000/api/trip/updatePayment/${orderId}`
      );
      console.log(response.data.message); // Log success message
      // Refresh the page after successful payment and update
      setRideDetails({});
      window.location.reload();
    } catch (error) {
      console.error(
        "Error updating payment status:",
        error.response.data.error
      ); // Log error message
      // Handle error as needed
    }
  };

  useEffect(() => {
    if (tripDateTime) {
      const now = new Date();
      const timeDifference = tripDateTime.getTime() - now.getTime();

      if (timeDifference > 3 * 60 * 60 * 1000) {
        // If the trip is more than 24 hours away, set up a timeout to send the notification 24 hours before the trip
        const notificationTimeout = setTimeout(() => {
          sendNotification();
        }, timeDifference - 3 * 60 * 60 * 1000); // Send notification 24 hours before the trip

        // Clear the timeout when unmounting or when the trip is canceled
        return () => clearTimeout(notificationTimeout);
      } else if (timeDifference > 0) {
        // If the trip is less than 24 hours away, set up an interval to send notifications every minute
        const notificationInterval = setInterval(() => {
          sendNotification();
        }, 60 * 60 * 1000); // Send notification every minute

        setTimeout(() => {
          clearInterval(notificationInterval);
        }, timeDifference);

        // Clear the interval when unmounting or when the trip is canceled
        return () => clearInterval(notificationInterval);
      }
    }
  }, [tripDateTime]);

  const parseDateString = (dateString) => {
    const parts = dateString.split(" ");
    const monthIndex = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ].indexOf(parts[1]);
    const day = parseInt(parts[2]);
    const year = parseInt(parts[3]);
    const timeParts = parts[5].split(":");
    const hours = parseInt(timeParts[0]);
    const minutes = parseInt(timeParts[1]);
    return new Date(year, monthIndex, day, hours, minutes);
  };

  const sendNotification = async () => {
    try {
      //     // const user = await axios.get("http://localhost:800")
      await axios.post("http://localhost:8000/send-notification", {
        email: email,
        subject: "Trip Reminder",
        text: `Your trip from ${source} to ${destination} is scheduled to start soon. Please be ready.`,
      });
    } catch (error) {
      console.error("Error sending notification email:", error);
    }
  };

  return (
    <>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={15}
        center={center}
        options={options}
        onLoad={onMapLoad}
      ></GoogleMap>
      {rideInfo.rideId ? (
        <Container id="activeTripContainer" fluid="lg">
          <Row style={{ marginTop: "1rem" }}>
            <Col md="10">
              <h1 className="heading">Active Trip Details</h1>
              <Row>
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
              </Row>
              <div className="payment">
                <div className="paymentDetails">
                  <h4>Amount To be Paid: ${rideInfo.cost}</h4>
                </div>
                {amountPaid ? (
                  "Amount Paid"
                ) : (
                  <StripeCheckout
                    name="Car Pooling"
                    image="https://api.freelogodesign.org/assets/thumb/logo/6294672_400.png?t=637945524870000000"
                    billingAddress
                    shippingAddress
                    description={`Your Total Amout is $ ${rideInfo.cost }`}
                    amount={rideInfo.cost* 100}
                    token={onToken}
                    stripeKey={KEY}
                  >
                    <Button>CheckOut</Button>
                  </StripeCheckout>
                )}
              </div>
            </Col>
          </Row>
        </Container>
      ) : (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            alignContent: center,
            height: "220px",
          }}
        >
          <h2>No Active Trip</h2>
        </div>
      )}

      <Footer />
    </>
  );
};

export default ActiveRide;
