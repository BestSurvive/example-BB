const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const houseSchema = new Schema({
   own:{type: Schema.Types.ObjectId, ref:'User'},//chi affitta
   rents:[{ type: Schema.Types.ObjectId, ref:'Rent'}], //gli id degli affitti su questa casa
   bedNumber: Number,
   address:{ type: String, requred:true},
   rate:{type:Number, required:true}
  });
  
  module.exports = mongoose.model('House', houseSchema);