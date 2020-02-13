# BLE Central Peripheral

## peripheral.connected

This returns connection state as boolean.

```Javascript
// Javascript Example

await obniz.ble.initWait(); 
var target = {
    uuids: ["fff0"],
};
var peripheral = await obniz.ble.scan.startOneWait(target);

console.log(peripheral.connected) // => false
```

## peripheral.rssi

This returns RSSI(dbm) as number.

```Javascript
// Javascript Example

await obniz.ble.initWait();
obniz.ble.scan.onfind = async (peripheral) => {
    console.log(peripheral.localName, peripheral.rssi); // null, -80
};

obniz.ble.scan.start();
```

## peripheral.adv_data
This returns raw advertise data.

```Javascript
// Javascript Example
await obniz.ble.initWait(); 
var target = {
    uuids: ["fff0"],
};
var peripheral = await obniz.ble.scan.startOneWait(target);

console.log(peripheral.adv_data)
```

## peripheral.localName
This returns local name if the peripheral has it.

```Javascript
// Javascript Example

await obniz.ble.initWait(); 
var target = {
    uuids: ["fff0"],
};
var peripheral = await obniz.ble.scan.startOneWait(target);

console.log(peripheral.localName)
```



## peripheral.iBeacon
// Javascript Example

This returns iBeacon data if the peripheral has it. If none, it will return null.
The return values are shown below.

```
{
    uuid : "907e1d1d-d85d-497f-9e93-4c813a459cae", //hex string
    major : 1000, //number
    minor : 100, //number
    power : 300, //number
    rssi : -22, //number
}
```

```Javascript
// Javascript Example
await obniz.ble.initWait(); 
var target = {
    uuids: ["fff0"],
};
var peripheral = await obniz.ble.scan.startOneWait(target);

console.log(peripheral.iBeacon)
```

<!--
## peripheral.connect()
Connet to peripheral

```Javascript
// Javascript Example
obniz.ble.scan.onfind = function(peripheral){
    if(peripheral.localName == "my peripheral"){
        peripheral.connect();
    }
}
obniz.ble.startScan({duration : 10});
```

-->
## \[await] peripheral.connectWait()
This connects obniz to the peripheral.
If ble scannning is undergoing, scan will be terminated immidiately.

It throws when connection establish failed.

when connection established, all service/characteristics/desriptors will be discovered automatically. This function will wait until all discovery done.

```Javascript
// Javascript Example

await obniz.ble.initWait(); 
var target = {
    uuids: ["fff0"],
};
var peripheral = await obniz.ble.scan.startOneWait(target);
if(!peripheral) {
    console.log('no such peripheral')
    return;
}
try {
  await peripheral.connectWait();
  console.log("connected");
} catch(e) {
  console.log("can't connect");
}
```


## peripheral.connect()
This function will try to connect a peripheral. `onconnect` will be caled when connected or `ondisconnect` will be called when failed.

If ble scannning is undergoing, scan will be terminated immidiately.

when connection established, all service/characteristics/desriptors will be discovered automatically. `onconnect` will be called after all discovery done.

```Javascript
// Javascript Example
await obniz.ble.initWait(); 
obniz.ble.scan.onfind = function(peripheral){
    if(peripheral.localName == "my peripheral"){
        peripheral.onconnect = function(){
            console.log("success");
        }
        peripheral.connect();
    }
}
obniz.ble.scan.start();
```


## peripheral.onconnect
This function is called when connection succeeds.

```Javascript
// Javascript Example
await obniz.ble.initWait(); 
obniz.ble.scan.onfind = function(peripheral){
    if(peripheral.localName == "my peripheral"){
        peripheral.onconnect = function(){
            console.log("success");
        }
        peripheral.connect();
    }
}
obniz.ble.scan.start();
```


<!--

## peripheral.disconnect()
Close connection.

```Javascript
// Javascript Example
obniz.ble.scan.onfind = function(peripheral){
    if(peripheral.localName == "my peripheral"){
        peripheral.connect();
        await obniz.wait(1000);
        peripheral.disconnect();
    }
}
obniz.ble.startScan({duration : 10});
```


-->


## peripheral.ondisconnect
This function is called when a connected peripheral is disconnected or first connection establish was failed.

```Javascript
// Javascript Example
await obniz.ble.initWait(); 
obniz.ble.scan.onfind = function(peripheral){
    if(peripheral.localName == "my peripheral"){
        peripheral.onconnect = function(){
            console.log("success");
        }
        peripheral.ondisconnect = function(){
            console.log("closed");
        }
        peripheral.connect();
    }
}
obniz.ble.scan.start();
```

