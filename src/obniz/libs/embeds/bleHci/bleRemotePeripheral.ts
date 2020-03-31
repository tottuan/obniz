/**
 * @packageDocumentation
 * @module ObnizCore.Components.Ble.Hci
 */

import EventEmitter from "eventemitter3";
import ObnizBLE from "./ble";
import BleHelper from "./bleHelper";
import BleRemoteCharacteristic from "./bleRemoteCharacteristic";
import BleRemoteService from "./bleRemoteService";
import { BleBinary } from "./bleScan";
import { BleDeviceAddress, BleDeviceAddressType, BleDeviceType, BleEventType, UUID } from "./bleTypes";

/**
 * The return values are shown below.
 *
 * ```json
 * {
 *   uuid : "907e1d1d-d85d-497f-9e93-4c813a459cae", //hex string
 *   major : 1000, //number
 *   minor : 100, //number
 *   power : 300, //number
 *   rssi : -22, //number
 * }
 * ```
 */
export interface IBeacon {
  /**
   * hex string
   */
  uuid: UUID;
  major: number;
  minor: number;
  power: number;
  rssi: number;
}

/**
 * connect setting
 */
export interface BleConnectSetting {
  /**
   * Auto discovery on connection established.
   *
   * true : auto discover services/characteristics/descriptors on connection established.
   * false : don't discover automatically. Please manually.
   *
   * Default is true;
   *
   * If set false, you should manually discover services/characteristics/descriptors;
   *
   * ```javascript
   * // Javascript Example
   * await obniz.ble.initWait({});
   * obniz.ble.scan.onfind = function(peripheral){
   * if(peripheral.localName == "my peripheral"){
   *      peripheral.onconnect = async function(){
   *          console.log("success");
   *          await peripheral.discoverAllServicesWait(); //manually discover
   *          let service = peripheral.getService("1800");
   *      }
   *      peripheral.connect({autoDiscovery:false});
   *     }
   * }
   * obniz.ble.scan.start();
   * ```
   *
   */
  autoDiscovery?: boolean;
}

/**
 * @category Use as Central
 */
export default class BleRemotePeripheral {
  /**
   * It contains all discovered services in a peripheral as an array.
   * It is discovered when connection automatically.
   *
   * ```javascript
   * // Javascript Example
   *
   * await obniz.ble.initWait();
   * var target = {
   *   uuids: ["fff0"],
   * };
   * var peripheral = await obniz.ble.scan.startOneWait(target);
   * if(!peripheral) {
   *     console.log('no such peripheral')
   *     return;
   * }
   * try {
   *   await peripheral.connectWait();
   *   console.log("connected");
   *   for (var service of peripheral.services) {
   *       console.log(service.uuid)
   *   }
   * } catch(e) {
   *   console.error(e);
   * }
   * ```
   *
   */
  get services(): BleRemoteService[] {
    return this._services;
  }

  /**
   * BLE address
   */
  public address: BleDeviceAddress;

  /**
   * This returns connection state as boolean.
   *
   * ```javascript
   * // Javascript Example
   * await obniz.ble.initWait();
   * var target = {
   *     uuids: ["fff0"],
   * };
   * var peripheral = await obniz.ble.scan.startOneWait(target);
   *
   * console.log(peripheral.connected) // => false
   * ```
   *
   */
  public connected: boolean;

  /**
   *
   */
  public device_type: BleDeviceType | null;

  /**
   *
   */
  public address_type: BleDeviceAddressType | null;

  /**
   *
   */
  public ble_event_type: BleEventType | null;

  /**
   * This returns RSSI(dbm) as number.
   *
   * ```javascript
   * // Javascript Example
   *
   * await obniz.ble.initWait();
   * obniz.ble.scan.onfind = async (peripheral) => {
   *  console.log(peripheral.localName, peripheral.rssi); // null, -80
   * };
   *
   * obniz.ble.scan.start();
   * ```
   */
  public rssi: number | null;

  /**
   * This returns raw advertise data.
   *
   * ```javascript
   *
   * // Javascript Example
   *  await obniz.ble.initWait();
   *  var target = {
   *   uuids: ["fff0"],
   * };
   * var peripheral = await obniz.ble.scan.startOneWait(target);
   *
   * console.log(peripheral.adv_data)
   * ```
   *
   */
  public adv_data: number[] | null;

