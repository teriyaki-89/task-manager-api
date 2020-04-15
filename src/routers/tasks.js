const express = require("express");

const Tasks = require("../models/tasks");
const auth = require("../middleware/auth");
const router = new express.Router();

router.post("/tasks", auth, (req, res) => {
    const task = new Tasks({
        ...req.body,
        owner: req.user._id,
    });
    task.save()
        .then((result) => {
            res.status(200);
            res.send(result);
        })
        .catch((e) => {
            res.status(400);
            res.send(e);
        });
});

router.get("/tasks", auth, async (req, res) => {
    if (!req.user) {
        return res.status(401).send("authenticate please");
    }
    const match = {};
    if (req.query.completed) {
        match.completed = req.query.completed;
    }
    const sort = {};
    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(":");
        sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
    }
    /* find in user model virtual tasks and get all tasks related to that user */
    try {
        await req.user
            .populate({
                path: "tasks",
                match,
                options: {
                    limit: parseInt(req.query.limit),
                    skip: parseInt(req.query.skip),
                    sort,
                },
            })
            .execPopulate();
        res.status(200).send(req.user.tasks);
    } catch (e) {
        res.status(500).send(e);
    }

    // Tasks.find({ owner: req.user._id })
    //     .then(tasks => {
    //         res.status(200).send(tasks);
    //     })
    //     .catch(e => {
    //         res.status(500).send(e);
    //     });
});

router.get("/tasks/:id", auth, (req, res) => {
    const id = req.params.id;

    Tasks.findOne({ _id: id, owner: req.user._id })
        .then((tasks) => {
            res.status(200).send(tasks);
        })
        .catch((e) => {
            res.status(500).send(e);
        });
});

router.patch("/tasks/:id", auth, async (req, res) => {
    const updates = Object.keys(req.body);
    let allowedProperties = ["description", "completed"];

    try {
        updates.forEach((property) => {
            if (allowedProperties.indexOf(property) == -1) {
                console.log(property);
                throw new Exception("");
            }
        });
    } catch (e) {
        return res.status(404).send({ response: "illegal property" });
    }

    try {
        const task = await Tasks.findOne({
            _id: req.params.id,
            owner: req.user._id,
        });
        if (!task) return res.status(401).send({ response: "no task found" });
        updates.forEach((update) => (task[update] = req.body[update]));
        await task.save();

        // Tasks.findByIdAndUpdate(req.params.id, req.body, {
        //     new: true,
        //     runValidators: true,
        //     useFindAndModify: false
        // })
        //     .then(tasks => {
        //         res.status(200).send(tasks);
        //     })
        //     .catch(e => {
        //         res.status(500).send(e);
        //     });
        res.status(201).send(task);
    } catch (e) {
        res.status(500).send(e);
    }
});

router.delete("/tasks/:id", auth, async (req, res) => {
    try {
        const task = await Tasks.findOneAndDelete({
            _id: req.params.id,
            owner: req.user._id,
        });
        if (!task) {
            return res.status(404).send();
        }
        res.status(200).send(task);
    } catch (e) {
        res.status(500).send(e);
    }
});

module.exports = router;
