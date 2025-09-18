import mongoose from 'mongoose';

const watchSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: [String],
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
    shop: [{
        item: {
            text: { type: String},
            order: Number,
            links: [{
                href: { type: String },
                target: { type: String },
                title: { title: String },
                order: Number,
                svgHref: { type: String }
            }]
        }
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
    }
},
{collection: 'watch'});

const Watch = mongoose.model('Watch', watchSchema);

export default Watch;