import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
    res.render('about/characters', {
        title: 'Characters - Infinity Train',
        heroImage: 'about_hero_tape', 
        heroAlt: 'The Tape Car, rendered by Andrew Mulert',
        heroText: 'Passengers of the'});
});

router.get('/characters/:id', async (req, res) => {

});

export default router;