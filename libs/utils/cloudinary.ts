import { v2 as cloudinary, ConfigOptions } from 'cloudinary';
import Container, { Service } from 'typedi';
import { ConfigService } from '@/libs/global';
import multer from 'multer';
import { createCloudinaryStorage } from 'multer-storage-cloudinary';
import { Params } from '@/libs/utils/cloudinary.types';
import * as dotenv from 'dotenv';
dotenv.config();

@Service()
class CloudinaryUtil {
  private readonly cloudinaryInstance = cloudinary;

  constructor(private readonly config: ConfigService) {
    const cloudinaryConfig: ConfigOptions = {
      cloud_name: this.config.get('CLOUDINARY_CLOUD_NAME'),
      api_key: this.config.get('CLOUDINARY_API_KEY'),
      api_secret: this.config.get('CLOUDINARY_API_SECRET')
    };

    if (
      !cloudinaryConfig.cloud_name ||
      !cloudinaryConfig.api_key ||
      !cloudinaryConfig.api_secret
    ) {
      throw new Error('Cloudinary configuration is missing or invalid');
    }

    this.cloudinaryInstance.config(cloudinaryConfig);
  }
  getInstance(): typeof cloudinary {
    return cloudinary;
  }
}

const cloudinaryGet = Container.get(CloudinaryUtil).getInstance();

const storage = createCloudinaryStorage({
  cloudinary: cloudinaryGet,
  params: {
    folder: 'user_avatars',
    transformation: [{ width: 500, height: 500, crop: 'limit' }]
  } as Params
});

const upload = multer({ storage });

export { upload, CloudinaryUtil };
