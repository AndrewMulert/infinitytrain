import { Router } from 'express';

const router = Router();

router.get('/', (res, req) => {
    res.render('merch/index', {title: 'Merchandise and Art - Infinity Train'});
});

export default router;