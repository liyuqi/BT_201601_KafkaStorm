#!/bin/bash
echo
echo '[Check 1] there are 6 PID (core,Jps,Kafka,nimbus,QuorumPeerMain,supervisor):';jps
echo
echo '[Check 2] fluentd alive info is an object => {"plugins":[...]}:';curl http://localhost:24220/api/plugins.json
echo  
echo 
