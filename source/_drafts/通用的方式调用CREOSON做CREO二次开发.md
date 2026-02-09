---
title: 通用的方式调用CREOSON做CREO二次开发
tags:
  - CREO
  - CREO二次开发
comments: true
category: CREO二次开发
---

这是调用CREOSON做CREO二次开发的最后一篇。CREOSON的架构是用采用web服务器的方式对jlink进行了二次开发，用户通过对CREOSON server发送Http请求，并返回相应的结果。所以不管什么开发语言，只要能够按照官方给的格式发送请求并读取返回结果，即可轻松实现CREO二次开发。

## 1.Curl命令测试  

先用`curl`命令来手动实现前面打开当前目录下fin.prt添加参数后保存的代码。

### 1.1 创建会话

首先是打开Creo会话。按照CREOSON的文档，向CREOSON server发送请求：

```json
{
  "command": "connection",
  "function": "start_creo",
  "data": {
    "start_dir": "D:\\mydoc\\Creoson_test",
    "start_command": "nitro_proe_remote.bat",
    "retries": 5,
    "use_desktop": false
  }
}
```

打开命令提示符（注意不是powershell），输入以下命令：

```bash
curl -X POST "http://localhost:9056/creoson" -H "Content-Type: application/json" --max-time 60 -k -d "{\"command\":\"connection\",\"function\":\"start_creo\",\"data\":{\"start_dir\":\"D:\\\\mydoc\\\\Creoson_test\",\"start_command\":\"nitro_proe_remote.bat\",\"retries\":5,\"use_desktop\":false}}"
```

运行正确会返回以下结果，同时打开了Creo：

```json
{"status":{"error":false},"data":null}
```

### 1.2 连接会话

接下来是连接会话，获取SessionId，对应的请求是：

```json
{
  "command": "connection",
  "function": "connect",
  "data": {
    "timeout": 60000
  }
}
```

运行Curl命令：

```bash
curl -X POST "http://localhost:9056/creoson" -H "Content-Type: application/json" --max-time 60 -k -d "{\"command\":\"connection\",\"function\":\"connect\",\"data\":{\"timeout\":60000}}"
```

正常的情况下返回结果如下，sessionId根据实际会有不同的值：

```json
{"status":{"error":false},"sessionId":"8332306140927056488","data":null}
```

### 1.3 切换工作目录

对应的请求如下，注意sessionId应是上一步返回的结果：

```json
{
  "command": "creo",
  "function": "cd",
  "sessionId": "8332306140927056488",
  "data": {
    "dirname": "D:\\mydoc\\Creoson_test"
  }
}
```

运行Curl命令：

```bash
curl -X POST "http://localhost:9056/creoson" -H "Content-Type: application/json" --max-time 60 -k -d "{\"command\":\"creo\",\"function\":\"cd\",\"sessionId\":\"8332306140927056488\",\"data\":{\"dirname\":\"D:\\\\mydoc\\\\Creoson_test\"}}"
```

正常的情况下返回结果如下：

```json
{"status":{"error":false},"data":{"dirname":"D:/mydoc/Creoson_test/"}}
```

### 1.4 打开文件

对应的请求如下，注意sessionId：

```json
{
  "command": "file",
  "function": "open",
  "sessionId": "8332306140927056488",
  "data": {
    "file": "fin.prt",
    "display": true,
    "activate": true
  }
}
```

运行Curl命令：

```bash
curl -X POST "http://localhost:9056/creoson" -H "Content-Type: application/json" --max-time 60 -k -d "{\"command\":\"file\",\"function\":\"open\",\"sessionId\":\"8332306140927056488\",\"data\":{\"file\":\"fin.prt\",\"display\":true,\"activate\":true}}"
```

返回结果如下：

```json
{"status":{"error":false},"data":{"files":["FIN.prt"],"dirname":"D:/mydoc/Creoson_test/"}}
```

### 1.5 添加修改参数

对应的请求如下，注意sessionId：

```json
{
  "command": "parameter",
  "function": "set",
  "sessionId": "8332306140927056488",
  "data": {
    "name": "test",
    "type": "STRING",
    "value": "Curl手动添加参数",
    "no_create": false,
    "designate": true
  }
}
```

运行Curl命令：

```bash
curl -X POST "http://localhost:9056/creoson" -H "Content-Type: application/json" --max-time 60 -k -d "{\"command\":\"parameter\",\"function\":\"set\",\"sessionId\":\"8332306140927056488\",\"data\":{\"name\":\"test\",\"type\":\"STRING\",\"value\":\"Curl手动添加参数\",\"no_create\":false,\"designate\":true}}"
```

返回结果如下：

