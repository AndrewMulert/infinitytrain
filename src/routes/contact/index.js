import { Router } from 'express';

const router = Router();

router.get('/', (res, req) => {
    res.render('contact/index', {title: 'Contact - Infinity Train'});
});

export default router;