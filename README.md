## 内网穿透/端口映射

默认加密连接

无依赖

___


## 使用方法

安装依赖

npm i 

#### 生成

在linux 下生成 sh make.sh

在win    下生成 运行等价的 make.sh 内容

#### 运行

使用 node 
```

node O.js

node Ol.js

```

O.js 转发服务入口

Ol.js 转发服务出口

#### 配置文件

位于 ./src/config.json

_运行make.sh会自动拷贝到生成的文件夹中_

#### 配置字段

_以下为Ol.js配置_
```
linkServerHost _转发服务器地址 host_ 默认 127.0.0.1

linkServerPort _转发服务器端口_ port 默认 5679

linkTargetHost _映射目标的地址_ host 默认 127.0.0.1

linkTargetPort _映射目标的端口_ port 默认 22
```

_以下为O.js配置_

```
serverPort _入口端口(访问者端口)_ 默认 22 

inPort _连接Ol端口(和linkServerPort对应二者必须相同不然无法通讯)_ 默认 5679
```

### 说明 

##### 关于运行的说明 


  该项目项目的默认配置 为映射本机22(sshd)端口

  可以 在完成安装依赖 和 生成后 进入 build 运行 
  ```
    node O.js & node Ol.js & 
  ```
  打开映射服务

  使用
  ```
    ssh username@127.0.0.1 -p 5678
  ```
  进行访问

##### 关于生成的说明

  运行 make.sh 完成了5个步骤

  运行 tsc 编译 typescript

  创建 build/dist 文件夹

  拷贝config.json到 ./build/ 和 ./build/dist/

  _此时./build/dist/是空的_

  运行 webpackcli 打包 ./build/O.js

  运行 webpackcli 打包 ./build/Ol.js

  位于./build/ 文件 和 ./build/dist/ 文件 没有功能上的区别 唯一的区别是 单文件和多文件 运行和多文件运行

  _build中的Ol和O依赖于其他编译出的文件_

  _dist中O和Ol可以独立运行_

##### 关于加密的说明

  Ol.js 和 O.js 之间 的通讯 默认 使用 *aes-256-cbc* 加密

  key iv 都是固定的 

  注意 *加密不是为了通讯安全而是为了隐秘性*

  加密函数位于 ./src/encrypton.ts

  如果更改加密方法

  建议使用 被注释的 testcode 进行测试
