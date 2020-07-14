import net from "net";
import { } from "./treaty"
import { enMsg, unMsg } from "./functions"
import { stateCode } from "./treaty"
import fs from "fs"

let netBuffter:Buffer=Buffer.concat([]);
let linkServerObj: net.Server | null = null;

interface config {
    serverPort: number,
    inPort: number
}
interface linkUserInfo {
    conn: net.Socket
}

const configConnection: config = JSON.parse(fs.readFileSync('./config.json').toString())
const linkUserMap: Map<string, linkUserInfo> = new Map();

let uuidToken = 1;
let inServerObj: net.Server | null = null;
let inServerConn: net.Socket | null = null;

//function
function sendLinkConn(olPack: olHeadPack): linkUserInfo | undefined {
    const linkUserInfoData: undefined | linkUserInfo = linkUserMap.get(olPack.uuid);    
    if (linkUserInfoData) {
        linkUserInfoData.conn.write(olPack.data)
        return linkUserInfoData;
    }
    return undefined;
}

function linkServerConnClose(uuid: string): linkUserInfo | undefined {
    const linkUserInfoData: undefined | linkUserInfo = linkUserMap.get(uuid);
    if (linkUserInfoData) {
        console.log(`${uuid} close`);
        linkUserMap.delete(uuid);
        linkUserInfoData.conn.end();
        return linkUserInfoData;
    }
    return undefined;
}

function createInServer() {
    inServerObj = net.createServer((c) => {
        inServerConn = c;
        c.on('error', console.log);
        console.log('link in connter')
        inServerConn.on('data', (dBUffer) => {
            netBuffter=Buffer.concat([netBuffter,dBUffer]);
            const msgList:Array<olHeadPack>=[];
            netBuffter = unMsg(netBuffter,msgList);
            msgList.forEach(olPack=>{
                switch (olPack.code) {
                    case stateCode.data:
                        sendLinkConn(olPack)
                        break;
                    case stateCode.closeError:
                        console.log(`error ${olPack.uuid}`);
                        linkServerConnClose(olPack.uuid)
                        break;
                    case stateCode.closeEnd:
                        linkServerConnClose(olPack.uuid)
                        break;
                    default:
                        console.log('uncode', olPack);
                        break;
                }
            })
        })

    })
    inServerObj.listen({
        port: configConnection.inPort,
    })
    inServerObj.on('close', createInServer)
}

createInServer();

function sendInServer(uuid: string, stateCode: stateCode, sendData: any) {
    if (inServerConn !== null) {
        inServerConn.write(enMsg({
            uuid: uuid,
            code: stateCode,
            data: sendData,
            dataLength: ''
        }))
    }
}

function linkServer() {
    linkUserMap.clear();
    console.log('linkServer run !')
    linkServerObj = net.createServer((c) => {
        const uuid = `${uuidToken++}-` + Math.random().toString();
        linkUserMap.set(uuid, { conn: c })
        console.log(`link server !`);
        c.on('data', dBuffer => sendInServer(uuid, stateCode.data, dBuffer));
        c.on('error', console.log);
        c.on('close', (info) => sendInServer(
            uuid,
            info ? stateCode.closeEnd : stateCode.closeError,
            ''
        ))
    })
    linkServerObj.listen({
        port: configConnection.serverPort,
    })
    linkServerObj.on('error', console.log)
    linkServerObj.on('close', () => { console.log('linkServer close !'); linkServer() })
}

linkServer();