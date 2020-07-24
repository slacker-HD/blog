---
title: 使用digispark打造简单voc在线监测仪-PC端
comments: true
date: 2017-11-22
tags: 
  - Arduino
  - Digispark
category: Arduino
---

在设备端我们引用了digiusb向PC机传输数据，对应PC端使用libusb与设备进行通信。同时我们将读取到的数据上传至第三方平台，这样完成数据的远程监控和查看。为简单起见，本程序采用控制台的方式进行操作,程序界面如下图所示：

<div align="center">
    <img src="/img/arduino/2017-11-22PCWindow.png" style="width:85%" align="center"/>
    <p>图 程序运行界面</p>
</div>

## 1.发现设备

首先设置Digispark的VID和PID，根据官网信息可知:

```cpp
#define DIGISPARKVID 0x16c0
#define DIGISPARKPID 0x05df
```

之后是通过libusb的通过usb_find_busses、usb_find_devices等函数获取系统所有的usb设备，代码如下:

```cpp
struct usb_dev_handle* p_handle = NULL;
struct usb_bus *bus = NULL;
struct usb_device *digispark = NULL;
struct usb_interface_descriptor *p_interface = NULL;
//初始化libusb
usb_init();
//获取usb总线的数量
bus_count = usb_find_busses();
if(bus_count<1)
{
  printf("bus not found.\n");
  return -1;
}
//获取usb设备的数量
device_count = usb_find_devices();
if(device_count<1)
{
  printf("device not found.\n");
  return -1;
}
```

循环比较PID和VID，即可找到已连接的Digispark设备，代码如下：

```cpp
// Check to see if each USB device matches the DigiSpark Vendor and Product IDs
for (bus = usb_get_busses(); bus; bus = bus->next)
{
  for (digispark = bus->devices; digispark; digispark = digispark->next)
  {
    if (digispark->descriptor.idVendor == DIGISPARKVID  && digispark->descriptor.idProduct == DIGISPARKPID)
    {
      //发现设备
      p_handle = usb_open(digispark);
      break;
    }
  }
}
```

## 2.硬件与设备数据传输

获取usb_dev_handle后，即可通过usb_control_msg函数读取数据。由于我们在设备端定义了将读取到的数据(int16类型)分两次以char的类型传输，简单起见，同样在PC端定义一个union体与之对应即可。读取设传输数据代码如下：

```cpp
typedef union
{
    __int16 ivalue;
    byte bvalue[2];
}VOCDATA;

while(true)
{
  result = usb_control_msg(p_handle, (0x01 << 5) | 0x80, 0x01, 0, 0, &tmpchar, 1, 1000);
  if(result>0)
  {
    value.bvalue[0] = (byte)tmpchar;
    result = usb_control_msg(p_handle, (0x01 << 5) | 0x80, 0x01, 0, 0, &tmpchar, 1, 1000);
    if(result>=0)
    {
      value.bvalue[1] = (byte)tmpchar;
      printf("VOC(PPM):%d\n",value.ivalue);
    }
  }
}
```

## 2.上传Yeelink

本例选择将数据上传至Yeelink平台，协议采用HTTP POST方式推送数据，协议内容如下：

```
POST /v1.0/device/YOU DEVICE ID/sensor/YOUR SENSOR ID/datapoints HTTP/1.1
Host: api.yeelink.net
U-ApiKey:YOUR APIKEY
Content-Length: 12
"value":读取的数值
```

直接使用winsock上传数据，关键代码如下：

```cpp
int upload_data_yeelink(char* apikey, char* deviceid, char* sensorid,int value)
{
  WSADATA WsaData;
  WSAStartup(0x0101, &WsaData);
  char valuestr[8];
  sprintf(valuestr,"%d",value);

  struct hostent* host_addr = gethostbyname("api.yeelink.net");
  if (host_addr == NULL)
  {
    cout<<"Unable to locate host"<<endl;
    return -103;
  }

  sockaddr_in sin;
  sin.sin_family = AF_INET;
  sin.sin_port = htons((unsigned short)80);
  sin.sin_addr.s_addr = *((int*)*host_addr->h_addr_list);

  int sock = socket(AF_INET, SOCK_STREAM, 0);
  if (sock == -1)
  {
    return -100;
  }

  if (connect(sock, (const struct sockaddr *)&sin, sizeof(sockaddr_in) ) == -1)
  {
    cout<<"connect failed"<<endl;
    return -101;
  }

  char send_str[2048] = {0};

  strcat(send_str, "POST /v1.0/device/");
  strcat(send_str, deviceid);
  strcat(send_str, "/sensor/");
  strcat(send_str, sensorid);
  strcat(send_str, "/datapoints HTTP/1.1\r\nHost: api.yeelink.net\r\nAccept: */*\r\nU-ApiKey:");
  strcat(send_str, apikey);
  strcat(send_str, "\r\nContent-Length: ");
  strcat(send_str, "14 ");
  strcat(send_str, "\r\nContent-Type: application/x-www-form-urlencoded\r\nConnection: close\r\n\r\n{\"value\":");
  strcat(send_str, valuestr);
  strcat(send_str, "}\r\n\r\n");

  if (send(sock, send_str, strlen(send_str),0) == -1)
  {
    return -101;
  }

  char recv_str[4096] = {0};
  if (recv(sock, recv_str, sizeof(recv_str), 0) == -1)
  {
    return -101;
  }
  WSACleanup( );
  return 0;
}
```

至此PC端程序完成，完整项目代码可在<a href="https://slacker_hd.coding.net/public/DigisparkEnvMon/DigisparkEnvMon/git" target="_blank">coding.net</a>下载。

~~补充：Yeelink网站好像经常不稳定，想截图网站打不开了。~~