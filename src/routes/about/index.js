import { Router } from 'express';
import About from '../../models/About.js'
import Watch from '../../models/Watch.js'

const router = Router();

router.get('/', async (req, res) => {
    try{
        const about = await About.find().sort({_id: 1 });

        console.log('Fetched About:', about);
        console.log('Number of About:', about.length);

        res.render('about/index', {
            title: 'About - Infinity Train',
            heroImage: 'about_hero_tape', 
            heroAlt: 'The Tape Car, rendered by Andrew Mulert',
            heroText: 'About the Show',
            about: about
        });
    } catch (err) {
        console.error('Error fetching about', err);
        nextTick(err);
    }
});

router.get('/characters', (req, res) => {
    res.render('about/characters', {
        title: 'Characters - Infinity Train',
        heroImage: 'about_hero_tape', 
        heroAlt: 'The Tape Car, rendered by Andrew Mulert',
        heroText: 'Passengers of the'});
});

router.get('/locations', (req, res) => {
    res.render('about/locations', {
        title: 'Locations - Infinity Train',
        heroImage: 'about_hero_tape', 
        heroAlt: 'The Tape Car, rendered by Andrew Mulert',
        heroText: 'Locations'});
});

router.get('/watch', async (req, res) => {
    try {
        const watch = await Watch.find().sort({_id: 1 });

        console.log('Fetched Watch:', watch);
        console.log('Number of Watch:', watch.length);

        res.render('about/watch', {
            title: 'Watch - Infinity Train',
            heroImage: 'about_hero_tape', 
            heroAlt: 'The Tape Car, rendered by Andrew Mulert',
            heroText: 'Where to Watch',
            watch: watch
        });
    } catch (err){
        console.error('Error fetching watch', err);
        nextTick(err);
    }
});

export default router;