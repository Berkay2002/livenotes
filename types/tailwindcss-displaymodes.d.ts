declare module 'tailwindcss-displaymodes' {
  interface DisplayModesOptions {
    standalone?: {
      acceptValues?: string[];
    };
    browser?: {
      acceptValues?: string[];
    };
  }

  export default function displayModes(options?: DisplayModesOptions): any;
} 