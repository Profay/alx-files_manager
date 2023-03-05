import sha1 from 'sha1';
import { v4 as uuidv4 } from 'uuid';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

class AuthController {
  static getConnect(request, response) {
    const auth = request.headers.authorization;
    if (!auth) {
      response.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const basicAuth = Buffer.from(auth.split(' ')[1], 'base64').toString().split(':');
    const email = basicAuth[0];
    const password = sha1(basicAuth[1]);

    const users = dbClient.db.collection('users');
    users.findOne({ email, password }, (err, user) => {
      if (!user) {
        response.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const token = uuidv4();
      const key = `auth_${token}`;
      redisClient.set(key, user._id.toString(), 86400);
      response.status(200).json({ token });
    });
  }

  static async getDisconnect(request, response) {
    const token = request.header('X-Token');
    if (!token) {
      response.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const key = `auth_${token}`;
    const userId = await redisClient.get(key);
    if (!userId) {
      response.status(401).json({ error: 'Unauthorized' });
      return;
    }

    redisClient.del(key);
    response.status(204).end();
  }
}

module.exports = AuthController;
