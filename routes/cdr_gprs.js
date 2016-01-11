var util = require('util');
var _pageunit = 10;
_max_pageunit = 10;
_max_pageunit = 10;
_statInterval = 5*60*1000;

var query = {
    COUNTY:''
};

var page = 1;

exports.index = function(req, res){
    res.render('cdr_gprs_raw_query', { title: 'gprs query', resp : false});
};

exports.cdr_CRUD_show_pagging = function (mongodb) {
    return function (req, res) {
        var page = req.query.p ? parseInt(req.query.p) : 1;

        var collection = mongodb.get('cdr_gprs_raw');
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


exports.cdr_gprs_raw_show = function(mongodb){
    return function(req, res) {
        var collection = mongodb.get('cdr_gprs_raw');
        collection.count({},function(err, count) {
            if(err) res.redirect('cdr_gprs_raw_query');
            //console.log(format("count = %s", count));
            res.render('cdr_gprs_raw_query', {
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

exports.cdr_gprs_raw_query = function(mongodb){
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
                    query['G_RECORD_OPENING_TIME'] = {
                        $gte: (new Date(req.body['DATE_T0']))
                    };
                }
                if((new Date(req.body['DATE_T1']))!='Invalid Date' ) {
                    query['G_RECORD_OPENING_TIME'] = {
                        $lte: (new Date(req.body['DATE_T1']))
                    };
                }
                if((new Date(req.body['DATE_T0']))!='Invalid Date' && (new Date(req.body['DATE_T1']))!='Invalid Date' ) {
                    query['G_RECORD_OPENING_TIME'] = {
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
            res.redirect('cdr_gprs_raw_query');

        // lte aggregate
        var collection = mongodb.get('cdr_gprs_raw');
        collection.count({},function(err,db_count){
            var T0 = new Date();
            collection.count(query, function (err, query_count) {
                var T00 = new Date();
                collection.find(query, //{limit: _pageunit}, function (err, docs) {
                    {skip : (page - 1) * _pageunit,limit : _pageunit,sort : { _id : -1 }}, function (e, docs) {
                    //{skip : (page - 1) * _pageunit,limit : _pageunit}, function (e, docs) {
                        var T000 = new Date();
                        if(e) res.redirect('cdr_gprs_raw_query');
                        //if (docs.length) console.log('docs.length: ' + docs.length);
                        res.render('cdr_gprs_raw_query', {
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
                        var T111 = new Date();
                        console.log('find(query)'+ (T111-T000) +' ms.'+ (T111-T000)/1000 + ' sec.');
                        //if (err) res.redirect('cdr_CRUD_query');
                    });
                var T11 = new Date();
                console.log('count(query)'+ (T11-T00) +' ms.'+ (T11-T00)/1000 + ' sec.');
            });
            var T1 = new Date();
            console.log('count(all)'+ (T1-T0)+ ' ms.' +(T1-T0)/1000 + ' sec.');
        });
    };
};

/*exports.cdr_CRUD_show = function (mongodb) {
    return function (req, res) {
        console.log('cdr_show');
        //var collection = mongodb.get('cep3g_sample');
        var collection = mongodb.get('cep3g_join');
        collection.count({}, function (err, count) {
            collection.find({}, {limit: _pageunit, sort: {_id: -1}}, function (e, docs) {
                // console.log("docs data : "+util.inspect(docs));
                var docdetail;
                if (docs.length == 1) docdetail = util.inspect(docs);
                //console.log(docs[0].toJSON());
                res.render('cdr_CRUD_show', {
                    title: 'cdr',
                    totalcount: count,
                    resp: docs,
                    logdetail: docdetail
                });
            });
        });
    };
};*/

exports.cdr_3g_site_stats = function(mongodb){
    return function(req, res) {
        var page = req.body.page ? parseInt(req.body.page) : 1;
        //field input
        var query = {};

        for (var key in req.body){
            if(req.body[key].length==0);
            else {
                switch(key){
                    case 'page':break;
                    default:
                        query[key] = req.body[key].trim();
                }
            }
        }

        console.log(util.inspect(query));

        var keys = [];
        for(var k in query) keys.push(k);

        if(keys.length==0) {
            res.redirect('cdr_3g_site_stats');
        }

        var agg_pipe_match = {$match:query};
        var agg_pipe_pro1  = {$project:{
        }};
        var agg_pipe_group = {$group:{
        }};
        var agg_pipe_match2 = {$match:{
        }};

        var agg_pipe_pro_en = {$project:{
        }};
        var agg_pipe_pro_zh = {$project:{
        }};

        var agg_pipe_skip = {$skip:(page - 1) * _pageunit};    //(page - 1) * _pageunit
        var agg_pipe_limit = {$limit:_pageunit};  //_pageunit
        var agg_pipe_out = {$out:""};
        var agg_pipe_disk = { allowDiskUse:true };

        var agg_pipes = [
              agg_pipe_match
            , agg_pipe_pro1
            , agg_pipe_group
            , agg_pipe_match2

            //, agg_pipe_pro_en
            , agg_pipe_pro_zh
            , agg_pipe_skip
            , agg_pipe_limit
            //,agg_pipe_out
            , agg_pipe_disk
        ];

        //console.log(util.inspect(agg_pipes));

        var collection = mongodb.get('cep3g_join');
        var collection_stat = mongodb.get('cep3g_stat_site');
        collection.count(query, function (err, query_count) {
            collection.col.aggregate(agg_pipes,{ allowDiskUse:true }, function(err, result) {
                if(err) //res.redirect('cdr_3g_site_stats');
                    console.log("err : "+err.trace());
                res.render('cdr_3g_site_show_fixHead_zh', {
                    title: 'stat cep3g',
                    //db_count: db_count,
                    //totalcount: result.lenth,
                    totalcount: result.length,
                    //page_count:docs.length,
                    resp: result,
                    query:query,
                    page: page,
                    pageTotal: Math.ceil(query_count.length / _pageunit),
                    isFirstPage: (page - 1) == 0,
                    isLastPage: ((page - 1) * _pageunit + query_count.length) == query_count.length
                });
            });
        });
    };
};