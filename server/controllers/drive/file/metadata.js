module.exports = {
    list : function(req, res) {
        console.log('routing rest.js /api/fileIndex/:driveId');

        req.apiClient.metadata.listFile(req.params.fileId)
            .then(function(result)
            {
                result.logined = true;
                res.send(result);
            })
            .done();
    },
    getMetadata : function(req,res){

    },
    patch : function(req,res){

    }
};