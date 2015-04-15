var api = require('polytrix-core-api');
var MultipartHandler = require('./multipart');


// '/api/drive/:driveId/:fileId/',
// Upload the file
// @param driveId
// @param fileId
// @param (in multipart body) size - the size of the file
module.exports.upload = function(req,res,next){
    console.log('handling upload file ',__dirname);

    var handler = new MultipartHandler(function(fileStream,status){
        if(status.size){
            fileStream.headers['content-length'] = status.size;
        }

        req.apiClient.stream.uploadStream(
            req.params.fileId,
            fileStream,
            status.mimetype,
            req.query.overwrite || false,
            req.query.parent_rev
        ).then(function(response){
                if(response.success){
                    console.log('success');
                    return req.apiClient.metadata.get(response.identifier)
                        .then(function(response){
                            delete response.success;
                            res.send({
                                success: true,
                                logined: true,
                                file:response
                            });
                        });
                }else{
                    res.send({
                        success:false,
                        logined: true,
                        error_code: response.error_code,
                        msg: response.msg,
                    });
                    next();
                }
            });
    });
    handler.process(req);
};

// '/api/drive/:driveId/:fileId/new/'
// Create and upload a file
// @param driveId
// @param fileId - the destination folder's id
// @param name - the name of the new file or folder
// @param (in multipart body) size - the size of the file
module.exports.createAndUpload = function(req,res,next){
    console.log('handling upload file ',__dirname);

    var handler = new MultipartHandler(function(fileStream,status){
        if(status.size){
            fileStream.headers['content-length'] = status.size;
        }

        var filename = req.query.name;
        filename = filename || status.filename;
        filename = filename || 'unnamed file';

        req.apiClient.stream.createAndUploadStream(
            req.params.fileId,
            fileStream,
            status.mimetype,
            filename
        ).then(function(response){
                if(response.success){
                    console.log('success');
                    return req.apiClient.metadata.get(response.identifier)
                        .then(function(response){
                            delete response.success;
                            res.send({
                                success: true,
                                logined: true,
                                file:response
                            });
                        });
                }else{
                    res.send({
                        success:false,
                        logined: true,
                        error_code: response.error_code,
                        msg: response.msg,
                    });
                    next();
                }
            });
    });
    handler.process(req);
};