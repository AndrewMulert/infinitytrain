import { Router } from 'express';
import Games from '../../models/games/Games.js'
import numberRouter from './number.js'

const router = Router();

router.get('/', async (req, res) => {
    try{
        const games = await Games.find().sort({_id: 1});

        console.log('Fetched Games:', games);
        console.log('Number of Games:', games.length);

        res.render('games/index', {
            title: 'Games - Infinity Train',
            description: 'Play Games, get your number, and explore new worlds with games created by the community',
            heroImage: 'support_hero_color', 
            heroAlt: 'The Color Clock Car, rendered by Andrew Mulert',
            heroText: 'Begin your Adventure',
            games: games
        });
    } catch (err) {
        console.error('Error fetching support', err);
        nextTick(err);
    }
});

router.use('/number', numberRouter);

export default router;