# BT_201601_KafkaStorm
BT_201601_KafkaStorm

### OS 環境準備

* 準備nodejs環境 ^0.10.35

```bash
$ sudo add-apt-repository ppa:chris-lea/node.js
$ sudo apt-get update
$ sudo apt-get install nodejs
$ node -v             #^0.10.35
```

### nodejs 安裝套件

* 下載此文件 BT_201601_KafkaStorm

```bash 
$ git clone https://github.com/liyuqi/BT_201601_KafkaStorm
$ cd BT_201601_KafkaStorm
$ sudo npm install
```

### nodejs 修改mongodb設定

* 修改 seeting.js

```sh
$ vi ./setting.js    # 替換連線DB
```

```js
module.exports = {
  	db : 'cep_storm',
  	host : '172.28.128.22',
	port : 27017
};
```

* 修改 app.js

```sh
$ vi ./app.js       # 替換連線DB
```

```js
var dbfluentd = monk('172.28.128.22/cep_storm');
```

### 開始使用 介面

* 開啟app

```bash
$ node app.js
```

### Log part

顯示 Log
![Image text](https://github.com/liyuqi/BT_201503_Syslog/blob/master/example/syslog_CRUD_query_result.png)