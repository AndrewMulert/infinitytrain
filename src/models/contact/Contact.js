import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
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
        smallSrc: { type: String, required: true },
        mediumSrc: { type: String, required: true },
        minSrc: { type: String, required: true },
        alt: { type: String, required: true },
        orientation: {
            type: String,
            enum: ['horizontal', 'vertical'], 
            required: true
        }
    },
    button: [{
        text: { type: String },
        href: { type: String }
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
    form: {
        information: [{ 
            label: {
                for: { type: String },
                text: { type: String },
                labelId: { type: String }
            },
            input: {
                inputType: { type: String },
                inputId: { type: String },
                inputName: { type: String },
                required: { type: Boolean, default: false },
                placeholder: { type: String },
                pattern: { type: String },
                fieldType: { type: String },
                autocomplete: { type: Boolean, default: false }
            }
        }],
        subject: {
            title: {
                for: { type: String },
                text: { type: String }
            },
            information: [{
                input: {
                    inputType: { type: String },
                    inputId: { type: String },
                    inputName: { type: String },
                    required: { type: Boolean, default: false},
                    value: { type: String }
                },
                label: {
                    for: { type: String },
                    text: { type: String }
                }
            }]
        }
    },
    id: { type: String },
    acknowledgements: {
        category: [{
            title: { type: String },
            subtitle: [{ 
                classification: {type: String},
                credit: [{
                    names: { type: String},
                    href: { type: String }
                }] 
            }],
        }]
    }
},
{collection: 'contact'});

const Contact = mongoose.model('Contact', contactSchema);

export default Contact;