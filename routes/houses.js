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
    rent.numberPeople = parseInt(req.body.numberPeople)
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


module.exports = router;
