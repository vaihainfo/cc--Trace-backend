/** Import .env */
import dotenv from "dotenv";
// dotenv.config({ path: '.env.local' });
dotenv.config({ path: `.env.${process.env.NODE_ENV || "development"}` });

console.log(process.env.NODE_ENV);

import express, { Request, Response } from "express";
import sequelize from "./util/dbConn";
import cors from "cors";
import * as path from "path";

const fs = require("fs");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("../src/swagger/swagger.json");
const customCss = fs.readFileSync((process.cwd() + "/src/swagger/swagger.css"), "utf8");

import authRouter from './router/auth';
import locationRouter from './router/master/location';
import cropRouter from './router/master/crop';
import farmRouter from './router/master/farm';
import unitRouter from './router/master/unit';
import deptRouter from './router/master/department';
import programRouter from './router/master/program';
import fabricTypeRouter from './router/master/fabric-type';
import seasonRouter from './router/master/season';
import loomTypeRouter from './router/master/loom-type';
import garmentTypeRouter from './router/master/garment-type';
import styleMarkRouter from './router/master/style-mark-no';
import cottonmixRouter from './router/master/cottonmix';
import yarnCountRouter from './router/master/yarn-count-range';
import cooperativeRouter from './router/master/cooperative';
import linenVarietyRouter from './router/master/linenvariety';
import productionCapacityRouter from './router/master/prod-capacity';
import farmGroupRouter from './router/master/farm-group';
import icsRouter from './router/master/ics-name';
import videoRouter from './router/master/video';
import fileRouter from './router/upload';
import brandRouter from './router/settings/brand';
import spinnerRouter from './router/settings/spinner';
import ginnerRouter from './router/settings/ginner';
import newProcessorRouter from './router/settings/new-process';
import knitterRouter from './router/settings/knitter';
import weaverRouter from './router/settings/weaver';
import garmentRouter from './router/settings/garment';
import traderRouter from './router/settings/trader';
import physicalPartnerRouter from './router/settings/physical-partner';
import physicalTraceabilityRouter from './router/physical-traceability';
import deviceRouter from './router/settings/device';
import scopeCertRouter from './router/services/scope-cert';
import farmerRouter from './router/services/farmer';
import organicRouter from './router/services/organic-integrity';
import premiumValidationRouter from './router/services/premium-validation';
import fabricRouter from './router/settings/fabric';
import entityLimitRouter from './router/settings/entity-limit';
import userRouter from './router/user/user';
import trainingRouter from './router/training/training';
import linenRouter from './router/services/linen-details';
import procurementRouter from './router/services/procurement';
import ticketingRouter from "./router/ticketing";
import reportRouter from './router/reports/reports';
import uploadDataBaseRouter from "./router/services/upload-databases";
import emailManagementRouter from "./router/settings/email-management";
import garmentSalesRouter from "./router/garment";
import qualityParameterRouter from "./router/quality-parameter";
import ginnerProcessRouter from "./router/ginner";
import spinnerProcessRouter from "./router/spinner";
import weaverProcessRouter from "./router/weaver";
import knitterProcessRouter from "./router/knitter";
import traderProcessRouter from "./router/trader";
import supplyChainRouter from "./router/supply-chain";
import brandProcessRouter from "./router/brand";
import fabricProcessRouter from "./router/fabric";
import errorMiddleware from "./middleware/error";
import setInterface from "./middleware/interface";
import qrApp from "./router/qr-app";
import DatamigrationRouter from './router/datamigration';
import failedRouter from './router/failed-records';
import oldsalesRouter from './router/oldsales';
import dashboardFarmerRouter from './router/dashboard/farmer';
import dashboardGinnerRouter from './router/dashboard/ginner';
import dashboardSpinnerRouter from './router/dashboard/spinner';
import dashboardProcurementRouter from './router/dashboard/procurement';
import dashboardProcessorRouter from './router/dashboard/processor';
import dashboardKnitterRouter from './router/dashboard/knitter';
import dashboardFabricRouter from './router/dashboard/fabric';
import dashboardGarmentRouter from './router/dashboard/garment';
import dashboardWeaverRouter from './router/dashboard/weaver';
import labMasterRouter from './router/master/lab-master';
import seedCompanyRouter from './router/master/seed-company';
import cropCurrentSeasonRouter from './router/master/crop-current-season';
import organicProgramDataDigitizationRouter from './router/services/organic-program-data-digitization';
import { sendScheduledEmails } from "./controllers/email-management/scheduled-email.controller";
import ExportData from "./models/export-data-check.model";
import { exportReportsTameTaking, exportReportsOnebyOne } from "./controllers/reports/export-cron";
import moment from "moment";
import 'moment-timezone';


