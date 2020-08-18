import dgram from "dgram";
import { stateCode, createUUID, unUUID } from "./treaty";
import { enMsg, unMsg } from "./functions";
import fs from "fs";
interface Config {
    serverPort: string;
    inPort: string;
}
const config: Config = JSON.parse(
    fs.readFileSync(__dirname + "/config.json").toString()
);

interface InServerInfo {
    port: number;
    addr: string;
}
//config
const server = dgram.createSocket({
    type: "udp4",
});
const inServer = dgram.createSocket({
    type: "udp4",
});
const msgList: Array<Buffer> = [];
let inServerInfo: InServerInfo | undefined = undefined;

//server event
server.on("message", (msg, rInfo) => {
    const userId = createUUID(rInfo.address, rInfo.port.toString());
    console.log("recvData", "inServerInfo", inServerInfo);
    msgList.push(msg);
    if (inServerInfo !== undefined) {
        msgList.forEach((mBuffer) => {
            inServer.send(
                enMsg({
                    code: stateCode.data,
                    data: mBuffer,
                    dataLength: "",
                    uuid: userId,
                }),
                inServerInfo?.port,
                inServerInfo?.addr
            );
        });
        //clear
        msgList.length=0;
    }
});
server.on("close", () => {
    console.log("server Close");
});
server.on("error", () => {
    console.log("server Error");
    server.close();
});
server.on("listening", () => {
    console.log("listening", server.address());
});
console.log({
    port: Number(config.serverPort),
});
server.bind(
    {
        port: Number(config.serverPort),
    },
    () => {
        console.log("server Bind", { port: Number(config.serverPort) });
    }
);

//inServer event
inServer.on("message", (msg, rInfo) => {
    const msgList: Array<olHeadPack> = [];
    inServerInfo = { addr: rInfo.address, port: rInfo.port };
    unMsg(msg,msgList);
    msgList.forEach((pack) => {
        switch (pack.code) {
            case stateCode.hear:
                console.log("recv hear");
                return;
            case stateCode.data:
                {
                    console.log('recvUserData',pack.uuid,);
                    const netInfo = unUUID(pack.uuid);
                    server.send(pack.data, Number(netInfo.port), netInfo.addr);
                }
                break;
        }
    });
});
inServer.bind(Number(config.inPort));
