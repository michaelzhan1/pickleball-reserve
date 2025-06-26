import 'dotenv/config';

export function authCheck(password) {
  return password === process.env.AUTH_PASSWORD;
}