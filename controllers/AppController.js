const { dbClient } = require('./utils/db');
const { redisClient } = require('./utils/redis');

async function getStatus(req, res) {
    const redisAlive = await redisClient.isAlive();
    const dbAlive = await redisClient.isAlive();
    
    res.status(200).json({ redis: redisAlive, db: dbAlive });
}

async function getStats(req, res) {
    nbUsers = await dbClient.nbUsers();
    nbFiles = await dbClient.nbFiles();

    res.status(200).json({ users: nbUsers, files: nbFiles });
}


module.exports = { getStatus, getStats };
