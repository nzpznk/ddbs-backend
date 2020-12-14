const WebHDFS = require('webhdfs');
const hdfs = WebHDFS.createClient();

const localFileStream = fs.createReadStream('/path/to/local/file');
const remoteFileStream = hdfs.createWriteStream('/path/to/remote/file');

localFileStream.pipe(remoteFileStream);

remoteFileStream.on('error', function onError (err) {
  // Do something with the error
});

remoteFileStream.on('finish', function onFinish () {
  // Upload is done
});