const multer = require('multer');
const path = require('path');
const fs = require('fs');

const profilePicDir = path.join(__dirname, '../../uploads/profile-pics');
const reportsDir = path.join(__dirname, '../../uploads/reports');

fs.mkdirSync(profilePicDir, { recursive: true });
fs.mkdirSync(reportsDir, { recursive: true });

const profilePicStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, profilePicDir),
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);
    const filename = `${req.user.id}-${Date.now()}${extension}`;
    cb(null, filename);
  }
});

const reportStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, reportsDir),
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);
    const filename = `${req.user.id}-${Date.now()}${extension}`;
    cb(null, filename);
  }
});

const imageFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const documentFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF and Word documents are allowed'), false);
  }
};

const uploadProfilePic = multer({
  storage: profilePicStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

const uploadReport = multer({
  storage: reportStorage,
  fileFilter: documentFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

module.exports = {
  uploadProfilePic: uploadProfilePic.single('profilePicture'),
  uploadReport: uploadReport.single('reportFile')
};
