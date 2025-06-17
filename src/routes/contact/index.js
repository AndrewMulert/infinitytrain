import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
    res.render('contact/index', {title: 'Contact - Infinity Train',
        heroImage: 'contact_hero_music', 
        heroAlt: 'The stage in New York, rendered by Andrew Mulert',
        heroText: 'A big thanks to those who made this site possible'});
});

export default router;