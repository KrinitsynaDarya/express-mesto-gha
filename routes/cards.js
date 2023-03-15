const router = require('express').Router(); // создали роутер
// контроллеры и роуты для карточек
const {
  getCards,
  deleteCardById,
  createCard,
  addCardLike,
  removeCardLike,
} = require('../controllers/cards');

router.get('/', getCards); // возвращает все карточки
router.delete('/:cardId', deleteCardById); // удаляет карточку по идентификатору
router.post('/', createCard); // создаёт карточку

router.put('/:cardId/likes', addCardLike); // поставить лайк карточке
router.delete('/:cardId/likes', removeCardLike); // убрать лайк с карточки

module.exports = router;
