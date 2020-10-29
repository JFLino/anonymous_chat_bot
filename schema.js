const mongoose = require('mongoose')
const {Schema} = mongoose

const CoupleSchema = new Schema({
    chat_id: {
        type: Number,
        required: true
    },
    partner_id: {
        type: Number,
        default: null
    }
})

module.exports = mongoose.model('Couple',CoupleSchema)