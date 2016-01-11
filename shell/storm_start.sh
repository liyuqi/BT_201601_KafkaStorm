#! /bin/bash
echo "進入到VM後啟動daemon......"

# 已設定環境變數
# sudo nano /etc/profile
# =========================================================
# export JAVA_HOME=/usr/lib/jdk
# export JRE_HOME=/usr/lib/jdk/jre
# export STORM_HOME=/realtime/apache-storm-0.9.4
# export ZK_HOME=/realtime/zookeeper-3.4.7
# export KAFKA_HOME=/realtime/kafka_2.11-0.9.0.0
# export PATH=$PATH:$JAVA_HOME/bin:$JAVA_HOME/jre/bin:$STORM_HOME/bin:$ZK_HOME/bin:$KAFKA_HOME/bin

# 啟動 zookeeper 方式1 
zkServer.sh start

# 啟動 zookeeper 方式2 (kafka內建的zk)
# /realtime/kafka_2.11-0.9.0.0/bin/zookeeper-server-start.sh /realtime/kafka_2.11-0.9.0.0/config/zookeeper.properties & 

# 啟動 kafka
kafka-server-start.sh /realtime/kafka_2.11-0.9.0.0/config/server.properties &

# 啟動 Storm
storm nimbus &
storm supervisor &
storm ui &


# [Kafka] Verify Test
# Step 1: Create a topic       # fluentd 寫入的話，會自己 Create。
# kafka-topics.sh --create --zookeeper localhost:2181 --replication-factor 1 --partitions 1 --topic test
# kafka-topics.sh --list --zookeeper localhost:2181

# Step 2: Send some messages
# kafka-console-producer.sh --broker-list localhost:9092 --topic test
# This is a message
# This is another message

# Step 3: Start a consumer (取資料)
# kafka-console-consumer.sh --zookeeper localhost:2181 --topic test --from-beginning
