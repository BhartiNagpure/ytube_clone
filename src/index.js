// 
import connectDB from "./db/index.js";
import dotenv from "dotenv";
dotenv.config({path:'/env'})
import app from "./app.js";

const port = process.env.PORT || 8000
// const port = 8000

connectDB()
    .then(() => {
        console.log("Database connected")
        app.on('Error', (error) => {
            console.log("error",error)
            throw error;
        }),
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`)
        })
    })
    .catch((error) => {
        console.error("ERROR: ", error)
    })

// import express from "express";

// const app = express();

// (async () => {
//     try {
//         await mongoose.connect(`${process.env.DATABASE_URL}/${DB_NAME}`)
//         app.on('error', (error) => {
//             console.error("ERROR in try: ", error)
//             throw error
//         })
//         app.listen(process.env.PORT , ()=>{
//             console.log(`Server is running on port ${process.env.PORT}`)
//         })
//     } catch (error) {
//         console.error("ERROR: ", error)
//         throw error
//     }
// })()