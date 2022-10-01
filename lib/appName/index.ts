export const appName = (url: URL): string => url.hostname.replace(/^www./, "");
