import { v2 as cloudinary } from 'cloudinary';
import { Service } from 'typedi';
import { ConfigService } from '@/libs/global';

@Service()
class CloudinaryUtil {
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

export default CloudinaryUtil;
