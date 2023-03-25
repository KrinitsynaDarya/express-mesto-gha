const router = require('express').Router(); // создали роутер
const auth = require('../middlewares/auth');

const NotFoundError = require('../errors/not-found-err');

router.use('/', require('./auth'));

router.use(auth);

// роуты, которым авторизация нужна
router.use('/users', require('./users'));
router.use('/cards', require('./cards'));

/* 20. необходимо обрабатывать все ошибки централизованно через обработчик */
router.use((req, res, next) => {
  next(new NotFoundError('Запрашиваемая страница не найдена'));
});
module.exports = router;
