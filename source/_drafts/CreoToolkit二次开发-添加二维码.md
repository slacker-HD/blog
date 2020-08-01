---
title: Creo Toolkit二次开发-添加二维码
tags:
  - CREO
  - TOOLKIT
  - CREO二次开发
comments: true
category: CREO二次开发
---

在工程图中插入二维码可以方便机器扫描读取，易于将图纸与MES、ERP等系统结合。添加二维码一般可以考虑以下方式：

1. 在工程图中插入图片等OLE内容。可以在Creo中导入外部程序生成的诸如jpg、png等图片格式的二维码文件。经测试，插入OLE内容暂时不仅未提供Toolkit接口，并且录制宏发现插入图片的操作也无法通过宏的方式实现，所以该方法只能由设计人员手动添加，无法进行二次开发。
2. 在工程图中插入dxf。可以在Creo中导入外部程序生成的dxf格式的二维码文件。经测试，导入的dxf文件会转换为草绘对象，而且Toolkit提供了Pro2dImportAppend函数用于导入dxf文件，所以该方法不仅可以手动操作，也适合于二次开发。但该方法导入dxf后添加了一系列草绘图元，当需要修改时难以确定那些草绘时导入的dxf文件转换得到导致难以对二维码相关的草绘删除修改，故该方法仅适用于一次性导入二维码的操作。
3. 生成包含二维码信息的符号。可以在绘图中添加一个符号，在符号中绘制对应的二维码图案，之后插入该符号。该方法手工操作较复杂，主要需要手动绘制对应的二维码符号，但易于插入修改及替换，而Toolkit也提供了绘制符号的方式，本文主要采用本方法在绘图中添加二维码。

## 1.添加二维码的基本流程

如上分析，通过添加符号的方式为工程图添加二维码主要包含以下几个步骤：

1. 遍历工程图所有符号实例，删除之前添加的二维码符号实例；
2. 遍历工程图所有符号定义，删除之前添加的二维码符号定义；
3. 对输入进行转码，生成二维码信息；
4. 创建新的符号定义，根据二维码信息对该符号定义进行修改，生成包含二维码信息的符号定义；
5. 根据实际，生成符号定义的实例并将其摆放到正确的位置。

## 2. 遍历并删除符号定义

Toolkit提供了ProDrawingDtlsymdefsCollect函数收集绘图所包含的所有符号对象定义。获取所有符号定义后对即可其遍历，使用ProDtlsymdefdataNameGet函数获取符号的名称，通过名称进行比对，如果名称与我们定义的二维码符号名称一致则调用ProDtlsymdefDelete删除符号定义。遍历并删除符号定义示例代码如下：

```cpp
CString DtlsymdefName(ProDtlsymdef *p_sym_def)
{
  ProDtlsymdefdata data;
  ProError status;
  ProName name;
  if (p_sym_def == NULL || p_sym_def->type != PRO_SYMBOL_DEFINITION)
    return "";
  status = ProDtlsymdefDataGet(p_sym_def, &data);
  status = ProDtlsymdefdataNameGet(data, name);
  return CString(name);
}

void DeletePreQrCodeDef()
{
  ProError status;
  ProDrawing drawing;
  ProDtlsymdef *p_symdefs;
  int size;
  CString SymName;
  if (CurrentMdlType() != PRO_DRAWING)
    return;
  status = ProMdlCurrentGet((ProMdl *)&drawing);
  status = ProDrawingDtlsymdefsCollect(drawing, &p_symdefs);
  status = ProArraySizeGet((ProArray)p_symdefs, &size);
  for (int i = 0; i < size; i++)
  {
    if (DtlsymdefName(&p_symdefs[i]) == QRCODESYMNAME)
    {
      status = ProDtlsymdefDelete(&p_symdefs[i]);
    }
  }
  status = ProArrayFree((ProArray *)&p_symdefs);
}
```

经测试，如果直接删除符号定义，则符号定义生成的对象实例也同时一并删除，故无需进行删除符号实例的操作。

