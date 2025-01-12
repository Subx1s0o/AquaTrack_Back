import { v2 as cloudinary } from 'cloudinary';
import Container, { Service } from 'typedi';
import { ConfigService } from '@/libs/global';
import multer from 'multer';
import { createCloudinaryStorage } from 'multer-storage-cloudinary';
import { Params } from '@/libs/utils/cloudinary.types';

@Service()
export class CloudinaryUtil {
  constructor(private readonly config: ConfigService) {
    cloudinary.config({
      cloud_name: this.config.get('CLOUDINARY_CLOUD_NAME'),
      api_key: this.config.get('CLOUDINARY_API_KEY'),
      api_secret: this.config.get('CLOUDINARY_API_SECRET')
    });
  }

  getInstance() {
    return cloudinary;
  }
}

const cloudinaryGet = Container.get(CloudinaryUtil).getInstance();

const storage = createCloudinaryStorage({
  cloudinary: cloudinaryGet,
  params: {
    folder: 'user_avatars',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }]
  } as Params
});
const upload = multer({ storage });

export { upload };
