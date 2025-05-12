import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
    console.log(aboutData);
    res.render('about/index', {title: 'About - Infinity Train'});
});

router.get('/characters', (req, res) => {
    res.render('about/characters', {title: 'Characters - Infinity Train'});
});

router.get('/locations', (req, res) => {
    res.render('about/locations', {title: 'Locations - Infinity Train'});
});

router.get('/watch', (req, res) => {
    res.render('about/watch', {title: 'Watch - Infinity Train'});
});

export default router;