import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
    res.render('about/index', {
        title: 'About - Infinity Train',
        heroImage: 'about_hero_tape', 
        heroAlt: 'The Tape Car, rendered by Andrew Mulert',
        heroText: 'About the Show'});
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

router.get('/watch', (req, res) => {
    res.render('about/watch', {
        title: 'Watch - Infinity Train',
        heroImage: 'about_hero_tape', 
        heroAlt: 'The Tape Car, rendered by Andrew Mulert',
        heroText: 'Where to Watch'});
});

export default router;