import { compress, TMode } from 'lzma';
import { TStep } from './app.types';
import { minify } from 'html-minifier';
import { minifyDefaultOptions } from './app.const';

export function getUrl(compressedHtml: Array<number>): string {
    const query = convertToFormatedHex(compressedHtml)
        .replace(/\n/g, ' ')
        .split(' ')
        .join('');

    return `${process.env.URL}/${query}`.toUpperCase();
}

function pasteDataInTemplate(html: string, data: Array<string>): string {
    const [personalName, birthDate, passport, date] = data;
    const dataObj = {
        personalName: hidePersonalName(personalName),
        passport: hidePassport(passport),
        birthDate,
        date
    };

    Object.keys(dataObj).forEach((key: string) => {
        // @ts-ignore
        html = html.replace(`{{${key}}}`, dataObj[key]);
    });

    return html;
}

function hidePersonalName(personalName: string): string {
    return personalName
        .split(' ')
        .map((name: string) => name.substring(0, 1) + '*'.repeat(name.length - 1))
        .join(' ');
}

function hidePassport(passport: string): string {
    const [series, number] = passport.split(' ');
    const newSeries = series.substring(0, 2) + '*'.repeat(2);
    const newNumber = '*'.repeat(3) + number.substring(3, number.length);

    return `${newSeries} ${newNumber}`;
}

function getDate(): string {
    const dateObj = new Date();
    const date = ('0' + dateObj.getDate()).slice(-2);
    const month = ('0' + (dateObj.getMonth() + 1)).slice(-2);
    const year = dateObj.getFullYear() + 1;

    return `${date}.${month}.${year}`;
}

export function prepareTemplate(step: TStep, text: string, html: string) {
    const newDate = getDate();
    const data = [...step.data, text, newDate];

    html = pasteDataInTemplate(html, data);

    return minify(html, minifyDefaultOptions);
}

export function compressAsync(input: string, mode: TMode = 1) {
    return new Promise((resolve: (result: Array<number>) => void, reject: (err: Error) => void) => {
        compress(input, mode, (result: Array<number>, err: Error) => err ? reject(err) : resolve(result));
    });
}

function convertToFormatedHex(byte_arr: Array<number>) {
    var hex_str = '',
        i,
        len,
        tmp_hex;

    len = byte_arr.length;

    for (i = 0; i < len; ++i) {
        if (byte_arr[i] < 0) {
            byte_arr[i] = byte_arr[i] + 256;
        }
        tmp_hex = byte_arr[i].toString(16);

        /// Add leading zero.
        if (tmp_hex.length === 1) {
            tmp_hex = '0' + tmp_hex;
        }

        if ((i + 1) % 16 === 0) {
            tmp_hex += '\n';
        } else {
            tmp_hex += ' ';
        }

        hex_str += tmp_hex;
    }

    return hex_str.trim();
}
