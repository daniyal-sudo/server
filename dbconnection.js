const mongoose = require("mongoose");

const dbconnection = async () => {
    try {
        console.log('www')
        await mongoose.connect(process.env.MONGODB_CONNECT_URI)
        console.log("Connect to MongoDB successfully")
    } catch (error) {
        console.log('www22')
        console.log("Connect failed " + error.message )
    }
}

module.exports = dbconnection