export async function cleanupExpiredRecords() {
  return {
    ok: true,
    cleaned: 0
  } as const;
}
