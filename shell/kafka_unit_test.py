# -*- coding: utf-8 -*-

from kafka import KafkaConsumer
from kafka import SimpleProducer, KafkaClient
import logging

"""
logging.basicConfig(
    format='%(asctime)s.%(msecs)s:%(name)s:%(thread)d:%(levelname)s:%(process)d:%(message)s',
    level=logging.DEBUG
)
"""

# To send messages synchronously
kafka = KafkaClient('localhost:9092')
producer = SimpleProducer(kafka)

# Note that the application is responsible for encoding messages to type bytes
producer.send_messages(b'mytopic', b'some message')
producer.send_messages(b'mytopic', b'this method', b'is variadic')

print("=====producer sent=====")

consumer = KafkaConsumer('mytopic', bootstrap_servers=['localhost:9092'])
print("consumer created")

with open("test_log", "w") as test_log:
    cursor = 0
    for messate in consumer:
    	print("mark")
        if cursor > 10:
            break
        test_log.write("%s:%d:%d: key=%s value=%s\n" % [message.topic, message.partition,
                                                        message.offset, message.key,
                                                        message.value])

print("=====different iterate way=====")


producer.send_messages(b'mytopic', b'some message')
producer.send_messages(b'mytopic', b'this method', b'is variadic')

with open("test_log", "a") as test_log:
    cursor = 0
    for message in consumer.fetch_messages():
    	print("mark")
        if cursor > 10:
            break
        cursor += 1
        test_log.write("%s:%d:%d: key=%s value=%s\n" % [message.topic, message.partition,
                                                        message.offset, message.key,
                                                        message.value])