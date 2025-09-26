import mongoose from 'mongoose';

const charactersSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: [String],
        required: true
    },
    image: {
        thumbnail: {
            src: { type: String, required: true },
            alt: { type: String, required: true }
        },
        panel: {
            src: { type: String, required: true },
            alt: { type: String, required: true } 
        }
    },
    number: [{
        status: Number
    }],
    button: {
        information: {
            text: { type: String },
            href: { type: String }
        },
        wiki: {
            text: { type: String },
            href: { type: String }
        }
    },
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
    group: { 
        book: Number,
        passenger: { type: Boolean, default: false }
    },
    id: { type: String }
},
{collection: 'characters'});

const Characters = mongoose.model('Characters', charactersSchema);

export default Characters;