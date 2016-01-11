# 最後修改於 20150108

此開發環境改編自 Krilo 的 2016 BT RealTime:
差異
1. storm 降版到 apache-storm-0.9.4
2. 安裝 fluentd, mongo, linux常用套件, sudo apt-get install python-virtualenv


新增Box:
vagrant box add bt2016realtime package_20150108.box

Apache Storm: apache-storm-0.9.4.tar  (注意:跟 Krilo box 版本不一樣)
Apache Kafka: kafka_2.11-0.9.0.0.tgz [https://www.apache.org/dyn/closer.cgi?path=/kafka/0.9.0.0/kafka_2.10-0.9.0.0.tgz]
Zookeeper: zookeeper-3.4.7.tar.gz

所有套件安裝於 /realtime 下
-------------------------------
預設使用 host-only ip:172.28.128.22
pwd:vagrant

* ip 若有改，修正
/realtime/apache-storm-0.10.0/conf/storm.yml
中的ip相關。

進入後執行 . storm_start.sh

-------------------------------
使用jps指令看是否Storm 啟用：
4053 QuorumPeerMain (zookeeper)
4013 nimbus
4015 core
4014 supervisor
4383 Jps

run first example:
cd /realtime/apache-storm-0.10.0/examples
storm jar storm-starter-*.jar storm.starter.RollingTopWords

-------------------------------
使用jps指令看是否Kafka 啟用 (沒有啟動 storm)：
5303 Jps
5209 Kafka
5221 QuorumPeerMain

------------------------------
Q1. vagrant up 的時候出現錯誤訊息如下:
default: Waiting for machine to boot. This may take a few minutes...
default: SSH address: 127.0.0.1:2222
default: SSH username: vagrant
default: SSH auth method: private key
default: Warning: Remote connection disconnect. Retrying...
default: Warning: Authentication failure. Retrying...

造成無法使用 synced_folder "shell"

A1. 解決方法如下:
Ctrl + C 中斷後
仍然可以 ssh 進去  (此時的網路配置 config.vm.network :private_network, ip: "172.28.128.22", adapter: 2)

執行下列指令
echo "ssh-rsa AAAAB3NzaC1yc2EAAAABIwAAAQEA6NF8iallvQVp22WDkTkyrtvp9eWW6A8YVr+kz4TjGYe7gHzIw+niNltGEFHzD8+v1I2YJ6oXevct1YeS0o9HZyN1Q9qgCgzUFtdOKLv6IedplqoPkcmF0aYet2PkEDo3MlTBckFXPITAMzF8dJSIFo9D8HfdOV0IAdx4O7PtixWKn5y2hMNG0zQPyUecp4pzC6kivAIhyfHilFR61RGL+GPXQ2MWZWFYbAGjyiYJnAmCP3NOTd0jMZEnDkbUvxhMmBYSdETk1rRgm+R4LOzFUGaHqHDLKLX+FIPKcF96hrucXzcWyLbIbEgE98OHlnVYCzRdK8jlqm8tehUc9c9WhQ== vagrant insecure public key" > .ssh/authorized_keys

重新 vagrant up ( reload )  成功
進入後，可以使用 synced_folder "shell"

Q2. 指令 mongo 的時候出現錯誤訊息如下
Failed global initialization: BadValue Invalid or no user locale set. Please ensure LANG and/or LC_* environment variables are set correctly

A2. 解決方法如下:
指令 export LC_ALL=C
