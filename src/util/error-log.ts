import { Request, Response } from "express";
import ErrorLogs from "../models/error-logs.model";
import { Sequelize, Op } from "sequelize";
import logger from "./logger";

interface ErrorTypes {
    method: String | null,
    api_url: String | null,
    response_time?: String | null,
    status_code?: Number | null,
    error_message: String,
    request_body?: JSON | null,
    sql_query?: String | null,
  }

export async function saveErrorsToDb(data: ErrorTypes){
    try {
        const ndata = {
            method: data.method ? data.method : null,
            api_url: data.api_url ? data.api_url : null,
            response_time: data.response_time ? data.response_time : null,
            status_code: data.status_code ? data.status_code : null,
            error_message: data.error_message ? data.error_message : "",
            request_body: data.request_body ? data.request_body : null,
            sql_query: data.sql_query ? data.sql_query : null,
        };

        const failedRecords = await ErrorLogs.create(ndata);
        return failedRecords;
    } catch (error: any) {
        console.log(error)
        logger.error(`Error: Saving to failed Records - ${error.messsage}`)
    }
}