```json
{"status":{"error":false},"data":null}
```

### 1.6 保存文件

对应的请求如下，注意sessionId：

```json
{
  "command": "file",
  "function": "save",
  "sessionId": "8332306140927056488",
  "data": {
    "file": "fin.prt"
  }
}
```

运行Curl命令：

```bash
curl -X POST "http://localhost:9056/creoson" -H "Content-Type: application/json" --max-time 60 -k -d "{\"command\":\"file\",\"function\":\"save\",\"sessionId\":\"8332306140927056488\",\"data\":{\"file\":\"fin.prt\"}}"
```

返回结果如下：

```json
{"status":{"error":false},"data":null}
```

这样我们就用手动输入Curl命令实现了前面文章的CREO二次开发功能。

## 2.使用批处理实现

根据上面的内容，可以将Curl命令写入一个批处理文件中，然后运行该批处理文件即可实现CREO二次开发功能，唯一需要处理的就是获得第二部Connect后得到的SessionId并传入后续步骤。也没什么好说的，直接给出代码：

```bat
@echo off
chcp 65001 >nul
setlocal EnableDelayedExpansion

rem 配置参数
set "CREOSON_URL=http://localhost:9056/creoson"
set "WORK_DIR=D:\mydoc\Creoson_test"
set "TARGET_FILE=fin.prt"
set "START_COMMAND=nitro_proe_remote.bat"
set "TIMEOUT=60"

set "SESSION_ID="

echo ============================================
echo    Creo CREOSON 自动化操作脚本
echo ============================================
echo.

rem 步骤 1.1: 创建会话
echo [1/6] 正在启动 Creo 会话...

curl -X POST "%CREOSON_URL%" -H "Content-Type: application/json" --max-time %TIMEOUT% -k -s ^
  -d "{\"command\":\"connection\",\"function\":\"start_creo\",\"data\":{\"start_dir\":\"%WORK_DIR:\=\\\\%\",\"start_command\":\"%START_COMMAND%\",\"retries\":5,\"use_desktop\":false}}" ^
  > response.json

call :CheckError "启动Creo"
if errorlevel 1 goto :ErrorExit

echo [✓] Creo 启动成功
echo.

rem 步骤 1.2: 连接会话
echo [2/6] 正在连接会话并获取 Session ID...

curl -X POST "%CREOSON_URL%" -H "Content-Type: application/json" --max-time %TIMEOUT% -k -s ^
  -d "{\"command\":\"connection\",\"function\":\"connect\",\"data\":{\"timeout\":60000}}" ^
  > response.json

rem 纯CMD方式解析JSON中的sessionId
call :ParseSessionId
if "!SESSION_ID!"=="" (
    echo [✗] 未能获取 Session ID
    type response.json
    goto :ErrorExit
)

echo [✓] 连接成功，Session ID: !SESSION_ID!
echo.

rem 步骤 1.3: 切换工作目录
echo [3/6] 正在切换工作目录...

curl -X POST "%CREOSON_URL%" -H "Content-Type: application/json" --max-time %TIMEOUT% -k -s ^
  -d "{\"command\":\"creo\",\"function\":\"cd\",\"sessionId\":\"!SESSION_ID!\",\"data\":{\"dirname\":\"%WORK_DIR:\=\\\\%\"}}" ^
  > response.json

call :CheckError "切换工作目录"
if errorlevel 1 goto :ErrorExit

echo [✓] 工作目录切换成功
echo.

rem 步骤 1.4: 打开文件
echo [4/6] 正在打开文件: %TARGET_FILE%...

curl -X POST "%CREOSON_URL%" -H "Content-Type: application/json" --max-time %TIMEOUT% -k -s ^
  -d "{\"command\":\"file\",\"function\":\"open\",\"sessionId\":\"!SESSION_ID!\",\"data\":{\"file\":\"%TARGET_FILE%\",\"display\":true,\"activate\":true}}" ^
  > response.json

call :CheckError "打开文件"
if errorlevel 1 goto :ErrorExit

echo [✓] 文件打开成功
echo.

rem 步骤 1.5: 添加参数
echo [5/6] 正在添加参数...

curl -X POST "%CREOSON_URL%" -H "Content-Type: application/json" --max-time %TIMEOUT% -k -s ^
  -d "{\"command\":\"parameter\",\"function\":\"set\",\"sessionId\":\"!SESSION_ID!\",\"data\":{\"name\":\"test\",\"type\":\"STRING\",\"value\":\"批处理调用Curl手动添加参数\",\"no_create\":false,\"designate\":true}}" ^
  > response.json

call :CheckError "添加参数"
if errorlevel 1 goto :ErrorExit

echo [✓] 参数添加成功
echo.

rem 步骤 1.6: 保存文件
echo [6/6] 正在保存文件...

curl -X POST "%CREOSON_URL%" -H "Content-Type: application/json" --max-time %TIMEOUT% -k -s ^
  -d "{\"command\":\"file\",\"function\":\"save\",\"sessionId\":\"!SESSION_ID!\",\"data\":{\"file\":\"%TARGET_FILE%\"}}" ^
  > response.json

call :CheckError "保存文件"
if errorlevel 1 goto :ErrorExit

echo [✓] 文件保存成功
echo.

rem 完成
echo ============================================
echo    所有操作执行成功！
echo ============================================
goto :CleanExit

rem ============================================
rem 子程序: 解析Session ID (纯CMD实现)
rem ============================================
:ParseSessionId
set "SESSION_ID="
set "jsonline="

rem 读取包含sessionId的行
for /f "delims=" %%a in ('findstr /i /c:"\"sessionId\"" response.json') do (
    set "jsonline=%%a"
    goto :GotLine
)

:GotLine
if "!jsonline!"=="" exit /b 1

rem 提取sessionId值
set "temp=!jsonline!"
set "marker="sessionId""
call :GetSubstringAfter "!temp!" "!marker!" temp

rem 去掉冒号
set "temp=!temp::=!"

rem 去掉双引号
set "temp=!temp:"=!"

rem 去掉空格
set "temp=!temp: =!"

rem 提取逗号前的数字部分
for /f "delims=," %%b in ("!temp!") do set "SESSION_ID=%%b"

exit /b 0

rem ============================================
rem 子程序: 获取标记后的子字符串
rem ============================================
:GetSubstringAfter
set "str=%~1"
set "marker=%~2"

rem 查找标记位置并提取之后的内容
set "test=!str:*%marker%=!"
if "!test!"=="!str!" (
    rem 未找到标记
    set "%~3="
    exit /b 1
)

rem 去掉标记及其前面的所有内容
set "result=!str:*%marker%=!"
set "%~3=!result!"

exit /b 0

rem ============================================
rem 子程序: 检查错误
rem ============================================
:CheckError
findstr /C:"\"error\":false" response.json >nul
if errorlevel 1 (
    echo [✗] %~1 失败
    type response.json
    exit /b 1
)
exit /b 0

:ErrorExit
echo.
echo ============================================
echo    执行过程中出现错误
echo ============================================

:CleanExit
if exist response.json del response.json
endlocal
exit /b 0
```

