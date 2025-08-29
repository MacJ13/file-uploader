import multer from "multer";

// const fileStorage = multer.diskStorage({
//   async destination(req, file, callback) {
//     try {
//       const username = (req.user as User).username;
//       const folderId = req.body.folderId;

//       const path = await resolveUploadPath(username, +folderId);

//       callback(null, path);
//     } catch (err) {
//       callback(err as Error, "");
//     }
//   },

//   filename(req, file, callback) {
//     callback(null, file.originalname);
//   },
// });

// export const fileUpload = multer({ storage: fileStorage });

export const fileUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 4 * 1024 * 1024 },
});
