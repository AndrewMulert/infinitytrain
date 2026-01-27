import { Router } from 'express';
import Merch from '../../models/merch/Merch.js'

const router = Router();

router.get('/', async (req, res) => {
    try{
        const merch = await Merch.find().sort({_id: 1});

        console.log('Fetched Merch:', merch);
        console.log('Number of Merch:', merch.length);

        res.render('merch/index', {
            title: 'Merch & Art - Infinity Train',
            description: 'Find your next piece of Infinity Train Merch through one of the many fan art sites, explore official art from galleries, and learn more about the talent behind the Infinity Train',
            heroImage: 'merch_hero_randall', 
            heroAlt: 'Randall and One-One in the Beach Car, rendered by Andrew Mulert',
            heroText: 'Merchandise and Art',
            merch: merch
        });
    } catch (err) {
        console.error('Error fetching merch', err);
        nextTick(err);
    }
});

export default router;