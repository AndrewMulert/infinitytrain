import { Router } from 'express';

const router = Router();
 
// The home page route
router.get('/', async (req, res) => {
    res.render('index', { 
        title: 'Infinity Train', 
        heroImage: 'index_hero_train_landscape', 
        heroAlt: 'The Infinity Train spanning against the horizon, rendered by Andrew Mulert',
        heroText: 'Climb Aboard the'
    });
});

export default router;