const multer = require("multer");
const fs = require("fs");
const path = require("path");

const getFileType = (file) => {
  const mimeType = file.mimetype.split("/");
  console.log("masuk multer");
  return mimeType[mimeType.length - 1];
};

const generateFileName = (req, file, cb) => {
  const extension = getFileType(file);
  console.log("masuk multer 2");
  const filename =
    Date.now() + "-" + Math.round(Math.random() * 1e9) + "." + extension;

  cb(null, file.fieldname + "-" + filename);
};

const fileFilter = (req, file, cb) => {
  console.log("masuk multer 3");
  const extension = getFileType(file);

  const allowedType = /jpg|jpeg|png/;

  const passed = allowedType.test(extension);

  if (passed) {
    return cb(null, true);
  }

  return cb(null, false);
};

exports.uploadImage = ((req, res, next) => {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const { id } = req.user;
      const dest = `uploads/user/${id}`;
      fs.access(dest, (error) => {
        // if doens't exist
        if (error) {
          return fs.mkdir(dest, (error) => {
            cb(error, dest);
          });
        } else {
          // it does exist
          fs.readdir(dest, (error, files) => {
            if (error) throw error;
            for (const file of files) {
              fs.unlink(path.join(dest, file), (error) => {
                if (error) throw error;
              });
            }
          });
          return cb(null, dest);
        }
      });
    },
    filename: generateFileName,
  });
  return multer({ storage, fileFilter }).single("avatar");
})();

exports.chatFile = ((req, res, next) => {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const { id } = req.body;
      const dest = `uploads/chat/${id}`;
      fs.access(dest, (error) => {
        // if doens't exist
        if (error) {
          return fs.mkdir(dest, (error) => {
            cb(error, dest);
          });
        } else {
          // it does exist
          return cb(null, dest);
        }
      });
    },
    filename: generateFileName,
  });
  return multer({ storage, fileFilter }).single("image");
})();
