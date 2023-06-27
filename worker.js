const Bull = require('bull');
const imageThumbnail = require('image-thumbnail');
const fs = require('fs');
const path = require('path');
const dbClient = require('./utils/db');

const fileQueue = new Bull('fileQueue');
const userQueue = new Bull('userQueue');

fileQueue.process(async (job) => {
  const { fileId, userId } = job.data;

  if (!fileId) throw new Error('Missing fileId');
  if (!userId) throw new Error('Missing userId');

  const file = await dbClient.files.findOne({ _id: fileId, userId });
  if (!file) throw new Error('File not found');

  const filePath = file.localPath;
  const options = { width: 500 };
  const thumbnail500 = await imageThumbnail(filePath, options);
  const thumbnail250 = await imageThumbnail(filePath, { ...options, width: 250 });
  const thumbnail100 = await imageThumbnail(filePath, { ...options, width: 100 });

  const ext = path.extname(filePath);
  const baseName = path.basename(filePath, ext);
  const dirName = path.dirname(filePath);

  fs.writeFileSync(path.join(dirName, `${baseName}_500${ext}`), thumbnail500);
  fs.writeFileSync(path.join(dirName, `${baseName}_250${ext}`), thumbnail250);
  fs.writeFileSync(path.join(dirName, `${baseName}_100${ext}`), thumbnail100);
});

userQueue.process(async (job) => {
  const { userId } = job.data;

  if (!userId) throw new Error('Missing userId');

  const user = await dbClient.users.findOne({ _id: userId });
  if (!user) throw new Error('User not found');

  console.log(`Welcome ${user.email}!`);
});

module.exports = { fileQueue, userQueue };
