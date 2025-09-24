import { Router } from 'express';
import Support from '../../models/Support.js'
import Watch from '../../models/Watch.js'

const router = Router();

router.get('/', async (req, res) => {
    try{
        const support = await Support.find().sort({_id: 1});

        console.log('Fetched Support:', support);
        console.log('Number of Support:', support.length);

        res.render('support/index', {
            title: 'Support the Show - Infinity Train',
            heroImage: 'support_hero_color', 
            heroAlt: 'The Color Clock Car, rendered by Andrew Mulert',
            heroText: 'Show Support for',
            support: support
        });
    } catch (err) {
        console.error('Error fetching support', err);
        nextTick(err);
    }
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

router.get('/watch', async (req, res) => {
     try {
        const watch = await Watch.find().sort({_id: 1 });

        console.log('Fetched Watch:', watch);
        console.log('Number of Watch:', watch.length);
    
        res.render('support/watch', {
            title: "Watch - Infinity Train",
            heroImage: 'support_hero_color', 
            heroAlt: 'The Color Clock Car, rendered by Andrew Mulert',
            heroText: 'Show Support for',
            watch: watch
        });
    
    } catch (err){
        console.error('Error fetching watch', err);
        nextTick(err);
    }
});

export default router;