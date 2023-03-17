// импортируем модель
const Card = require('../models/card');
const {
  HTTP_STATUS_NOT_FOUND,
  HTTP_STATUS_BAD_REQUEST,
  HTTP_STATUS_INTERNAL_SERVER_ERROR,
} = require('../errors/codes');

module.exports.createCard = (req, res) => {
  // получим из объекта запроса имя и ссылку на карточку
  const { name, link } = req.body;
  const owner = req.user._id;
  // создадим документ на основе пришедших данных
  Card.create({ name, link, owner })
  // вернём записанные в базу данные
    .then((card) => res.send({ data: card }))
  // данные не записались, вернём ошибку
    .catch((err) => {
      if (err.name === 'ValidationError') { res.status(HTTP_STATUS_BAD_REQUEST).send({ message: 'Переданы некорректные данные при создании карточки' }); } else res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'Произошла ошибка' });
    });
};

module.exports.getCards = (req, res) => {
  // найти вообще всех
  Card.find({})
    .then((users) => res.send(users))
    .catch(() => res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'Произошла ошибка' }));
};

module.exports.deleteCardById = (req, res) => {
  Card.findByIdAndRemove(req.params.cardId)
    .orFail(() => res.status(HTTP_STATUS_NOT_FOUND).send({ message: 'Карточка с указанным _id не найдена' }))
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (res.headersSent) {
        return;
      }
      if (err.name === 'CastError') { res.status(HTTP_STATUS_BAD_REQUEST).send({ message: 'Передан некорректный _id при поиске карточки' }); } else res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'Произошла ошибка' });
    });
};

module.exports.addCardLike = (req, res) => {
  Card.findByIdAndUpdate(req.params.cardId, { $addToSet: { likes: req.user._id } })
    .orFail(() => res.status(HTTP_STATUS_NOT_FOUND).send({ message: 'Передан несуществующий _id карточки' }))
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (res.headersSent) {
        return;
      }
      if (err.name === 'CastError') { res.status(HTTP_STATUS_BAD_REQUEST).send({ message: 'Передан некорректный _id при поиске карточки' }); } else res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'Произошла ошибка' });
    });
};

module.exports.removeCardLike = (req, res) => {
  Card.findByIdAndUpdate(req.params.cardId, { $pull: { likes: req.user._id } })
    .orFail(() => res.status(HTTP_STATUS_NOT_FOUND).send({ message: 'Передан несуществующий _id карточки' }))
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (res.headersSent) {
        return;
      }
      if (err.name === 'CastError') { res.status(HTTP_STATUS_BAD_REQUEST).send({ message: 'Передан некорректный _id при поиске карточки' }); } else res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'Произошла ошибка' });
    });
};
