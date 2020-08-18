import { enMsg as _enMsg, unMsg as _unMsg } from "./struct";
import {} from "./treaty";
function enMsg(headPake: olHeadPack): Buffer {
    return _enMsg(headPake);
}
function unMsg(packData: Buffer, msgDataList: Array<olHeadPack>): Buffer {
    return _unMsg(packData, msgDataList);
}
export { enMsg, unMsg };
