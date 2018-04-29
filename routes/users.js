var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
var jwt = require('jwt-simple');
var User = require('../models/User');
var House = require('../models/House');
var Rent = require('../models/Rent');
var auth = require('../middlewares/auth');


router.post('/signup', function (req, res) {
    var user = new User();
    user.name = req.body.name;
    user.surname = req.body.surname;
    user.password = bcrypt.hashSync(req.body.password, 10);
    user.email = req.body.email;
    user.save(function (err, userCreated) {
        if (err) return res.status(400).json(err);
        res.status(201).json(userCreated);
    })
})

router.post('/login', function (req, res) {
    User.findOne({ email: req.body.email }, function (err, user) {
        if(err) return res.status(500).json({ Error: err })
        if (!user) return res.status(404).json({ message: 'User not found' })
        if (bcrypt.compareSync(req.body.password, user.password)) {
            var token = jwt.encode(user._id, auth.secret);
            return res.json({ token: token });
        } else {
            return res.status(401).json({ message: 'password not valid' });
        }

    })

})

router.get('/me', auth.verify, function (req, res, next) {
            res.json(req.user);
})


module.exports = router;
