const cryptoRandomString = require('crypto-random-string');

export const generateRandomToken = () => {
  const timestamp = Math.floor(Date.now() / 1000)
  const randomString = cryptoRandomString({ length: 10 });
  return `${timestamp}${randomString}`
}