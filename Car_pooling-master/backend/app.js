const express = require('express');
const mongoose = require('mongoose');
const app = express();
const bodyparser = require('body-parser');
const cookieparser = require('cookie-parser');
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config()
const { Client } = require("@googlemaps/google-maps-services-js");
const swaggerUI = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDocument = YAML.load('./swagger.yaml');



const authRoutes = require("./Routes/authentication");
const allusersRoutes = require("./Routes/allusersRoutes");
//const userRoutes = require("./Routes/user.js");
const tripRoutes = require("./Routes/tripRoutes");

// import cookieparser from "cookie-parser";
// import cors from "cors";
//import swaggerUI from "swagger-ui-express";
//import YAML from 'yamljs';
//import dotenv from "dotenv" 
// import authRoutes from "./Routes/authentication.js";
// import userRoutes from "./Routes/user.js";
// import allusersRoutes from "./Routes/allusersRoutes.js";
//const specs = swaggerJsDoc(options);
//Middleware

//PORT


// MongoDb connection
var db = mongoose.connect(process.env.DATABASE_URI).then(console.log("DB connected"))
//.catch(error => console.log(error));


// notification
app.use(express.json());
const nodemailer = require('nodemailer'); 
const transporter = nodemailer.createTransport({
    // service: 'gmail',
    // auth: {
    //     user: 'your-email@gmail.com',
    //     pass: 'your-email-password'
    // }
    host: "smtp.gmail.com",
    port: "465",
    service: "Gmail",
    auth: {
      user: "yug20020706@gmail.com",
      pass: process.env.NODE_MAILER_PASS,
    },
});

app.post('/send-notification', (req, res) => {
    // console.log("Hello",req.body);
    const { email, subject, text } = req.body;

    const mailOptions = {
        from: 'yug20020706@gmail.com',
        to: email,
        subject: subject,
        text: text
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return res.status(500).send(error.toString());
        }
        res.send('Email sent: ' + info.response);
    });
});



//Middleware
app.use(bodyparser.json())
app.use(cookieparser())
app.use(cors())

//Routes
app.use("/api", authRoutes);
app.use("/api", allusersRoutes);
//app.use("/api", userRoutes);
app.use("/api", tripRoutes);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument));

app.listen(process.env.PORT || 8000, () => {
    console.log(`Listening on a port`, process.env.PORT);
})




module.exports = app;
// MongoDb connection
