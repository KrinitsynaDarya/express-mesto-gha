// импортируем модель
const Card = require('../models/card');

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
      if (err.name === 'ValidationError') { res.status(400).send({ message: 'Переданы некорректные данные при создании карточки' }); } else res.status(500).send({ message: 'Произошла ошибка' });
    });
};

module.exports.getCards = (req, res) => {
  // найти вообще всех
  Card.find({})
    .then((users) => res.send(users))
    .catch(() => res.status(500).send({ message: 'Произошла ошибка' }));
};

module.exports.deleteCardById = (req, res) => {
  Card.findByIdAndRemove(req.params.cardId)
    .orFail(() => res.status(404).send({ message: 'Карточка с указанным _id не найдена' }))
    .then((user) => res.send({ data: user }))
    .catch(() => {
      if (res.headersSent) {
        return;
      }
      res.status(500).send({ message: 'Произошла ошибка' });
    });
};

module.exports.addCardLike = (req, res) => {
  Card.findByIdAndUpdate(req.params.cardId, { $addToSet: { likes: req.user._id } })
    .orFail(() => res.status(404).send({ message: 'Передан несуществующий _id карточки' }))
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (res.headersSent) {
        return;
      }
      if (err.name === 'ValidationError') { res.status(400).send({ message: 'Переданы некорректные данные для постановки лайка' }); } else res.status(500).send({ message: 'Произошла ошибка' });
    });
};

module.exports.removeCardLike = (req, res) => {
  Card.findByIdAndUpdate(req.params.cardId, { $pull: { likes: req.user._id } })
    .orFail(() => res.status(404).send({ message: 'Передан несуществующий _id карточки' }))
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (res.headersSent) {
        return;
      }
      if (err.name === 'ValidationError') { res.status(400).send({ message: 'Переданы некорректные данные для снятии лайка' }); } else res.status(500).send({ message: 'Произошла ошибка' });
    });
};
