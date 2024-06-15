const mongoose = require("mongoose");
const schema = mongoose.Schema;
const rideSchema = new schema({  
    source: {
        type: Object,
        required: true,
    },
    destination: {
        type: Object,
        required: true,
    },
    rideId:{
        type:String,
        required:true,
    },
    dateTime: {
        type: Date,
        required: true,
    },
    completed: {    // false: active
        type: Boolean,
        default: false
    },
    payment:{
        type:Boolean,
        default:false,
    },
    email: {
        type: String,
        trim: true,
        required: true,
        unique: true,
    },
}, { timestamps: true });

module.exports = mongoose.model("rides", rideSchema)