## 3.PHP实现

按照前面的思路，给出php实现打开当前目录下fin.prt添加参数后保存的代码，也没什么好解释的，无非是发送对应的请求即可：

```php
<?php
// 开启错误显示
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('default_charset', 'UTF-8');


class CreosonClient
{
    private $creosonUrl = 'http://localhost:9056/creoson';
    private $timeout = 60;
    private $sessionId = '';


    public function creosonPost($command, $function, $data = [])
    {
        $requestBody = [
            'command' => $command,
            'function' => $function
        ];

        if (!empty($this->sessionId)) {
            $requestBody['sessionId'] = $this->sessionId;
        }

        if (!empty($data)) {
            $requestBody['data'] = (object) $data;
        }

        $postData = json_encode(
            $requestBody,
            JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_FORCE_OBJECT
        );

        echo "[调试] 请求URL: {$this->creosonUrl}\n";
        echo "[调试] {$command}.{$function} {$postData}\n";

        // 执行CURL请求
        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => $this->creosonUrl,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $postData,
            CURLOPT_HTTPHEADER => [
                'Content-Type: application/json; charset=UTF-8',
                'Content-Length: ' . strlen($postData)
            ],
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => $this->timeout,
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_SSL_VERIFYHOST => false
        ]);

        $response = curl_exec($ch);
        $curlError = curl_error($ch);
        curl_close($ch);

        if ($curlError) {
            throw new Exception("[CURL错误] {$curlError}");
        }

        $result = json_decode($response, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception("[JSON解析错误] 响应: {$response} | 错误: " . json_last_error_msg());
        }

        if (isset($result['status']['error']) && $result['status']['error'] === true) {
            $msg = isset($result['status']['message']) ? $result['status']['message'] : '未知错误';
            if ($msg == 'No session found') {
                throw new Exception("[会话未就绪] {$msg}", 1001);
            }
            throw new Exception("[Creoson错误] {$msg}");
        }

        // 保存connect返回的sessionId
        if ($command == 'connection' && $function == 'connect' && isset($result['sessionId'])) {
            $this->sessionId = $result['sessionId'];
            echo "[会话] 获取到官方SessionID: {$this->sessionId}\n";
        }

        return $result;
    }

    public function startCreo($config)
    {
        echo "【1/6】发送Creo启动命令...\n";
        $this->creosonPost('connection', 'start_creo', $config);
        echo "【1/6】Creo启动命令发送完成！\n";
    }

    public function connect()
    {
        echo "【2/6】建立Creoson会话...\n";
        $this->creosonPost('connection', 'connect');
        echo "【2/6】检测Creo会话就绪状态...\n";
    }

    public function creoCd($dirName)
    {
        echo "【3/6】切换Creo工作目录到: {$dirName}\n";
        $absDir = realpath($dirName);
        if (!$absDir || !is_dir($absDir)) {
            throw new Exception("目录不存在或无效: {$dirName}（绝对路径: {$absDir}）");
        }
        $this->creosonPost('creo', 'cd', [
            'dirname' => $absDir
        ]);
        echo "【3/6】工作目录切换成功！\n";
    }

    public function fileOpen($file, $generic = "", $display = true, $activate = true)
    {
        echo "【4/6】打开Creo文件: {$file}\n";
        $fileName = basename($file); 
        $absFile = realpath("D:\\mydoc\\Creoson_test\\" . $fileName);

        if (!$absFile || !file_exists($absFile)) {
            throw new Exception("文件不存在或无效: {$file}（完整路径: {$absFile}）");
        }

        $params = [
            'file' => $fileName,
            'display' => $display,
            'activate' => $activate
        ];
        // generic字段可选，非空时添加
        if (!empty($generic)) {
            $params['generic'] = $generic;
        }

        $this->creosonPost('file', 'open', $params);
        echo "【4/6】文件打开成功！\n";
    }

    public function parameterSet($name, $value, $type = 'STRING')
    {
        echo "【5/6】设置参数 {$name} = {$value}（类型: {$type}）\n";
        $this->creosonPost('parameter', 'set', [
            'name' => $name,
            'type' => $type,
            'value' => $value,
            'no_create' => false,
            'designate' => true
        ]);
        echo "【5/6】参数设置成功！\n";
    }

    public function fileSave($file)
    {
        echo "【6/6】保存Creo文件: {$file}\n";
        $fileName = basename($file);
        $absFile = realpath("D:\\mydoc\\Creoson_test\\" . $fileName);
        if (!$absFile) {
            throw new Exception("文件路径无效: {$file}（完整路径: {$absFile}）");
        }
        $this->creosonPost('file', 'save', [
            'file' => $fileName
        ]);
        echo "【6/6】文件保存成功！\n";
    }
}

try {
    $client = new CreosonClient();
    $creoConfig = [
        'start_dir' => 'D:\\mydoc\\Creoson_test',
        'start_command' => 'nitro_proe_remote.bat',
        'retries' => 5,
        'use_desktop' => false
    ];

    // 执行流程
    $client->startCreo($creoConfig);
    $client->connect();
    $client->creoCd('D:\\mydoc\\Creoson_test');
    $client->fileOpen("fin.prt", "fin");
    $client->parameterSet("test", "PHP调用CREOSON添加的参数", "STRING");
    $client->fileSave("fin.prt");

    echo "\n===== 全流程执行完成！=====\n";

} catch (Exception $e) {
    echo "\n===== 执行失败 =====\n";
    echo "错误详情: " . $e->getMessage() . "\n";
    echo "====================\n";
    exit(1);
}
?>
```

