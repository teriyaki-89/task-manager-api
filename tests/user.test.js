const request = require("supertest");
const app = require("../src/app");

const { userOne, userOneId, setupDatabase } = require("./fixtures/db");

const User = require("../src/models/user.js");

beforeEach(setupDatabase);

afterEach(() => {
    //console.log("afterEach");
});

test("should signup new user", async () => {
    const response = await request(app)
        .post("/users")
        .send({
            name: "Ilik",
            email: "teriyaki-89@mail.ru",
            password: "123456",
        })
        .expect(200);

    // assert that the user was changed correctly
    const user = await User.findById(response.body.user._id);
    expect(user).not.toBeNull();

    //assertions about the response
    expect(response.body.user.name).toBe("Ilik");
    expect(response.body).toMatchObject({
        user: {
            name: "Ilik",
            email: "teriyaki-89@mail.ru",
        },
        token: user.tokens[0].token,
    });
    expect(user.password).not.toBe("123456");
});

test("should login existing user", async () => {
    const response = await request(app)
        .post("/users/login")
        .send({ email: userOne.email, password: userOne.password })
        .expect(200);

    /* login and check that second token matches database to response */
    const user = await User.findById(response.body.user._id);
    expect(response.body.token).toBe(user.tokens[1].token);
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
    const user = await User.findById(userOneId);
    expect(user).toBeNull();
});

test("should not delete user", async () => {
    await request(app).delete("/users/me").send().expect(401);
});

test("should update valid user fields", async () => {
    await request(app)
        .patch("/users/" + userOneId)
        .send({
            name: "Jessica",
        })
        .expect(201);
    const user = await User.findById(userOneId);
    expect(user.name).toBe("Jessica");
});

test("should not  update invalide user fields", async () => {
    await request(app)
        .patch("/users/" + userOneId)
        .send({
            location: "newLocation",
        })
        .expect(404);
});

test("should upload image", async () => {
    await request(app)
        .post("/users/me/avatar")
        .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
        .attach("avatar", "tests/fixtures/wallhaven-13oq3v.jpg")
        .expect(200);

    const user = await User.findById(userOneId);
    expect(user.avatar).toEqual(expect.any(Buffer));
});
