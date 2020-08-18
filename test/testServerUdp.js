const dgram= require("dgram");

const server = new dgram.Socket('udp4');

// function createUuid(){
//     return Date.now()+Math.random().toString().split('').filter(char=>char!=='.');
// }
// function createAddrPortUuid(addr,port){
//     return `${addr}_${port}`
// }

// const userAgg_id={};
// const userAgg_addrPort={};



// class userInfo{
//     constructor(_addr,_port,_id){
//         this.time=~~(new Date.now()/1000);
//         this.addr=_addr;
//         this.port=_port;
//         this.id=_id;
//         this.addrPort=createAddrPortUuid(this.addr,this.port);
//         userAgg_id[this.id]=this;
//         userAgg_addrPort[this.addrPort]=this;
//     }
//     delMe(){
//         delete userAgg_id[this.id];
//         delete  userAgg_addrPort[this.addrPort];
//     }
//     timeOut(){
//         if((~~(new Date.now()/1000))-this.time > 60 ){
//         }
//     } 
// }





server.on('message',(m,rInfo)=>{
    server.send(Buffer.from("success!") ,rInfo.port,rInfo.address)
    console.log(`${m.toString()},${Object.values(rInfo).join(',')}`);
});
server.on('listening',()=>{
    console.log('listening',server.address());
})
server.bind(1234);

// const conn = new dgram.Socket('udp4');
// conn.on('message',function(recv){
//     console.log(recv.toString(),'!!!');
// })
// conn.send("hello",1234,'127.0.0.1');