// const mongo = require("mongodb").MongoClient;

// const url = "mongodb://localhost:27017";

// const database = "task-manager";
// mongo.connect(
//     url,
//     {
//         useNewUrlParser: true
//     },
//     (error, client) => {
//         if (error) {
//             console.log("unable to conenct to database");
//         } else {
//             const db = client.db(database);
//             db.collection("users").insertOne({
//                 name: "Ellis",
//                 age: "29"
//             });
//         }
//     }
// );
