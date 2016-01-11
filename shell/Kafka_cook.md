Table of Contents

# 0: Enviroment setting

## UC3 exec
> vagrant reload
> vagrant up
> vagrant ssh
$ bash storm_start.sh # 啟動 kafka + zookeeper + storm
$ virtualenv --copy
$ source source petrel_env/bin/activate # 啟動python虛擬環境
$  sh petrel_exp2/run.sh  # 執行腳本

## Kafka test

### env
.jmx script
	*Ref [https://blazemeter.com/blog/building-jms-testing-plan-apache-jmeter]
	*Ref [http://www.technix.in/load-testing-apache-kafka-using-kafkameter/]
	*Ref [http://liveramp.com/engineering/kafka-0-8-producer-performance-2/]

### params
broker
partition
producer
consumer

### exam
$ jps #> kafka ?

# 1: INITIATING KAFKA 初始

##	1.1 Introduction

Kafka是一種分散式的消息發布和訂閱系統，具有高效能和高吞吐綠的特色。

[http://kafka.apache.org/images/producer_consumer.png]


消息的发布（publish）称作producer，消息的订阅（subscribe）称作consumer，中间的存储阵列称作broker。

　　多个broker协同合作，producer、consumer和broker三者之间通过zookeeper来协调请求和转发。

　　producer产生和推送(push)数据到broker，consumer从broker拉取(pull)数据并进行处理。

　　broker端不维护数据的消费状态，提升了性能。

　　直接使用磁盘进行存储，线性读写，速度快：避免了数据在JVM内存和系统内存之间的复制，减少耗性能的创建对象和垃圾回收。

replica 相當於 
partition 相當於 shard
broker 相當於 mongod
message:value 訊息

##	1.2 Setting up multiple Kafka brokers

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


##	1.3 Creating topics
##	1.4 Sending some messages from the console
##	1.5 Consuming from the console



# ----------------------------------------

# 2: CONFIGURING BROKERS
	Introduction
	Configuring the basic settings
	Configuring threads and performance
	Configuring the log settings
	Configuring the replica settings
	Configuring the ZooKeeper settings
	Configuring other miscellaneous parameters
# 3: CONFIGURING A PRODUCER AND CONSUMER
	Introduction
	Configuring the basic settings for producer
	Configuring the thread and performance for producer
	Configuring the basic settings for consumer
	Configuring the thread and performance for consumer
	Configuring the log settings for consumer
	Configuring the ZooKeeper settings for consumer
	Other configurations for consumer
# 4: MANAGING KAFKA
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
# 5: INTEGRATING KAFKA WITH JAVA
	Introduction
	Writing a simple producer
	Writing a simple consumer
	Writing a high-level consumer
	Writing a producer with message partitioning
	Multithreaded consumers in Kafka
# 6: OPERATING KAFKA
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
# 7: INTEGRATING KAFKA WITH THIRD-PARTY PLATFORMS
	Introduction
	Using Flume
	Using Gobblin
	Using Logstash
	Configuring Kafka for real-time
	Integrating Spark with Kafka
	Integrating Storm with Kafka
	Integrating Elasticsearch with Kafka
	Integrating SolrCloud with Kafka
# 8: MONITORING KAFKA
	Introduction
	Monitoring server stats
	Monitoring producer stats