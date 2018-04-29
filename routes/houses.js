var express = require('express');
var router = express.Router();
var User = require('../models/User');
var House = require('../models/House');
var Rent = require('../models/Rent');
var auth = require('../middlewares/auth');

//auth verify ritorna l'utente
//findHouseById ritorna la  casa

var findHouseById = function (req, res, next) {
    House.findById(req.params.id).populate({
        path: 'own', select: 'name surname',
        path: 'rent', select: 'name surname'
    }).exec(function (err, house) {
        if (err) return res.status(500).json({ message: err });
        if (!house) return res.status(404).json({ message: 'House not found' });
        req.house = house;
        next();
    })
}
/*
var isParticipantsOfChat = function(req, res, next) {
    for (var i=0; i<req.chat.users.length; i++) {
        if (String(req.chat.users[i]) === (String(req.user._id))) {
           return next();
        }
    }
    return res.status(401).js on({message: 'You are not in this chat!'})
}
*/

router.post('/', auth.verify, function (req, res) {
    var house = new House();
    house.own = req.user._id;
    house.bedNumber = parseInt(req.body.bedNumber);
    house.address = req.body.address;
    house.rate = parseInt(req.body.rate);
    house.save(function (err, houseSaved) {
        if (err) return res.status(500).json({ message: err });
        req.user.house.push(houseSaved._id);
        req.user.save(function (err, userSaved) {
            res.status(201).json(houseSaved)
        })
    });
});

router.get('/', function (req, res) {
    House.find({}).select('-rents').populate('own', 'name surname email')
        .exec(function (err, house) {
            if (err) return res.status(500).json({ message: err })
            res.json(house);
        })
})


router.post('/:id/rent', auth.verify, findHouseById, function (req, res) {
    if (String(req.house.own) === String(req.user.id)) {
        return res.status(409).json({ message: `Yourself can't rent your House` })
    }
    var rent = new Rent();
    rent.start = req.body.start
    rent.end = req.body.end
    rent.people = req.user._id
    rent.numberPeople = req.body.numberPeople
    rent.house = req.house._id
    var _MS_PER_DAY = 1000 * 60 * 60 * 24;
    var utc1 = Date.UTC(rent.start.getFullYear(), rent.start.getMonth(), rent.start.getDate());
    var utc2 = Date.UTC(rent.end.getFullYear(), rent.end.getMonth(), rent.end.getDate());
    rent.cost = Math.floor((utc2 - utc1) / _MS_PER_DAY) * parseInt(req.house.rate);
    rent.save(function (err, rentSaved) {
        if (err) return res.status(500).json({ message: err });
        req.house.rents.push(rentSaved._id);
        req.house.save(function (err, rentHouseSaved) {
            if (err) return res.status(500).json({ message: err });
            req.user.rent.push(req.house._id)
            req.user.save(function (err, userSaved) {
                res.status(201).json(rentSaved)
            })
        });
    })
})

router.get('/own', auth.verify, function (req, res) {
    House.find({}).populate('own', 'name surname')
        .where('own').equals(req.user._id)
        .exec((err, houseOwn) => {
            if (err) return res.status(500).json({ message: err });
            if (!houseOwn) return res.status(404).json({ message: "House Own not Found" });
            res.json(houseOwn);

        });
})

router.get('/rent', auth.verify, function (req, res) {
    House.find({}).populate('own', 'name surname')
        .where('rents.people').equals(req.user._id)
        .exec((err, houseRent) => {
            if (err) return res.status(500).json({ message: err });
            if (!houseRent) return res.status(404).json({ message: "House Rent not Found" });

            res.json(houseRent);

        });
})

/*
router.get('/:id', auth.verify, findById, isParticipantsOfChat, function (req, res, next) {
    res.json(req.chat.comments);
})
 
router.post('/:id/send', auth.verify, findChatById, isParticipantsOfChat, function (req, res) {
    var comment = new Comment();
    comment.user = req.user._id;
    comment.text = req.body.text;
    comment.save(function (err, commentSaved) {
        if (err) return res.status(500).json({ message: err })
        req.chat.comments.push(commentSaved._id);
        req.chat.save(function (err, chatSaved) {
            if (err) return res.status(500).json({ message: err })
            res.status(201).json(commentSaved);
        })
    })
});
 
router.get('/', auth.verify, function (req, res) {
    User.findById(req.user._id).populate({
        path: 'chats',
        populate: {
            path: 'admin',
            model: 'User',
            select: 'name surname'
        }
    }).exec(function (err, user) {
        if (err) return res.status(500).json({ message: err })
        res.json(user.chats);
    })
})
*/

module.exports = router;
