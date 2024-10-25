import { Buffer } from 'buffer';
import * as http from 'http';
import * as https from 'https';

export const post = async (url: URL, data: string): Promise<string> => {
  const useSSL = url.protocol === 'https:';
  const options = {
    hostname: url.hostname,
    port: url.port || (useSSL ? '443' : '80'),
    path: url.pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data),
    },
  };

  return new Promise((resolve, reject) => {
    const req = (useSSL ? https : http).request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data);
        } else {
          reject(
            new Error(
              `HTTP Error: ${res.statusCode} ${res.statusMessage} - URL: ${options.hostname}${options.path}`,
            ),
          );
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error(`Request failed to ${url.href}: ${error.message}`));
    });

    req.write(data);
    req.end();
  });
};
