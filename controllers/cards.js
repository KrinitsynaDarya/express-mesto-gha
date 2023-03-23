// импортируем модель
const Card = require('../models/card');

const {
  HTTP_STATUS_CREATED,
} = require('../utils/codes');

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
      data.populate(['owner', 'likes'])
        .then((card) => { res.status(HTTP_STATUS_CREATED).send({ data: card }); })
        .catch(() => {
          next(new InternalServerError('Произошла ошибка'));
          // res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'Произошла ошибка' });
        });
    })
  // данные не записались, вернём ошибку
    .catch((err) => {
      if (err.name === 'ValidationError') {
        // res.status(HTTP_STATUS_BAD_REQUEST)
        // .send({ message: 'Переданы некорректные данные при создании карточки' });
        next(new BadRequestError('Переданы некорректные данные при создании карточки'));
      } else { next(new InternalServerError('Произошла ошибка')); }
      // res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'Произошла ошибка' });
    });
};

/* вариант без вложенного промиса и дублирования дефолтного ответа */
module.exports.createCard = async (req, res, next) => {
  const { name, link } = req.body;
  const owner = req.user._id;
  try {
    const data = await Card.create({ name, link, owner });
    const card = await data.populate(['owner', 'likes']);

    res.status(HTTP_STATUS_CREATED).send({ data: card });
  } catch (err) {
    if (err.name === 'ValidationError') {
      // res.status(HTTP_STATUS_BAD_REQUEST)
      // .send({ message: 'Переданы некорректные данные при создании карточки' });
      next(new BadRequestError('Переданы некорректные данные при создании карточки'));
    } else { next(new InternalServerError('Произошла ошибка')); }
    // res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'Произошла ошибка' });
  }
};

module.exports.getCards = (req, res, next) => {
  // найти вообще всех
  Card.find({})
    .populate(['owner', 'likes'])
    .then((cards) => res.send(cards))
    .catch(() => { next(new InternalServerError('Произошла ошибка')); });
  // res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'Произошла ошибка' })
};

module.exports.deleteCardById = (req, res, next) => {
  Card.findById(req.params.cardId)
    .populate(['owner', 'likes'])
    .orFail()
    .then((card) => {
      if (req.user._id.toString() !== card.owner._id.toString()) {
        // res.status(HTTP_STATUS_FORBIDDEN)
        // .send({ message: 'Карточка с указанным _id не принадлежит текущему пользователю' });
        next(new ForbiddenError('Карточка с указанным _id не принадлежит текущему пользователю'));
        // return;
      }
      card.remove()
        .then(() => res.send({ data: card }));
    })
    .catch((err) => {
      if (err.name === 'DocumentNotFoundError') {
        // res.status(HTTP_STATUS_NOT_FOUND)
        // .send({ message: 'Карточка с указанным _id не найдена' });
        next(new NotFoundError('Карточка с указанным _id не найдена'));
        // return;
      }
      if (err.name === 'CastError') {
        // res.status(HTTP_STATUS_BAD_REQUEST)
        // .send({ message: 'Передан некорректный _id при поиске карточки' });
        next(new BadRequestError('Передан некорректный _id при поиске карточки'));
      } else { next(new InternalServerError('Произошла ошибка')); }
      // res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'Произошла ошибка' });
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
        // res.status(HTTP_STATUS_NOT_FOUND)
        // .send({ message: 'Передан несуществующий _id карточки' });
        // return;
      }
      if (err.name === 'CastError') {
        // res.status(HTTP_STATUS_BAD_REQUEST)
        // .send({ message: 'Передан некорректный _id при поиске карточки' });
        next(new BadRequestError('Передан некорректный _id при поиске карточки'));
      } else { next(new InternalServerError('Произошла ошибка')); }
      // res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'Произошла ошибка' });
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
        // res.status(HTTP_STATUS_NOT_FOUND)
        // .send({ message: 'Передан несуществующий _id карточки' });
        // return;
      }
      if (err.name === 'CastError') {
        // res.status(HTTP_STATUS_BAD_REQUEST)
        // .send({ message: 'Передан некорректный _id при поиске карточки' });
        next(new BadRequestError('Передан некорректный _id при поиске карточки'));
      } else { next(new InternalServerError('Произошла ошибка')); }
      // res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'Произошла ошибка' });
    });
};
