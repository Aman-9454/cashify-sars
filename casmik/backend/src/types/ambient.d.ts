declare module 'imagekit' {
  export default class ImageKit {
    constructor(options: { publicKey: string; privateKey: string; urlEndpoint: string });
    getAuthenticationParameters(token?: string, expire?: number): { token: string; expire: number; signature: string };
    upload(options: any): Promise<any>;
    deleteFile(fileId: string): Promise<any>;
    url(options: any): string;
  }
}

declare module '@supabase/ssr' {
  export function createBrowserClient<T = any>(supabaseUrl: string, supabaseAnonKey: string, options?: any): T;
  export function createServerClient<T = any>(supabaseUrl: string, supabaseAnonKey: string, options?: any): T;
}
