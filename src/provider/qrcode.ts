import * as qr from 'qrcode';
import * as fs from 'fs';
import * as path from 'path';
import puppeteer from 'puppeteer';
import crypto from 'crypto';

const encrypt = (text: any) => {
    let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from('QrCOdeTextEcryptQrCOdeTextEcrypt'), Buffer.alloc(16));
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return encrypted.toString('hex');
}

const decrypt = (text: any) => {
    let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from('QrCOdeTextEcryptQrCOdeTextEcrypt'), Buffer.alloc(16));
    let encryptedBuffer = Buffer.from(text, 'hex');
    let decrypted = decipher.update(encryptedBuffer);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}


const updateQrCode = async (qrData: any, farmerName: string, fileName: any, farmerCode: any, village: any) => {
    // Generate the QR code
    const qrImagePath: string = path.join('./upload', fileName); // Path to save the QR code image
    if (fs.existsSync(qrImagePath)) {
        fs.unlinkSync(qrImagePath); // Delete the old QR code file
    }
    
    return new Promise((resolve, reject) => {
        try {
            let data = encrypt(qrData);
            qr.toBuffer(data, { errorCorrectionLevel: 'H' }, async (err, buffer) => {
                if (err) {
                    console.error('Error generating QR code:', err);
                    return;
                }
                const qrBufferAsDataUrl = `data:image/png;base64,${buffer.toString('base64')}`;

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

const generateQrCode = async (qrData: any, farmerName: string, fileName: any, farmerCode: any, village: any) => {
    // Generate the QR code
    const qrImagePath: string = path.join('./upload', fileName); // Path to save the QR code image

    return new Promise((resolve, reject) => {
        try {
            let data = encrypt(qrData);
            qr.toBuffer(data, { errorCorrectionLevel: 'H' }, async (err, buffer) => {
                if (err) {
                    console.error('Error generating QR code:', err);
                    return;
                }
                const qrBufferAsDataUrl = `data:image/png;base64,${buffer.toString('base64')}`;

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
        const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
        const page = await browser.newPage();
        await page.setViewport({ width: 374, height: 520 }); // Adjust the values as needed
        await page.setContent(htmlContent);

        const content: any = await page.$("body");
        const imageBuffer = await content.screenshot({ omitBackground: true });

        await page.close();
        await browser.close();
        // Write the buffer to the file
        fs.writeFileSync(outputPath, imageBuffer);
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
     <img src="https://api.newtracebale.com/file/1696838743827-cotton_connect.png" class="mdl-qr-logo" style="width: 280px;"> <br>

     <img src="${src}" alt="" id="qr-code-img" class="mdl-qr-img" style="width: 250px;">
     <div id='model-farmer-name' style="font-size: 30px;font-weight: 700; color: #081461; width: 80%; margin: 0 auto;text-align: center;">${name}</div>
     <div id='model-farmer-code' style="font-size: 20px;">${code}</div>
     <div id='model-farmer-village' style="font-size: 20px;">${village}</div>
     <img src="https://api.newtracebale.com/file/1696838792397-tracebale-logo.png" class="mdl-qr-logo-footer" style="padding-top: 10px;width: 220px;margin: 0 auto;">
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

const generateGinSalesHtml = async (sales: any) => {
    try {
        let gst_amt = ((sales['sale_value'] ?? 0) * sales['gst_percentage']) / 100;
        let grand_total = sales['sale_value'] + (gst_amt ?? 0);
        let html = `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <title>file_1699417946330</title>
        <style type="text/css">
            * {
                margin: 0;
                padding: 0;
                text-indent: 0;
            }
    
            h2 {
                color: black;
                font-family: Arial, sans-serif;
                font-style: normal;
                font-weight: bold;
                text-decoration: none;
                font-size: 12pt;
            }
    
            h1 {
                color: black;
                font-family: Arial, sans-serif;
                font-style: normal;
                font-weight: bold;
                text-decoration: none;
                font-size: 15pt;
            }
    
            p {
                color: black;
                font-family: Arial, sans-serif;
                font-style: normal;
                font-weight: bold;
                text-decoration: none;
                font-size: 10pt;
                margin: 0pt;
            }
    
            .a,
            a {
                color: black;
                font-family: Arial, sans-serif;
                font-style: normal;
                font-weight: bold;
                text-decoration: none;
                font-size: 10pt;
            }
    
            .s1 {
                color: black;
                font-family: Arial, sans-serif;
                font-style: normal;
                font-weight: normal;
                text-decoration: none;
                font-size: 10pt;
            }
    
            .s2 {
                color: black;
                font-family: Arial, sans-serif;
                font-style: normal;
                font-weight: bold;
                text-decoration: none;
                font-size: 10pt;
            }
    
            .s3 {
                color: black;
                font-family: Arial, sans-serif;
                font-style: normal;
                font-weight: normal;
                text-decoration: none;
                font-size: 10pt;
            }
    
            table,
            tbody {
                vertical-align: top;
                overflow: visible;
            }
        </style>
    </head>
    
    <body>
        <div style="margin:1% 6%">
            <h2 style="padding-top: 3pt;text-indent: 0pt;text-align: center;">INVOICE</h2>
            <p style="text-indent: 0pt;text-align: left;"><br /></p>
            <h1 style="text-indent: 0pt;text-align: center;">${sales.ginner?.name}</h1>
            <p style="padding-top: 14pt;text-indent: 0pt;line-height: 123%;text-align: center;">
                ${sales.ginner?.address}</p>
            <p style="text-indent: 0pt;text-align: center;"><a class="a" target="_blank">Email : </a><a
                    target="_blank">${sales.ginner?.email}</a>
            </p>
            <p style="text-indent: 0pt;text-align: left;"><br /></p>
            <p class="s1" style="text-indent: 0pt;text-align: center;">Supply of goods under rule 46 of CGST
                rules, 2017 read with section 31 of the CGST Act, 2017</p>
            <p style="text-indent: 0pt;text-align: left;"><br /></p>
    
            <div style="display: flex; justify-content: space-between;  margin:7px">
                <p style="padding-left: 8pt;text-indent: 0pt;text-align: left;">PAN No : </p>
                <p style="padding-left: 8pt;text-indent: 0pt;text-align: left;"> Invoice No : ${sales.invoice_no}</p>
            </div>
            <div style="display: flex; justify-content: space-between; margin:7px">
                <p style="padding-left: 8pt;text-indent: 0pt;text-align: left;">GST No : </p>
                <p style="padding-left: 8pt;text-indent: 0pt;text-align: left;"> Date of Issue :${sales.date ? new Date(sales.date).toLocaleDateString() : ''}</p>
            </div>
            <div style="display: flex; justify-content: space-between;  margin:7px">
                <p style="padding-left: 8pt;text-indent: 0pt;text-align: left;">State : ${sales.ginner ? sales.ginner.state.state_name : ''}</p>
                <p style="padding-left: 8pt;text-indent: 0pt;text-align: left;"> Despatch from : ${sales.despatch_from}</p>
            </div>
            <div style="display: flex; justify-content: space-between;  margin:7px">
                <p style="padding-left: 8pt;text-indent: 0pt;text-align: left;">Buyer Information :
                    ${sales.buyerdata ? sales.buyerdata.address : ''}</p>
                <p style="padding-left: 8pt;text-indent: 0pt;text-align: left;">Despatch to : ${sales.despatch_to ? sales.despatch_to : ''}</p>
            </div>
            <div style="display: flex; justify-content: space-between; margin:7px">
                <p style="padding-left: 8pt;text-indent: 0pt;text-align: left;">Place of supply : ${sales.place_of_supply ? sales.place_of_supply : ''}
                </p>
                <p style="padding-left: 8pt;text-indent: 0pt;text-align: left;">Transporter Name : ${sales.transporter_name}
                </p>
            </div>
            <div style="display: flex; justify-content: space-between;  margin:7px">
                <p style="padding-left: 8pt;text-indent: 0pt;text-align: left;">Shipped To :${sales.shipping_address}</p>
                <p style="padding-left: 8pt;text-indent: 0pt;text-align: left;"> LR/BL No : ${sales.lrbl_no}</p>
            </div>
            <p style="text-indent: 0pt;text-align: left;"><br /></p>
            <table style="border-collapse:collapse;margin-left:6.13pt" cellspacing="0">
                <tr style="height:17pt">
                    <td
                        style="width:142pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                        <p class="s2"
                            style="padding-top: 1pt;padding-left: 12pt;padding-right: 11pt;text-indent: 0pt;text-align: center;">
                            COTTON BALES (5201)</p>
                    </td>
                    <td
                        style="width:45pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                        <p class="s2"
                            style="padding-top: 1pt;padding-left: 7pt;padding-right: 7pt;text-indent: 0pt;text-align: center;">
                            No&#39;s</p>
                    </td>
                    <td
                        style="width:102pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                        <p class="s2" style="padding-top: 1pt;padding-left: 40pt;text-indent: 0pt;text-align: left;">
                            Kg&#39;s
                        </p>
                    </td>
                    <td
                        style="width:102pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                        <p class="s2"
                            style="padding-top: 1pt;padding-left: 39pt;padding-right: 39pt;text-indent: 0pt;text-align: center;">
                            Rate</p>
                    </td>
                    <td
                        style="width:114pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                        <p class="s2"
                            style="padding-top: 1pt;padding-left: 39pt;padding-right: 39pt;text-indent: 0pt;text-align: center;">
                            Per</p>
                    </td>
                    <td
                        style="width:85pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                        <p class="s2"
                            style="padding-top: 1pt;padding-left: 8pt;padding-right: 8pt;text-indent: 0pt;text-align: center;">
                            Total Amount</p>
                    </td>
                </tr>
                <tr style="height:34pt">
                    <td
                        style="width:142pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                        <p class="s3"
                            style="padding-top: 1pt;padding-left: 12pt;padding-right: 11pt;text-indent: 0pt;text-align: center;">
                            DESCRIPTION (HSN No)</p>
                    </td>
                    <td
                        style="width:45pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                        <p class="s3"
                            style="padding-top: 1pt;padding-left: 10pt;padding-right: 7pt;text-indent: 0pt;text-align: center;">
                            ${sales.no_of_bales} Bales</p>
                    </td>
                    <td
                        style="width:102pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                        <p class="s3" style="padding-top: 1pt;padding-left: 42pt;text-indent: 0pt;text-align: left;">
                            ${sales.total_qty}</p>
                    </td>
                    <td
                        style="width:102pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                        <p class="s3"
                            style="padding-top: 1pt;padding-left: 39pt;padding-right: 39pt;text-indent: 0pt;text-align: center;">
                            ${sales.candy_rate}</p>
                        <p class="s3"
                            style="padding-top: 5pt;padding-left: 39pt;padding-right: 39pt;text-indent: 0pt;text-align: center;">
                            ${sales.rate}</p>
                    </td>
                    <td
                        style="width:114pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                        <p class="s3"
                            style="padding-top: 1pt;padding-left: 37pt;padding-right: 39pt;text-indent: 0pt;text-align: center;">
                            Candy</p>
                        <p class="s3"
                            style="padding-top: 5pt;padding-left: 39pt;padding-right: 39pt;text-indent: 0pt;text-align: center;">
                            Quintal</p>
                    </td>
                    <td
                        style="width:85pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                        <p class="s3" style="padding-top: 1pt;text-indent: 0pt;text-align: center;"> ${sales.sale_value}</p>
                    </td>
                </tr>
            </table>
            <p style="text-indent: 0pt;text-align: left;"><br /></p>
            <table style="border-collapse:collapse;margin-left:6.13pt" cellspacing="0">
                <tr style="height:17pt">
                    <td
                        style="width:71pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                        <p class="s2" style="padding-top: 1pt;padding-left: 19pt;text-indent: 0pt;text-align: left;">Lot No
                        </p>
                    </td>
                    <td
                        style="width:85pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                        <p class="s2" style="padding-top: 1pt;padding-left: 27pt;text-indent: 0pt;text-align: left;">PR No
                        </p>
                    </td>
                    <td
                        style="width:159pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                        <p class="s2"
                            style="padding-top: 1pt;padding-left: 55pt;padding-right: 55pt;text-indent: 0pt;text-align: center;">
                            REEL Lot</p>
                    </td>
                    <td
                        style="width:102pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                        <p class="s2"
                            style="padding-top: 1pt;padding-left: 22pt;padding-right: 21pt;text-indent: 0pt;text-align: center;">
                            Gross Wt</p>
                    </td>
                    <td
                        style="width:65pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                        <p class="s2"
                            style="padding-top: 1pt;padding-left: 23pt;padding-right: 22pt;text-indent: 0pt;text-align: center;">
                            190</p>
                    </td>
                    <td
                        style="width:70pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                        <p class="s2" style="padding-top: 1pt;padding-left: 19pt;text-indent: 0pt;text-align: left;">IGST :
                        </p>
                    </td>
                    <td
                        style="width:40pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                        <p class="s2" style="padding-top: 1pt;padding-left: 1pt;text-indent: 0pt;text-align: center;"></p>
                    </td>
                </tr>
                <tr style="height:17pt">
                    <td
                        style="width:71pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                        <p style="text-indent: 0pt;text-align: left;"><br />${sales.lot_no}</p>
                    </td>
                    <td
                        style="width:85pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                        <p style="text-indent: 0pt;text-align: left;"><br />${sales.press_no}</p>
                    </td>
                    <td
                        style="width:159pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                        <p style="text-indent: 0pt;text-align: left;"><br />${sales.reel_lot_no}</p>
                    </td>
                    <td
                        style="width:102pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                        <p class="s3"
                            style="padding-top: 1pt;padding-left: 22pt;padding-right: 21pt;text-indent: 0pt;text-align: center;">
                            Tare Weight</p>
                    </td>
                    <td
                        style="width:65pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                        <p style="text-indent: 0pt;text-align: left;"><br /></p>
                    </td>
                    <td
                        style="width:70pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                        <p style="text-indent: 0pt;text-align: left;"><br /></p>
                    </td>
                    <td
                        style="width:40pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                        <p style="text-indent: 0pt;text-align: left;"><br /></p>
                    </td>
                </tr>
                <tr style="height:17pt">
                    <td
                        style="width:71pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                        <p style="text-indent: 0pt;text-align: left;"><br /></p>
                    </td>
                    <td
                        style="width:85pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                        <p style="text-indent: 0pt;text-align: left;"><br /></p>
                    </td>
                    <td
                        style="width:159pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                        <p style="text-indent: 0pt;text-align: left;"><br /></p>
                    </td>
                    <td
                        style="width:102pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                        <p class="s3"
                            style="padding-top: 1pt;padding-left: 22pt;padding-right: 21pt;text-indent: 0pt;text-align: center;">
                            Less Wt</p>
                    </td>
                    <td
                        style="width:65pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                        <p style="text-indent: 0pt;text-align: left;"><br /></p>
                    </td>
                    <td
                        style="width:70pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                        <p style="text-indent: 0pt;text-align: left;"><br /></p>
                    </td>
                    <td
                        style="width:40pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                        <p style="text-indent: 0pt;text-align: left;"><br /></p>
                    </td>
                </tr>
                <tr style="height:17pt">
                    <td
                        style="width:71pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                        <p style="text-indent: 0pt;text-align: left;"><br /></p>
                    </td>
                    <td
                        style="width:85pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                        <p style="text-indent: 0pt;text-align: left;"><br /></p>
                    </td>
                    <td
                        style="width:159pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                        <p style="text-indent: 0pt;text-align: left;"><br /></p>
                    </td>
                    <td
                        style="width:102pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                        <p class="s3"
                            style="padding-top: 1pt;padding-left: 22pt;padding-right: 21pt;text-indent: 0pt;text-align: center;">
                            Sample</p>
                    </td>
                    <td
                        style="width:65pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                        <p style="text-indent: 0pt;text-align: left;"><br /></p>
                    </td>
                    <td
                        style="width:70pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                        <p style="text-indent: 0pt;text-align: left;"><br /></p>
                    </td>
                    <td
                        style="width:40pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                        <p style="text-indent: 0pt;text-align: left;"><br /></p>
                    </td>
                </tr>
                <tr style="height:17pt">
                    <td
                        style="width:71pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                        <p style="text-indent: 0pt;text-align: left;"><br /></p>
                    </td>
                    <td
                        style="width:85pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                        <p style="text-indent: 0pt;text-align: left;"><br /></p>
                    </td>
                    <td
                        style="width:159pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                        <p style="text-indent: 0pt;text-align: left;"><br /></p>
                    </td>
                    <td
                        style="width:102pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                        <p class="s3"
                            style="padding-top: 1pt;padding-left: 22pt;padding-right: 21pt;text-indent: 0pt;text-align: center;">
                            Moisture</p>
                    </td>
                    <td
                        style="width:65pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                        <p style="text-indent: 0pt;text-align: left;"><br /></p>
                    </td>
                    <td
                        style="width:70pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                        <p style="text-indent: 0pt;text-align: left;"><br /></p>
                    </td>
                    <td
                        style="width:40pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                        <p style="text-indent: 0pt;text-align: left;"><br /></p>
                    </td>
                </tr>
                <tr style="height:17pt">
                    <td
                        style="width:71pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                        <p style="text-indent: 0pt;text-align: left;"><br /></p>
                    </td>
                    <td
                        style="width:85pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                        <p style="text-indent: 0pt;text-align: left;"><br /></p>
                    </td>
                    <td
                        style="width:159pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                        <p style="text-indent: 0pt;text-align: left;"><br /></p>
                    </td>
                    <td
                        style="width:102pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                        <p class="s3"
                            style="padding-top: 1pt;padding-left: 22pt;padding-right: 21pt;text-indent: 0pt;text-align: center;">
                            Tot.Less</p>
                    </td>
                    <td
                        style="width:65pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                        <p class="s3" style="padding-top: 1pt;text-indent: 0pt;text-align: center;"></p>
                    </td>
                    <td
                        style="width:70pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                        <p style="text-indent: 0pt;text-align: left;"><br /></p>
                    </td>
                    <td
                        style="width:40pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                        <p style="text-indent: 0pt;text-align: left;"><br /></p>
                    </td>
                </tr>
                <tr style="height:17pt">
                    <td
                        style="width:71pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                        <p style="text-indent: 0pt;text-align: left;"><br /></p>
                    </td>
                    <td
                        style="width:85pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                        <p style="text-indent: 0pt;text-align: left;"><br /></p>
                    </td>
                    <td
                        style="width:159pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                        <p style="text-indent: 0pt;text-align: left;"><br /></p>
                    </td>
                    <td
                        style="width:102pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                        <p class="s3"
                            style="padding-top: 1pt;padding-left: 22pt;padding-right: 21pt;text-indent: 0pt;text-align: center;">
                            Net WT</p>
                    </td>
                    <td
                        style="width:65pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                        <p class="s3"
                            style="padding-top: 1pt;padding-left: 23pt;padding-right: 22pt;text-indent: 0pt;text-align: center;">
                            ${sales.total_qty}</p>
                    </td>
                    <td
                        style="width:70pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                        <p style="text-indent: 0pt;text-align: left;"><br /></p>
                    </td>
                    <td
                        style="width:40pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                        <p style="text-indent: 0pt;text-align: left;"><br /></p>
                    </td>
                </tr>
                <tr style="height:17pt">
                    <td style="width:425pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt"
                        colspan="5">
                        <p style="text-indent: 0pt;text-align: left;"><br /></p>
                    </td>
                    <td
                        style="width:71pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                        <p class="s3" style="padding-top: 1pt;padding-left: 4pt;text-indent: 0pt;text-align: left;">Grand
                            Total
                            :</p>
                    </td>
                    <td
                        style="width:96pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                        <p class="s3" style="padding-top: 1pt;padding-left: 1pt;text-indent: 0pt;text-align: center;">
                            ${grand_total}</p>
                    </td>
                </tr>
            </table>
            <p style="text-indent: 0pt;text-align: left;"><br /></p>
            <p class="s1" style="padding-top: 4pt;text-indent: 0pt;text-align: right;">For ${sales.ginner ? sales.ginner.name : ''}</p>
        </div>
    </body>
    
    </html>`
        const browser = await puppeteer.launch({ args: ['--no-sandbox']});
        const page = await browser.newPage();

        const htmlContent = html;

        await page.setContent(htmlContent);

        // Generate PDF
        const pdfBuffer = await page.pdf({ landscape: true });

        // Write PDF to a file
        const qrImagePath: string = path.join('./upload', 'sales_invoice.pdf'); // Path to save the QR code image
        fs.writeFileSync(qrImagePath, pdfBuffer);

        await browser.close();
        return qrImagePath;

    } catch (error) {
        return error;
    }
}
export {
    generateOnlyQrCode,
    generateQrCode,
    updateQrCode,
    encrypt,
    decrypt,
    generateGinSalesHtml
}