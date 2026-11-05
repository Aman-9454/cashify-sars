import ImageKit from 'imagekit';

export const IMAGEKIT_CONFIG = {
  id: process.env.IMAGEKIT_ID || 'avdarinn',
  urlEndpoint:
    process.env.IMAGEKIT_URL_ENDPOINT ||
    process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT ||
    'https://ik.imagekit.io/avdarinn',
  publicKey:
    process.env.IMAGEKIT_PUBLIC_KEY ||
    process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY ||
    'public_uzSklsoDFlGNoIPGFtTdcYJU32Y=',
  privateKey:
    process.env.IMAGEKIT_PRIVATE_KEY || 'private_Zgjm0jSmxe2S76y3kkULZ5nzEvo=',
  folder:
    process.env.IMAGEKIT_FOLDER ||
    process.env.NEXT_PUBLIC_IMAGEKIT_FOLDER ||
    'casmik',
};

// ImageKit server-side SDK instance
let imagekitInstance: ImageKit | null = null;

export function getImageKitServerClient(): ImageKit {
  if (!imagekitInstance) {
    imagekitInstance = new ImageKit({
      publicKey: IMAGEKIT_CONFIG.publicKey,
      privateKey: IMAGEKIT_CONFIG.privateKey,
      urlEndpoint: IMAGEKIT_CONFIG.urlEndpoint,
    });
  }
  return imagekitInstance;
}

/**
 * Generates authentication parameters for client-side uploads.
 * Can be returned to the client from an API route.
 */
export function getAuthenticationParameters(token?: string, expire?: number) {
  const ik = getImageKitServerClient();
  return ik.getAuthenticationParameters(token, expire);
}

export interface ImageKitUploadOptions {
  file: string | Buffer; // Base64 string, URL, or Buffer
  fileName: string;
  folder?: string;
  tags?: string[];
  isPrivateFile?: boolean;
  useUniqueFileName?: boolean;
  responseFields?: string[];
}

/**
 * Uploads a file (buffer, base64, or remote url) to ImageKit.
 * Automatically targets the 'casmik' folder unless overridden.
 */
export async function uploadToImageKit(options: ImageKitUploadOptions) {
  const ik = getImageKitServerClient();
  const folder = options.folder || IMAGEKIT_CONFIG.folder;
  
  return ik.upload({
    file: options.file,
    fileName: options.fileName,
    folder: folder.startsWith('/') ? folder : `/${folder}`,
    tags: options.tags || ['casmik'],
    isPrivateFile: options.isPrivateFile ?? false,
    useUniqueFileName: options.useUniqueFileName ?? true,
    responseFields: options.responseFields,
  });
}

/**
 * Deletes a file from ImageKit by fileId.
 */
export async function deleteFromImageKit(fileId: string) {
  const ik = getImageKitServerClient();
  return ik.deleteFile(fileId);
}

/**
 * Generates a full transformed URL for an asset.
 */
export function getImageKitUrl(params: {
  path?: string;
  src?: string;
  transformation?: Array<Record<string, string | number>>;
}): string {
  const ik = getImageKitServerClient();
  if (params.src) {
    return ik.url({
      src: params.src,
      urlEndpoint: IMAGEKIT_CONFIG.urlEndpoint,
      transformation: params.transformation,
    });
  }
  return ik.url({
    path: params.path || '',
    urlEndpoint: IMAGEKIT_CONFIG.urlEndpoint,
    transformation: params.transformation,
  });
}

export default getImageKitServerClient;
