import net from "net";
import { } from "./treaty"
import { enMsg, unMsg } from "./functions"
import { stateCode } from "./treaty"
import fs from "fs"
import path from "path"


interface userInfo {
    targetConn: net.Socket
}

const userInfoMap: Map<string, userInfo> = new Map();
const linkServerMsgList: Array<olHeadPack> = []
let linkServerConn: net.Socket | null = null;


interface config {
    linkServerHost: string,
    linkServerPort: number,
    linkTargetHost: string,
    linkTargetPort: number
}

const configConnection: config = JSON.parse(fs.readFileSync(`${path.resolve(__dirname,'config.json')}`).toString())

function getORCreateUserInfoLink(olHeadPackData: olHeadPack): Promise<userInfo> {
    return new Promise((res) => {
        if (userInfoMap.has(olHeadPackData.uuid)) {
            res(userInfoMap.get(olHeadPackData.uuid));
        } else {
            console.log('create new userInfo')
            linkTarget(olHeadPackData.uuid, () => {
                console.log('create Success link target', olHeadPackData.uuid)
                res(userInfoMap.get(olHeadPackData.uuid));
            });
        }
    })
}
function deleteUserInfo(uuid: string) {
    const userInfoData = userInfoMap.get(uuid);
    if (userInfoData) {
        userInfoData.targetConn.end();
        userInfoMap.delete(uuid);
    }
}
let netBuffter: Buffer = Buffer.concat([]);

function linkServerEventData(netData: Buffer) {
    netBuffter = Buffer.concat([netBuffter, netData]);
    const msgList: Array<olHeadPack> = [];
    netBuffter = unMsg(netBuffter, msgList);
    msgList.forEach(olHeadPackData => {
        switch (olHeadPackData.code) {
            case stateCode.data:
                console.log('this is a data');
                getORCreateUserInfoLink(olHeadPackData).then((userInfoData) => {
                    userInfoData.targetConn.write(olHeadPackData.data);
                })
                break;
            case stateCode.closeEnd:
                deleteUserInfo(olHeadPackData.uuid);
                break;
            case stateCode.closeError:
                deleteUserInfo(olHeadPackData.uuid);
                break;
            default:
                console.log('uncode', olHeadPackData);
                break;
        }
    })
}

function sendDataLinkServer(dataOlPack: olHeadPack) {
    if (linkServerConn) {
        linkServerConn.write(enMsg(dataOlPack))
    } else {
        linkServerMsgList.push(dataOlPack)
    }
}


function linkServer() {
    console.error(`link server run!`)
    linkServerConn = net.createConnection({
        host: configConnection.linkServerHost,
        port: configConnection.linkServerPort
    })
    linkServerConn.on('error', console.log)
    linkServerConn.on('data', linkServerEventData)
    linkServerConn.on('close', (isE) => {
        console.error(`link server close!`)
        linkServer();
    })
}
linkServer();

function linkTarget(uuid: string, connBackCall: (c: net.Socket) => void): userInfo {
    console.log('link linkTarget');
    const targetConn = net.createConnection({
        host: configConnection.linkTargetHost,
        port: configConnection.linkTargetPort,
    }, () => {
        connBackCall(targetConn)
    })
    const userInfoData = {
        targetConn: targetConn
    };
    userInfoMap.set(uuid, userInfoData);
    targetConn.on('data', dBuffer => {
        sendDataLinkServer({
            uuid: uuid,
            code: stateCode.data,
            data: dBuffer,
            dataLength: ''
        })
    })
    targetConn.on('error', console.log)
    targetConn.on('close', isE => {
        sendDataLinkServer({
            code: isE ? stateCode.closeError : stateCode.closeEnd,
            uuid: uuid,
            data: '',
            dataLength: ''
        })
    })
    return userInfoData;
}