## 3.字符串转二维码<sup>[1]</sup>

生成QRCODE的数据我们直接使用了<a href="https://github.com/elicec/MFCQRcode" target="_blank">Github.com上MFCQRcode项目提供的LibQRCode库</a>。使用该库只需添加LibQRCode.lib以及对应头文件qrencode.h的引用，为常规的库文件引用操作，在此不在赘述。根据工程介绍，生成二维码并访问其信息的示例代码如下：

```cpp
if (pQRC = QRcode_encodeString(message, 0, QR_ECLEVEL_L, QR_MODE_8, 1)) //根据实际调整对应的参数
  {
    pSourceData = pQRC->data;
    unWidth = pQRC->width;//矩阵的长和宽
    for (y = 0; y < unWidth; y++)
    {
      for (x = 0; x < unWidth; x++)
      {
        if (*pSourceData & 1)
        {
          //如果是true，则矩阵这个点为实心方块
        }
        pSourceData++;
      }
    }
    QRcode_free(pQRC);
  }
```

## 4.创建二维码符号定义

### 4.1 创建符号定义

创建一个新的符号定义可以用ProDtlsymdefdataAlloc、ProDtlsymdefCreate等实现，使用ProDtlsymdefdataAttachAdd等函数可以设置其插入方式为自由摆放，ProDtlsymdefdataPathSet设置其名称等。操作相对简单，直接给出创建符号定义对应的代码：

```cpp
void QRcodeSymdefCreate(ProDrawing drawing, CString name, CString message, ProVector position)
{
  ProError status;
  ProDtlsyminstdata sdata;
  ProDtlattach attach;
  ProDtlsyminst syminst;

  status = ProDtlsymdefdataAlloc(drawing, &sdata);
  symdefname = name.AllocSysString();
  status = ProDtlsymdefdataPathSet(sdata, symdefname);
  SysFreeString(symdefname);
  status = ProDtlsymdefdataHeighttypeSet(sdata, PRODTLSYMDEFHGHTTYPE_FIXED);
  status = ProDtlsymdefattachAlloc(PROSYMDEFATTACHTYPE_FREE, 0, 0.0, origin, &attach);
  status = ProDtlsymdefdataAttachAdd(sdata, attach);
  status = ProDtlsymdefattachFree(attach);
  status = ProDtlsymdefCreate(drawing, sdata, &symdef);
  status = ProDtlsymdefdataFree(sdata);
  // 后续代码
}
```

### 4.2 符号定义中绘制二维码

为便于描述，我们设定在符号中画一个1mm长，线宽1mm的线段作为二维码中的点。在符号中创建草绘与在绘图中创建草绘过程基本一致，只是在调用ProDtlentityCreate函数的参数中的第二个参数需指定为二维码的符号定义对象。创建草绘以及设定其属性在之前<a href="https://www.hudi.site/2020/08/01/CREO Toolkit二次开发-草绘中心线/" target="_blank">CREO Toolkit二次开发-草绘中心线</a>一文中已经进行了描述，在此不在赘述，直接给出源码：

```cpp
void PrintQRCodeDot(ProDtlsymdef *symdef, ProVector start, ProColortype color)
{
  ProError status;
  ProDtlentity entity;
  ProDtlentitydata edata;
  ProCurvedata *curve;
  ProColor entity_color;
  ProVector end;
  end[0] = start[0];
  end[1] = start[1] + 1;
  end[2] = start[2];
  status = ProDtlentitydataAlloc(symdef->owner, &edata);
  status = ProCurvedataAlloc(&curve);
  status = ProLinedataInit(start, end, curve);
  status = ProDtlentitydataCurveSet(edata, curve);
  entity_color.method = PRO_COLOR_METHOD_TYPE;
  entity_color.value.type = color;
  status = ProDtlentitydataColorSet(edata, &entity_color);
  status = ProDtlentitydataWidthSet(edata, 1.0);
  status = ProDtlentityCreate(symdef->owner, symdef, edata, &entity);
  status = ProDtlentitydataFree(edata);
}
```

