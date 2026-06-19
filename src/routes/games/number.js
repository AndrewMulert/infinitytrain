import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
    res.render('games/number', {
        title: 'Number - Infinity Train',
        description: "Want a glowing green number on your hand? They're super cool, right?.",
        heroImage: 'support_hero_color', 
        heroAlt: 'The Color Car, rendered by Andrew Mulert',
        heroText: 'Welcome New Passenger'});
});

export default router;