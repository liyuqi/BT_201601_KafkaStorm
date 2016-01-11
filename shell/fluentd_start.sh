#!/bin/bash
# 輸入 Fluentd => Kafka 成功
sudo nohup /opt/td-agent/embedded/bin/fluentd -c /home/vagrant/fluentd/test/fm01.conf --log /home/vagrant/fluentd/log/fm01.log -d /home/vagrant/fluentd/pid/fm01.pid  &> /home/vagrant/fluentd/log/nohup01.out  

# 輸出 Kafka => Fluentd 失敗 (Failed to connect to localhost:9092)
# sudo nohup /opt/td-agent/embedded/bin/fluentd -c /home/vagrant/fluentd/test/fm02.conf --log /home/vagrant/fluentd/log/fm02.log -d /home/vagrant/fluentd/pid/fm02.pid  &> /home/vagrant/fluentd/log/nohup02.out  

# 測試 Files => Fluentd => Files/MongoDB
# sudo nohup /opt/td-agent/embedded/bin/fluentd -c /home/vagrant/fluentd/test/fm03.conf --log /home/vagrant/fluentd/log/fm03.log -d /home/vagrant/fluentd/pid/fm03.pid  &> /home/vagrant/fluentd/log/nohup03.out
