import * as qr from 'qrcode';
import * as fs from 'fs';
import * as path from 'path';
import puppeteer from 'puppeteer';
import crypto from 'crypto';
const algorithm = 'aes-256-cbc';
const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);

const encrypt = (text: any) => {
    let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return encrypted.toString('hex');
}

const generateQrCode = async (qrData: any, farmerName: string, fileName: any, farmerCode: any, village: any) => {
    // Generate the QR code
    return new Promise((resolve, reject) => {
        try {
            let data = encrypt(qrData);
            qr.toBuffer(data, { errorCorrectionLevel: 'H' }, async (err, buffer) => {
                if (err) {
                    console.error('Error generating QR code:', err);
                    return;
                }
                const qrBufferAsDataUrl = `data:image/png;base64,${buffer.toString('base64')}`;

                const qrImagePath: string = path.join('./upload', fileName); // Path to save the QR code image
                let html = getQrImageHtml(qrBufferAsDataUrl, farmerName, farmerCode, village);
                // console.log(html);
                let url = await generateCanvasFromHTML(html, qrImagePath);
                resolve(url);
            })
        } catch (error) {
            reject(error)
        }
    })
}

const generateCanvasFromHTML = async (htmlContent: string, outputPath: string) => {
    try {
        const browser = await puppeteer.launch({args: ['--no-sandbox'] });
        const page = await browser.newPage();
        await page.setViewport({ width: 374, height: 520 }); // Adjust the values as needed
        await page.setContent(htmlContent);

        const content: any = await page.$("body");
        const imageBuffer = await content.screenshot({ omitBackground: true });

        await page.close();
        await browser.close();
        // Write the buffer to the file
        fs.writeFileSync(outputPath, imageBuffer);
        console.log('herer')
        return outputPath;
    } catch (error: any) {
        console.log(error.message);
    }
}



const getQrImageHtml = (src: any, name: any, code: any, village: any) => {
    return `
    <div class="model_content_text" style="width: 350px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-repeat: no-repeat;
    background: #0f265c;
    padding: 5px;" id='farmer_qr_code_down'>
 <div style="width: 100%;
    background: #fff;
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;
    padding: 15px 0;
    border-radius: 10px;">
     <img src="https://staging.tracebale.com/dist/img/cotton_connect.png" class="mdl-qr-logo" style="width: 280px;"> <br>

     <img src="${src}" alt="" id="qr-code-img" class="mdl-qr-img" style="width: 250px;">
     <div id='model-farmer-name' style="font-size: 30px;font-weight: 700; color: #081461; width: 80%; margin: 0 auto;text-align: center;">${name}</div>
     <div id='model-farmer-code' style="font-size: 20px;">${code}</div>
     <div id='model-farmer-village' style="font-size: 20px;">${village}</div>
     <img src="https://staging.tracebale.com/dist/img/tracebale-logo.png" class="mdl-qr-logo-footer" style="padding-top: 10px;width: 220px;margin: 0 auto;">
 </div>

</div>
`
}


const generateOnlyQrCode = async (qrData: any, fileName: string) => {
    // Generate the QR code
    return new Promise((resolve, reject) => {
        try {
            qr.toBuffer(qrData, { errorCorrectionLevel: 'H' }, async (err, buffer) => {
                if (err) {
                    console.error('Error generating QR code:', err);
                    return;
                }
                const qrImagePath: string = path.join('./upload', fileName); // Path to save the QR code image
                fs.writeFileSync(qrImagePath, buffer);
                resolve(qrImagePath);
            })
        } catch (error) {
            reject(error)
        }

    })

}

export {
    generateOnlyQrCode,
    generateQrCode
}
