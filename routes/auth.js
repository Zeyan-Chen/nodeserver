const router = require('express').Router();
const User = require('../model/User.js');
const bcrypt = require('bcryptjs')
const { registerValidation, loginValidation } = require('../validate')

router.post('/register', async (req, res) => {

    // lets validate the data before we a user
    const { error } = registerValidation(req.body)
    if (error) return res.status(400).send(error.details[0].message)

    // checking if the user is already in the database
    const emailExit = await User.findOne({ email: req.body.email })
    if (emailExit) return res.status(400).send('Email already exists')

    // hash password
    const hashedPassword = await bcrypt.hashSync(req.body.password, 10);

    // create a new user
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
    });

    try {
        const savedUser = await user.save();
        // res.send(savedUser); // 保護資料我們只要回傳id就好
        res.send({ user: user._id });
    } catch (err) {
        res.status(400).send(err);
    }
});

router.post('/login', async (req, res) => {
    // lets validate the data before we a user
    const { error } = loginValidation(req.body)
    if (error) return res.status(400).send(error.details[0].message)

    // checking email is exit
    const user = await User.findOne({ email: req.body.email })
    if (!user) return res.status(400).send('Email or password is wrong')
    // password is correct
    const validPass = await bcrypt.compare(req.body.password, user.password)
    if (!validPass) return res.status(400).send('Invalid password')

    res.send('Logged in!!!')
});


module.exports = router;