const app = express();

app.use(express.json({ limit: '2450mb' }));

app.use(express.urlencoded({ extended: true }));
var corsOptions = {
  origin: function (origin: any, callback: any) {
    callback(null, true);
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(setInterface);
//check connection to database
const connectToDb = async () => {
  const data = await sequelize.sync({ force: false })
  try {
    await sequelize.authenticate();
      console.log("Database Connected successfully.");
      exportReportsOnebyOne();
      const used = process.memoryUsage();
      console.log(`Memory usage: ${JSON.stringify(used)}`);
      console.log("Current Server Time", moment());
      console.log("Time Zone", serverTimezone);
      console.log("Offset IST", differenceInMinutes);
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

const { spawn } = require('child_process');

const cronWorkerPath = path.join(__dirname, 'util', 'cron_worker.js');

const cronWorker = spawn('node', [cronWorkerPath]);

cronWorker.stdout.on('data', (data:any) => {
  console.log(`Cron Worker stdout: ${data}`);
});

cronWorker.stderr.on('data', (data:any) => {
  console.error(`Cron Worker stderr: ${data}`);
});

cronWorker.on('close', (code:any) => {
  console.log(`Cron Worker process exited with code ${code}`);
});

var cron = require('node-cron');

const serverTimezone = moment.tz.guess();
const IST = 'Asia/Kolkata';

const IST_to_Denver_offset = moment().tz(serverTimezone).utcOffset();
const IST_to_India_offset = moment().tz(IST).utcOffset();
const differenceInMinutes = IST_to_Denver_offset-IST_to_India_offset;
const differenceInHours = Math.round(differenceInMinutes / 60);
  
const checkTimeDiff = (cronTime:number,differenceInHours:number) => {
  let newCronTime;
  if (differenceInHours<0) {
    newCronTime = (cronTime + differenceInHours) % 24;
    newCronTime = newCronTime > 0 ? newCronTime : 24 + newCronTime;
  }else{
    newCronTime = (cronTime - differenceInHours) % 24;
    newCronTime = newCronTime > 0 ? newCronTime : 24 + newCronTime;
  }
  return newCronTime>=24?0:newCronTime;
}


cron.schedule(`0 ${checkTimeDiff(23,differenceInHours)} * * *`, async () => {
  console.log('running a task once a day at 11 pm');
  sendScheduledEmails();
});

cron.schedule(`0 ${checkTimeDiff(8,differenceInHours)} * * *`, async () => {
  console.log('Running a task at 8 am IST');
  // Add your task for 8 am IST here
  cronWorker.stdin.write('exportReportsOnebyOne\n');
});
// Schedule cron job for 4 pm in India time (UTC+5:30)
cron.schedule(`0 ${checkTimeDiff(16,differenceInHours)} * * *`, async () => {
  console.log('Running a task at 4 pm IST');
  // Add your task for 4 pm IST here
   cronWorker.stdin.write('exportReportsOnebyOne\n');
});

// Schedule cron job for 12 am (midnight) in India time (UTC+5:30)
cron.schedule(`0 ${checkTimeDiff(0,differenceInHours)} * * *`, async () => {
  console.log('Running a task at 12 am IST');
  // Add your task for 12 am IST here
   cronWorker.stdin.write('exportReportsOnebyOne\n');
});

// Schedule cron job for 2 am in India time (UTC+5:30)
cron.schedule(`0 ${checkTimeDiff(2,differenceInHours)} * * *`, async () => {
  console.log('Running a task at 2 am IST');
  // Add your task for 2 am IST here
  cronWorker.stdin.write('exportReportsTameTaking\n');
});

// ---------------------hostinger--------------------------------//

// cron.schedule( `0 ${checkTimeDiff(13,differenceInHours)} * * *`, async () => {
//   console.log('Running a task at 1 pm IST');
//   // Add your task for 1 am IST here
//   exportReportsTameTaking();
// });

// cron.schedule('* * * * * *', async () => {
//   console.log('Running a task at 2 am IST');
//   // Add your task for 2 am IST here
//   // exportReportsTameTaking();
//   cronWorker.stdin.write('executeCronJob\n');
// });

app.use("/auth", authRouter);
app.use("/location", locationRouter);
app.use("/crop", cropRouter);
app.use("/farm", farmRouter);
app.use("/unit", unitRouter);
app.use("/department", deptRouter);
app.use("/program", programRouter);
app.use("/fabric-type", fabricTypeRouter);
app.use("/season", seasonRouter);
app.use("/loom-type", loomTypeRouter);
app.use("/production-capacity", productionCapacityRouter);
app.use("/user", userRouter);
app.use("/cottonmix", cottonmixRouter);
app.use("/yarncount", yarnCountRouter);
app.use("/cooperative", cooperativeRouter);
app.use("/linen-variety", linenVarietyRouter);
app.use("/farm-group", farmGroupRouter);
app.use("/ics", icsRouter);
app.use("/video", videoRouter);
app.use("/file", fileRouter);
app.use("/scope-certificate", scopeCertRouter);
app.use("/brand", brandRouter);
app.use("/new-processor", newProcessorRouter);
app.use("/spinner", spinnerRouter);
app.use("/ginner", ginnerRouter);
app.use("/knitter", knitterRouter);
app.use("/weaver", weaverRouter);
app.use("/garment", garmentRouter);
app.use("/trader", traderRouter);
app.use("/physical-partner", physicalPartnerRouter);
app.use("/physical-traceability", physicalTraceabilityRouter);
app.use("/farmer", farmerRouter);
app.use("/organic-integrity", organicRouter);
app.use("/device", deviceRouter);
app.use("/fabric", fabricRouter);
app.use("/entity", entityLimitRouter);
app.use("/training", trainingRouter);
app.use("/ticketing", ticketingRouter);
app.use("/upload-database", uploadDataBaseRouter);
app.use("/premium-validation", premiumValidationRouter);
app.use("/linen", linenRouter);
app.use("/procurement", procurementRouter);
app.use("/reports", reportRouter);
app.use("/email", emailManagementRouter);
app.use("/garment-sales", garmentSalesRouter);
app.use("/ginner-process", ginnerProcessRouter);
app.use("/spinner-process", spinnerProcessRouter);
app.use("/weaver-process", weaverProcessRouter);
app.use("/knitter-process", knitterProcessRouter);
app.use("/supply-chain", supplyChainRouter);
app.use("/quality-parameter", qualityParameterRouter);
app.use("/trader-process", traderProcessRouter);
app.use("/fabric-process", fabricProcessRouter);
app.use("/brand-interface", brandProcessRouter);
app.use("/qr-app", qrApp);
app.use("/datamigration", DatamigrationRouter);
app.use("/failed-records", failedRouter);
app.use("/oldsales", oldsalesRouter);
app.use("/garment-type", garmentTypeRouter);
app.use("/style-mark", styleMarkRouter);
app.use("/dashboard/farmer", dashboardFarmerRouter)
app.use("/dashboard/ginner", dashboardGinnerRouter)
app.use("/dashboard/spinner", dashboardSpinnerRouter)
app.use("/dashboard/procurement", dashboardProcurementRouter)
app.use("/dashboard/processor", dashboardProcessorRouter)
app.use("/dashboard/knitter", dashboardKnitterRouter)
app.use("/dashboard/fabric", dashboardFabricRouter)
app.use("/dashboard/garment", dashboardGarmentRouter)
app.use("/dashboard/weaver", dashboardWeaverRouter)
app.use("/lab-master", labMasterRouter);
app.use("/seed-company", seedCompanyRouter);
app.use("/crop-current-season", cropCurrentSeasonRouter);
app.use("/organic-program-data-digitization", organicProgramDataDigitizationRouter);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument, { customCss }));

app.use(errorMiddleware);

app.listen(5000, () => {
  connectToDb();
  console.log(`[*] Server listening on Port ${5000}`);
});
