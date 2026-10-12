export function detectDevice(userAgent) {
  const ua = (userAgent || "").toLowerCase();
  const isMobile = /android|iphone|ipad|ipod|mobile|blackberry|iemobile|opera mini/.test(ua);
  return isMobile ? "mobile" : "desktop";
}
