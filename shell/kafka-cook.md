## 0: Enviroment setting

### 0.1 UC3 exec
    vagrant reload
    vagrant up
    vagrant ssh
```bash
$ bash storm_start.sh # 啟動 kafka + zookeeper + storm
$ virtualenv --copy
$ source source petrel_env/bin/activate # 啟動python虛擬環境
$  sh petrel_exp2/run.sh  # 執行腳本
```

#### 0.2 Kafka test

#### 0.3 env
    .jmx script
    Ref [https://blazemeter.com/blog/building-jms-testing-plan-apache-jmeter]
    Ref [http://www.technix.in/load-testing-apache-kafka-using-kafkameter/]
    Ref [http://liveramp.com/engineering/kafka-0-8-producer-performance-2/]

#### 0.4 params
    broker
    partition
    producer
    consumer

### 0.5 exam
$ jps #> kafka ?

-----

## 1.initialize kafka
    replica 相當於
    partition 相當於 shard
    broker 相當於 mongod
    message:value 訊息

### [Kafka] Verify Test
* Step 1: Create a topic       # fluentd 寫入的話，會自己 Create。
kafka-topics.sh --create --zookeeper localhost:2181 --replication-factor 1 --partitions 1 --topic test
kafka-topics.sh --list --zookeeper localhost:2181

* Step 2: Send some messages
kafka-console-producer.sh --broker-list localhost:9092 --topic test
This is a message
This is another message

* Step 3: Start a consumer (取資料)
kafka-console-consumer.sh --zookeeper localhost:2181 --topic test --from-beginning

### 1.1 設定 Broker

### 1.2 建立 topic
* 建立 topic:kafkatest
`kafka-topics.sh --create --ZooKeeper localhost:2181 -replication-factor 1 --partitions 1 --topic kafkatest`
* 查看 topic:kafkatest
`kafka-topics.sh --list --ZooKeeper localhost:2181 kafkatest`
* 描述 topic:kafkatest
`kafka-topics.sh --describe --ZooKeeper localhost:2181 --topic kafkatest`
* 建立 rs topic
`kafka-topics.sh --create --ZooKeeper localhost:2181 -replication-factor 3 --partitions 1 --topic rskafka`
* 描述 rs topic
`kafka-topics.sh --describe --ZooKeeper localhost:2181 --topic rskafka`

>Topic:replicatedkafkatest
>PartitionCount:1
>ReplicationFactor:3
>Configs:
>
>Topic:	replicatedkafkatest
>Partition:	0
>Leader:	2
>Replicas:	2,0,1
>Isr:	2,0,1

describe   資訊說明             |description
--- | ---
PartitionCount | 某topic下partition的數量
ReplicationFactor | 某topic下replicas的數量
Leader | 指定的partition中負責RW操作的node(server)
Replicas | 有replica的node(server)清單，含有dead
ISR | in-sync replica的node(server)清單，kafka cluster中 replica nodes的subset

### 1.3 produce message

* 發布 msg
`kafka-console-producer.sh --broker-list localhost:9092 --topic kafkatest`
    > line 1 hello
    > line 2 helloo

param   參數說明             |description        |sample
--- | --- | ---
--broker-list               |zookeeper servers  |hostname:port
--topic                     |topic 名稱          |kafkatest
--sync                      |指定傳送方式(同步)
--compression-codec         |壓縮方式            |none,default:gzip,snappy,lz4
--batch-size                |非sync時的傳送
--message-send-max-retries  |broker無回應時,重傳數
--retry-backoff-ms          |leader重選的初始時間

### 1.4 consume message
* 訂閱 msg
`kafka-console-consumer.sh --zookeeper localhost:2181 --topic	kafkatest --from-beginning`
    > line 1 hello
    > line 2 helloo

param   參數說明p81          |description    |sample
--- | --- | ---
--fetch-size                |   訂閱byte量
--socket-buffer-size        |TCP接收byte量
--autocommit.interval.ms    |offset保留時間
--max-messages              |               |default:無限大
--skip-message-on-error     |               |default:直接skip

### 1.5 params

properties | default value | description
--- | --- | ---
broker.id | 0 | 多个Kafka服务不能相同
port|9092|KAFKA绑定的端口
zookeeper.connect|localhost:2181|ZooKeeper的连接URL
zookeeper.connection.timeout.ms|1000000|ZooKeeper的超时连接时间
>`host.name=HDP125	无	主机名`
>`advertised.host.name	HDP125`
>`advertised.port	9092`
num.network.threads	2
num.io.threads	8
socket.send.buffer.bytes	1048576
socket.receive.buffer.bytes	1048576
socket.request.max.bytes	104857600
num.partitions	2
>`log.flush.interval.messages	10000`
>`log.flush.interval.ms	1000`
log.retention.hours	168
>`log.retention.bytes	1073741824`
log.segment.bytes	536870912
log.retention.check.interval.ms	60000
log.cleaner.enable	false


# Apache Kafka Cookbook, Saurabh Minni, 2015-12
-----

Table of Contents

### 1: INITIATING KAFKA
    Introduction
    Setting up multiple Kafka brokers
    Creating topics
    Sending some messages from the console
    Consuming from the console
### 2: CONFIGURING BROKERS
    Introduction
    Configuring the basic settings
    Configuring threads and performance
    Configuring the log settings
    Configuring the replica settings
    Configuring the ZooKeeper settings
    Configuring other miscellaneous parameters
### 3: CONFIGURING A PRODUCER AND CONSUMER
    Introduction
    Configuring the basic settings for producer
    Configuring the thread and performance for producer
    Configuring the basic settings for consumer
    Configuring the thread and performance for consumer
    Configuring the log settings for consumer
    Configuring the ZooKeeper settings for consumer
    Other configurations for consumer
### 4: MANAGING KAFKA
    Introduction
    Consumer offset checker
    Understanding dump log segments
    Exporting the ZooKeeper offsets
    Importing the ZooKeeper offsets
    Using GetOffsetShell
    Using the JMX tool
    Using the Kafka migration tool
    The MirrorMaker tool
    Replay Log Producer
    Simple Consumer Shell
    State Change Log Merger
    Updating offsets in Zookeeper
    Verifying consumer rebalance
### 5: INTEGRATING KAFKA WITH JAVA
    Introduction
    Writing a simple producer
    Writing a simple consumer
    Writing a high-level consumer
    Writing a producer with message partitioning
    Multithreaded consumers in Kafka
### 6: OPERATING KAFKA
    Introduction
    Adding and removing topics
    Modifying topics
    Implementing a graceful shutdown
    Balancing leadership
    Mirroring data between Kafka clusters
    Expanding clusters
    Increasing the replication factor
    Checking the consumer position
    Decommissioning brokers
### 7: INTEGRATING KAFKA WITH THIRD-PARTY PLATFORMS
    Introduction
    Using Flume
    Using Gobblin
    Using Logstash
    Configuring Kafka for real-time
    Integrating Spark with Kafka
    Integrating Storm with Kafka
    Integrating Elasticsearch with Kafka
    Integrating SolrCloud with Kafka
### 8: MONITORING KAFKA
    Introduction
    Monitoring server stats
    Monitoring producer stats
