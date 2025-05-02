import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
    res.render('merch/index', {title: 'Merchandise and Art - Infinity Train'});
});

export default router;