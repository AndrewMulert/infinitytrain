import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
    res.render('contact/index', {title: 'Contact - Infinity Train'});
});

export default router;