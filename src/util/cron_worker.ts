// cron-worker.js
import { exportReportsOnebyOne, exportReportsTameTaking } from '../controllers/reports/export-cron'

process.stdin.on('data', async (data) => {
  const command = data.toString().trim();
  
  if (command === 'exportReportsTameTaking') {
    try {
      console.log('Executing cron job logic...');
       exportReportsTameTaking();
      console.log('Cron job execution completed.');
    } catch (error) {
      console.error('Error executing cron job:', error);
    }
  }else if(command === 'exportReportsOnebyOne'){
    try {
      console.log('Executing cron job logic...');
       exportReportsOnebyOne();
      console.log('Cron job execution completed.');
    } catch (error) {
      console.error('Error executing cron job:', error);
    }
  }
});

process.on('exit', (code) => {
  console.log(`Cron worker process exited with code ${code}`);
});