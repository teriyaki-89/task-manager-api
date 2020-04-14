const { calculateTip, add } = require("../src/math.js");

test("Hello World", () => {});

test("This should fail", () => {
    //throw new Error("fail");
});

test("async", (done) => {
    setTimeout(() => {
        expect(add(1, 2)).toBe(3);
        done();
    }, 1000);
});

test("async2", async () => {
    await setTimeout(() => {
        return expect(add(1, 2)).toBe(3);
    }, 1000);
});
