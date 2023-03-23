const router = require('express').Router(); // создали роутер
const { celebrate, Joi } = require('celebrate');

// контроллеры и роуты для карточек
const {
  getCards,
  deleteCardById,
  createCard,
  addCardLike,
  removeCardLike,
} = require('../controllers/cards');

router.get('/', getCards); // возвращает все карточки
router.delete('/:cardId', celebrate({
  // валидируем параметры
  params: Joi.object().keys({
    cardId: Joi.string().alphanum().length(24),
  }),
}), deleteCardById); // удаляет карточку по идентификатору
router.post('/', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    link: Joi.string().required().pattern(/https?:\/\/(www.)?[a-z0-9][a-z0-9-]+\.[a-z]{2,6}[0-9a-z\-._~:/[\]@!$'()*+,;=]*#?$/),
  }),
}), createCard); // создаёт карточку

router.put('/:cardId/likes', celebrate({
  // валидируем параметры
  params: Joi.object().keys({
    cardId: Joi.string().alphanum().length(24),
  }),
}), addCardLike); // поставить лайк карточке
router.delete('/:cardId/likes', celebrate({
  // валидируем параметры
  params: Joi.object().keys({
    cardId: Joi.string().alphanum().length(24),
  }),
}), removeCardLike); // убрать лайк с карточки

module.exports = router;
