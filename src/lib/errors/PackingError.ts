export class PackingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PackingError';
    Error.captureStackTrace(this, PackingError);
  }
}