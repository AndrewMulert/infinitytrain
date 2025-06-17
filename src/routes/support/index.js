import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
    res.render('support/index', {
        title: 'Support the Show - Infinity Train',
        heroImage: 'support_hero_color', 
        heroAlt: 'The Color Clock Car, rendered by Andrew Mulert',
        heroText: 'Show Support for'});
});

router.get('/creators', (req, res) => {
    res.render('support/creators', {
        title: 'Creators - Infinity Train',
        heroImage: 'support_hero_color', 
        heroAlt: 'The Color Clock Car, rendered by Andrew Mulert',
        heroText: 'Show Support for'});
});

router.get('/share', (req, res) => {
    res.render('support/share', {
        title: 'Share - Infinity Train',
        heroImage: 'support_hero_color', 
        heroAlt: 'The Color Clock Car, rendered by Andrew Mulert',
        heroText: 'Show Support for'});
});

router.get('/watch', (req, res) => {
    res.render('support/watch', {
        title: "Watch - Infinity Train",
        heroImage: 'support_hero_color', 
        heroAlt: 'The Color Clock Car, rendered by Andrew Mulert',
        heroText: 'Show Support for'});
});

export default router;