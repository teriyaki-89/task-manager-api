const express = require("express");

require("./db/mongoose");
const app = express();

const port = process.env.PORT;

app.use(express.json());

const userRouter = require("./routers/users");
const taskRouter = require("./routers/tasks");

app.use(userRouter, taskRouter);

app.listen(port, () => {
    console.log("server is up on port " + port);
});

// const Task = require("./models/tasks");
// const User = require("./models/user");
