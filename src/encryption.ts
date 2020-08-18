import crypto from "crypto";
import fs from "fs";
const algorithm = "aes-256-cbc";
const password = [
    "asdf",
    "yuti",
    "qwer",
    "uioy",
    "aSDG",
    "fgjd",
    "ghgf",
    "XXXA",
].join("");
const iv = Buffer.from(["xndU", "yFkd", "sSXp", "ajAm"].join(""));
function enData(enBuffer: Buffer): Buffer {
    const cipher = crypto.createCipheriv(algorithm, password, iv);
    const enD = Buffer.concat([cipher.update(enBuffer), cipher.final()]);
    return enD;
}
function unData(unBuuffer: Buffer): Buffer {
    const uncipher = crypto.createDecipheriv(algorithm, password, iv);
    const unD = Buffer.concat([uncipher.update(unBuuffer), uncipher.final()]);
    return unD;
}
//test code
//fs.writeFileSync('./test.png',unData(enData(fs.readFileSync('./logo.png'))))
export default {
    enData,
    unData,
};
