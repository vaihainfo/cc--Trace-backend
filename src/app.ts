/** Import .env */
import dotenv from "dotenv";
// dotenv.config({ path: '.env.local' });
dotenv.config({ path: `.env.${process.env.NODE_ENV || "development"}` });

console.log(process.env.NODE_ENV);

import express, { Request, Response } from "express";
import sequelize from "./util/dbConn";
import cors from "cors";

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
import { sendScheduledEmails } from "./controllers/email-management/scheduled-email.controller";

const app = express();

app.use(express.json({ limit: '2450mb' }));

app.use(express.urlencoded({ extended: true }));

//check connection to database
const connectToDb = async () => {
  await sequelize.sync({ force: false });
  try {
    await sequelize.authenticate();
    console.log("Database Connected successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

var cron = require('node-cron');

cron.schedule('0 23 * * *', async () => {
  console.log('running a task once a day at 11 pm');
  sendScheduledEmails();
});

var corsOptions = {
  origin: function (origin: any, callback: any) {
    callback(null, true);
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(setInterface);
// app.use("/", (req: Request, res: Response) =>{
//     console.log("object");
//     res.json("ressss")
// })

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
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument, { customCss }));

app.use(errorMiddleware);

app.listen(5000, () => {
  connectToDb();
  console.log(`[*] Server listening on Port ${5000}`);
});
