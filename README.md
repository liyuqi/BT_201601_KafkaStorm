# BT_201503_Syslog
BT_201503_Syslog

### 前置準備

下載BT_201503_Syslog資源

```bash 
$ git clone https://github.com/liyuqi/BT_201503_Syslog
```


安裝node_module套件

```bash 
$ sudo npm install
```


開啟mongod，預設27017 port

```bash 
$ mongod
```

修改mongodb設定

```sh
$ vi ./setting.js    # 替換連線DB
```

```js
module.exports = {
	cookie_secret : 'secret_meteoric',
  	db : 'test',
  	host : '192.168.0.190',
	port : 27017
};
```

```sh
$ vi ./app.js       # 替換連線DB
```

```js
var dbfluentd = monk('192.168.0.190/test');
```

### 開始使用SYSLOG CRUD功能

開啟app

```bash
$ node app.js
```

### Log part

新增 Log
![Image text](https://github.com/liyuqi/BT_201503_Syslog/blob/master/example/syslog_CRUD_insert.png)

查詢 Log
![Image text](https://github.com/liyuqi/BT_201503_Syslog/blob/master/example/syslog_CRUD_query.png)

顯示 Log
![Image text](https://github.com/liyuqi/BT_201503_Syslog/blob/master/example/syslog_CRUD_query_result.png)

最新 Log
![Image text](https://github.com/liyuqi/BT_201503_Syslog/blob/master/example/syslog_CRUD_show_pagging.png)

### Alert part

設定 Alert
![Image text](https://github.com/liyuqi/BT_201503_Syslog/blob/master/example/syslog_ALERT_insert.png)

列表 Alert
![Image text](https://github.com/liyuqi/BT_201503_Syslog/blob/master/example/syslog_ALERT_list.png)

顯示 Alert (60sec)
![Image text](https://github.com/liyuqi/BT_201503_Syslog/blob/master/example/syslog_ALERT_display.png)

流量 Alert
![Image text](https://github.com/liyuqi/Syslog0130/blob/master/example/syslog_ALERT_event.png)
