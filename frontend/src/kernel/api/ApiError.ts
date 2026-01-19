export type BaseError = {
  code: string;
  message: string;
  statusCode: number;
};

export class ApiError extends Error {
  public code: string;
  public statusCode: number;

  constructor(error: BaseError) {
    super(error.message);
    this.code = error.code;
    this.statusCode = error.statusCode;
    this.message = error.message;
  }

  getTextError(): string {
    return `${this.code}: ${this.message}`;
  }
}