## 4.Python实现

同样的，Python也可以不使用CREOSON的库，使用HTTP请求实现：

```python
import requests
import json
import os
import sys
from pathlib import Path
import urllib3

# 禁用SSL警告（与JS中的 rejectUnauthorized: false 等效）
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)


class CreosonClient:
    def __init__(self):
        self.creoson_url = 'http://localhost:9056/creoson'
        self.timeout = 60 
        self.session_id = ''

    def creoson_post(self, command: str, function_name: str, data: dict = None) -> dict:
        if data is None:
            data = {}

        request_body = {
            "command": command,
            "function": function_name
        }

        if self.session_id:
            request_body["sessionId"] = self.session_id

        if data:
            request_body["data"] = data

        post_data = json.dumps(request_body, ensure_ascii=False)

        print(f"[调试] 请求URL: {self.creoson_url}")
        print(f"[调试] {command}.{function_name} {post_data}")

        try:
            response = requests.post(
                self.creoson_url,
                data=post_data.encode('utf-8'),
                timeout=self.timeout,
                headers={
                    'Content-Type': 'application/json; charset=UTF-8',
                    'Content-Length': str(len(post_data.encode('utf-8')))
                },
                verify=False
            )

            response.raise_for_status()
            result = response.json()

            if not isinstance(result, dict):
                raise Exception(f"[JSON解析错误] 响应: {response.text} | 错误: 无效的JSON格式")

            status = result.get('status', {})
            if status.get('error') is True:
                msg = status.get('message', '未知错误')
                if msg == 'No session found':
                    error = Exception(f"[会话未就绪] {msg}")
                    error.code = 1001
                    raise error
                raise Exception(f"[Creoson错误] {msg}")

            if command == 'connection' and function_name == 'connect' and result.get('sessionId'):
                self.session_id = result['sessionId']
                print(f"[会话] 获取到官方SessionID: {self.session_id}")

            return result

        except requests.exceptions.Timeout:
            raise Exception(f"[请求超时] 请求超时（{self.timeout}秒）")
        except requests.exceptions.HTTPError as e:
            raise Exception(f"[HTTP错误] 状态码: {e.response.status_code} | 响应: {e.response.text}")
        except requests.exceptions.ConnectionError as e:
            raise Exception(f"[CURL错误] 无法连接到服务器: {str(e)}")
        except json.JSONDecodeError:
            raise Exception(f"[JSON解析错误] 响应: {response.text} | 错误: 无效的JSON格式")
        except Exception:
            raise

    def start_creo(self, config: dict):
        print("【1/6】发送Creo启动命令...")
        self.creoson_post('connection', 'start_creo', config)
        print("【1/6】Creo启动命令发送完成！")

    def connect(self):
        print("【2/6】建立Creoson会话...")
        self.creoson_post('connection', 'connect')
        print("【2/6】检测Creo会话就绪状态...")

    def creo_cd(self, dir_name: str):
        print(f"【3/6】切换Creo工作目录到: {dir_name}")
        abs_dir = Path(dir_name).resolve()

        if not abs_dir.exists() or not abs_dir.is_dir():
            raise Exception(f"目录不存在或无效: {dir_name}（绝对路径: {abs_dir}）")

        self.creoson_post('creo', 'cd', {
            "dirname": str(abs_dir)
        })
        print("【3/6】工作目录切换成功！")

    def file_open(self, file: str, generic: str = "", display: bool = True, activate: bool = True):
        print(f"【4/6】打开Creo文件: {file}")
        file_name = Path(file).name
        abs_file = Path("D:\\mydoc\\Creoson_test\\") / file_name

        if not abs_file.exists() or not abs_file.is_file():
            raise Exception(f"文件不存在或无效: {file}（完整路径: {abs_file}）")

        params = {
            "file": file_name,
            "display": display,
            "activate": activate
        }

        if generic:
            params["generic"] = generic

        self.creoson_post('file', 'open', params)
        print("【4/6】文件打开成功！")

    def parameter_set(self, name: str, value: str, type_: str = 'STRING'):
        print(f"【5/6】设置参数 {name} = {value}（类型: {type_}）")
        self.creoson_post('parameter', 'set', {
            "name": name,
            "type": type_,
            "value": value,
            "no_create": False,
            "designate": True
        })
        print("【5/6】参数设置成功！")

    def file_save(self, file: str):
        print(f"【6/6】保存Creo文件: {file}")
        file_name = Path(file).name
        abs_file = Path("D:\\mydoc\\Creoson_test\\") / file_name

        if not abs_file.exists():
            raise Exception(f"文件路径无效: {file}（完整路径: {abs_file}）")

        self.creoson_post('file', 'save', {
            "file": file_name
        })
        print("【6/6】文件保存成功！")


def main():
    try:
        client = CreosonClient()
        creo_config = {
            "start_dir": 'D:\\mydoc\\Creoson_test',
            "start_command": 'nitro_proe_remote.bat',
            "retries": 5,
            "use_desktop": False
        }

        client.start_creo(creo_config)
        client.connect()
        client.creo_cd('D:\\mydoc\\Creoson_test')
        client.file_open("fin.prt", "fin")
        client.parameter_set("test", "PYthon调用CREOSON添加的参数", "STRING")
        client.file_save("fin.prt")

        print("\n===== 全流程执行完成！=====")
    except Exception as error:
        print("\n===== 执行失败 =====")
        print(f"错误详情: {error}")
        if hasattr(error, 'code'):
            print(f"错误代码: {error.code}")
        sys.exit(1)


if __name__ == "__main__":
    main()
```

其余如java、CSharp等语言均可按照这个思路实现，代码公开不一一赘述了，可在<a href="https://github.com/slacker-HD/Creoson_test" target="_blank">Github.com</a>下载。
