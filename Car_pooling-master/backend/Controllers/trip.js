const Trip = require("../Models/tripModel");
const User = require("../Models/user");
const Ride = require("../Models/rides");
const dotenv = require("dotenv");
const { Client } = require("@googlemaps/google-maps-services-js");
var polylineUtil = require("@mapbox/polyline");
const mapsClient = new Client({});
const { PolyUtil } = require("node-geometry-library");
dotenv.config();
const nodeMailer = require("nodemailer");

// const MS_PER_MINUTE = 60000;
const offsetDurationInMinutes = 15;
const pct = 0.3; // Percent of route points for source (others are checked for destination)
const radiusOffset = 50; //TODO: TUNE

exports.activeTrip = (req, res) => {
  var riderArray = [];
  User.findById(req.auth._id, (err, user) => {
    if (user.active_trip == undefined || user.active_trip == null) {
      res.statusMessage = "No active trip";
      return res.status(400).end();
    }
    Trip.findById(user.active_trip, (err, trip) => {
      User.findById(trip.driver, (err, user_driver) => {
        const riders = trip.riders;

        if (riders.length === 0) {
          res.status(200).json({
            ...trip._doc,
            riders: riderArray,
            driver: user_driver.name + " " + user_driver.lastname,
          });
        }

        var i = 0;
        riders.forEach((rider) => {
          User.findById(rider, (err, user_rider) => {
            if (err) return res.status(500).end();
            riderArray.push(
              String(user_rider?.name + " " + user_rider?.lastname)
            );
            i++;
            if (i == riders.length) {
              return res.status(200).json({
                ...trip._doc,
                riders: riderArray,
                driver: user_driver.name + " " + user_driver.lastname,
              });
            }
          });
        });
      });
    });
  });
};

exports.allRide = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const filter = { completed: false, max_riders: { $gt: 0 }, dateTime: { $gt: today } };
    const allRide = await Trip.find(filter).sort({ createdAt: -1 });

    res.status(201).json({
      success: true,
      allRide,
    });
  } catch (error) {
    res.status(500).json(error);
  }
};

exports.getRide = async (req, res) => {
  // console.log(req.params.id);
  try {
    // console.log(req.params.id)
    // const filter = { _id: req.params.id }
    const ride = await Ride.findById(req.params.id);
    // console.log(ride)
    // console.log(ride)

    res.status(201).json({
      ride,
    });
  } catch (error) {
    res.status(500).json(error);
  }
};

exports.drive = (req, res) => {
  User.findById(req.auth._id, (err, user) => {
    try {
      if (err) return res.status(500).end();
      if (user.active_trip == undefined || user.active_trip == null) {
        const tripObj = new Trip({
          driver: req.auth._id,
          source: req.body.src,
          destination: req.body.dst,
          route: req.body.route,
          dateTime: new Date(req.body.dateTime),
          max_riders: req.body.max_riders,
        });
        tripObj.save((err, trip) => {
          if (err)
            // TODO: ?Handle error coming due to not selecting all the required fields?
            return res.status(500).end();
          res.status(200).json(trip);
          user.active_trip = trip._id;
          user.trip_role_driver = true;
          user.save((err) => {
            if (err) {
              trip.deleteOne();
              return res.status(500).end();
            }
            return res;
          });
          return res.status(500).end();
        });
      } else {
        //TODO: revert
        res.statusMessage = "A trip is already active";
        return res.status(400).end();
      }
    } catch (error) {
      res.status(500).json(error);
    }
  });
};

