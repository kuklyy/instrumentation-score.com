export type UrlState = {
  enabledRuleIds: string[];
  preset?: string;
};

export function encodeState(state: UrlState): string {
  try {
    const compressed = JSON.stringify(state);
    const encoded = encodeURIComponent(compressed).replace(/%([0-9A-F]{2})/g,
      (_, p1) => String.fromCharCode(parseInt(p1, 16)));
    return btoa(encoded);
  } catch (error) {
    console.error("Failed to encode state:", error);
    return "";
  }
}

export function decodeState(encoded: string): UrlState {
  try {
    const compressed = decodeURIComponent(Array.from(atob(encoded),
      c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
    const state = JSON.parse(compressed);

    if (!state || typeof state !== 'object' || !Array.isArray(state.enabledRuleIds)) {
      throw new Error("Invalid state structure");
    }
    return state;
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