import multer from 'multer';

// Use memory storage to buffer files
const storage = multer.memoryStorage();

// File size limit: 10MB
const limits = {
  fileSize: 10 * 1024 * 1024,
};

// Allow general images, PDFs, spreadsheets, word docs, text files, and zip files
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'application/zip',
    'application/x-zip-compressed'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file type. Allowed: Images, PDFs, Word, Excel, Text, and Zip.'), false);
  }
};

const upload = multer({
  storage,
  limits,
  fileFilter,
});

export default upload;
