const jwt = require('jsonwebtoken');

const UnauthorizedError = require('../errors/unauthorized-err');

const { JWT_SECRET = 'dev-secret' } = process.env;

module.exports = (req, res, next) => {
  const token = req.cookies.jwt;
  // верифицируем токен
  let payload;
  try {
    // попытаемся верифицировать токен
    payload = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    // отправим ошибку, если не получилось
    next(new UnauthorizedError('Необходима авторизация'));
  }

  req.user = payload; // записываем пейлоуд в объект запроса

  return next(); // пропускаем запрос дальше
};
