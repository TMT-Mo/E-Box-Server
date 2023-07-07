class HttpError {
  errorMessage: string;
  code: number;

  constructor(message: string, errorCode: number = null) {
    this.code = errorCode;
    this.errorMessage = message;
  }

  sendError() {
    return { errorMessage: this.errorMessage, code: this.code };
  }
}

class HttpSuccess{
  message: string;
  code: number;

  constructor(message: string, code: number = null) {
    this.code = code;
    this.message = message;
  }
}

export class BadRequest extends HttpError {
  constructor(message: string = 'Bad Request!'){
    super(message)
    this.code = 400
  }
}

export class NotFound extends HttpError {
  constructor(message: string = 'Not Found!'){
    super(message)
    this.code = 404
  }
}

export class Unauthorized extends HttpError {
  constructor(message: string = 'Unauthorized'){
    super(message)
    this.code = 401
  }
}

export class InternalServer extends HttpError {
  constructor(message: string = 'Something went wrong with the server!'){
    super(message)
    this.code = 500
  }
}

export class Forbidden extends HttpError{
  constructor(message: string = 'Forbidden!'){
    super(message)
    this.code = 403 
  }
}

export class CreatedSuccessfully extends HttpSuccess{
  constructor(message: string = 'Create Successfully!'){
    super(message)
    this.code = 201
  }
}

export class RequestSuccessfully extends HttpSuccess{
  constructor(message: string = 'Request Successfully!'){
    super(message)
    this.code = 200
  }
}

