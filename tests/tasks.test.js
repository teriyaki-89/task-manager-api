const request = require("supertest");
const app = require("../src/app");

const { userOne, userOneId, userTwo, userTwoId, setupDatabase, taskOne, taskTwo, taskThree } = require("./fixtures/db");

const Task = require("../src/models/tasks");

beforeEach(setupDatabase);

test("should create actual task for user", async () => {
    const response = await request(app)
        .post("/tasks")
        .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
        .send({
            description: "task from new user",
            completed: true,
        })
        .expect(200);
    const task = await Task.findById(response.body._id);
    expect(task).not.toBeNull();
    expect(task.completed).toEqual(true);
});

test("should fetch user tasks", async () => {
    const response = await request(app)
        .get("/tasks")
        .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
        .expect(200);
    expect(response.body.length).toEqual(2);
});

test("userTwo cannot delete userOne tasks", async () => {
    const response = await request(app)
        .delete("/tasks/" + taskOne._id)
        .set("Authorization", `Bearer ${userTwo.tokens[0].token}`)
        .send()
        .expect(404);
    const task = await Task.findById(taskOne._id);
    expect(task).not.toBeNull();
});
