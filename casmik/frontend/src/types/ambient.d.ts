declare module 'recharts' {
  export const ResponsiveContainer: any;
  export const AreaChart: any;
  export const Area: any;
  export const BarChart: any;
  export const Bar: any;
  export const LineChart: any;
  export const Line: any;
  export const PieChart: any;
  export const Pie: any;
  export const Cell: any;
  export const XAxis: any;
  export const YAxis: any;
  export const CartesianGrid: any;
  export const Tooltip: any;
  export const Legend: any;
}

declare module 'sonner' {
  export const Toaster: any;
  export const toast: any;
}

declare module '@heroicons/react/24/outline' {
  export const QuestionMarkCircleIcon: any;
  const content: Record<string, any>;
  export default content;
  export * from '@heroicons/react/24/outline';
}

declare module '@heroicons/react/24/solid' {
  const content: Record<string, any>;
  export default content;
  export * from '@heroicons/react/24/solid';
}

declare module 'imagekit' {
  export default class ImageKit {
    constructor(options: any);
    getAuthenticationParameters(token?: string, expire?: number): any;
    upload(options: any): Promise<any>;
    deleteFile(fileId: string): Promise<any>;
    url(options: any): string;
  }
}

declare module '@supabase/ssr' {
  export function createBrowserClient<T = any>(supabaseUrl: string, supabaseAnonKey: string, options?: any): T;
  export function createServerClient<T = any>(supabaseUrl: string, supabaseAnonKey: string, options?: any): T;
}

