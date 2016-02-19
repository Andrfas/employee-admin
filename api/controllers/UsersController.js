var async = require('async');
var db = require('../../libs/mongoose.js');
var _ = require('lodash');

module.exports = {
    getNotActivated: getNotActivated,
    activateUser: activateUser
}

function getNotActivated(req, res){
    async.auto({
        getCredentials: function(cb) {
            var fields = 'client_type client_id email';
            db['Credentials'].find({"status": "notActivated"}, fields, function(err, response){
                if (err) {
                    return cb(err);
                }
                cb(null,response);
            })
        },
        getProfiles: ['getCredentials', function(cb, res) {
            var data = JSON.parse(JSON.stringify(res.getCredentials));            
            // var data = _.cloneDeep(res.getCredentials); 
            async.forEachOfSeries(res.getCredentials, function(cred, index, eachCb) {
                if(cred.client_type === 'company') {
                    db['Company'].find({"_id": cred.client_id}, function(err, response){
                        if (err) {
                            return eachCb(err);
                        }
                        data[index]['profile'] = response[0];
                        eachCb();
                    })
                } else if(cred.client_type === 'employee') {
                    db['Employee'].find({"_id": cred.client_id}, function(err, response){
                        if (err) {
                            return eachCb(err);
                        }
                        data[index]['profile'] = response[0];
                        eachCb();
                    })
                } else {
                    eachCb('Wrong client type');
                }
            }, function(err) {
                if(err) {
                    return cb(err);
                }
                cb(null, data);
            })
        }]
    }, function(err, results) {
        if(err) {
            return res.json(err);
        }
        res.json(results.getProfiles);
    })
    
}

function activateUser(req, res) {
    if(!req.params.id) {
        return res.json({success:false, msg: 'No id specified'});
    }
    db['Credentials'].update({'client_id': req.params.id}, {status:'activated'}, function(err, response){
        if (err) {
            return res.json({success:false, msg:'[activateUser cntrl] update error'});
        }

        res.json({success:true, obj:response});
    })
}

