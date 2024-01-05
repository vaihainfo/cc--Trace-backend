import { Sequelize, Op } from "sequelize";
import moment from "moment";

import EmailTemplate from "../../models/email-template.model";
import EmailManagement from "../../models/email-management.model";
import ScheduledEmailJobs from "../../models/scheduled-email-jobs.model";
import { sendFarmerReport, sendGinnerBaleProcess,sendGinnerPendingSales, sendGinnerSales, sendSpinnerBale, sendSpinnerYarnSale, sendKnitterYarnReceipt, sendKnitterFabricSale, sendWeaverYarnReceipt, sendWeaverFabricSale, sendGarmentFabric, sendGarmentFabricSale, sendOrganicFarmerReport, sendProcurementReport, sendIntegrityReport, processAndSentTicketReminder, sendGinnerPendingReminder } from "../send-emails";

async function checkEmailFunction(templateName: string) {
  const tempFunction: any = {
      "Farmer Report": sendFarmerReport,
      "Ginner Bale Process Report": sendGinnerBaleProcess,
      "Ginner Pending Sales Report": sendGinnerPendingSales,
      "Ginner Sales Report": sendGinnerSales,
      "Spinner Bale Receipt Report": sendSpinnerBale,
      "Spinner Yarn Sales Report": sendSpinnerYarnSale,
      "Knitter Yarn Receipt Report": sendKnitterYarnReceipt,
      "Knitter Fabric Sales Report": sendKnitterFabricSale,
      "Weaver Yarn Receipt Report": sendWeaverYarnReceipt,
      "Weaver Fabric Sales Report": sendWeaverFabricSale,
      "Garment Fabric Receipt Report": sendGarmentFabric,
      "Garment Fabric Sales Report": sendGarmentFabricSale,
      "Organic Farmer Report": sendOrganicFarmerReport,
      "Procurement Report": sendProcurementReport,
      "Organic Integrity Report": sendIntegrityReport,
      "When Gin Sales are still pending - 5 days reminder": sendGinnerPendingReminder,
      "When Gin Sales are still pending - 7 days and Before": sendGinnerPendingReminder,
      "Ticket Approval reminder Admin/brand - 5 days": processAndSentTicketReminder,
      "Ticket Approval reminder Technical team - 7 days": processAndSentTicketReminder,
      "Ticket Approval reminder Technical team - 15 days": processAndSentTicketReminder,
  }

  if(!templateName){ return null;}
  if (typeof templateName == "string") {
    if (tempFunction[templateName] !== undefined){
       return tempFunction[templateName];
      };
    return null;
  } else {
    return null;
  }
}


const sendScheduledEmails = async () => {
    try {
    const startDate = moment().utc().startOf('day'); // Get the current UTC date at the start of the day
    const endDate = moment(startDate).add(1, 'days'); // Get the date for the next day

    const scheduledEmailJobs = await ScheduledEmailJobs.findAll({
        where: {
          scheduled_date: {
            [Op.gte]: startDate.toDate(),
            [Op.lt]: endDate.toDate(),
          },
          email_status: false, // Assuming you want to fetch only unsent emails
        },
        include:[
          {
            model: EmailManagement,
            as: "emailjobs",
            include:[
              {
                model: EmailTemplate,
                as: "template",
              }
            ]
          }
        ]
      });

      if(scheduledEmailJobs && scheduledEmailJobs.length > 0){
        for await (let row of scheduledEmailJobs){
          let currentDate = moment.utc(row?.dataValues?.scheduled_date);
          let scheduledDate = moment.utc(row?.dataValues?.scheduled_date);

          const daysToAdd = row?.dataValues?.emailjobs?.mail_type === 'Weekly' ? 7 : 1;
          scheduledDate.add(daysToAdd, 'days');

          let getFuncToCall = await checkEmailFunction(row?.dataValues?.emailjobs?.template?.template_name);

          if(getFuncToCall){
           let result = await getFuncToCall(row?.dataValues?.email_job_id);

           if(!result){
            let data = {
              scheduled_date: scheduledDate,
              no_of_attempts: row?.dataValues?.no_of_attempts + 1,
              email_status: false,
              email_message: "Pending",
            }
            let updateSchedule = await ScheduledEmailJobs.update(data,{
              where: {
                id: row?.dataValues?.id,
              }
            })
           }else{
            let dataToUpdate = {
              no_of_attempts: row?.dataValues?.no_of_attempts + 1,
              email_status: true,
              email_message: "Success",
            }
            let dataToCreate = {
              email_job_id: row?.dataValues?.email_job_id,
              created_date: currentDate,
              scheduled_date: scheduledDate,
              no_of_attempts: 0,
              email_status: false,
              email_message: null,
            }
            let updateSchedule = await ScheduledEmailJobs.update(dataToUpdate,{
              where: {
                id: row?.dataValues?.id,
              }
            });
            let createNextSchedule = await ScheduledEmailJobs.create(dataToCreate)
           }
           console.log(result ? "Scheduled Email Sent and Updated Successfully" : "Failed Sending Scheduled Email")    
          }
        }
      }
    }  catch (error: any) {
      console.error("Error appending data:", error);
    }
  };


export { sendScheduledEmails };