import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
    res.render('merch/index', {
        title: 'Merchandise and Art - Infinity Train',
        heroImage: 'merch_hero_randall', 
        heroAlt: 'Randall and One-One in the Beach Car, rendered by Andrew Mulert',
        heroText: 'Merchandise and Art'});
});

export default router;