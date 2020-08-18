import {} from "./struct";
enum stateCode {
    data = "200",
    closeEnd = "400",
    closeError = "400",
    hear = "100",
}
declare global {
    interface olHeadPack extends packHeaderInfo {
        uuid: string;
        code: stateCode;
    }
    enum stateCode {
        data = "200",
        closeEnd = "400",
        closeError = "400",
        hear = "100",
    }
}

//uuid functions
function createUUID(addr: string, port: string) {
    return `${addr}-${port}`;
}
function unUUID(UUID: string) {
    const uuidInfoList = UUID.split("-");
    return {
        addr: uuidInfoList[0],
        port: uuidInfoList[1],
    };
}

console.log(`版本0.1`);
export { stateCode, createUUID, unUUID };
