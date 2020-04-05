const express = require("express");
const router = new express.Router();
const User = require("../models/user");
const auth = require("../middleware/auth");
const multer = require("multer");
const sharp = require("sharp");
const { sendWelcomeEmail } = require("../emails/account");

router.post("/users", async (req, res) => {
    //console.log(req.body);
    const user = new User(req.body);
    try {
        const token = await user.generateAuthToken();
        let newObject = Object.assign({ user, token });
        sendWelcomeEmail(user.email, user.name);
        res.status(200).send(newObject);
    } catch (e) {
        res.status(400);
        res.send(e);
    }
});

router.post("/users/login", async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();
        //console.log(user.getPublicProfile());
        //let newObject = Object.assign({ user: user.getPublicProfile(), token }); // use methods to hide secret data
        let newObject = Object.assign({ user, token }); // use toJSON to hide data
        res.status(200).send(newObject);
    } catch (e) {
        res.status(500).send(e.message);
    }
});

router.post("/users/logout", auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter(token => {
            return token.token !== req.token;
        });
        //console.log(req.user);

        await req.user.save();
        res.status(200).send();
    } catch (e) {
        res.status(500).send(e.message);
    }
});

router.post("/users/logoutAll", auth, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();
        res.status(200).send();
    } catch (e) {
        res.status(500).send(e.message);
    }
});

router.get("/users/me", auth, async (req, res) => {
    res.send(req.user);
});

router.patch("/users/:id", async (req, res) => {
    const updates = Object.keys(req.body);
    let allowedProperties = ["name", "email", "password", "age"];
    var breakException = {};
    try {
        updates.forEach(property => {
            // console.log(property);
            if (allowedProperties.indexOf(property) == -1) {
                throw breakException;
            }
        });
    } catch (e) {
        return res.status(404).send({ response: "illegal property" });
    }

    try {
        /* in order to use Schema pre password hashing */
        const user = await User.findById({ _id: req.params.id });
        updates.forEach(update => (user[update] = req.body[update]));
        await user.save();
        //     { _id: req.params.id },
        // const user = await User.findByIdAndUpdate(
        //     { _id: req.params.id },
        //     req.body,
        //     { new: true, runValidators: true, useFindAndModify: false }
        // );

        if (!user) return res.status(404).send();
        res.status(201).send(user);
    } catch (e) {
        res.status(404).send(e);
    }
});

// router.delete("/users/:id", async (req, res) => {
//     try {
//         const user = await User.findByIdAndDelete(req.params.id);
//         if (!user) {
//             return res.status(404).send();
//         }
//         res.status(404).send(user);
//     } catch (e) {
//         res.status(500).send(e);
//     }
// });

router.delete("/users/me", auth, async (req, res) => {
    try {
        const user = await req.user.remove();
        if (!user) {
            return res.status(404).send();
        }
        res.status(404).send(user);
    } catch (e) {
        res.status(500).send(e);
    }
});

const upload = multer({
    //dest: "avatars",
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)/)) {
            return cb(new Error("Please upload an image"));
        }
        cb(undefined, true);
    }
});

router.post(
    "/users/me/avatar",
    auth,
    upload.single("avatar"),
    async (req, res) => {
        const buffer = await sharp(req.file.buffer)
            .resize({ width: 250, height: 250 })
            .png()
            .toBuffer();
        req.user.avatar = buffer;
        await req.user.save();
        res.send({ user: req.user });
    },
    (e, req, res, next) => {
        res.status(400).send({ error: e.message });
    }
);

router.delete("/users/me/avatar", auth, async (req, res) => {
    req.user.avatar = undefined;
    await req.user.save();
    res.send();
});

router.get("/users/:id/avatar", async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user || !user.avatar) {
            throw new Error("no avatar or no user found");
        }
        res.set("Content-Type", "image/jpg");
        res.send(user.avatar);
    } catch (e) {
        res.status(500).send({ error: e.message });
    }
});

module.exports = router;
