import mongoose from 'mongoose';

const merchSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        src: { type: String, required: true },
        alt: { type: String, required: true }
    },
    button: [{
        text: { type: String },
        href: { type: String },
        target: { type: String }
    }],
    order: {
        mediumView: {
            row: Number,
            column: Number
        },
        largeView: {
            row: Number,
            column: Number
        },
        position: {
            type: Number
        }
    },
    id: {type: String }
},
{collection: 'merch'});

const Merch = mongoose.model('Merch', merchSchema);

export default Merch;