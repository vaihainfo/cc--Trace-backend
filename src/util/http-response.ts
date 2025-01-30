import { Response } from "express";
import errors from "../conf/http-error.conf";
import { saveErrorsToDb } from "./error-log";

export default {
  sendSuccess: (res: Response, data: object, statusCode: number = 200) => {
    res.status(statusCode).json({ success: true, data, error: null });
  },

  sendPaginationSuccess: (res: Response, data: object, count: any = 0, statusCode: number = 200) => {
    res.status(statusCode).json({ success: true, data, count, error: null });
  },
  sendError: async (res: Response, error: string, errBody: any= null,  data: object | null = null) => {

    if (!errors[error]) {
      error = error ? error : "ERR_INTERNAL_SERVER_ERROR";
    }
    res.errorMessage = error;

    const { method, originalUrl, body } = res.req;
    const { sql } = errBody;

    const ndata = {
            method,
            api_url: originalUrl,
            response_time: res.get("response-time") ? res.get("response-time") : null,
            status_code: errors[error] ? errors[error].statusCode : 400,
            error_message: error,
            request_body: body ? body : null,
            sql_query: sql ? sql : null,
        };
    
    await saveErrorsToDb(ndata)

    res
      .status(errors[error] ? errors[error].statusCode : 400)
      .json({ success: false, data: data, error: { code: error } });
  },
};  