在第三节字符串转二维码中我们已获得了二维码信息矩阵，故只需根据该矩阵的信息在对应的位置调用PrintQRCodeDot绘制实心方块即可：

```cpp
void QRcodeSymdefCreate(ProDrawing drawing, CString name, CString message, ProVector position)
{
  ProError status;
  ProDtlsymdefdata sdata;
  ProVector origin = {0, 0, 0}, start;
  ProDtlsymdefattach attach;
  ProDtlsymdef symdef;
  wchar_t *symdefname;

  int unWidth, x, y;
  unsigned char *pSourceData;
  QRcode *pQRC;

  status = ProDtlsymdefdataAlloc(drawing, &sdata);
  symdefname = name.AllocSysString();
  status = ProDtlsymdefdataPathSet(sdata, symdefname);
  SysFreeString(symdefname);
  status = ProDtlsymdefdataHeighttypeSet(sdata, PRODTLSYMDEFHGHTTYPE_FIXED);
  status = ProDtlsymdefattachAlloc(PROSYMDEFATTACHTYPE_FREE, 0, 0.0, origin, &attach);
  status = ProDtlsymdefdataAttachAdd(sdata, attach);
  status = ProDtlsymdefattachFree(attach);
  status = ProDtlsymdefCreate(drawing, sdata, &symdef);
  status = ProDtlsymdefdataFree(sdata);
  if (pQRC = QRcode_encodeString(message, 0, QR_ECLEVEL_L, QR_MODE_8, 1))
  {
    start[0] = 0.5;
    start[1] = -0.5;
    start[2] = 0.0;
    pSourceData = pQRC->data;
    unWidth = pQRC->width;
    start[1] += unWidth;
    for (y = 0; y < unWidth; y++)
    {
      for (x = 0; x < unWidth; x++)
      {
        if (*pSourceData & 1)
        {
          PrintQRCodeDot(&symdef, start, PRO_COLOR_LETTER);
        }
        start[0]++;
        pSourceData++;
      }
      start[0] = 0.5;
      start[1]--;
    }
    QRcode_free(pQRC);
  }
  //创建完毕，现在可以摆放符号了
}
```

## 5.插入符号实例

插入符号也无非是设定相关参数并显示的操作，各函数调用也是基本的toolkit函数调用，注意内存的释放即可：

```cpp
void SymInstCreateFree(ProDrawing drawing, ProDtlsymdef *definition, ProVector position)
{
  ProError status;
  ProDtlsyminstdata sdata;
  ProDtlattach attach;
  ProDtlsyminst syminst;
  status = ProDtlsyminstdataAlloc(drawing, &sdata);
  status = ProDtlsyminstdataDefSet(sdata, definition);
  status = ProDtlsyminstdataAttachtypeSet(sdata, PROSYMDEFATTACHTYPE_FREE);
  status = ProDtlattachAlloc(PRO_DTLATTACHTYPE_FREE, NULL, position, NULL, &attach);
  status = ProDtlsyminstdataAttachmentSet(sdata, attach);
  status = ProDtlattachFree(attach);
  status = ProDtlsyminstCreate(drawing, sdata, &syminst);
  status = ProDtlsyminstdataFree(sdata);
  status = ProDtlsyminstShow(&syminst);
}
```

插入二维码的实际演示效果如下图所示，读者也可以根据实际情况修改对应的文字、颜色及摆放位置：

<div align="center">
    <img src="/img/proe/qrcode.gif" style="width:75%" align="center"/>
    <p>图 插入二维码示例</p>
</div>

完整代码可在<a href="https://github.com/slacker-HD/creo_toolkit" target="_blank">Github.com</a>下载。代码在VS2010,Creo 2.0 M060 X64下编译通过。

## 参考网站

[1] elicec/MFCQRcode. 2020-XXX-XXX[引用日期XXXXXXXXXXXXXXXXXXXX],<a href="https://github.com/elicec/MFCQRcode" target="_blank">https://github.com/elicec/MFCQRcode</a>.
