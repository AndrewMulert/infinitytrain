import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
    res.render('support/index', {title: 'Support the Show - Infinity Train'});
});

router.get('/creators', (req, res) => {
    res.render('support/creators', {title: 'Creators - Infinity Train'});
});

router.get('/share', (req, res) => {
    res.render('support/share', {title: 'Share - Infinity Train'});
});

router.get('/watch', (req, res) => {
    res.render('support/watch', {title: "Watch - Infinity Train"});
});

export default router;