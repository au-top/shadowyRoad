import {} from "./struct"
enum stateCode{
    data='200',
    closeEnd='400',
    closeError='400',
}
declare global{
    interface olHeadPack extends packHeaderInfo {
        uuid:string,
        code:stateCode,
    }
    enum stateCode{
        data='200',
        closeEnd='400',
        closeError='400',
    }
}
console.log(`版本0.1`);
export{
    stateCode
}