const man = require('os');
console.log(man.networkInterfaces());
var macaddress = require('macaddress');
macaddress.one(function (err, mac) {
  console.log("Mac address for this host: %s", mac);  
});
macaddress.all(function (err, all) {
    console.log(JSON.stringify(all, null, 2));
  });