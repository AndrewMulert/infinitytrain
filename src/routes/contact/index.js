import { Router } from 'express';

const router = Router();

get.router('/', (res, req) => {
    res.render('contact/index', {title: 'Contact - Infinity Train'});
});

export default router;