import dbClient from "../utils/db";
import redisClient from "../utils/redis";
import { v4 as uuidv4 } from "uuid";
import { promises as fs } from "fs";
import { ObjectID } from "mongodb";
import mime from 'mime-types';
import Queue from "bull";



class FilesController {
    static async get_user(req) {
        const token = req.header('X-Token');
        const key = `auth_${token}`;
        const user_id = await redisClient.get(key);
        if (user_id) {
            const users = dbClient.db.collections('users');
            const idObject = new ObjectID(user_id);
            const user = await users.findOne({ _id: idObject });
            if (!user) {
                return null;
            }
            return user;
        }
        return null;
    }
    static async PostUpload(req, res) {
        const user = await FilesController.get_user(req);
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const { name, type, parentId = 0, isPublic = false, data } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Missing name' });
        }
        if (!type || !['folder', 'file', 'image'].includes(type)) {
            return res.status(400).json({ error: 'Missing type' });
        }
        if (type !== 'folder' && !data) {
            return res.status(400).json({ error: 'Missing data' });
        }
        const files = await dbClient.db.collections('files');
        if (parentId) {
            const idObject = new ObjectID(parentId);
            const file = files.findOne({_id: idObject });
            if (!file) {
                return res.status(400).json({ error: 'Parent not found' });
            }
            if (file.type !== 'folder') {
                return res.status(401).json({ error: 'Parent is not a folder' });
            }
        }
        if (type === 'folder') {
            files.insertOne({
                userid: user._id,
                name,
                type,
                isPublic,
                parentId,
            }).then((result) => res.status(200).json({
                id: result.insertedId,
                userId: user._id,
                name,
                type,
                isPublic,
                parentId,
            })).then((error) => {
                console.log(error);
            });
        }else {
            const filepath = process.env.FOLDER_PATH || '/tmp/files_manager';
            const filename = `${filepath}/${uuidv4()}`;
            const buff = new Buffer.from(data, 'base64');
            try {
                try { 
                    await fs.mkdir(filepath);
                } catch (error) {}
                await fs.writeFile(filepath, buff, 'utf8');
            } catch (error) {
                console.log(error);
            }
            files.insertOne({
                userId: user._id,
                name,
                type,
                isPublic,
                parentId,
                localPath: filename,
            },).then((result) => {
                res.status(201).json({
                id: result.insertedId,
                userId: users.id,
                name,
                type,
                isPublic,
                parentId,
            },
            );
            if (type === 'image') {
                fileQueue.add({
                    userId: users.id,
                    fieldId: result.insertedId,
                },
                );
            }
        }).catch((error) => {
            console.log(error);
        });
        };
        return null;
    }
}

module.exports = FilesController;