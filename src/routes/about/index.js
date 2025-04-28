import { Router } from 'express';

const router = Router();

router.get('/', (res, req) => {
    res.render('about/index', {title: 'About - Infinity Train'});
});

router.get('/characters', (res, req) => {
    res.render('about/characters', {title: 'Characters - Infinity Train'});
});

router.get('/locations', (res, req) => {
    res.render('about/locations', {title: 'Locations - Infinity Train'});
});

router.get('/watch', (res, req) => {
    res.render('about/watch', {title: 'Watch - Infinity Train'});
});

export default router;