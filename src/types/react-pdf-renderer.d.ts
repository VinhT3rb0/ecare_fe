declare module '@react-pdf/renderer' {
    export const pdf: (doc: any) => { toBlob: () => Promise<Blob> };
    export const Document: any;
    export const Page: any;
    export const Text: any;
    export const View: any;
    export const StyleSheet: { create: (styles: any) => any };
    export const Font: { register: (config: any) => void };
}


