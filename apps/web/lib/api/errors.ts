export class AppError extends Error {
  code: string;
  status: number;

  constructor(message: string, options?: { code?: string; status?: number }) {
    super(message);
    this.name = "AppError";
    this.code = options?.code ?? "APP_ERROR";
    this.status = options?.status ?? 400;
  }
}
