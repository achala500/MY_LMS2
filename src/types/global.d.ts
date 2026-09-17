declare module 'qrcode' {
  const qrcode: any;
  export default qrcode;
}

declare global {
  interface Window {
    firebase?: any;
    QRCode?: any;
    STUDYSYNC_API_URL?: string;
  }
}

export {};

