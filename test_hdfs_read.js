var WebHDFS = require('webhdfs');
var fs = require('fs')

var hdfs = WebHDFS.createClient({
	  user: 'root',
	  host: 'namenode',
	  port: 9870,
	  path: '/webhdfs/v1'
});

var remoteFileStream = hdfs.createReadStream('/articles/article0/text_a0.txt');

var x = remoteFileStream.on('data', function(chunck) {
	var dat = chunck.toString();
	console.log(dat);
	console.log('finished');
});
