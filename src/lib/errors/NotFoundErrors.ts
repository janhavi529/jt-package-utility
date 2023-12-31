class NotFound extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFound';
    Error.captureStackTrace(this, NotFound);
  }
}
class FileNotFound extends NotFound {
  constructor(message: string) {
    super(message);
    this.name = 'FileNotFound';
    Error.captureStackTrace(this, FileNotFound);
  }
}

class PathNotFound extends NotFound {
  constructor(message: string) {
    super(message);
    this.name = 'PathNotFound';
    Error.captureStackTrace(this, PathNotFound);
  }
}

export { FileNotFound, PathNotFound };
