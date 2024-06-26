import uploadFile from "../../middleware/upload";
import fs from "fs";
import path from "path";

const upload = async (req: any, res: any) => {
    try {
        let data = await uploadFile(req, res);
        if (req.file == undefined) {
            return res.status(400).send({
                status: false,
                message: "Please provide a file",
                data: null
            });
        }
        res.status(200).send({
            success: true,
            message: "Uploaded the file successfully",
            data: process.env.BASE_URL + req.file.filename,
            name:req.file.originalname
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: `Could not upload the file:. ${err}`,
        });
    }
};


const download = (req: any, res: any) => {
    const fileName = req.params.name;
    const directoryPath = "./upload/";

    res.download(directoryPath + fileName, fileName, (err: any) => {
        if (err) {
            res.status(500).send({
                message: "Could not download the file. " + err,
            });
        }
    });
};

const viewFile = (req: any, res: any) => {
    const fileName = req.params.name;
    const directoryPath = "./upload/";

    const filePath = path.join(directoryPath, fileName);

    fs.access(filePath, fs.constants.R_OK, (err) => {
        if (err) {
            res.status(404).send({
                message: "File not found or not accessible.",
            });
        } else {
            const fileStream = fs.createReadStream(filePath);

            // Set appropriate Content-Type header based on the file extension
            const ext = path.extname(filePath);
            const contentType = getContentType(ext);
            res.set("Content-Type", contentType);

            fileStream.pipe(res);
        }
    });
};

// Helper function to get the Content-Type based on file extension
function getContentType(ext: any) {
    switch (ext.toLowerCase()) {
        case ".pdf":
            return "application/pdf";
        case ".jpg":
        case ".jpeg":
            return "image/jpeg";
        case ".png":
            return "image/png";
        case ".zip":
            return "application/zip";
        case ".mp4":
            return "video/mp4"
        case ".webm":
            return "video/webm"
        case ".avi":
            return "video/x-msvideo"
        case ".mpeg":
            return "video/mpeg"
        case "..ogv":
            return "video/ogg"
        // Add more cases for other file types as needed
        default:
            return "application/octet-stream"; // Fallback to binary data
    }
}

export { upload, download, viewFile }