exports.ride = (req, res) => {
  User.findById(req.auth._id, async (err, user) => {
    // if (err)
    //     return res.status(500).end();
    if (user.active_trip == undefined || user.active_trip == null) {
      //Matching logic START
      let startDateTime = new Date(req.body.dateTime);
      startDateTime.setMinutes(
        startDateTime.getMinutes() - offsetDurationInMinutes
      );
      let endDateTime = new Date(req.body.dateTime);
      endDateTime.setMinutes(
        endDateTime.getMinutes() + offsetDurationInMinutes
      );
      Trip.find(
        {
          completed: false, //trip is active
          available_riders: true,
          date: {
            $gte: startDateTime,
            $lte: endDateTime,
          },
        },
        function (err, trips) {
          if (err) {
            res.statusMessage = "No matches found. No trips around your time.";
            return res.status(400).end();
          }
          var trip;
          trips.forEach((tempTrip) => {
            const pctLen = parseInt(tempTrip.route.length * pct);
            let found = PolyUtil.isLocationOnPath(
              req.body.src,
              tempTrip.route.slice(0, pctLen),
              radiusOffset
            );
            if (found) {
              found = PolyUtil.isLocationOnPath(
                req.body.dst,
                tempTrip.route.slice(pctLen),
                radiusOffset
              );
              if (found) {
                trip = tempTrip;
                return;
              }
            }
          });
          //Matching logic END
          if (trip == undefined || trip == null) {
            res.statusMessage = "No match found";
            return res.status(400).end();
          }
          trip.waypoints = [...trip.waypoints, req.body.src, req.body.dst];
          mapsClient
            .directions({
              params: {
                origin: trip.source,
                destination: trip.destination,
                waypoints: trip.waypoints,
                drivingOptions: {
                  departureTime: new Date(trip.dateTime), // for the time N milliseconds from now.
                },
                optimize: true,
                key: process.env.MAPS_KEY,
              },
              timeout: 2000, // milliseconds
            })
            .then((r) => {
              const routeArray = polylineUtil.decode(
                r.data.routes[0].overview_polyline.points
              );
              trip.route = Object.values(routeArray).map((item) => ({
                lat: item[0],
                lng: item[1],
              }));
              trip.riders.push(user._id);
              trip.available_riders = !(trip.riders.length === trip.max_riders);

              trip.save((err, trip) => {
                res.status(200).json(trip);
                user.active_trip = trip._id;
                user.trip_role_driver = false;
                user.save((err) => {
                  return res;
                });
                return res.status(500).end();
              });
            });

        }
      );
      await sendMail({
        email: user.email,
        subject: "Car booking Request",
        message: `Hello ${user.name + user.lastname}, Your Car ride has been Booked Please Track Your journey on our Website Thankyou.`,
      });
    } else {
      res.statusMessage = "A trip is already active";
      return res.status(400).end();
    }
  });
};

exports.bookRide = (req, res) => {
  User.findById(req.auth._id, async (err, user) => {
    if (user.activeTrip == undefined || user.activeTrip == null) {

      const userFind = await User.findById(req.auth?._id);
      const userEmail = userFind.email;
      const rideObj = new Ride({
        source: req.body.source,
        destination: req.body.destination,
        dateTime: new Date(req.body.tripDate),
        rideId: req.body.rideID,
        email: userEmail,
      });

      // console.log(userFind)

      await sendMail({
        email: userEmail,
        subject: "Car booking Request",
        message: `Hello ${userFind.name}, Your Car ride has been Booked Please Track Your journey on our Website Thankyou.`,
      });

      // trip.available_riders = !(trip.riders.length === trip.max_riders);

      rideObj.save((err, ride) => {
        if (err) {
          // console.log(err);
          return res.status(500).end();
        }
        res.status(200).json(ride);

        // return res.status(500).end();
      });
    } else {
      res.statusMessage = "A ride is already active";
      return res.status(400).end();
    }
  });
};

