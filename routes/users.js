const router = require('express').Router(); // создали роутер
const { celebrate, Joi } = require('celebrate');
const { regExUrl } = require('../utils/constants');

// контроллеры и роуты для пользователей
const {
  getUsers,
  getUserById,
  updateUser,
  updateUserAvatar,
  getCurrentUser,
} = require('../controllers/users');

router.get('/', getUsers); // возвращает всех пользователей
router.get('/me', getCurrentUser); // возвращает текущего пользователя
router.get('/:userId', celebrate({
  // валидируем параметры
  params: Joi.object().keys({
    /* 18. Id валидируем как hex последовательность длиной 24 символа */
    userId: Joi.string().length(24).hex().required(),
  }),
}), getUserById); // возвращает пользователя по _id

router.patch('/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
  }),
}), updateUser); // обновляет профиль
router.patch('/me/avatar', celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().pattern(regExUrl),
  }),
}), updateUserAvatar); // обновляет аватар

module.exports = router;