  /**
   * This returns raw scan response data.
   *
   * ```javascript
   *
   * // Javascript Example
   *  await obniz.ble.initWait();
   *  var target = {
   *   uuids: ["fff0"],
   * };
   * var peripheral = await obniz.ble.scan.startOneWait(target);
   *
   * console.log(peripheral.adv_data)
   * console.log(peripheral.scan_resp)
   * ```
   *
   */
  public scan_resp: number[] | null;

  /**
   * This returns local name if the peripheral has it.
   *
   * ```javascript
   * // Javascript Example
   *
   * await obniz.ble.initWait();
   * var target = {
   *  uuids: ["fff0"],
   * };
   * var peripheral = await obniz.ble.scan.startOneWait(target);
   *
   * console.log(peripheral.localName)
   * ```
   */
  public localName: string | null;

  /**
   * This returns iBeacon data if the peripheral has it. If none, it will return null.
   *
   * ```javascript
   * // Javascript Example
   * await obniz.ble.initWait();
   * var target = {
   *  uuids: ["fff0"],
   * };
   * var peripheral = await obniz.ble.scan.startOneWait(target);
   *
   * console.log(peripheral.iBeacon)
   * ```
   */
  public iBeacon: IBeacon | null;

  /**
   * This function is called when connection succeeds.
   *
   * ```javascript
   * // Javascript Example
   * await obniz.ble.initWait();
   * obniz.ble.scan.onfind = function(peripheral){
   *   if(peripheral.localName == "my peripheral"){
   *     peripheral.onconnect = function(){
   *       console.log("success");
   *     }
   *      peripheral.connect();
   *    }
   * }
   * obniz.ble.scan.start();
   *
   * ```
   */
  public onconnect?: () => void;

  /**
   * This function is called when a connected peripheral is disconnected or first connection establish was failed.
   *
   * ```javascript
   * // Javascript Example
   *  await obniz.ble.initWait();
   *  obniz.ble.scan.onfind = function(peripheral){
   *   if(peripheral.localName == "my peripheral"){
   *       peripheral.onconnect = function(){
   *           console.log("success");
   *       }
   *       peripheral.ondisconnect = function(){
   *           console.log("closed");
   *       }
   *       peripheral.connect();
   *   }
   * }
   * obniz.ble.scan.start();
   * ```
   */
  public ondisconnect?: () => void;

  /**
   * @ignore
   */
  public ondiscoverservice?: (child: any) => void;

  /**
   * @ignore
   */
  public ondiscoverservicefinished?: (children: any) => void;

  /**
   * This gets called with an error message when some kind of error occurs.
   */
  public onerror?: (err: any) => void;
  /**
   * @ignore
   */
  public obnizBle: ObnizBLE;

  /**
   * @ignore
   */
  public _connectSetting: BleConnectSetting = {};

  protected keys: any;
  protected advertise_data_rows: any;
  protected _services: BleRemoteService[];
  protected emitter: EventEmitter;

  constructor(obnizBle: ObnizBLE, address: BleDeviceAddress) {
    this.obnizBle = obnizBle;
    this.address = address;
    this.connected = false;

    this.device_type = null;
    this.address_type = null;
    this.ble_event_type = null;
    this.rssi = null;
    this.adv_data = null;
    this.scan_resp = null;
    this.localName = null;
    this.iBeacon = null;

    this.keys = ["device_type", "address_type", "ble_event_type", "rssi", "adv_data", "scan_resp"];

    this._services = [];
    this.emitter = new EventEmitter();
  }

  /**
   * @ignore
   * @return {String} json value
   */
  public toString() {
    return JSON.stringify({
      address: this.address,
      addressType: this.address_type,
      advertisement: this.adv_data,
      scanResponse: this.scan_resp,
      rssi: this.rssi,
    });
  }

  /**
   * @ignore
   * @param dic
   */
  public setParams(dic: any) {
    this.advertise_data_rows = null;
    for (const key in dic) {
      if (dic.hasOwnProperty(key) && this.keys.includes(key)) {
        (this as any)[key] = dic[key];
      }
    }
    this.analyseAdvertisement();
  }

