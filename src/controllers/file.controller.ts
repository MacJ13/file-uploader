import { User } from "../../generated/prisma";
import { saveFileToDB } from "../services/file.service";
import { HandlerType } from "../types/handlers";

const upload_file_post: HandlerType = async (req, res, next) => {
  try {
    const userId = (req.user as User).id;
    const folderId = req.body.folderId;
    const file = req.file;

    await saveFileToDB(file, +userId, +folderId);

    res.redirect(`/folder/${folderId}`);
  } catch (err) {
    next(err);
  }
};

export default {
  upload_file_post,
};

//
// id
// name: originalName,
// path: path
// size: size
// type : mimetype
// userId: user.id
// folder: folder.id

// [1] {
// [1]   fieldname: 'file',
// [1]   originalname: 'image.jpg',
// [1]   encoding: '7bit',
// [1]   mimetype: 'image/jpeg',
// [1]   destination: 'public\\files\\user12\\update innder folder',
// [1]   filename: 'image.jpg',
// [1]   path: 'public\\files\\user12\\update innder folder\\image.jpg',
// [1]   size: 39987
// [1] }
