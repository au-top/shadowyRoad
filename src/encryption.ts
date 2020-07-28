import crypto from "crypto"
import fs from "fs"
const algorithm = 'aes-256-cbc';
const password = 'aaaabbbbccccddddeeeeffffgggghhhh';
const iv = Buffer.from("1234567812345678");
function enData(enBuffer:Buffer):Buffer{
    const cipher = crypto.createCipheriv(algorithm,password,iv);
    const enD = Buffer.concat([cipher.update(enBuffer),cipher.final()]);
    return enD;
}
function unData(unBuuffer:Buffer):Buffer{
    const uncipher = crypto.createDecipheriv(algorithm,password,iv);
    const unD = Buffer.concat([uncipher.update(unBuuffer),uncipher.final()])
    return unD
}
//test code
//fs.writeFileSync('./test.png',unData(enData(fs.readFileSync('./logo.png'))))
export default {
    enData,
    unData
}