  /**
   * This function will try to connect a peripheral.
   * [[onconnect]] will be caled when connected or [[ondisconnect]] will be called when failed.
   *
   * If ble scanning is undergoing, scan will be terminated immediately.
   *
   * when connection established, all service/characteristics/descriptors will be discovered automatically.
   * [[onconnect]] will be called after all discovery done.
   *
   * ```javascript
   * // Javascript Example
   * await obniz.ble.initWait();
   * obniz.ble.scan.onfind = function(peripheral){
   * if(peripheral.localName == "my peripheral"){
   *      peripheral.onconnect = function(){
   *          console.log("success");
   *      }
   *      peripheral.connect();
   *     }
   * }
   * obniz.ble.scan.start();
   * ```
   */
  public connect(setting?: BleConnectSetting) {
    this._connectSetting = setting || {};
    this._connectSetting.autoDiscovery = this._connectSetting.autoDiscovery !== false;
    this.obnizBle.scan.end();
    this.obnizBle.centralBindings.connect(this.address);
  }

  /**
   * This connects obniz to the peripheral.
   * If ble scannning is undergoing, scan will be terminated immidiately.
   *
   * It throws when connection establish failed.
   *
   * when connection established, all service/characteristics/desriptors will be discovered automatically.
   * This function will wait until all discovery done.
   *
   * ```javascript
   * // Javascript Example
   *
   * await obniz.ble.initWait();
   * var target = {
   *    uuids: ["fff0"],
   * };
   * var peripheral = await obniz.ble.scan.startOneWait(target);
   * if(!peripheral) {
   *    console.log('no such peripheral')
   *    return;
   * }
   * try {
   *   await peripheral.connectWait();
   *   console.log("connected");
   * } catch(e) {
   *   console.log("can't connect");
   * }
   * ```
   *
   */
  public connectWait(setting?: BleConnectSetting): Promise<void> {
    return new Promise((resolve: any, reject: any) => {
      // if (this.connected) {
      //   resolve();
      //   return;
      // }
      this.emitter.once("statusupdate", (params: any) => {
        if (params.status === "connected") {
          resolve(true); // for compatibility
        } else {
          reject(
            new Error(`connection to peripheral name=${this.localName} address=${this.address} can't be established`),
          );
        }
      });
      this.connect(setting);
    });
  }

  /**
   * This disconnects obniz from peripheral.
   *
   *
   * ```javascript
   * // Javascript Example
   *
   * await obniz.ble.initWait();
   * var target = {
   *  uuids: ["fff0"],
   * };
   * var peripheral = await obniz.ble.scan.startOneWait(target);
   * if(!peripheral) {
   *   console.log('no such peripheral')
   *   return;
   * }
   *
   * peripheral.connect();
   * peripheral.onconnect = ()=>{
   *   console.log("connected");
   *   peripheral.disconnect();
   * }
   *
   * ```
   */
  public disconnect() {
    this.obnizBle.centralBindings.disconnect(this.address);
  }

  /**
   * This disconnects obniz from peripheral.
   *
   * It throws when failed
   *
   * ```javascript
   * // Javascript Example
   *
   * await obniz.ble.initWait();
   * var target = {
   *  uuids: ["fff0"],
   * };
   * var peripheral = await obniz.ble.scan.startOneWait(target);
   * if(!peripheral) {
   *   console.log('no such peripheral')
   *   return;
   * }
   * try {
   *   await peripheral.connectWait();
   *   console.log("connected");
   *   await peripheral.disconnectWait();
   *   console.log("disconnected");
   * } catch(e) {
   *    console.log("can't connect / can't disconnect");
   * }
   * ```
   */
  public disconnectWait(): Promise<void> {
    return new Promise((resolve: any, reject: any) => {
      // if (!this.connected) {
      //   resolve();
      //   return;
      // }
      this.emitter.once("statusupdate", (params: any) => {
        if (params.status === "disconnected") {
          resolve(true); // for compatibility
        } else {
          reject(
            new Error(`cutting connection to peripheral name=${this.localName} address=${this.address} was failed`),
          );
        }
      });
      this.disconnect();
    });
  }

