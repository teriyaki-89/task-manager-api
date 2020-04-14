const express = require("express");

require("./db/mongoose");
const app = express();

app.use(express.json());

const userRouter = require("./routers/users");
const taskRouter = require("./routers/tasks");

app.use(userRouter, taskRouter);

module.exports = app;
