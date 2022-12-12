export class APIError extends Error {
  constructor(public readonly code: number, message: string, public readonly ctx?: unknown) {
    super(message);
    this.name = 'API Error';
    this.cause = this.ctx;
    this.log();
  }

  private log() {
    if (process.env.NODE_ENV !== 'production') {
      console.error('\x1b[31m', this, '\x1b[0m');
    }
  }
}
