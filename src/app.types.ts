import { Step } from './app.const';

export type TText = Record<Step, string>;

export type TCommand = Record<string, RegExp>;

export type TStep = {
    currentStep: Step;
    data: Array<string>;
};

export type TFileOptions = {
    filename: string;
    contentType: string;
};
