declare module 'lzma' {
    export type TMode = 1|2|3|4|5|6|7|8|9;
    export const compress: (input: string, mode: TMode, onFinish: (result: Array<number>, error: Error) => void) => void;
}
