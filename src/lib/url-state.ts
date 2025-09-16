export type UrlState = {
  enabledRuleIds: string[];
  preset?: string;
};

export function encodeState(state: UrlState): string {
  try {
    const compressed = JSON.stringify(state);
    return btoa(compressed);
  } catch (error) {
    console.error("Failed to encode state:", error);
    return "";
  }
}

export function decodeState(encoded: string): UrlState {
  try {
    const compressed = atob(encoded);
    return JSON.parse(compressed);
  } catch (error) {
    console.error("Failed to decode state:", error);
    throw new Error("Invalid state parameter");
  }
}

export function getShareableUrl(state: UrlState): string {
  const encoded = encodeState(state);
  const url = new URL(window.location.href);
  url.searchParams.set('state', encoded);
  return url.toString();
}