const request = require("supertest");
const app = require("./app");

const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const User = require("./models/user.js");

const userOneId = new mongoose.Types.ObjectId();

const userOne = {
    _id: userOneId,
    name: "Mike",
    email: "Tyson@mail.com",
    password: "123456",
    tokens: [
        {
            token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET),
        },
    ],
};

beforeEach(async () => {
    await User.deleteMany();
    await new User(userOne).save();
});

afterEach(() => {
    //console.log("afterEach");
});

test("should signup new user", async () => {
    await request(app)
        .post("/users")
        .send({
            name: "Ilik",
            email: "teriyaki-89@mail.ru",
            password: "123456",
        })
        .expect(200);
});

test("should login test user", async () => {
    await request(app).post("/users/login").send({ email: userOne.email, password: userOne.password }).expect(200);
});

test("should not login non existing", async () => {
    await request(app).post("/users/login").send({ email: userOne.email, password: "bad password" }).expect(400);
});

test("should get profile for user", async () => {
    await request(app).get("/users/me").set("Authorization", `Bearer ${userOne.tokens[0].token}`).send().expect(200);
});

test("should not get profile for user", async () => {
    await request(app).get("/users/me").send().expect(401);
});

test("should delete user ", async () => {
    await request(app).delete("/users/me").set("Authorization", `Bearer ${userOne.tokens[0].token}`).send().expect(200);
});

test("should not delete user", async () => {
    await request(app).delete("/users/me").send().expect(401);
});
