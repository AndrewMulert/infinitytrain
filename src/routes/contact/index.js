import { Router } from 'express';
import Contact from '../../models/Contact.js'
import dotenv from 'dotenv';
import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";

dotenv.config();

const router = Router();

const mailerSend = new MailerSend({
    apiKey: process.env.MAILERSEND_API_KEY,
});

function makeHtmlSafeAgain(rawPattern) {
    if (!rawPattern) return '';

    const namePatternFromDB = "^[A-Za-z\\u00C0-\\u017F\\s'.-]+$"; 
    const emailPatternFromDB = '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'; 
    const phonePatternFromDB = '^(?:\\(?\\d{3}\\)?[-.\\s]?){2}\\d{4}$';

    const namePatternForHtml = '^[A-Za-z\\u00C0-\\u017F .\'\\-]+$';  
    const emailPatternForHtml = '^[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}$';
    const phonePatternForHtml = '^(?:\\(?\\d{3}\\)?[\\-. ]?){2}\\d{4}$';

    if (rawPattern === namePatternFromDB) {
        return namePatternForHtml;
    }
    if (rawPattern === emailPatternFromDB) {
        return emailPatternForHtml;
    }
    if (rawPattern === phonePatternFromDB) {
        return phonePatternForHtml;
    }

    return rawPattern;
}

router.get('/', async (req, res) => {
    try {
        const contacts = await Contact.find().sort({_id: 1 }).lean();

        const transformedContacts = contacts.map(contact => {
            const transformed = { ...contact };

            if (transformed.form && transformed.form.information && Array.isArray(transformed.form.information)) {
                transformed.form.information = transformed.form.information.map(field => {
                    const transformedField = { ...field };

                    if (transformedField.input && transformedField.input.pattern) {
                        transformedField.input.pattern = makeHtmlSafeAgain(transformedField.input.pattern)
                    }
                    return transformedField;
                })
            }

            return transformed;
        });

        console.log('Fetched & Transformed Contacts (being sent to template):', JSON.stringify(transformedContacts, null, 2));
        console.log('Number of Contacts:', transformedContacts.length);

        res.render('contact/index', {
            title: 'Contact - Infinity Train',
            heroImage: 'contact_hero_music', 
            heroAlt: 'The stage in New York, rendered by Andrew Mulert',
            heroText: 'A big thanks to those who made this site possible',
            contacts: contacts
        });

    } catch (err) {
        console.error('Error fetching contact', err);
        res.status(500).send('Error loading contact page.');
    }
});

router.post('/', async (req, res) => {
    const spamWordsString = process.env.SPAM_WORDS;
    const spamWords = spamWordsString.split(',');
    
    const swearWordsString = process.env.SWEAR_WORDS;
    const swearWords = swearWordsString.split(',');

    const { fname, lname, email, tel, subject, msg } = req.body;

    const lowerCaseMsg = msg.toLowerCase();
    const lowerCaseFname = fname.toLowerCase();
    const lowerCaseLname = lname.toLowerCase();
    const msgContainsSpam = spamWords.some(word => lowerCaseMsg.includes(word));
    const msgContainsSwears = swearWords.some(word => lowerCaseMsg.includes(word));
    const fnameContainsSpam = spamWords.some(word => lowerCaseFname.includes(word));
    const fnameContainsSwears = swearWords.some(word => lowerCaseFname.includes(word));
    const lnameContainsSwears = swearWords.some(word => lowerCaseLname.includes(word));

    if (!fname || fname.length < 2){
        return res.status(400).json({ message: "A first name is required."});
    } 
    if (!lname || lname.length < 2){
        return res.status(400).json({ message: "A last name is required."});
    } 
    if (!email || email.length < 11){
        return res.status(400).json({ message: "An email is required."});
    } 
    if (!msg || msg.length < 2){
        return res.status(400).json({ message: "A message is required."});
    }
    if (msgContainsSpam) {
        console.log('Blocked spam message from:', email);
        return res.status(400).json({ message: "Your message was flagged as spam and could not be sent. If this is an error, please try again without using any promotional keywords."})
    }
    if (msgContainsSwears) {
        console.log('Blocked inappropriate message from:', email);
        return res.status(400).json({ message: "Your message was flagged as inappropriate due to the use of certain keywords and could not be sent. Please review your message for any language, including slang, profanity, or threat-related terms, and try again."});
    }
    if (fnameContainsSpam) {
        console.log('Blocked spam message from:', email);
        return res.status(400).json({ message: "Your first name was flagged as spam and could not be sent. If this is an error, please try again without using any promotional keywords."})
    }
    if (fnameContainsSwears) {
        console.log('Blocked inappropriate message from:', email);
        return res.status(400).json({ message: "Your first name was flagged as inappropriate due to the use of certain keywords and could not be sent. Please review your message for any language, including slang, profanity, or threat-related terms, and try again."});
    }
    if (lnameContainsSwears) {
        console.log('Blocked inappropriate message from:', email);
        return res.status(400).json({ message: "Your last name was flagged as inappropriate due to the use of certain keywords and could not be sent. Please review your message for any language, including slang, profanity, or threat-related terms, and try again."});
    }

    try {
        const sentFrom = new Sender(process.env.MAILERSEND_SENDER_EMAIL, process.env.MAILERSEND_SENDER_NAME);
        const recipients = [
            new Recipient(process.env.EMAIL_RECIPIENT, "Andrew Mulert")
        ];

        const emailParams = new EmailParams()
            .setFrom(sentFrom)
            .setTo(recipients)
            .setSubject(`${subject} from ${fname} ${lname}`)
            .setHtml(`
                <div>
                    <h2>${fname} ${lname}</h2>
                    <h3>${email}</h3>
                    <h3><strong>Phone:</strong> ${tel || 'N/A'}</h3>
                </div>
                <h3>Type:${subject}</h3>
                <p>${msg}</p>
            `)
            .setText(`Name: ${fname} ${lname}\nPhone: ${tel || 'N/A'}\nMessage:\n${msg}`);

        emailParams.setReplyTo(new Sender(email, `${fname} ${lname}`));
        await mailerSend.email.send(emailParams);
        console.log('Email sent successfully via MailerSend!');
        req.body.clear;
        res.status(200).json({ message: 'Thank you for your message! Your email has been sent.' });

    } catch (error) {
        console.error('Error sending email:', error);

        if (error.response && error.response.data) {
            console.error('MailerSend API Error Details:', error.response.data);
        }
        res.status(500).json({ message: 'There was an error sending your message. Please try again later.'});
    }
});


export default router;