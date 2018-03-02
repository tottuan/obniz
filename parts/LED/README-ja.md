# LED
LEDは電流を流すことで光る半導体です。電球よりもずっと少ない電流で光ります。部品にはプラスとマイナスの端子があります。逆だと電流が流れず光りません。プラスの端子は「アノード」マイナスの端子は「カソード」と言われています。プラスの端子のほうが足が長くなっています(これは他の電子部品でも同じです)

![](./led.jpg)

## obniz.wired("LED", {anode, cathode})
２本の足をObnizのピンにそれぞれ繋ぎます。LEDのプラス（足の長い方。アノードといいます）をObnizの0ピンに。マイナスをObnizの1ピンに繋いだ場合、プログラムでは以下のように設定します


```Javascript
var led = obniz.wired("LED", {anode:0, cathode:1}); // io0 is connected to anode, io1 is cathode
```

もしLEDのプラスだけをObnizにつなぎ、マイナスはどこかのマイナスにつながっている場合は１ピンだけの指定でOKです

```Javascript
var led = obniz.wired("LED", {anode:0}); // io0 is anode. cathode is connected obniz GND other way.
```
## on()
LEDを点灯させます。


### Example
```Javascript
var led = obniz.wired("LED", {anode:0, cathode:1});

led.on();
```

![](./led_on.jpg)

## off()
LEDを消灯させます


```Javascript
var led = obniz.wired("LED", {anode:0, cathode:1});

led.off();
```
## blink(interval_ms)
LEDを点滅させます。interval_msで指定した場合はその時間で点滅します。

```Javascript
var led = obniz.wired("LED", {anode:0, cathode:1});

led.blink(); // 100msec
```
## endBlink()
LEDの点滅をやめます。LEDは最後の状態で止まります。

```Javascript
var led = obniz.wired("LED", {anode:0, cathode:1});

led.blink();
led.endBllink();
```