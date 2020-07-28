import bufferSecret from "./encryption"

declare global {
    interface packHeaderInfo {
        data: any,
        dataLength: string,
        [propName: string]: any
    }
}
const headEndCode = '\n\n'
const lintEndCode = ';'
const valueLinkCode = '='
function enMsg(headPack: packHeaderInfo): Buffer {
    const netDataList = [];
    headPack.data =bufferSecret.enData(Buffer.from(headPack.data));
    headPack.dataLength = (headPack.data as Buffer).length.toString();
    for (const key in headPack) {
        if (
            Object.prototype.hasOwnProperty.call(headPack, key) &&
            key !== 'data'
        ) {
            netDataList.push(`${key}=${headPack[key] as string};`)
        }
    }
    netDataList.push(headEndCode)
    return Buffer.concat(
        [
            Buffer.from(netDataList.join('')),
            headPack.data
        ]
    )
}


function unMsg(msgData: Buffer,msgDataPackList:Array<packHeaderInfo>):Buffer{
    const rDataArray: Array<packHeaderInfo> = msgDataPackList;
    for (let HEADINDEX = msgData.indexOf(headEndCode); HEADINDEX !== -1; HEADINDEX = msgData.indexOf(headEndCode)) {
        const headData: Buffer = Buffer.prototype.subarray.call(msgData, 0, HEADINDEX);
        const returnHeadInfo: packHeaderInfo = headData
            .toString()
            .split(lintEndCode)
            .map(v => v.split(valueLinkCode))
            .filter(v => v.length === 2)
            .reduce((acc, v) => (void (acc[v[0]] = v[1]) || acc ), Object.create(null));
        const dataLength:number=parseInt(returnHeadInfo.dataLength);
        const dataEnd: Buffer = Buffer.prototype.slice.call(msgData, HEADINDEX + headEndCode.length );
        if(dataEnd.length>=dataLength){
            const packInData=Buffer.prototype.subarray.call(dataEnd,0,dataLength);
            //update Main Buffer block = create new Buffer block
            msgData=Buffer.prototype.subarray.call(dataEnd,dataLength)
            returnHeadInfo['data'] = bufferSecret.unData(packInData);
            rDataArray.push(returnHeadInfo);
        }else{
            break;
        }
    }
    return msgData
}
// // test code
// const packList:Array<Buffer>=[];
// const packDataList:Array<Buffer>=[];
// const dataTEST="Uq1w2e3r4t5y6u7i8o9p0AX";
// for(let i=0;i<10;i++)
//     packList.push(enMsg({
//         "data":dataTEST,
//         "dataLength":''
//     }));
    
// packList.forEach((v:Buffer)=>{
//     packDataList.push(v.subarray(0,10),v.subarray(10))
// })

// packDataList.push(Buffer.concat(packList)) 

// let main:Buffer=Buffer.concat([]);

// const MsgList:Array<packHeaderInfo>=[];

// console.log(packDataList);
// packDataList.forEach((v)=>{
//     main=unMsg(Buffer.concat([main,v]),MsgList);  
// })
// console.log(MsgList.length,'\n',MsgList);
// console.log(dataTEST,'\n',MsgList[0].data.toString())
// console.log(dataTEST.length,'\n',MsgList[0].data.toString().length)
export {
    enMsg,
    unMsg
}