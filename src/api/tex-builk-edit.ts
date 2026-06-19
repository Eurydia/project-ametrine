import { invoke } from "@tauri-apps/api/core";

export type TokenKind =
  | { kind: "Marker"; key: string }
  | { kind: "TexString"; content: string };

export const getTokens = async (texString: string) => {
  return invoke<Array<TokenKind>>("get_tokens", { texString });
};

export const getMarkerKeys = async (texString: string) => {
  return invoke<Record<string, number>>("get_marker_keys", { texString });
};