exports.cancelTrip = (req, res) => {
  User.findById(req.auth._id, (err, user) => {
    // if (err)
    //     return res.status(500).end();
    if (user.active_trip == undefined || user.active_trip == null) {
      res.statusMessage = "No active trip";
      return res.status(400).end();
    } else {
      Trip.findById(user.active_trip, (err, trip) => {
        // if (err)
        //     return res.status(500).end();
        if (trip) {
          // if trip role is driver execute this set all riders ride true
          if (user.trip_role_driver) {
            trip.riders.forEach((rider) => {
              //3
              User.findById(rider, (err, user_rider) => {
                if (err) return res.status(500).end();
                else {
                  user_rider.active_trip = null;
                  user_rider.trip_role_driver = null;
                  user_rider.save((err) => {
                    // if (err) {
                    //     //TODO: revert
                    //     res.statusMessage = "Error in saving user data for a rider.";
                    //     return res.status(500).end();
                    // }
                  });
                }
              });
            });
            trip.deleteOne((err) => {
              // if (err) {
              //     res.statusMessage = "Error in deleting trip object";
              //     return res.status(500).end();
              // }
            });
          } else { // when user cancel ride 
            const riderIndex = trip.riders.indexOf(user._id);
            trip.waypoints.splice(riderIndex * 2, 2);
            mapsClient
              .directions({
                params: {
                  origin: trip.source,
                  destination: trip.destination,
                  waypoints: trip.waypoints,
                  drivingOptions: {
                    departureTime: new Date(trip.dateTime), // for the time N milliseconds from now.
                  },
                  optimize: true,
                  key: process.env.MAPS_KEY,
                },
                timeout: 2000, // milliseconds
              })
              .then((r) => {
                const routeArray = polylineUtil.decode(
                  r.data.routes[0].overview_polyline.points
                );
                trip.route = Object.values(routeArray).map((item) => ({
                  lat: item[0],
                  lng: item[1],
                }));
                trip.riders.splice(riderIndex);
                trip.available_riders = true;
                trip.save((err) => {
                  if (err) return res.status(500).end();
                });
              })
              .catch((e) => {
                res.statusMessage = e.response.data.error_message;
                return res.status(400).end();
              });
          }
        }
        user.active_trip = null;
        user.trip_role_driver = null;
        user.save((err) => {
          // if (err) {
          //     res.statusMessage = "Error in saving user. Trip was deleted/modified.";
          //     return res.status(500).end();
          // }
          res.status(200).end();
          return res;
        });
      });
    }
  });
};

exports.tripHistory = (req, res) => {
  User.findById(req.auth._id, (err, user) => {
    // if (err)
    //     return res.status(500).end();
    // else {
    Trip.find({ _id: { $in: user.trips } }, (err, trips) => {
      // if (err)
      //     return res.status(500).end();
      res.status(200).json(trips);
      return res;
    });
    // }
  });
};

exports.tripDone = (req, res) => {
  User.findById(req.auth._id, (err, user) => {
    // if (err)
    //     return res.status(500).end();
    // else {

    if (user.active_trip == undefined || user.active_trip == null) {
      res.statusMessage = "No active trip";
      return res.status(400).end();
    } else {
      Trip.findById(user.active_trip, (err, trip) => {
        // if (err)
        //     return res.status(500).end();
        // else {
        trip.completed = true;
        trip.save((err) => {
          //1
          // if (err) {
          //     res.statusMessage = "Error in saving trip status.";
          //     return res.status(500).end();
          // }
        });
        user.trips.push(trip._id);
        user.active_trip = null;
        user.trip_role_driver = null;
        user.save((err) => {
          //2
          // if (err) {
          //     res.statusMessage = "Error in saving trip to table.";
          //     return res.status(500).end();
          // }
        });
        trip.riders.forEach((rider) => {
          //3
          User.findById(rider, (err, user_rider) => {
            // if (err)
            //     return res.status(500).end();
            // else {
            user_rider.trips?.push(trip?._id);
            user_rider.active_trip = null;
            user_rider.trip_role_driver = null;
            user_rider.save((err) => {
              // if (err) {
              //     //TODO: revert
              //     res.statusMessage = "Error in saving user data for a rider.";
              //     return res.status(500).end();
              // }
            });
            // }
          });
        });
        //POTENTIAL ISSUE (should not be since foreach is NOT async): Need to return 200 when 1, 2, 3 (all) are done
        return res.status(200).end();
        // }
      });
    }
    // }
  });
};

exports.isDriver = (req, res) => {
  User.findById(req.auth._id, (err, user) => {
    if (user.trip_role_driver == undefined || user.trip_role_driver == null) {
      res.statusMessage = "No active trip";
      return res.status(400).end();
    } else res.status(200).json({ isdriver: user.trip_role_driver });
  });
};

exports.paymentDone = async (req, res) => {
  console.log("pagee");
  try {
    // Find the ride document by rideId
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({ error: "Ride not found" });
    }

    // Update payment status to true
    ride.payment = true;
    await ride.save();

    res.status(200).json({ message: "Payment updated successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while updating payment status" });
  }
};

// Function to send email notification
const sendMail = async (options) => {
  const transporter = nodeMailer.createTransport({
    host: "smtp.gmail.com",
    port: "465",
    service: "Gmail",
    auth: {
      user: "yug20020706@gmail.com",
      pass: process.env.NODE_MAILER_PASS,
    },
  });

  const mailToUser = {
    from: "yug20020706@gmail.com",
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  await transporter.sendMail(mailToUser);
};
