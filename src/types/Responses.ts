// SUCCESS RESPONSE
export type Pagination = {
  hasNextPage: boolean;
  nextId: number | null;
};

export type SuccessResponseType<T> = {
  status: string;
  code: number;
  message: string;
  data: T;
  pagination: Pagination | null;
};

export function createSuccessResponse<T>(
  code: number,
  message: string,
  data: T,
  pagination: Pagination | null = null
): SuccessResponseType<T> {
  return {
    status: "success",
    code,
    message,
    data,
    pagination,
  };
}

// FAILED RESPONSE
export enum ErrorStatusEnum {
  INVALID_PARAMETER = "Invalid Parameter",
  UNAUTHORIZED_ACCESS = "Unauthorized Access",
  RESOURCE_NOT_FOUND = "Resource Not Found",
  INTERNAL_SERVER_ERROR = "Internal Server Error",
  METHOD_NOT_ALLOWED = "Method Not Allowed",
  CONFLICT_DUPLICATE_ENTRY = "Conflict (Duplicate Entry)",
}

export type ErrorType = {
  field?: string;
  type: string;
  message: string;
};

export type ErrorResponseType = {
  status: ErrorStatusEnum;
  code: number;
  errors: ErrorType[];
};

export function createErrorResponse<T>(
  status: ErrorStatusEnum,
  code: number,
  errors: ErrorType[]
): ErrorResponseType {
  return {
    status,
    code,
    errors,
  };
}

export function validateParams(
  params: any,
  requiredFields: string[]
): ErrorType[] {
  return requiredFields.reduce((errors: ErrorType[], field: string) => {
    if (!params[field]) {
      errors.push({
        field,
        type: "validation",
        message: `${field} is required`,
      });
    }
    return errors;
  }, []);
}

export function validateParamsAsNumber(
  params: any,
  requiredFields: string[]
): ErrorType[] {
  return requiredFields.reduce((errors: ErrorType[], field: string) => {
    if (isNaN(params[field])) {
      errors.push({
        field,
        type: "validation",
        message: `${field} is not a number`,
      });
    }
    return errors;
  }, []);
}

export const DEFAULT_ERROR_RESPONSE_INTERNAL_SERVER = (): ErrorResponseType => {
  const errorObject: ErrorResponseType = {
    status: ErrorStatusEnum.INTERNAL_SERVER_ERROR,
    code: 500,
    errors: [
      {
        type: "server",
        message: "An unexpected error occurred on the server",
      },
    ],
  };
  return errorObject;
};
