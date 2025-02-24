export const compareURLs = (url1: string, url2: string): boolean => {
  try {
    const parsedUrl1 = new URL(url1);
    const parsedUrl2 = new URL(url2);
    return parsedUrl1.host === parsedUrl2.host;
  } catch (error) {
    return false;
  }
};
