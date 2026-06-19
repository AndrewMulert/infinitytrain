import mongoose from 'mongoose';

const gamesSchema = new mongoose.Schema({
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
        position: {
            type: Number
        }
    },
    id: {type: String }
},
{collection: 'games'});

const Games = mongoose.model('Games', gamesSchema);

export default Games;