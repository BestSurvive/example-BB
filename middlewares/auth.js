var User = require('../models/User');
var jwt = require('jwt-simple');
var secret = 'xxx';


var verify = function(req, res, next) {
    if (req.query.token === undefined) return res.status(401).json({message:'Unothorized'})
    var id = jwt.decode(req.query.token, secret);
    User.findById(id).populate('house rent', '-rents')
    .exec(function(err, user) {
        if (err) return res.status(500).json({ message: err });
        if (!user) return res.status(404).json({ message: "User not found" });    
        req.user = user;
        next();
    })
}
module.exports.verify = verify;
module.exports.secret = secret;
