import dgram from "dgram";
import { stateCode } from "./treaty";
import { enMsg, unMsg } from "./functions";
import fs from "fs";
interface Config {
    linkServerHost: string;
    linkServerPort: number;
    linkTargetHost: string;
    linkTargetPort: number;
}
interface userInfo {
    link: dgram.Socket;
}
const config: Config = JSON.parse(
    fs.readFileSync(`${__dirname}/config.json`).toString()
);
const userAgg: Record<string, userInfo> = Object.create(null);

let hearInt: NodeJS.Timeout | undefined = undefined;

async function createConnTargetSocket(uuid: string) {
    const newConn = dgram.createSocket({
        type: "udp4",
    });
    newConn.on("close", function () {
        console.log("close Connet");
        delete userAgg[uuid];
    });
    newConn.on("error", function (e) {
        console.log("conn Error!", e);
        newConn.close();
    });
    newConn.on("listening", function () {
        console.log(
            "listening",
            newConn.address().address,
            newConn.address().port
        );
    });
    newConn.on("message", function (data) {
        console.log("recv target");
        linkServer.send(
            enMsg({
                code: stateCode.data,
                data: data,
                dataLength: "",
                uuid: uuid,
            })
        );
    });
    newConn.connect(Number(config.linkTargetPort), config.linkTargetHost);

    await new Promise((res) => {
        newConn.on("connect", res);
    }).catch((e) => {
        throw e;
    });
    return newConn;
}

function createLinkServerSocket() {
    const createSocket = dgram.createSocket({
        type: "udp4",
    });
    createSocket.on("connect", function () {
        createSocket.on("close", function () {
            if (hearInt !== undefined) {
                clearInterval(hearInt);
            }
            linkServer = createLinkServerSocket();
        });

        hearInt = setInterval(function () {
            createSocket.send(
                enMsg({
                    code: stateCode.hear,
                    dataLength: "",
                    data: "",
                    uuid: "",
                })
            );
            console.log("send Hear");
        }, 1000);
        createSocket.on("message", (msg, rInfo) => {
            const msgList: Array<olHeadPack> = [];
            unMsg(msg, msgList);
            msgList.forEach(async (packData) => {
                switch (packData.code) {
                    case stateCode.hear:
                        break;
                    case stateCode.data:
                        {
                            if (
                                !Object.prototype.hasOwnProperty.call(
                                    userAgg,
                                    packData.uuid
                                )
                            ) {
                                userAgg[packData.uuid] = {
                                    link: await createConnTargetSocket(
                                        packData.uuid
                                    ),
                                };
                            }
                            userAgg[packData.uuid].link.send(packData.data);
                        }
                        break;
                }
            });
        });
        createSocket.on("error", function (e) {
            // createSocket.close();
            console.log(e);
        });
    });

    createSocket.connect(config.linkServerPort, config.linkServerHost);

    console.log("linkServer!", config.linkServerPort, config.linkServerHost);
    return createSocket;
}

let linkServer = createLinkServerSocket();
