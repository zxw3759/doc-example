const shelljs = require('shelljs');
// 服务器部署
const Rsync = require('rsync');
const path = require('path');
const colors = require('colors');
// 分析执行命令后面的参数
const argv = require('yargs').argv;

const [targetName] = argv._
const host_name = {
  staging001:'root@47.95.109.212:/root/doc'
}
if (!host_name[targetName]) {
  shelljs.echo(colors.red('目标主机不存在'))
  shelljs.exit(1);
}

function sendNotify(message) {
  shelljs.exec(`curl -H "Content-Type:application/json" -X POST -d '{"text": {"content":"${message}"},msgtype:"text"}' 'https://oapi.dingtalk.com/robot/send?access_token=587d203031917523bc857f011a052ba3f2044e37be49a878b5ae39d505c9ba01'`)
}
// 通知 开始构建
// https://oapi.dingtalk.com/robot/send?access_token=587d203031917523bc857f011a052ba3f2044e37be49a878b5ae39d505c9ba01

// curl -H "Content-Type:application/json" -X POST -d '{"text": {"content":"测试一下发送消息"},msgtype:"text"}' 'https://oapi.dingtalk.com/robot/send?access_token=587d203031917523bc857f011a052ba3f2044e37be49a878b5ae39d505c9ba01'


// 安装依赖
// shell  0 成功
console.log(colors.yellow('安装依赖'))
if (shelljs.exec('npm i').code !== 0) {
  shelljs.echo('Error: npm i failed');
  shelljs.exit(1);
}

// 测试
console.log(colors.yellow('开始测试了'))
if (shelljs.exec('npm run test').code !== 0) {
  shelljs.echo('Error: npm i failed');
  shelljs.exit(1);
}


// 构建
sendNotify('开始构建')
console.log(colors.yellow('开始构建了'))
if (shelljs.exec('npm run build').code !== 0) {
  shelljs.echo('Error: npm i failed');
  shelljs.exit(1);
}


// 部署
sendNotify('开始部署')
console.log(colors.yellow('开始部署'))
var rsync = Rsync.build({
  source:      path.join(__dirname,'../','.vuepress/dist/*'),
  destination: host_name[targetName],
  flags:       'avz',
  shell:       'ssh'
});
 
rsync.execute(function(err, code, cmd) {
  // we're done
  console.log(err,code,cmd)
  console.log(colors.green('部署完成'))
  sendNotify('部署完成')
});