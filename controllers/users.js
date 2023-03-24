const bcrypt = require('bcryptjs'); // импортируем bcrypt
const jwt = require('jsonwebtoken');
// импортируем модель
const User = require('../models/user');
const {
  HTTP_STATUS_CREATED,
} = require('../utils/constants');
const BadRequestError = require('../errors/bad-request-err');
const InternalServerError = require('../errors/internal-server-err');
const NotFoundError = require('../errors/not-found-err');
const UnauthorizedError = require('../errors/unauthorized-err');
const ConflictError = require('../errors/conflict-err');

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, 'some-secret-key', { expiresIn: '7d' });
      // вернём токен
      // res.send({ token });
      res
        .cookie('jwt', token, {
          // token - наш JWT токен, который мы отправляем
          maxAge: 3600 * 24 * 7,
          httpOnly: true,
          sameSite: true,
        })
        .send({ token });
    })
    .catch((err) => {
      // res.status(HTTP_STATUS_UNAUTHORIZED).send({ message: err.message });
      next(new UnauthorizedError(err.message));
    });
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
    .then((user) => res.status(HTTP_STATUS_CREATED).send({ data: user }))
  // данные не записались, вернём ошибку
    .catch((err) => {
      if (err.code === 11000) {
        // res.status(HTTP_STATUS_CONFLICT)
        // .send({ message: 'Пользователь с данным email уже существует' });
        next(new ConflictError('Пользователь с данным email уже существует'));
        // return;
      }
      if (err.name === 'ValidationError') {
        // res.status(HTTP_STATUS_BAD_REQUEST)
        // .send({ message: 'Переданы некорректные данные при создании пользователя' });
        next(new BadRequestError('Переданы некорректные данные при создании пользователя'));
      } else { next(new InternalServerError('Произошла ошибка')); }
      // res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'Произошла ошибка' });
    });
};

module.exports.getUserById = (req, res, next) => {
  User.findById(req.params.userId)
    .orFail()
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'DocumentNotFoundError') {
        // res.status(HTTP_STATUS_NOT_FOUND)
        // .send({ message: 'Пользователь по указанному _id не найден' });
        next(new NotFoundError('Пользователь по указанному _id не найден'));
        // return;
      }
      if (err.name === 'CastError') {
        // res.status(HTTP_STATUS_BAD_REQUEST).send(
        // { message: 'Передан некорректный _id при поиске пользователя' },
        // );
        next(new BadRequestError('Передан некорректный _id при поиске пользователя'));
      } else { next(new InternalServerError('Произошла ошибка')); }
      // res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'Произошла ошибка' });
    });
};

module.exports.getUsers = (req, res, next) => {
  // найти вообще всех
  User.find({})
    .then((users) => res.send(users))
    .catch(() => {
      next(new InternalServerError('Произошла ошибка'));
      // res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'Произошла ошибка' });
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
        // res.status(HTTP_STATUS_NOT_FOUND)
        // .send({ message: 'Пользователь по указанному _id не найден' });
        next(new NotFoundError('Пользователь по указанному _id не найден'));
        // return;
      }
      if (err.name === 'ValidationError') {
        // res.status(HTTP_STATUS_BAD_REQUEST)
        // .send({ message: 'Переданы некорректные данные при обновлении профиля' });
        next(new BadRequestError('Переданы некорректные данные при обновлении профиля'));
      } else { next(new InternalServerError('Произошла ошибка')); }
      // res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'Произошла ошибка' });
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
        // res.status(HTTP_STATUS_NOT_FOUND)
        // .send({ message: 'Пользователь по указанному _id не найден' });
        next(new NotFoundError('Пользователь по указанному _id не найден'));
        // return;
      }
      if (err.name === 'ValidationError') {
        // res.status(HTTP_STATUS_BAD_REQUEST)
        // .send({ message: 'Переданы некорректные данные при обновлении аватара' });
        next(new BadRequestError('Переданы некорректные данные при обновлении аватара'));
      } else { next(new InternalServerError('Произошла ошибка')); }
      // res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'Произошла ошибка' });
    });
};

module.exports.getCurrentUser = (req, res, next) => {
  User.findById(req.user._id)
    .orFail(/* оставляем как есть */)
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'DocumentNotFoundError') {
        // res.status(HTTP_STATUS_NOT_FOUND)
        // .send({ message: 'Пользователь по указанному _id не найден' });
        next(new NotFoundError('Пользователь по указанному _id не найден'));
        // return;
      }
      if (err.name === 'CastError') {
        // res.status(HTTP_STATUS_BAD_REQUEST)
        // .send({ message: 'Передан некорректный _id при поиске пользователя' });
        next(new BadRequestError('Передан некорректный _id при поиске пользователя'));
      } else { next(new InternalServerError('Произошла ошибка')); }
      // res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'Произошла ошибка' });
    });
};
