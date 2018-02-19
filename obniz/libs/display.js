
var Display = function(Obniz) {
  this.Obniz = Obniz;
  this.width = 128;
  this.height = 64;
};

Display.prototype.clear = function() {
  var obj = {};
  obj["display"] = {
    clear: true
  };
  this.Obniz.send(obj);
};

Display.prototype.print = function(text) {
  var obj = {};
  obj["display"] = {
    text: ""+text
  };
  this.Obniz.send(obj);
};

Display.prototype.qr = function(text, correction) {
  var obj = {};
  obj["display"] = {
    qr: {
      text
    }
  };
  if (correction) {
    obj["display"].qr.correction = correction;
  }
  this.Obniz.send(obj);
};

Display.prototype.raw = function(data) {
  var obj = {};
  obj["display"] = {
    raw: data
  };
  this.Obniz.send(obj);
};

Display.prototype.setPinName = function(io, moduleName, funcName) {
  var obj = {};
  obj["display"] = {};
  obj["display"]["pin_assign"] = {};
  obj["display"]["pin_assign"][io] = {module_name : moduleName, pin_name:funcName};
  
  this.Obniz.send(obj);
};

Display.prototype.drawCanvasContext = function(ctx) {
  if (isNode) {
    // TODO:
    throw new Error("node js mode is under working.");
  } else {
    const stride = this.width/8;
    let vram = new Array(stride * 64);
    const imageData = ctx.getImageData(0, 0, this.width, this.height);
    const data = imageData.data;
    
    for(let i = 0; i < data.length; i += 4) {
      var brightness = 0.34 * data[i] + 0.5 * data[i + 1] + 0.16 * data[i + 2];
      var index = parseInt(i/4);
      var line = parseInt(index/this.width);
      var col = parseInt((index-line*this.width)/8);
      var bits = parseInt((index-line*this.width))%8;
      if (bits == 0)
        vram[line*stride + col] = 0x00;
      if (brightness > 0x7F)
      vram[line*stride + col] |= 0x80 >> bits;
    }
    this.raw(vram);
  }
  
}