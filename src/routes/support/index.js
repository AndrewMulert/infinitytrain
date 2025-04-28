import { Router } from 'express';

const router = Router();

router.get('/', (res, req) => {
    res.render('support/index', {title: 'Support the Show - Infinity Train'});
});

router.get('/creators', (res, req) => {
    res.render('support/creators', {title: 'Creators - Infinity Train'});
});

router.get('/share', (res, req) => {
    res.render('support/share', {title: 'Share - Infinity Train'});
});

router.get('/watch', (res, req) => {
    res.render('support/watch', {title: "Watch - Infinity Train"});
});

export default router;