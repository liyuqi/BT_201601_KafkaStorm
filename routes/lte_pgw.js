/**
 * Created by Yuqi on 2015/2/16.
 */
/*** Created by Yuqi on 2015/1/21.
 *
 */
// var mongodb = require('../models/db.js');

var fs = require('fs');
var util = require('util');

var exec = require('child_process').exec;
var ps;

var _pageunit = 10;
_max_pageunit = 10;
_statInterval = 5*60*1000;

var query = {
    COUNTY:''
};

var page = 1;

exports.index = function(req, res){
    res.render('lte_pgw_raw_query', { title: 'lte query', resp : false});
};

exports.cdr_CRUD_show_pagging = function (mongodb) {
    return function (req, res) {
        var page = req.query.p ? parseInt(req.query.p) : 1;

        var collection = mongodb.get('lte_pgw_exp');
        collection.count({}, function (err, count) {
            collection.find({}, //{/*limit: 20,*/ sort: {_id: -1}}, function (e, docs) {
                {skip : (page - 1) * 20,limit : 20,sort : { timestamp : -1 }}, function (e, docs) {
                    // console.log("docs data : "+util.inspect(docs));
                    var docdetail;
                    if (docs.length == 1) docdetail = util.inspect(docs);
                    res.render('sys_CRUD_show', {
                        title: 'logs',
                        totalcount: count,
                        resp: docs,
                        logdetail: docdetail,
                        page: page,
                        pageTotal: Math.ceil(docs.length / 20),
                        isFirstPage: (page - 1) == 0,
                        isLastPage: ((page - 1) * 20 + docs.length) == docs.length
                    });
                });
        });
    };
};

exports.lte_pgw_raw_show = function(mongodb){
    return function(req, res) {
        var collection = mongodb.get('lte_pgw_raw');
        collection.count({},function(err, count) {
            if(err) res.redirect('lte_pgw_raw_query');
            //console.log(format("count = %s", count));
            res.render('lte_pgw_raw_query', {
                title: 'cdr',
                totalcount : count,
                resp :null,
                query:{},
                page:1,
                isFirstPage: (page - 1) == 0,
                isLastPage: ((page - 1) * _pageunit + count) == count
            });
        });
    };
};

exports.lte_pgw_raw_query = function(mongodb){
    return function(req, res) {
        var page = req.body.page ? parseInt(req.body.page) : 1;
        //field input

        var query = {};

        // mongo query string
        for (var key in req.body){
            if(req.body[key].length==0);
            else {
                switch(key){
                    case 'page':break;
                    case 'DATE_T0':break;
                    case 'DATE_T1':break;
                    default:
                        query[key] = req.body[key].trim();
                }
                //if(isDate(new Date(req.body['DATE_T0'])) && isDate(new Date(req.body['DATE_T1']))) {
                if((new Date(req.body['DATE_T0']))!='Invalid Date' ) {
                    query['RECORD_OPENING_TIME'] = {
                        $gte: (new Date(req.body['DATE_T0']))
                    };
                }
                if((new Date(req.body['DATE_T1']))!='Invalid Date' ) {
                    query['RECORD_OPENING_TIME'] = {
                        $lte: (new Date(req.body['DATE_T1']))
                    };
                }
                if((new Date(req.body['DATE_T0']))!='Invalid Date' && (new Date(req.body['DATE_T1']))!='Invalid Date' ) {
                    query['RECORD_OPENING_TIME'] = {
                        $gte: (new Date(req.body['DATE_T0'])),
                        $lte: (new Date(req.body['DATE_T1']))
                    };
                }
            }
        }

        console.log(util.inspect(query));

        var keys = [];
        for(var k in query) keys.push(k);

        if(keys.length==0)
            res.redirect('lte_pgw_raw_query');

        // lte aggregate
        var collection = mongodb.get('lte_pgw_raw');
        collection.count({},function(err,db_count){
            collection.count(query, function (err, query_count) {
                collection.find(query, //{limit: _pageunit}, function (err, docs) {
                    {skip : (page - 1) * _pageunit,limit : _pageunit,sort : { _id : -1 }}, function (e, docs) {
                        if(e) res.redirect('lte_pgw_raw_query');
                        //if (docs.length) console.log('docs.length: ' + docs.length);
                        res.render('lte_pgw_raw_query', {
                                title: 'query lte',
                                db_count: db_count,
                                query_count:query_count,
                                totalcount: db_count,
                                query:req.body,
                                //page_count:docs.length,
                                resp: docs,
                                page: page,
                                pageTotal: Math.ceil(docs.length / _pageunit),
                                isFirstPage: (page - 1) == 0,
                                isLastPage: ((page - 1) * _pageunit + docs.length) == docs.length
                            }
                        );
                        //if (err) res.redirect('cdr_CRUD_query');
                    });
            });
        });
    };
};

// 統計
exports.lte_pgw_agg_query = function (mongodb) {
    return function(req, res) {
        var collection = mongodb.get('pgw_report_unit');
        collection.count({},function(err, count) {
            if(err) res.redirect('lte_pgw_agg_stat');
            //console.log(format("count = %s", count));
            res.render('lte_pgw_agg_stat', {
                title: 'stat',
                totalcount : count,
                resp :null,
                query:{},
                page:1,
                isFirstPage: (page - 1) == 0,
                isLastPage: ((page - 1) * _pageunit + count) == count
            });
        });
    };
};


