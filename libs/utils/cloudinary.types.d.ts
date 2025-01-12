import 'multer-storage-cloudinary';

declare module 'multer-storage-cloudinary' {
  export interface Params {
    folder?: string;
    allowed_formats?: string[];
    transformation?: Record<string, unknown>[];
  }
}
export interface Params {
  folder?: string;
  allowed_formats?: string[];
  transformation?: Record<string, unknown>[];
}