  /**
   * It returns a service which having specified uuid in [[services]].
   * Case is ignored. So aa00 and AA00 are the same.
   *
   * ```javascript
   * // Javascript Example
   *
   * await obniz.ble.initWait();
   * var target = {
   *   uuids: ["fff0"],
   * };
   * var peripheral = await obniz.ble.scan.startOneWait(target);
   * if(!peripheral) {
   *   console.log('no such peripheral')
   *   return;
   * }
   * try {
   *   await peripheral.connectWait();
   *   console.log("connected");
   *   var service = peripheral.getService("1800")
   *   if (!service) {
   *     console.log("service not found")
   *     return;
   *   }
   *   console.log(service.uuid)
   * } catch(e) {
   *   console.error(e);
   * }
   * ```
   * @param uuid
   */
  public getService(uuid: UUID): BleRemoteService | null {
    uuid = BleHelper.uuidFilter(uuid);
    for (const key in this._services) {
      if (this._services[key].uuid === uuid) {
        return this._services[key];
      }
    }
    return null;
  }

  /**
   * @ignore
   * @param param
   */
  public findService(param: any) {
    const serviceUuid: any = BleHelper.uuidFilter(param.service_uuid);
    return this.getService(serviceUuid);
  }

  /**
   * @ignore
   * @param param
   */
  public findCharacteristic(param: any) {
    const serviceUuid: any = BleHelper.uuidFilter(param.service_uuid);
    const characteristicUuid: any = BleHelper.uuidFilter(param.characteristic_uuid);
    const s: any = this.getService(serviceUuid);
    if (s) {
      return s.getCharacteristic(characteristicUuid);
    }
    return null;
  }

  /**
   * @ignore
   * @param param
   */
  public findDescriptor(param: any) {
    const descriptorUuid: any = BleHelper.uuidFilter(param.descriptor_uuid);
    const c: any = this.findCharacteristic(param);
    if (c) {
      return c.getDescriptor(descriptorUuid);
    }
    return null;
  }

  /**
   * Discover services.
   *
   * If connect setting param 'autoDiscovery' is true(default),
   * services are automatically disvocer on connection established.
   *
   *
   * ```javascript
   * // Javascript Example
   * await obniz.ble.initWait({});
   * obniz.ble.scan.onfind = function(peripheral){
   * if(peripheral.localName == "my peripheral"){
   *      peripheral.onconnect = async function(){
   *          console.log("success");
   *          await peripheral.discoverAllServicesWait(); //manually discover
   *          let service = peripheral.getService("1800");
   *      }
   *      peripheral.connect({autoDiscovery:false});
   *     }
   * }
   * obniz.ble.scan.start();
   * ```
   */
  public async discoverAllServicesWait(): Promise<BleRemoteService[]> {
    const serviceUuids = await this.obnizBle.centralBindings.discoverServicesWait(this.address);
    for (const uuid of serviceUuids) {
      let child: any = this.getService(uuid);
      if (!child) {
        const newService: any = new BleRemoteService({ uuid });
        newService.parent = this;
        this._services.push(newService);
        child = newService;
      }
      child.discoverdOnRemote = true;
      if (this.ondiscoverservice) {
        this.ondiscoverservice(child);
      }
    }

    const children: any = this._services.filter((elm: any) => {
      return elm.discoverdOnRemote;
    });

    if (this.ondiscoverservicefinished) {
      this.ondiscoverservicefinished(children);
    }
    return children;
  }

  /**
   * @ignore
   */
  public async discoverAllHandlesWait() {
    const ArrayFlat: any = (array: any, depth: any) => {
      const flattend: any = [];
      (function flat(_array: any, _depth: any) {
        for (const el of _array) {
          if (Array.isArray(el) && _depth > 0) {
            flat(el, _depth - 1);
          } else {
            flattend.push(el);
          }
        }
      })(array, Math.floor(depth) || 1);
      return flattend;
    };

    const services: any = await this.discoverAllServicesWait();
    const charsNest: any = await Promise.all(services.map((s: any) => s.discoverAllCharacteristicsWait()));
    const chars: any = ArrayFlat(charsNest);
    const descriptorsNest: any = await Promise.all(chars.map((c: any) => c.discoverAllDescriptorsWait()));

    // eslint-disable-next-line no-unused-vars
    const descriptors: any = ArrayFlat(descriptorsNest);
  }