exports.lte_pgw_agg_stat = function(mongodb){
    return function(req, res) {

        var page = req.body.page ? parseInt(req.body.page) : 1;
        //field input
        var query = {};

        // mongo query string
        for (var key in req.body){
            if(req.body[key].length==0);
            else {
                switch(key){
                    case 'page':break;
                    case 'DATE_T0': break;
                    case 'DATE_T1': break;
                    default:
                        query[key] = req.body[key].trim();
                }
                if((new Date(req.body['DATE_T0']))!='Invalid Date' ) {
                    query['RECORD_OPENING_TIME'] = {
                        $gte: (new Date(req.body['DATE_T0']))
                    };
                }
                if((new Date(req.body['DATE_T1']))!='Invalid Date' ) {
                    query['RECORD_OPENING_TIME'] = {
                        $lte: (new Date(req.body['DATE_T1']))
                    };
                }
                if((new Date(req.body['DATE_T0']))!='Invalid Date' && (new Date(req.body['DATE_T1']))!='Invalid Date' ) {
                    query['RECORD_OPENING_TIME'] = {
                        $gte: (new Date(req.body['DATE_T0'])),
                        $lte: (new Date(req.body['DATE_T1']))
                    };
                }
            }
        }

        console.log(util.inspect(query));

        var keys = [];
        for(var k in query) keys.push(k);

        if(keys.length==0)
            res.redirect('lte_pgw_agg_stat');

        var agg_pipe_match = {	$match:query };

        var agg_pipe_group = { $group:{
            _id: {
                DATE    :"$DATE"
                ,HOUR    :"$HOUR"
                ,SIM_TYPE:"$SIM_TYPE"
                ,NETWORK :"$NETWORK"
                //,BAND    :"$BAND"
                //,COUNTY  :"$COUNTY"
                //,DISTRICT:"$DISTRICT"
            }
            ,TOTAL_UPLINK: {$sum: "$TOTAL_UPLINK"}
            ,TOTAL_DOWNLINK: {$sum: "$TOTAL_DOWNLINK"}
            ,TOTAL_DURATION: {$sum: "$TOTAL_DURATION"}
            //,UNIQUE_MSISDN: {$addToSet: "$SERVED_MSISDN"}
        }};

        var agg_pipe_pro_en = {	$project: {
            _id: 1
            //,DATE    :"$_id.DATE"
            //,SIM_TYPE:"$_id.SIM_TYPE"
            //,NETWORK :"$_id.NETWORK"
            //,BAND    :"$_id.BAND"
            //,COUNTY  :"$_id.COUNTY"
            //,DISTRICT:"$_id.DISTRICT"

            ,TOTAL_UPLINK: 1
            ,TOTAL_DOWNLINK: 1
            ,TOTAL_LINK: {$add:["$TOTAL_UPLINK","$TOTAL_DOWNLINK"]}
            ,TOTAL_DURATION: 1
            //,UNIQUE_MSISDN_CN: {$size:"$UNIQUE_MSISDN"}
        }};

        //var agg_pipe_group = {	$group: {
        //    _id: {	HOUR:"$HOUR" },
        //    TOTAL_UPLINK: {$sum:"$TOTAL_UPLINK"},
        //    TOTAL_DOWNLINK: {$sum:"$TOTAL_DOWNLINK"},
        //    TOTAL_DURATION: {$sum:"$TOTAL_DURATION"}
        //}};
        //
        //var agg_pipe_pro_en = {	$project: {
        //    _id: false,
        //    HOUR: "$_id.HOUR",
        //    TOTAL_UPLINK: 1,
        //    TOTAL_DOWNLINK: 1,
        //    TOTAL_DURATION: 1
        //}};


        //{skip : (page - 1) * _pageunit,limit : _pageunit,sort : { _id : -1 }
        var agg_pipe_pro_zh = {};
        var agg_pipe_sort = {$sort : {	"_id.DATE": 1,"_id.HOUR":1	} };
        var agg_pipe_skip = {$skip:(page - 1) * _pageunit};
        //var agg_pipe_limit = {$limit:_pageunit};

        var agg_pipe_limit = {$limit:100};
        var agg_pipe_out = {$out:"lte_pgw_agg_"+'stat'};

        var agg_pipes = [
            agg_pipe_match
            ,agg_pipe_group
            ,agg_pipe_pro_en
            //,agg_pipe_pro_zh
            ,agg_pipe_sort
            //,agg_pipe_skip
            //,agg_pipe_limit
            //,agg_pipe_out
        ];

        var T = new Date();
        var T_string = T.toLocaleTimeString().split(':').join('').substr(0,4);
        var query_time = '' + T.getFullYear() + '-' + T.getMonth() + T.getDate() + 'T' + T_string;


        //console.log(util.inspect(agg_pipes));
        var page = req.body.page ? parseInt(req.body.page) : 1;
        var collection = mongodb.get('lte_pgw_raw');
        //collection.col.aggregate(agg_pipes,{limit:100}, function(err, result) {
        collection.col.aggregate(agg_pipes, { allowDiskUse: true}, function(err, result) {
            if(err) //res.redirect('cdr_3g_site_query');
                console.log("err : "+err.trace());
            //if(result) console.log("result : "+util.inspect(result));
            //jsonexport(result,{rowDelimiter: ','}, function(err, csv) {
            //    if (err) return console.log(err);
            //    //console.log(csv);
            //
            //    fs.writeFile('./stat/D1_' + query_time + '.csv', csv, function (err) {
            //        return console.log(err);
            //    });
            //});
            //res.render('cdr_3g_site_show', {
            res.render('lte_pgw_agg_stat', {
                    title: 'stat lte4g',
                    //db_count: db_count,
                    query:req.body,
                    totalcount: result.length,
                    //page_count:docs.length,
                    resp: result,
                    page: page,
                    pageTotal: Math.ceil(result.length / _pageunit),
                    isFirstPage: (page - 1) == 0,
                    isLastPage: ((page - 1) * _pageunit + result.length) == result.length
                }
            );
        });
    };
};
/*
exports.lte_pgw_agg_stat1 = function(mongodb){
    return function(req, res) {

        var page = req.body.page ? parseInt(req.body.page) : 1;
        //field input
        var query = {};

        // mongo query string
        for (var key in req.body){
            if(req.body[key].length==0);
            else {
                switch(key){
                    case 'page':break;
                    case 'USER':break;
                    case 'DATE_T0': break;
                    case 'DATE_T1': break;
                    default:
                        query[key] = req.body[key].trim();
                }
                if((new Date(req.body['DATE_T0']))!='Invalid Date' ) {
                    query['UNIT_TIME'] = {
                        $gte: (new Date(req.body['DATE_T0']))
                    };
                }
                if((new Date(req.body['DATE_T1']))!='Invalid Date' ) {
                    query['UNIT_TIME'] = {
                        $lte: (new Date(req.body['DATE_T1']))
                    };
                }
                if((new Date(req.body['DATE_T0']))!='Invalid Date' && (new Date(req.body['DATE_T1']))!='Invalid Date' ) {
                    query['UNIT_TIME'] = {
                        $gte: (new Date(req.body['DATE_T0'])),
                        $lte: (new Date(req.body['DATE_T1']))
                    };
                }
            }
        }

        console.log(util.inspect(query));

        var keys = [];
        for(var k in query) keys.push(k);

        if(keys.length==0)
            res.redirect('lte_pgw_agg_stat1');

        var agg_pipe_match = {	$match:query };

        var agg_pipe_group = { $group:{
            _id: {
                DATE    :"$DATE"
                ,HOUR    :"$HOUR"
                ,SIM_TYPE:"$SIM_TYPE"
                //,NETWORK :"$NETWORK"
                //,BAND    :"$BAND"
                //,COUNTY  :"$COUNTY"
                //,DISTRICT:"$DISTRICT"
            }
            ,TOTAL_UPLINK: {$sum: "$TOTAL_UPLINK"}
            ,TOTAL_DOWNLINK: {$sum: "$TOTAL_DOWNLINK"}
            ,TOTAL_DURATION: {$sum: "$TOTAL_DURATION"}
            ,UNIQUE_MSISDN: {$addToSet: "$UNIQUE_MSISDN"}
        }};

        var agg_pipe_pro_en = {	$project: {
            _id: 1
            //,DATE    :"$_id.DATE"
            //,SIM_TYPE:"$_id.SIM_TYPE"
            //,NETWORK :"$_id.NETWORK"
            //,BAND    :"$_id.BAND"
            //,COUNTY  :"$_id.COUNTY"
            //,DISTRICT:"$_id.DISTRICT"

            ,TOTAL_UPLINK: 1
            ,TOTAL_DOWNLINK: 1
            ,TOTAL_LINK: {$add:["$TOTAL_UPLINK","$TOTAL_DOWNLINK"]}
            ,TOTAL_DURATION: 1
            ,UNIQUE_MSISDN_CN: {$size:"$UNIQUE_MSISDN"}
        }};

        //{skip : (page - 1) * _pageunit,limit : _pageunit,sort : { _id : -1 }
        var agg_pipe_pro_zh = {};
        var agg_pipe_sort = {$sort : {	"_id.DATE": 1	} };
        var agg_pipe_skip = {$skip:(page - 1) * _pageunit};
        //var agg_pipe_limit = {$limit:_pageunit};

        var agg_pipe_limit = {$limit:100};
        var agg_pipe_out = {$out:"lte_pgw_agg_"+'stat'};

        var agg_pipes = [
            agg_pipe_match
            ,agg_pipe_group
            ,agg_pipe_pro_en
            //,agg_pipe_pro_zh
            ,agg_pipe_sort
            //,agg_pipe_skip
            //,agg_pipe_limit
            //,agg_pipe_out
        ];

        var T = new Date();
        var T_string = T.toLocaleTimeString().split(':').join('');
        var query_time = '' + T.getFullYear() + '-' + T.getMonth() + T.getDate() + 'T' + T_string;
        var filename1 = './stat/'+req.body.USER+'/' + query_time + '_D1' +'.csv';
        //var filename1 = './stat/' + query_time + '_D1.csv';

        //console.log(util.inspect(agg_pipes));
        var page = req.body.page ? parseInt(req.body.page) : 1;
        var collection = mongodb.get('pgw_report_unit');
        //collection.col.aggregate(agg_pipes,{limit:100}, function(err, result) {
        collection.col.aggregate(agg_pipes, { allowDiskUse: true},function(err, result) {
            if(err) //res.redirect('cdr_3g_site_query');
                console.log("err : "+err);
            //if(result) console.log("result : "+util.inspect(result));
            jsonexport(result,{rowDelimiter: ','}, function(err, csv) {
                if (err) return console.log(err);
                //console.log(csv);

                fs.writeFile(filename1, csv, function (err) {
                    //return console.log(err);
                    if(err) console.log(err);
                    res.render('lte_pgw_agg_stat1', {
                            title: 'stat lte4g',
                            //db_count: db_count,
                            query:req.body,
                            totalcount: result.length,
                            //page_count:docs.length,
                            filenames:filename1,
                            resp: result,
                            page: page,
                            pageTotal: Math.ceil(result.length / _pageunit),
                            isFirstPage: (page - 1) == 0,
                            isLastPage: ((page - 1) * _pageunit + result.length) == result.length
                        }
                    );
                });
            });
            //res.render('cdr_3g_site_show', {
            //res.render('lte_pgw_agg_stat1', {
            //        title: 'stat lte4g',
            //        //db_count: db_count,
            //        query:req.body,
            //        totalcount: result.length,
            //        //page_count:docs.length,
            //        filename:filename1,
            //        resp: result,
            //        page: page,
            //        pageTotal: Math.ceil(result.length / _pageunit),
            //        isFirstPage: (page - 1) == 0,
            //        isLastPage: ((page - 1) * _pageunit + result.length) == result.length
            //    }
            //);
        });
    };
};

exports.lte_pgw_agg_stat2 = function(mongodb){
    return function(req, res) {

        var page = req.body.page ? parseInt(req.body.page) : 1;
        //field input
        var query = {};

        // mongo query string
        for (var key in req.body){
            if(req.body[key].length==0);
            else {
                switch(key){
                    case 'page':break;
                    case 'USER':break;
                    case 'DATE_T0': break;
                    case 'DATE_T1': break;
                    default:
                        query[key] = req.body[key].trim();
                }
                if((new Date(req.body['DATE_T0']))!='Invalid Date' ) {
                    query['UNIT_TIME'] = {
                        $gte: (new Date(req.body['DATE_T0']))
                    };
                }
                if((new Date(req.body['DATE_T1']))!='Invalid Date' ) {
                    query['UNIT_TIME'] = {
                        $lte: (new Date(req.body['DATE_T1']))
                    };
                }
                if((new Date(req.body['DATE_T0']))!='Invalid Date' && (new Date(req.body['DATE_T1']))!='Invalid Date' ) {
                    query['UNIT_TIME'] = {
                        $gte: (new Date(req.body['DATE_T0'])),
                        $lte: (new Date(req.body['DATE_T1']))
                    };
                }
            }
        }

        console.log(util.inspect(query));

        var keys = [];
        for(var k in query) keys.push(k);

        if(keys.length==0)
            res.redirect('lte_pgw_agg_stat');

        var agg_pipe_match = {	$match:query };

        var agg_pipe_group = { $group:{
            _id: {
                DATE    :"$DATE"
                //,HOUR    :"$HOUR"
                ,SIM_TYPE:"$SIM_TYPE"
                ,NETWORK :"$NETWORK"
                //,BAND    :"$BAND"
                //,COUNTY  :"$COUNTY"
                //,DISTRICT:"$DISTRICT"
                //,VENDOR  :"$VENDOR"
                //,MODEL   :"$MODEL"
            }
            ,TOTAL_UPLINK: {$sum: "$TOTAL_UPLINK"}
            ,TOTAL_DOWNLINK: {$sum: "$TOTAL_DOWNLINK"}
            ,TOTAL_DURATION: {$sum: "$TOTAL_DURATION"}
            ,UNIQUE_MSISDN: {$addToSet: "$UNIQUE_MSISDN"}
        }};

        var agg_pipe_pro_en = {	$project: {
            _id: 1
            //,DATE    :"$_id.DATE"
            //,SIM_TYPE:"$_id.SIM_TYPE"
            //,NETWORK :"$_id.NETWORK"
            //,BAND    :"$_id.BAND"
            //,COUNTY  :"$_id.COUNTY"
            //,DISTRICT:"$_id.DISTRICT"
            //,VENDOR  :"$VENDOR"
            //,MODEL   :"$MODEL"

            ,TOTAL_UPLINK: 1
            ,TOTAL_DOWNLINK: 1
            ,TOTAL_LINK: {$add:["$TOTAL_UPLINK","$TOTAL_DOWNLINK"]}
            ,TOTAL_DURATION: 1
            ,UNIQUE_MSISDN_CN: {$size:"$UNIQUE_MSISDN"}
        }};

        //{skip : (page - 1) * _pageunit,limit : _pageunit,sort : { _id : -1 }
        var agg_pipe_pro_zh = {};
        var agg_pipe_sort = {$sort : {	"_id.DATE": 1	} };
        var agg_pipe_skip = {$skip:(page - 1) * _pageunit};
        //var agg_pipe_limit = {$limit:_pageunit};

        var agg_pipe_limit = {$limit:100};
        var agg_pipe_out = {$out:"lte_pgw_agg_"+'stat'};

        var agg_pipes = [
            agg_pipe_match
            ,agg_pipe_group
            ,agg_pipe_pro_en
            //,agg_pipe_pro_zh
            //,agg_pipe_sort
            //,agg_pipe_skip
            //,agg_pipe_limit
            //,agg_pipe_out
        ];


        var T = new Date(new Date().getTime()+8*60*60*1000).toJSON();
        var T_string = T.substr(11,5).split(':').join('').substr(0,4);
        var query_time = T.substr(0,10) + 'T' + T_string;
        var filename = './stat/'+req.body.USER+'/' + query_time + '_D2' +'.csv';
        //var filename = './stat/' + query_time + '_D2.csv';

        //console.log(util.inspect(agg_pipes));
        var page = req.body.page ? parseInt(req.body.page) : 1;
        var collection = mongodb.get('pgw_report_unit');
        //collection.col.aggregate(agg_pipes,{limit:100}, function(err, result) {
        collection.col.aggregate(agg_pipes, { allowDiskUse: true}, function(err, result) {
            if(err) //res.redirect('cdr_3g_site_query');
                console.log("err : "+err);
            //if(result) console.log("result : "+util.inspect(result));
            //res.render('cdr_3g_site_show', {
            jsonexport(result,{rowDelimiter: ','}, function(err, csv) {                if (err) return console.log(err);
                fs.writeFile(filename, csv, function (err) {                    if(err) console.log(err.trace());
                    console.log(filename);
                });
            });

            res.render('lte_pgw_agg_stat2', {
                    title: 'stat lte4g',
                    //db_count: db_count,
                    query:req.body,
                    totalcount: result.length,
                    //page_count:docs.length,
                    filenames:filename,
                    resp: result,
                    page: page,
                    pageTotal: Math.ceil(result.length / _pageunit),
                    isFirstPage: (page - 1) == 0,
                    isLastPage: ((page - 1) * _pageunit + result.length) == result.length
                }
            );
        });
    };
};

exports.lte_pgw_agg_stat3 = function(mongodb){
    return function(req, res) {

        var page = req.body.page ? parseInt(req.body.page) : 1;
        //field input
        var query = {};

        // mongo query string
        for (var key in req.body){
            if(req.body[key].length==0);
            else {
                switch(key){
                    case 'page':break;
                    case 'USER':break;
                    case 'DATE_T0': break;
                    case 'DATE_T1': break;
                    default:
                        query[key] = req.body[key].trim();
                }
                if((new Date(req.body['DATE_T0']))!='Invalid Date' ) {
                    query['UNIT_TIME'] = {
                        $gte: (new Date(req.body['DATE_T0']))
                    };
                }
                if((new Date(req.body['DATE_T1']))!='Invalid Date' ) {
                    query['UNIT_TIME'] = {
                        $lte: (new Date(req.body['DATE_T1']))
                    };
                }
                if((new Date(req.body['DATE_T0']))!='Invalid Date' && (new Date(req.body['DATE_T1']))!='Invalid Date' ) {
                    query['UNIT_TIME'] = {
                        $gte: (new Date(req.body['DATE_T0'])),
                        $lte: (new Date(req.body['DATE_T1']))
                    };
                }
            }
        }

        console.log(util.inspect(query));

        var keys = [];
        for(var k in query) keys.push(k);

        if(keys.length==0)
            res.redirect('lte_pgw_agg_stat');

        var agg_pipe_match = {	$match:query };

        var agg_pipe_group = { $group:{
            _id: {
                DATE    :"$DATE"
                //,HOUR    :"$HOUR"
                ,SIM_TYPE:"$SIM_TYPE"
                ,NETWORK :"$NETWORK"
                //,BAND    :"$BAND"
                ,COUNTY  :"$COUNTY"
                //,DISTRICT:"$DISTRICT"
                //,VENDOR  :"$VENDOR"
                //,MODEL   :"$MODEL"
            }
            ,TOTAL_UPLINK: {$sum: "$TOTAL_UPLINK"}
            ,TOTAL_DOWNLINK: {$sum: "$TOTAL_DOWNLINK"}
            ,TOTAL_DURATION: {$sum: "$TOTAL_DURATION"}
            ,UNIQUE_MSISDN: {$addToSet: "$UNIQUE_MSISDN"}
        }};

        var agg_pipe_pro_en = {	$project: {
            _id: 1
            //,DATE    :"$_id.DATE"
            //,SIM_TYPE:"$_id.SIM_TYPE"
            //,NETWORK :"$_id.NETWORK"
            //,BAND    :"$_id.BAND"
            //,COUNTY  :"$_id.COUNTY"
            //,DISTRICT:"$_id.DISTRICT"
            //,VENDOR  :"$VENDOR"
            //,MODEL   :"$MODEL"

            ,TOTAL_UPLINK: 1
            ,TOTAL_DOWNLINK: 1
            ,TOTAL_LINK: {$add:["$TOTAL_UPLINK","$TOTAL_DOWNLINK"]}
            ,TOTAL_DURATION: 1
            ,UNIQUE_MSISDN_CN: {$size:"$UNIQUE_MSISDN"}
        }};

        //{skip : (page - 1) * _pageunit,limit : _pageunit,sort : { _id : -1 }
        var agg_pipe_pro_zh = {};
        var agg_pipe_sort = {$sort : {	"_id.DATE": 1	} };
        var agg_pipe_skip = {$skip:(page - 1) * _pageunit};
        //var agg_pipe_limit = {$limit:_pageunit};

        var agg_pipe_limit = {$limit:100};
        var agg_pipe_out = {$out:"lte_pgw_agg_"+'stat'};

        var agg_pipes = [
            agg_pipe_match
            ,agg_pipe_group
            ,agg_pipe_pro_en
            //,agg_pipe_pro_zh
            //,agg_pipe_sort
            //,agg_pipe_skip
            //,agg_pipe_limit
            //,agg_pipe_out
        ];


        var T = new Date(new Date().getTime()+8*60*60*1000).toJSON();
        var T_string = T.substr(11,5).split(':').join('').substr(0,4);
        var query_time = T.substr(0,10) + 'T' + T_string;
        var filename = './stat/'+req.body.USER+'/' + query_time + '_D3'+'.csv';
        //var filename = './stat/' + query_time + '_D3.csv';

        //console.log(util.inspect(agg_pipes));
        var page = req.body.page ? parseInt(req.body.page) : 1;
        var collection = mongodb.get('pgw_report_unit');
        //collection.col.aggregate(agg_pipes,{limit:100}, function(err, result) {
        collection.col.aggregate(agg_pipes, { allowDiskUse: true}, function(err, result) {
            if(err) //res.redirect('cdr_3g_site_query');
                console.log("err : "+err);
            //if(result) console.log("result : "+util.inspect(result));
            //res.render('cdr_3g_site_show', {
            jsonexport(result,{rowDelimiter: ','}, function(err, csv) {                if (err) return console.log(err);
                fs.writeFile(filename, csv, function (err) {                    if(err) console.log(err.trace());
                    console.log(filename);
                });
            });

            res.render('lte_pgw_agg_stat3', {
                    title: 'stat lte4g',
                    //db_count: db_count,
                    query:req.body,
                    totalcount: result.length,
                    //page_count:docs.length,
                    filenames:filename,
                    resp: result,
                    page: page,
                    pageTotal: Math.ceil(result.length / _pageunit),
                    isFirstPage: (page - 1) == 0,
                    isLastPage: ((page - 1) * _pageunit + result.length) == result.length
                }
            );
        });
    };
};

exports.lte_pgw_agg_stat4 = function(mongodb){
    return function(req, res) {

        var page = req.body.page ? parseInt(req.body.page) : 1;
        //field input
        var query = {};

        // mongo query string
        for (var key in req.body){
            if(req.body[key].length==0);
            else {
                switch(key){
                    case 'page':break;
                    case 'USER':break;
                    case 'DATE_T0': break;
                    case 'DATE_T1': break;
                    default:
                        query[key] = req.body[key].trim();
                }
                if((new Date(req.body['DATE_T0']))!='Invalid Date' ) {
                    query['UNIT_TIME'] = {
                        $gte: (new Date(req.body['DATE_T0']))
                    };
                }
                if((new Date(req.body['DATE_T1']))!='Invalid Date' ) {
                    query['UNIT_TIME'] = {
                        $lte: (new Date(req.body['DATE_T1']))
                    };
                }
                if((new Date(req.body['DATE_T0']))!='Invalid Date' && (new Date(req.body['DATE_T1']))!='Invalid Date' ) {
                    query['UNIT_TIME'] = {
                        $gte: (new Date(req.body['DATE_T0'])),
                        $lte: (new Date(req.body['DATE_T1']))
                    };
                }
            }
        }

        console.log(util.inspect(query));

        var keys = [];
        for(var k in query) keys.push(k);

        if(keys.length==0)
            res.redirect('lte_pgw_agg_stat4');

        var agg_pipe_match = {	$match:query };

        var agg_pipe_group = { $group:{
            _id: {
                DATE    :"$DATE"
                //,HOUR    :"$HOUR"
                ,SIM_TYPE:"$SIM_TYPE"
                ,NETWORK :"$NETWORK"
                ,BAND    :"$BAND"
                ,COUNTY  :"$COUNTY"
                //,DISTRICT:"$DISTRICT"
                //,VENDOR  :"$VENDOR"
                //,MODEL   :"$MODEL"
            }
            ,TOTAL_UPLINK: {$sum: "$TOTAL_UPLINK"}
            ,TOTAL_DOWNLINK: {$sum: "$TOTAL_DOWNLINK"}
            ,TOTAL_DURATION: {$sum: "$TOTAL_DURATION"}
            ,UNIQUE_MSISDN: {$addToSet: "$UNIQUE_MSISDN"}
        }};

        var agg_pipe_pro_en = {	$project: {
            _id: 1
            //,DATE    :"$_id.DATE"
            //,SIM_TYPE:"$_id.SIM_TYPE"
            //,NETWORK :"$_id.NETWORK"
            //,BAND    :"$_id.BAND"
            //,COUNTY  :"$_id.COUNTY"
            //,DISTRICT:"$_id.DISTRICT"
            //,VENDOR  :"$VENDOR"
            //,MODEL   :"$MODEL"

            ,TOTAL_UPLINK: 1
            ,TOTAL_DOWNLINK: 1
            ,TOTAL_LINK: {$add:["$TOTAL_UPLINK","$TOTAL_DOWNLINK"]}
            ,TOTAL_DURATION: 1
            ,UNIQUE_MSISDN_CN: {$size:"$UNIQUE_MSISDN"}
        }};

        //{skip : (page - 1) * _pageunit,limit : _pageunit,sort : { _id : -1 }
        var agg_pipe_pro_zh = {};
        var agg_pipe_sort = {$sort : {	"_id.DATE": 1	} };
        var agg_pipe_skip = {$skip:(page - 1) * _pageunit};
        //var agg_pipe_limit = {$limit:_pageunit};

        var agg_pipe_limit = {$limit:100};
        var agg_pipe_out = {$out:"lte_pgw_agg_"+'stat'};

        var agg_pipes = [
            agg_pipe_match
            ,agg_pipe_group
            ,agg_pipe_pro_en
            //,agg_pipe_pro_zh
            //,agg_pipe_sort
            //,agg_pipe_skip
            //,agg_pipe_limit
            //,agg_pipe_out
        ];


        var T = new Date(new Date().getTime()+8*60*60*1000).toJSON();
        var T_string = T.substr(11,5).split(':').join('').substr(0,4);
        var query_time = T.substr(0,10) + 'T' + T_string;
        var filename = './stat/'+req.body.USER+'/' + query_time + '_D4' +'.csv';
        //var filename = './stat/' + query_time + '_D4.csv';

        //console.log(util.inspect(agg_pipes));
        var page = req.body.page ? parseInt(req.body.page) : 1;
        var collection = mongodb.get('pgw_report_unit');
        //collection.col.aggregate(agg_pipes,{limit:100}, function(err, result) {
        collection.col.aggregate(agg_pipes, { allowDiskUse: true},function(err, result) {
            if(err) //res.redirect('cdr_3g_site_query');
                console.log("err : "+err);
            //if(result) console.log("result : "+util.inspect(result));
            //res.render('cdr_3g_site_show', {
            jsonexport(result,{rowDelimiter: ','}, function(err, csv) {                if (err) return console.log(err);
                fs.writeFile(filename, csv, function (err) {                    if(err) console.log(err.trace());
                    console.log(filename);
                });
            });

            res.render('lte_pgw_agg_stat4', {
                    title: 'stat lte4g',
                    //db_count: db_count,
                    query:req.body,
                    totalcount: result.length,
                    //page_count:docs.length,
                    filenames:filename,
                    resp: result,
                    page: page,
                    pageTotal: Math.ceil(result.length / _pageunit),
                    isFirstPage: (page - 1) == 0,
                    isLastPage: ((page - 1) * _pageunit + result.length) == result.length
                }
            );
        });
    };
};

exports.lte_pgw_agg_stat5 = function(mongodb){
    return function(req, res) {

        var page = req.body.page ? parseInt(req.body.page) : 1;
        //field input
        var query = {};

        // mongo query string
        for (var key in req.body){
            if(req.body[key].length==0);
            else {
                switch(key){
                    case 'page':break;
                    case 'USER':break;
                    case 'DATE_T0': break;
                    case 'DATE_T1': break;
                    default:
                        query[key] = req.body[key].trim();
                }
                if((new Date(req.body['DATE_T0']))!='Invalid Date' ) {
                    query['UNIT_TIME'] = {
                        $gte: (new Date(req.body['DATE_T0']))
                    };
                }
                if((new Date(req.body['DATE_T1']))!='Invalid Date' ) {
                    query['UNIT_TIME'] = {
                        $lte: (new Date(req.body['DATE_T1']))
                    };
                }
                if((new Date(req.body['DATE_T0']))!='Invalid Date' && (new Date(req.body['DATE_T1']))!='Invalid Date' ) {
                    query['UNIT_TIME'] = {
                        $gte: (new Date(req.body['DATE_T0'])),
                        $lte: (new Date(req.body['DATE_T1']))
                    };
                }
            }
        }

        console.log(util.inspect(query));

        var keys = [];
        for(var k in query) keys.push(k);

        if(keys.length==0)
            res.redirect('lte_pgw_agg_stat');

        var agg_pipe_match = {	$match:query };

        var agg_pipe_group = { $group:{
            _id: {
                DATE    :"$DATE"
                //,HOUR    :"$HOUR"
                ,SIM_TYPE:"$SIM_TYPE"
                ,NETWORK :"$NETWORK"
                ,BAND    :"$BAND"
                //,COUNTY  :"$COUNTY"
                //,DISTRICT:"$DISTRICT"
                ,VENDOR  :"$VENDOR"
                ,MODEL   :"$MODEL"
            }
            ,TOTAL_UPLINK: {$sum: "$TOTAL_UPLINK"}
            ,TOTAL_DOWNLINK: {$sum: "$TOTAL_DOWNLINK"}
            ,TOTAL_DURATION: {$sum: "$TOTAL_DURATION"}
            ,UNIQUE_MSISDN: {$addToSet: "$UNIQUE_MSISDN"}
        }};

        var agg_pipe_pro_en = {	$project: {
            _id: 1
            //,DATE    :"$_id.DATE"
            //,SIM_TYPE:"$_id.SIM_TYPE"
            //,NETWORK :"$_id.NETWORK"
            //,BAND    :"$_id.BAND"
            //,COUNTY  :"$_id.COUNTY"
            //,DISTRICT:"$_id.DISTRICT"
            //,VENDOR  :"$VENDOR"
            //,MODEL   :"$MODEL"

            ,TOTAL_UPLINK: 1
            ,TOTAL_DOWNLINK: 1
            ,TOTAL_LINK: {$add:["$TOTAL_UPLINK","$TOTAL_DOWNLINK"]}
            ,TOTAL_DURATION: 1
            ,UNIQUE_MSISDN_CN: {$size:"$UNIQUE_MSISDN"}
        }};

        //{skip : (page - 1) * _pageunit,limit : _pageunit,sort : { _id : -1 }
        var agg_pipe_pro_zh = {};
        var agg_pipe_sort = {$sort : {	_id: 1	} };
        var agg_pipe_skip = {$skip:(page - 1) * _pageunit};
        //var agg_pipe_limit = {$limit:_pageunit};

        var agg_pipe_limit = {$limit:100};
        var agg_pipe_out = {$out:"lte_pgw_agg_"+'stat'};

        var agg_pipes = [
            agg_pipe_match
            ,agg_pipe_group
            ,agg_pipe_pro_en
            //,agg_pipe_pro_zh
            //,agg_pipe_sort
            //,agg_pipe_skip
            //,agg_pipe_limit
            //,agg_pipe_out
        ];


        var T = new Date(new Date().getTime()+8*60*60*1000).toJSON();
        var T_string = T.substr(11,5).split(':').join('').substr(0,4);
        var query_time = T.substr(0,10) + 'T' + T_string;
        var filename5 = './stat/'+req.body.USER+'/' + query_time + '_D5' +'.csv';
        //var filename5 = './stat/' + query_time + '_D5.csv';

        //console.log(util.inspect(agg_pipes));
        var page = req.body.page ? parseInt(req.body.page) : 1;
        var collection = mongodb.get('pgw_report_phone_unit');
        //collection.col.aggregate(agg_pipes,{limit:100}, function(err, result) {
        collection.col.aggregate(agg_pipes, { allowDiskUse: true}, function(err, result) {
            if(err) //res.redirect('cdr_3g_site_query');
                console.log("err : "+err);
            //if(result) console.log("result : "+util.inspect(result));
            //res.render('cdr_3g_site_show', {
            jsonexport(result,{rowDelimiter: ','}, function(err, csv) {                if (err) return console.log(err);
                fs.writeFile(filename5, csv, function (err) {                    if(err) console.log(err.trace());
                    console.log(filename5);
                });
            });

            res.render('lte_pgw_agg_stat5', {
                    title: 'stat lte4g',
                    //db_count: db_count,
                    query:req.body,
                    totalcount: result.length,
                    //page_count:docs.length,
                    filenames:filename5,
                    resp: result,
                    page: page,
                    pageTotal: Math.ceil(result.length / _pageunit),
                    isFirstPage: (page - 1) == 0,
                    isLastPage: ((page - 1) * _pageunit + result.length) == result.length
                }
            );
        });
    };
};

exports.lte_pgw_agg_stat1_q = function (mongodb) {
    return function(req, res) {
        var collection = mongodb.get('pgw_report_unit');
        collection.count({},function(err, count) {
            if(err) res.redirect('lte_pgw_agg_query');
            //console.log(format("count = %s", count));
            res.render('lte_pgw_agg_stat1', {
                title: 'stat',
                totalcount : count,
                resp :null,
                query:{},
                page:1,
                isFirstPage: (page - 1) == 0,
                isLastPage: ((page - 1) * _pageunit + count) == count
            });
        });
    };
};

exports.lte_pgw_agg_stat2_q = function (mongodb) {
    return function(req, res) {
        var collection = mongodb.get('pgw_report_unit');
        collection.count({},function(err, count) {
            if(err) res.redirect('lte_pgw_agg_query');
            //console.log(format("count = %s", count));
            res.render('lte_pgw_agg_stat2', {
                title: 'stat',
                totalcount : count,
                resp :null,
                query:{},
                page:1,
                isFirstPage: (page - 1) == 0,
                isLastPage: ((page - 1) * _pageunit + count) == count
            });
        });
    };
};

exports.lte_pgw_agg_stat3_q = function (mongodb) {
    return function(req, res) {
        var collection = mongodb.get('pgw_report_unit');
        collection.count({},function(err, count) {
            if(err) res.redirect('lte_pgw_agg_query');
            //console.log(format("count = %s", count));
            res.render('lte_pgw_agg_stat3', {
                title: 'stat',
                totalcount : count,
                resp :null,
                query:{},
                page:1,
                isFirstPage: (page - 1) == 0,
                isLastPage: ((page - 1) * _pageunit + count) == count
            });
        });
    };
};

exports.lte_pgw_agg_stat4_q = function (mongodb) {
    return function(req, res) {
        var collection = mongodb.get('pgw_report_unit');
        collection.count({},function(err, count) {
            if(err) res.redirect('lte_pgw_agg_query');
            //console.log(format("count = %s", count));
            res.render('lte_pgw_agg_stat4', {
                title: 'stat',
                totalcount : count,
                resp :null,
                query:{},
                page:1,
                isFirstPage: (page - 1) == 0,
                isLastPage: ((page - 1) * _pageunit + count) == count
            });
        });
    };
};

exports.lte_pgw_agg_stat5_q = function (mongodb) {
    return function(req, res) {
        var collection = mongodb.get('pgw_report_phone_unit');
        collection.count({},function(err, count) {
            if(err) res.redirect('lte_pgw_agg_query');
            //console.log(format("count = %s", count));
            res.render('lte_pgw_agg_stat5', {
                title: 'stat',
                totalcount : count,
                resp :null,
                query:{},
                page:1,
                isFirstPage: (page - 1) == 0,
                isLastPage: ((page - 1) * _pageunit + count) == count
            });
        });
    };
};

exports.lte_pgw_agg_full_q = function (mongodb) {
    return function(req, res) {
        var collection = mongodb.get('pgw_report_unit');
        collection.count({},function(err, count) {
            if(err) res.redirect('lte_pgw_agg_query');
            //console.log(format("count = %s", count));
            res.render('lte_pgw_agg_full', {
                title: 'stat',
                totalcount : count,
                filenames:null,
                resp :null,
                query:{},
                page:1,
                isFirstPage: (page - 1) == 0,
                isLastPage: ((page - 1) * _pageunit + count) == count
            });
        });
    };
};

exports.lte_pgw_agg_full = function(mongodb){
    return function(req, res) {

        //field input
        var query = {};

        // mongo query string
        for (var key in req.body){
            if(req.body[key].length==0);
            else {
                switch(key){
                    case 'page':break;
                    case 'USER': break;
                    case 'DATE_T0': break;
                    case 'DATE_T1': break;
                    default:
                        query[key] = req.body[key].trim();
                }
                if((new Date(req.body['DATE_T0']))!='Invalid Date' ) {
                    query['RECORD_OPENING_TIME'] = {
                        $gte: (new Date(req.body['DATE_T0']))
                    };
                }
                if((new Date(req.body['DATE_T1']))!='Invalid Date' ) {
                    query['RECORD_OPENING_TIME'] = {
                        $lte: (new Date(req.body['DATE_T1']))
                    };
                }
                if((new Date(req.body['DATE_T0']))!='Invalid Date' && (new Date(req.body['DATE_T1']))!='Invalid Date' ) {
                    query['RECORD_OPENING_TIME'] = {
                        $gte: (new Date(req.body['DATE_T0'])),
                        $lte: (new Date(req.body['DATE_T1']))
                    };
                }
            }
        }

        console.log(util.inspect(query));

        var keys = [];
        for(var k in query) keys.push(k);

        if(keys.length==0)
            res.redirect('lte_pgw_agg_full');

        var T = new Date(new Date().getTime()+8*60*60*1000).toJSON();
        var T_string = T.substr(11,5).split(':').join('').substr(0,4);
        var query_time = T.substr(0,10).split('-').join('') + '_' + T_string;

        //console.log(util.inspect(agg_pipes));
        //var page = req.body.page ? parseInt(req.body.page) : 1;
        //var collection = mongodb.get('pgw_report_unit');


        var filename1 = '~/bt-poc/calculate_report_result/'+req.body.USER+'_'+ query_time +'/calculate_report_1.csv';
        var filename2 = '~/bt-poc/calculate_report_result/'+req.body.USER+'_'+ query_time +'/calculate_report_2.csv';
        var filename3 = '~/bt-poc/calculate_report_result/'+req.body.USER+'_'+ query_time +'/calculate_report_3.csv';
        var filename4 = '~/bt-poc/calculate_report_result/'+req.body.USER+'_'+ query_time +'/calculate_report_4.csv';
        var filename5 = '~/bt-poc/calculate_report_result/'+req.body.USER+'_'+ query_time +'/calculate_report_5.csv';

        var filenames = [
            filename1,
            filename2,
            filename3,
            filename4,
            filename5
        ];

        console.log('/home/btserver/bt-poc/calculate_report_script/calculate_all_report.sh'
        +' '+ new Date(req.body['DATE_T0']).toJSON().substr(0,10)
        +' '+ new Date(req.body['DATE_T1']).toJSON().substr(0,10)
        +' '+ req.body.USER +'_'+ query_time);
        //console.log(filenames);
        //ps = exec('/home/btserver/bt-poc/pgw_stat_script/monitor_pre.sh'
        ps = exec('/home/btserver/bt-poc/calculate_report_script/calculate_all_report.sh'
            +' '+ new Date(req.body['DATE_T0']).toJSON().substr(0,10)
            +' '+ new Date(req.body['DATE_T1']).toJSON().substr(0,10)
            +' '+ req.body.USER +'_'+ query_time //+ UTC ms
            , function (err, stdout, stderr) {
                if (err) console.log(err);

            });
        res.render('lte_pgw_agg_full', {
            title: 'stat lte4g',
            //db_count: db_count,
            query: req.body,
            totalcount: null,
            //page_count:docs.length,
            filenames: filenames,
            resp: null
            //page: page,
            //pageTotal: Math.ceil([].length / _pageunit),
            //isFirstPage: (page - 1) == 0,
            //isLastPage: ((page - 1) * _pageunit + result.length) == result.length
        });
    };
};


*/
