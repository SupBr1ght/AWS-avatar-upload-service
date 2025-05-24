import User from "./model/UserSheme.js";
import { Buffer } from 'buffer';
import loger from "./loger.js"

export const basicAuth = async (req, res, next) => {
  const header = req.headers.authorization;
  loger.info("This is a header basick auth")
  
  if (!header?.startsWith('Basic ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }
  // get nickname and password
  const base64 = header.split(' ')[1];
  //decode and get nickname and password
  const [nickname, password] = Buffer.from(base64, 'base64').toString().split(':');

  const user = await User.findOne({ nickname });
  if (!user || !(await user.validatePassword(password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  req.user = user; // прикріплюємо юзера до запиту
  next();
};
