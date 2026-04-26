const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
    console.log('SSH Connection established');
    conn.exec('cd vandywebproject && git clean -fd && git stash && git pull && pm2 restart dealnamaa-backend', (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            console.log('Deployment completed with code: ' + code);
            conn.end();
        }).on('data', (data) => {
            console.log('STDOUT: ' + data);
        }).stderr.on('data', (data) => {
            console.log('STDERR: ' + data);
        });
    });
}).connect({
    host: '192.168.242.128',
    port: 22,
    username: 'wsadm',
    password: 'india@123'
});
