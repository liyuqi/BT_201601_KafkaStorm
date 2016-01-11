from pykafka import KafkaClient
client = KafkaClient(hosts="127.0.0.1:9092")
print("%s" % client.topics)
topic = client.topics['test']
consumer = topic.get_balanced_consumer(consumer_group="exp1",
                                       zookeeper_connect='127.0.0.1:2181',
                                       consumer_timeout_ms=500,
                                       auto_commit_enable=False)

cursor = 0
for message in consumer:
    if message is not None:
        print message.offset, message.value
    else:
        print "no more message"
        break
    cursor += 1
    if cursor > 500:
        break
#consumer.commit_offsets()
