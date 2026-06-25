/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_SOCKET_URL: string;
  readonly VITE_CLOUDINARY_UPLOAD_URL: string;
  readonly VITE_CLOUDINARY_PRESET: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