  /**
   * @ignore
   * @param notifyName
   * @param params
   */
  public notifyFromServer(notifyName: any, params: any) {
    this.emitter.emit(notifyName, params);
    switch (notifyName) {
      case "statusupdate": {
        if (params.status === "connected") {
          this.connected = true;
          if (this.onconnect) {
            this.onconnect();
          }
        }
        if (params.status === "disconnected") {
          this.connected = false;
          if (this.ondisconnect) {
            this.ondisconnect();
          }
        }
        break;
      }
    }
  }

  /**
   * @ignore
   */
  public advertisementServiceUuids(): UUID[] {
    const results: UUID[] = [];
    this._addServiceUuids(results, this.searchTypeVal(0x02), 16);
    this._addServiceUuids(results, this.searchTypeVal(0x03), 16);
    this._addServiceUuids(results, this.searchTypeVal(0x04), 32);
    this._addServiceUuids(results, this.searchTypeVal(0x05), 32);
    this._addServiceUuids(results, this.searchTypeVal(0x06), 64);
    this._addServiceUuids(results, this.searchTypeVal(0x07), 64);
    return results;
  }

  public pairingWait(keys?: any) {
    return new Promise((resolve) => {
      this.obnizBle.centralBindings.pairing(this.address, keys, resolve);
    });
  }

  protected analyseAdvertisement() {
    if (!this.advertise_data_rows) {
      this.advertise_data_rows = [];
      if (this.adv_data) {
        for (let i = 0; i < this.adv_data.length; i++) {
          const length: any = this.adv_data[i];
          const arr: any = new Array(length);
          for (let j = 0; j < length; j++) {
            arr[j] = this.adv_data[i + j + 1];
          }
          this.advertise_data_rows.push(arr);
          i = i + length;
        }
      }
      if (this.scan_resp) {
        for (let i = 0; i < this.scan_resp.length; i++) {
          const length: any = this.scan_resp[i];
          const arr: any = new Array(length);
          for (let j = 0; j < length; j++) {
            arr[j] = this.scan_resp[i + j + 1];
          }
          this.advertise_data_rows.push(arr);
          i = i + length;
        }
      }
      this.setLocalName();
      this.setIBeacon();
    }
  }

  protected searchTypeVal(type: any) {
    this.analyseAdvertisement();
    for (let i = 0; i < this.advertise_data_rows.length; i++) {
      if (this.advertise_data_rows[i][0] === type) {
        const results: any = [].concat(this.advertise_data_rows[i]);
        results.shift();
        return results;
      }
    }
    return undefined;
  }

  protected setLocalName() {
    let data: any = this.searchTypeVal(0x09);
    if (!data) {
      data = this.searchTypeVal(0x08);
    }
    if (!data) {
      this.localName = null;
    } else {
      this.localName = String.fromCharCode.apply(null, data);
    }
  }

  protected setIBeacon() {
    const data: any = this.searchTypeVal(0xff);
    if (!data || data[0] !== 0x4c || data[1] !== 0x00 || data[2] !== 0x02 || data[3] !== 0x15 || data.length !== 25) {
      this.iBeacon = null;
      return;
    }
    const uuidData: any = data.slice(4, 20);
    let uuid: any = "";
    for (let i = 0; i < uuidData.length; i++) {
      uuid = uuid + ("00" + uuidData[i].toString(16)).slice(-2);
      if (i === 4 - 1 || i === 4 + 2 - 1 || i === 4 + 2 * 2 - 1 || i === 4 + 2 * 3 - 1) {
        uuid += "-";
      }
    }

    const major: any = (data[20] << 8) + data[21];
    const minor: any = (data[22] << 8) + data[23];
    const power: any = data[24];

    this.iBeacon = {
      uuid,
      major,
      minor,
      power,
      rssi: this.rssi!,
    };
  }

  protected _addServiceUuids(results: UUID[], data: any, bit: any) {
    if (!data) {
      return;
    }
    const uuidLength: any = bit / 8;
    for (let i = 0; i < data.length; i = i + uuidLength) {
      const one: any = data.slice(i, i + uuidLength);
      results.push(ObnizBLE._dataArray2uuidHex(one, true));
    }
  }
}
