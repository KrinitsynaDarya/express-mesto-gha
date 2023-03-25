// импортируем модель
const Card = require('../models/card');

const {
  HTTP_STATUS_CREATED,
} = require('../utils/constants');

const BadRequestError = require('../errors/bad-request-err');
const ForbiddenError = require('../errors/forbidden-err');
const InternalServerError = require('../errors/internal-server-err');
const NotFoundError = require('../errors/not-found-err');

module.exports.createCardOld = (req, res, next) => {
  // получим из объекта запроса имя и ссылку на карточку
  const { name, link } = req.body;
  const owner = req.user._id;
  // создадим документ на основе пришедших данных
  Card.create({ name, link, owner })
  // вернём записанные в базу данные
    .then((data) => {
      data.populate('owner')
        .then((card) => { res.status(HTTP_STATUS_CREATED).send({ data: card }); })
        .catch(() => {
          next(new InternalServerError('Произошла ошибка'));
        });
    })
  // данные не записались, вернём ошибку
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Переданы некорректные данные при создании карточки'));
      } else { next(new InternalServerError('Произошла ошибка')); }
    });
};

/* вариант без вложенного промиса и дублирования дефолтного ответа */
module.exports.createCard = async (req, res, next) => {
  const { name, link } = req.body;
  const owner = req.user._id;
  try {
    const data = await Card.create({ name, link, owner });
    const card = await data.populate('owner');

    res.status(HTTP_STATUS_CREATED).send({ data: card });
  } catch (err) {
    if (err.name === 'ValidationError') {
      next(new BadRequestError('Переданы некорректные данные при создании карточки'));
    } else { next(new InternalServerError('Произошла ошибка')); }
  }
};

module.exports.getCards = (req, res, next) => {
  // найти вообще всех
  Card.find({})
    .populate(['owner', 'likes'])
    .then((cards) => res.send(cards))
    .catch(() => { next(new InternalServerError('Произошла ошибка')); });
};

module.exports.deleteCardById = (req, res, next) => {
  Card.findById(req.params.cardId)
    .populate(['owner', 'likes'])
    .orFail()
    .then((card) => {
      if (req.user._id.toString() !== card.owner._id.toString()) {
        next(new ForbiddenError('Карточка с указанным _id не принадлежит текущему пользователю'));
      } /* 1. чтобы код дальше не выполнялся, ставим else */else {
        card.remove()
          .then(() => res.send({ data: card }))
          .catch(next); /* 2. добавили обработчик ошибок */
      }
    })
    .catch((err) => {
      if (err.name === 'DocumentNotFoundError') {
        next(new NotFoundError('Карточка с указанным _id не найдена'));
      } /* 3. чтобы код дальше не выполнялся, ставим else */ else if (err.name === 'CastError') {
        next(new BadRequestError('Передан некорректный _id при поиске карточки'));
      } else { next(new InternalServerError('Произошла ошибка')); }
    });
};

module.exports.addCardLike = (req, res, next) => {
  Card.findByIdAndUpdate(req.params.cardId, { $addToSet: { likes: req.user._id } }, { new: true })
    .populate(['owner', 'likes'])
    .orFail()
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'DocumentNotFoundError') {
        next(new NotFoundError('Передан несуществующий _id карточки'));
      } /* 4. чтобы код дальше не выполнялся, ставим else */else if (err.name === 'CastError') {
        next(new BadRequestError('Передан некорректный _id при поиске карточки'));
      } else { next(new InternalServerError('Произошла ошибка')); }
    });
};

module.exports.removeCardLike = (req, res, next) => {
  Card.findByIdAndUpdate(req.params.cardId, { $pull: { likes: req.user._id } }, { new: true })
    .populate(['owner', 'likes'])
    .orFail()
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'DocumentNotFoundError') {
        next(new NotFoundError('Передан несуществующий _id карточки'));
      } /* 5. чтобы код дальше не выполнялся, ставим else */else if (err.name === 'CastError') {
        next(new BadRequestError('Передан некорректный _id при поиске карточки'));
      } else { next(new InternalServerError('Произошла ошибка')); }
    });
};
