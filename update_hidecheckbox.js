const dbConn = require('./dist/util/dbConn'); 
const sequelize = dbConn.default; 
const xlsx = require('xlsx'); 
const path = require('path');
const fs = require('fs');
const { Op, Sequelize } = require('sequelize');
//const GinProcess = require('./src/models/gin-sales.model');

const logFilePath = 'hide_checkbox_update.txt';
fs.appendFileSync(logFilePath, `Date ${new Date().toISOString().split('T')[0]}\n`, 'utf8');
function excelDateToJSDate(excelDate) {
    const date = new Date((excelDate - (25567 + 1)) * 86400 * 1000); 
    return date.toISOString().split('T')[0]; 
} 

const excelFilePath = path.join(__dirname, 'Leaspin Process Report - Need to be greyout.xlsx');
const workbook = xlsx.readFile(excelFilePath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];

let dataArr = xlsx.utils.sheet_to_json(sheet, {
    raw: false, 
    defval: '', 
});

dataArr = dataArr.map(row => {
    for (const key in row) {
        if (typeof row[key] === 'number' && row[key] > 40000) { 
            row[key] = excelDateToJSDate(row[key]);
        }
    }
    return row;
});
// console.log("============dataArr========");
// console.log(dataArr);
/* for (let i = 0; i < 2; i++) { 
    const row = dataArr[i];
    const lot_no = row['__EMPTY_5']
    console.log("============row========");
    console.log(row);
}
 */
/* const runQuery = async () => {
    try {
        const [results] = await sequelize.query('SELECT * FROM gin_sales WHERE id=1');
        
        console.log('Results:', results);
    } catch (error) {
        console.error('Error executing query:', error);
    }
};
runQuery(); */

 const updateDatabase = async (dataArr) => {
    try {
        for (let i = 1; i < dataArr.length; i++) { 
            const row = dataArr[i];

            if (row['__EMPTY_5']) { 
                const ginnerResults = await sequelize.query(
                    `SELECT * 
                    FROM gin_processes 
                    WHERE reel_lot_no = :reelLotNo 
                      AND lot_no = :ginLotNo 
                      AND gin_out_turn = :ginOutTurn
                      AND no_of_bales = :noOfBales `,
                    { 
                        replacements: {
                            reelLotNo: row['__EMPTY_5'], 
                            ginLotNo: row['__EMPTY_3'], 
                            ginOutTurn: row['__EMPTY_11'],
                            noOfBales: row['__EMPTY_8'] 
                        },
                        type: Sequelize.QueryTypes.SELECT 
                    }
                );
                if (ginnerResults.length === 1) {
                    const ginner = ginnerResults[0]; 
                    await sequelize.query(
                        `UPDATE gin_processes 
                        SET greyout_status = true 
                        WHERE id = :id`,
                        {
                            replacements: { id: ginner.id },
                            type: Sequelize.QueryTypes.UPDATE
                        }
                    );
                    console.log(`Updated greyout_status for id: ${ginner.id}`);
                } else if (ginnerResults.length > 1) {
                    console.log("More than one record found; not updating. AND REEL LOT NO IS ", row['__EMPTY_5']);
                } else {
                    console.log("No records found to update for reel_lot_no:", row['__EMPTY_5']);
                }
            }
        }
    } catch (error) {
        console.error("Error during database update:", error);
    }
};
updateDatabase(dataArr); 


