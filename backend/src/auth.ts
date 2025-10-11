import 'dotenv/config';

export function authCheck(password: string): boolean {
  return password === process.env.AUTH_PASSWORD;
}
