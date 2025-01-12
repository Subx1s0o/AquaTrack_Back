import 'multer-storage-cloudinary';

declare module 'multer-storage-cloudinary' {
  interface Params {
    folder?: string;
    allowed_formats?: string[];
    transformation?: Record<string, unknown>[];
  }
}
