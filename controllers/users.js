const bcrypt = require('bcryptjs'); // импортируем bcrypt
const jwt = require('jsonwebtoken');

const { JWT_SECRET = 'dev-secret' } = process.env;
// импортируем модель
const User = require('../models/user');
const {
  HTTP_STATUS_CREATED,
} = require('../utils/constants');
const BadRequestError = require('../errors/bad-request-err');
const InternalServerError = require('../errors/internal-server-err');
const NotFoundError = require('../errors/not-found-err');
const ConflictError = require('../errors/conflict-err');

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, { expiresIn: '7d' });
      // вернём токен
      res
        .cookie('jwt', token, {
          // token - наш JWT токен, который мы отправляем
          maxAge: 3600 * 24 * 7,
          httpOnly: true,
          sameSite: true,
        })
        .send({ token });
    })
    .catch(next);/* 6. убрали избыточный обработчик */
};

module.exports.createUser = (req, res, next) => {
  // получим из объекта запроса имя и описание пользователя
  const {
    name, about, avatar, email, password,
  } = req.body;
  bcrypt.hash(password, 10)
  // создадим документ на основе пришедших данных
    .then((hash) => User.create({
      name, about, avatar, email, password: hash,
    }))
  // вернём записанные в базу данные
    .then((user) => res.status(HTTP_STATUS_CREATED).send({ data: user.clean() }))
  // данные не записались, вернём ошибку
    .catch((err) => {
      if (err.code === 11000) {
        next(new ConflictError('Пользователь с данным email уже существует'));
      } /* 7. чтобы код дальше не выполнялся, ставим else */else if (err.name === 'ValidationError') {
        next(new BadRequestError(err.message));
      } else { next(new InternalServerError('Произошла ошибка')); }
    });
};

module.exports.getUserById = (req, res, next) => {
  User.findById(req.params.userId)
    .orFail()
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'DocumentNotFoundError') {
        next(new NotFoundError('Пользователь по указанному _id не найден'));
      } /* 8. чтобы код дальше не выполнялся, ставим else */else if (err.name === 'CastError') {
        next(new BadRequestError('Передан некорректный _id при поиске пользователя'));
      } else { next(new InternalServerError('Произошла ошибка')); }
    });
};

module.exports.getUsers = (req, res, next) => {
  // найти вообще всех
  User.find({})
    .then((users) => res.send(users))
    .catch(() => {
      next(new InternalServerError('Произошла ошибка'));
    });
};

module.exports.updateUser = (req, res, next) => {
  const { name, about } = req.body;
  // обновим имя найденного по _id пользователя
  User.findByIdAndUpdate(req.user._id, { name, about }, { new: true, runValidators: true })
    .orFail()
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'DocumentNotFoundError') {
        next(new NotFoundError('Пользователь по указанному _id не найден'));
      } /* 9. чтобы код дальше не выполнялся, ставим else */else if (err.name === 'ValidationError') {
        next(new BadRequestError('Переданы некорректные данные при обновлении профиля'));
      } else { next(new InternalServerError('Произошла ошибка')); }
    });
};

module.exports.updateUserAvatar = (req, res, next) => {
  const { avatar } = req.body;
  // обновим аватар найденного по _id пользователя
  User.findByIdAndUpdate(req.user._id, { avatar }, { new: true, runValidators: true })
    .orFail()
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'DocumentNotFoundError') {
        next(new NotFoundError('Пользователь по указанному _id не найден'));
      } /* 10. чтобы код дальше не выполнялся, ставим else */else if (err.name === 'ValidationError') {
        next(new BadRequestError('Переданы некорректные данные при обновлении аватара'));
      } else { next(new InternalServerError('Произошла ошибка')); }
    });
};

module.exports.getCurrentUser = (req, res, next) => {
  User.findById(req.user._id)
    .orFail()
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'DocumentNotFoundError') {
        next(new NotFoundError('Пользователь по указанному _id не найден'));
      } /* 11. чтобы код дальше не выполнялся, ставим else */else if (err.name === 'CastError') {
        next(new BadRequestError('Передан некорректный _id при поиске пользователя'));
      } else { next(new InternalServerError('Произошла ошибка')); }
    });
};
