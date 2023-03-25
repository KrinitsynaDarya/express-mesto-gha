const router = require('express').Router(); // создали роутер
const { celebrate, Joi } = require('celebrate');
const { regExUrl } = require('../utils/constants');

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
    /* 15.  Id валидируем как hex последовательность длиной 24 символа */
    cardId: Joi.string().length(24).hex().required(),
  }),
}), deleteCardById); // удаляет карточку по идентификатору
router.post('/', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    link: Joi.string().required().pattern(regExUrl),
  }),
}), createCard); // создаёт карточку

router.put('/:cardId/likes', celebrate({
  // валидируем параметры
  params: Joi.object().keys({
    /* 16. Id валидируем как hex последовательность длиной 24 символа */
    cardId: Joi.string().length(24).hex().required(),
  }),
}), addCardLike); // поставить лайк карточке
router.delete('/:cardId/likes', celebrate({
  // валидируем параметры
  params: Joi.object().keys({
    /* 17. Id валидируем как hex последовательность длиной 24 символа */
    cardId: Joi.string().length(24).hex().required(),
  }),
}), removeCardLike); // убрать лайк с карточки

module.exports = router;