## \[await] peripheral.disconnectWait()
This disconnects obniz from peripheral.

It throws when failed

```Javascript
// Javascript Example

await obniz.ble.initWait(); 
var target = {
    uuids: ["fff0"],
};
var peripheral = await obniz.ble.scan.startOneWait(target);
if(!peripheral) {
    console.log('no such peripheral')
    return;
}
try {
    await peripheral.connectWait();
    console.log("connected");
    await peripheral.disconnectWait();
    console.log("disconnected");
} catch(e) {
    console.log("can't connect / can't disconnect");
}
```

<!--
## peripheral.discoverAllServices()

Discover all services in connected peripheral.
A function set to `ondiscoverservice` will be called for each found service. And a function set to `ondiscoverservicefinished` will be called when discovery finished.


```Javascript
// Javascript Example
await obniz.ble.initWait();
obniz.ble.scan.onfind = (peripheral) => {
    console.log(peripheral.localName)
    if (peripheral.localName === 'my peripheral') {
      
        peripheral.onconnect = function(){
            console.log("connected");
            peripheral.discoverAllServices();
            peripheral.ondiscoverservice = function (service) {
                console.log('service UUID: ' + service.uuid);
            }
            peripheral.ondiscoverservicefinished = function (service) {
                console.log("service discovery finished")
            }
        }
      
        peripheral.ondisconnect = function(){
            console.log("disconnected");
        }
      
        peripheral.connect();
    }
};

obniz.ble.scan.start();
```

## ondiscoverservice = (service) => {}

A function set to this property will be called when a service found after `discoverAllServices()` is called. 1st param is service object.

## ondiscoverservicefinished = () => {}

A function set to this property will be called when service discovery  `discoverAllServices()` was finshed.

## \[await] peripheral.discoverAllServicesWait()

This function is async version of `discoverAllServices()`.
It will return all found services as array.

Please do not call this function in paralell.

```Javascript
// Javascript Example
await obniz.ble.initWait();
obniz.ble.scan.onfind = async (peripheral) => {
    console.log(peripheral.localName)
    if (peripheral.localName === 'my peripheral') {
      obniz.ble.scan.end();
      await peripheral.connectWait();
        var services = await peripheral.discoverAllServicesWait();
        console.log("service discovery finish");
        for (var i=0; i<services.length; i++) {
            console.log('service UUID: ' + services[i].uuid)
        }
    }
};

obniz.ble.scan.start();
```
-->


## peripheral.services

It contains all discovered services in a peripheral as an array. It is discovered when connection automatically.

```Javascript
// Javascript Example

await obniz.ble.initWait(); 
var target = {
    uuids: ["fff0"],
};
var peripheral = await obniz.ble.scan.startOneWait(target);
if(!peripheral) {
    console.log('no such peripheral')
    return;
}
try {
  await peripheral.connectWait();
  console.log("connected");
  for (var service of peripheral.services) {
      console.log(service.uuid)
  }
} catch(e) {
  console.error(e);
}
```

## peripheral.getService(uuid: string)

It returns a service which having specified uuid in `peripheral.services`.

Case is ignored. So `aa00` and `AA00` are the same.

```Javascript
// Javascript Example

await obniz.ble.initWait(); 
var target = {
    uuids: ["fff0"],
};
var peripheral = await obniz.ble.scan.startOneWait(target);
if(!peripheral) {
    console.log('no such peripheral')
    return;
}
try {
  await peripheral.connectWait();
  console.log("connected");
  var service = peripheral.getService("1800")
  if (!service) {
      console.log("service not found")
      return;
  }
  console.log(service.uuid) // => 1800 or 
} catch(e) {
  console.error(e);
}
```


## peripheral.onerror
This gets called with an error message when some kind of error occurs.

```Javascript
{
   error_code : 1,
   message : "ERROR MESSAGE",
   device_address : "abcdefghijkl", //hex string or null
   service_uuid : "FF00",           //hex string or null
   characteristic_uuid : "FF01", //hex string or null
   descriptor_uuid : "FF01", //hex string or null
}
```


```Javascript
// Javascript Example
await obniz.ble.initWait(); 
var target = {
    uuids: ["fff0"],
};
var peripheral = await obniz.ble.scan.startOneWait(target);

peripheral.onerror = function(err){
    console.log("error : " + err.message);
}

```