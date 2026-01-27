import { Router } from 'express';
import Home from '../models/Home.js';

const router = Router();
 
// The home page route
router.get('/', async (req, res) => {
    try {
        const home = await Home.find().sort({_id: 1 });

        console.log('Fetched Home:', home);
        console.log('Number of Home:', home.length);
        
        res.render('index', { 
            title: 'Infinity Train', 
            description: 'A fanmade website dedicated to petitioning the return of the Cartoon Network show, Infinity Train. Learn about the current state of the show and how you can show your support',
            heroImage: 'index_hero_train_landscape', 
            heroAlt: 'The Infinity Train spanning against the horizon, rendered by Andrew Mulert',
            heroText: 'Climb Aboard the',
            home: home
        });
    } catch {
        console.error('Error fetching about', err);
        nextTick(err);
    }
});

export default router;