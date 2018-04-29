const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const rentSchema = new Schema({
    start:{type: Date, required: true},
    end:{type: Date, required: true},
    people:{ type: Schema.Types.ObjectId, ref:'User'}, //Chi ha preso in affitto
    cost: Number,
    numberPeople: Number,
    house:{ type: Schema.Types.ObjectId, ref:'House'}, 
  });
  
  module.exports = mongoose.model('Rent', rentSchema);