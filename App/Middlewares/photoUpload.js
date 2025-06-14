import multer from "multer";
import path from "path";

// Setup penyimpanan file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/photos"); // Folder tujuan simpan foto
  },
  filename: function (req, file, cb) {
    // Buat nama file unik misalnya: userID_timestamp.jpg
    const ext = path.extname(file.originalname);
    const uniqueName = `user_${Date.now()}${ext}`;
    cb(null, uniqueName);
  },
});

// Filter hanya menerima file gambar
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Format file harus jpg, jpeg, atau png"), false);
  }
};

const upload = multer({ storage, fileFilter });

export default upload;
