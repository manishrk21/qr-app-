export function healthCheck() {
  return {
    ok: true,
    service: "worker",
    status: "placeholder"
  } as const;
}
