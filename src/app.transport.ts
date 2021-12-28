import https from 'https';

export function createShortenUrl(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
        https.get('https://tinyurl.com/api-create.php?url=' + encodeURIComponent(url), res => {
            res.on('data', chunk => resolve(chunk.toString()));
        }).on('error', err => reject(err));
    });
}
