import { invoke } from "@tauri-apps/api/core";

export type TokenKind =
  | { kind: "Marker"; key: string }
  | { kind: "TexString"; content: string };

export const getTokens = async (
  texString: string,
): Promise<Array<TokenKind>> => {
  return invoke("get_tokens", { texString });
};

export const getMarkerKeys = async (
  texString: string,
): Promise<Record<string, number>> => {
  return invoke("get_marker_keys", { texString });
};
