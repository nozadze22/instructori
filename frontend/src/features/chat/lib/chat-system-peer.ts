export const SYSTEM_CHAT_PEER_ID =
  "00000000-0000-4000-8000-000000000099";

export function isSystemChatPeerId(peerId: string) {
  return peerId === SYSTEM_CHAT_PEER_ID;
}
