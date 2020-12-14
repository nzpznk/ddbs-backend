var WebHDFS = require('webhdfs');
var fs = require('fs')

var hdfs = WebHDFS.createClient({
	  user: 'root',
	  host: 'namenode',
	  port: 9870,
	  path: '/webhdfs/v1'
});

var localFileStream = fs.createReadStream('/home/node/hello.txt');
var remoteFileStream = hdfs.createWriteStream('/root/nzp_test_create_file.txt');

localFileStream.pipe(remoteFileStream);

remoteFileStream.on('error', function onError (err) {
	  // Do something with the error
	console.log('error occurred');
});

remoteFileStream.on('finish', function onFinish () {
	// Upload is done
});
