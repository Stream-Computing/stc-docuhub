---
sidebar_position: 4
sidebar_label: C++ API
sidebar_class_name: green
---

# C++ API

## STCML API

本章节详细的描述了STCML（Stream Computing Management Library）接口，用户可使用这些接口进行设备管理查询等操作。STCML接口相关的库为`libstcml.so`。用户可调用接口完成二次开发。

### 调用要求

* 已安装HPE。

* 在代码文件中导入所需的头文件，包括但不限于：

  ```c++
  #include <stcml.h>
  ```

### 接口说明

#### stcmlInit

函数描述：调用stcmlInit初始化STCML。

函数定义：

```c++
stcmlReturn_t stcmlInit()
```

函数参数：

无

函数返回值：

| **类型**      | **说明**                                                     |
| ------------- | ------------------------------------------------------------ |
| stcmlReturn_t | - 返回值为0：成功。<br/>- 返回值为其他值：失败，详细的说明请参见错误码章节。 |

#### stcmlShutdown

函数描述：调用stcmlShutdown关闭STCML，释放stcmlInit中初始化的资源。

函数定义：

```c++
stcmlReturn_t stcmlShutdown()
```

函数参数：

无

函数返回值：

| **类型**      | **说明**                                                     |
| ------------- | ------------------------------------------------------------ |
| stcmlReturn_t | - 返回值为0：成功。<br/>- 返回值为其他值：失败，详细的说明请参见错误码章节。 |

#### stcmlDeviceGetCount

函数描述：调用stcmlDeviceGetCount获取当前设备数量。

函数定义：

```c++
stcmlReturn_t stcmlDeviceGetCount(unsigned int *deviceCount)
```

函数参数：

| **名称**    | **输入/输出** | **类型**       | **描述**       |
| ----------- | ------------- | -------------- | -------------- |
| deviceCount | 输出参数      | unsigned int * | 当前设备数量。 |

函数返回值：

| **类型**      | **说明**                                                     |
| ------------- | ------------------------------------------------------------ |
| stcmlReturn_t | - 返回值为0：成功。<br/>- 返回值为其他值：失败，详细的说明请参见错误码章节。 |

#### stcmlDeviceGetHandleByIndex

函数描述：调用stcmlDeviceGetHandleByIndex获取当前指定设备编号对应的设备句柄。

函数定义：

```c++
stcmlReturn_t stcmlDeviceGetHandleByIndex(unsigned int index, stcDevice_t **device)
```

函数参数：

| **名称** | **输入/输出** | **类型**       | **描述**           |
| -------- | ------------- | -------------- | ------------------ |
| index    | 输入参数      | unsigned int   | 指定设备编号。     |
| device   | 输出参数      | stcDevice_t ** | 返回指定设备句柄。 |

函数返回值：

| **类型**      | **说明**                                                     |
| ------------- | ------------------------------------------------------------ |
| stcmlReturn_t | - 返回值为0：成功。<br/>- 返回值为其他值：失败，详细的说明请参见错误码章节。 |

#### stcmlDeviceGetHandleByPciBusId

函数描述：调用stcmlDeviceGetHandleByPciBusId获取当前PCIe总线id对应的设备句柄。

函数定义：

```c++
stcmlReturn_t stcmlDevcieGetHandleByPciBusId(const char *pciBusId, stcDevice_t **device)
```

函数参数：

| **名称** | **输入/输出** | **类型**     | **描述**           |
| -------- | ------------- | ------------ | ------------------ |
| pciBusId | 输入参数      | const char * | 指定PCIe总线id。   |
| device   | 输出参数      | stcDevice_t  | 返回指定设备句柄。 |

函数返回值：

| **类型**      | **说明**                                                     |
| ------------- | ------------------------------------------------------------ |
| stcmlReturn_t | - 返回值为0：成功。<br/>- 返回值为其他值：失败，详细的说明请参见错误码章节。 |

#### stcmlDeviceGetIndex

函数描述：调用stcmlDeviceGetIndex获取当前设备句柄对应的设备id。

函数定义：

```c++
stcmlReturn_t stcmlDeviceGetIndex(stcDevice_t *device, unsigned int *index)
```

函数参数：

| **名称** | **输入/输出** | **类型**       | **描述**           |
| -------- | ------------- | -------------- | ------------------ |
| device   | 输入参数      | stcDevice_t *  | 指定设备句柄。     |
| index    | 输出参数      | unsigned int * | 返回对应设备编号。 |

函数返回值：

| **类型**      | **说明**                                                     |
| ------------- | ------------------------------------------------------------ |
| stcmlReturn_t | - 返回值为0：成功。<br/>- 返回值为其他值：失败，详细的说明请参见错误码章节。 |

#### stcmlDeviceGetName

函数描述：调用stcmlDeviceGetName获取当前设备的名称。

函数定义：

```c++
stcmlReturn_t stcmlDeviceGetName(stcDevice_t *device, char *name, unsigned int length)
```

函数参数：

| **名称** | **输入/输出** | **类型**      | **描述**                           |
| -------- | ------------- | ------------- | ---------------------------------- |
| device   | 输入参数      | stcDevice_t * | 指定设备句柄。                     |
| name     | 输出参数      | char *        | 设备名称。                         |
| length   | 输入参数      | unsigned int  | 允许返回的最大长度（至少32字节）。 |

函数返回值：

| **类型**      | **说明**                                                     |
| ------------- | ------------------------------------------------------------ |
| stcmlReturn_t | - 返回值为0：成功。<br/>- 返回值为其他值：失败，详细的说明请参见错误码章节。 |

#### stcmlDeviceGetUuid

函数描述：调用stcmlDeviceGetUuid获取当前设备的设备id。

函数定义：

```c++
stcmlReturn_t stcmlDeviceGetUuid(stcDevice_t *device, char *uuid, unsigned int length)
```

函数参数：

| **名称** | **输入/输出** | **类型**      | **描述**                           |
| -------- | ------------- | ------------- | ---------------------------------- |
| device   | 输入参数      | stcDevice_t * | 指定设备句柄。                     |
| uuid     | 输出参数      | char *        | 设备名称。                         |
| length   | 输入参数      | unsigned int  | 允许返回的最大长度（至少32字节）。 |

函数返回值：

| **类型**      | **说明**                                                     |
| ------------- | ------------------------------------------------------------ |
| stcmlReturn_t | - 返回值为0：成功。<br/>- 返回值为其他值：失败，详细的说明请参见错误码章节。 |

#### stcmlDeviceGetSerial

函数描述：调用stcmlDeviceGetSerial获取当前设备的序列号。

函数定义：

```c++
stcmlReturn_t stcmlDeviceGetSerial(stcDevice_t *device, char *serial, unsigned int length)
```

函数参数：

| **名称** | **输入/输出** | **类型**      | **描述**                           |
| -------- | ------------- | ------------- | ---------------------------------- |
| device   | 输入参数      | stcDevice_t * | 指定设备句柄。                     |
| serial   | 输出参数      | char *        | 设备序列号。                       |
| length   | 输入参数      | unsigned int  | 允许返回的最大长度（至少32字节）。 |

函数返回值：

| **类型**      | **说明**                                                     |
| ------------- | ------------------------------------------------------------ |
| stcmlReturn_t | - 返回值为0：成功。<br/>- 返回值为其他值：失败，详细的说明请参见错误码章节。 |

#### stcmlDeviceGetPower

函数描述：调用stcmlDeviceGetPower获取当前设备的功率。

函数定义：

```c++
stcmlReturn_t stcmlDeviceGetPower(stcDevice_t *device, float *power)
```

函数参数：

| **名称** | **输入/输出** | **类型**      | **描述**       |
| -------- | ------------- | ------------- | -------------- |
| device   | 输入参数      | stcDevice_t * | 指定设备句柄。 |
| power    | 输出参数      | float *       | 设备功率。     |

函数返回值：

| **类型**      | **说明**                                                     |
| ------------- | ------------------------------------------------------------ |
| stcmlReturn_t | - 返回值为0：成功。<br/>- 返回值为其他值：失败，详细的说明请参见错误码章节。 |

#### stcmlDeviceGetFrequency

函数描述：调用stcmlDeviceGetFrequency获取当前设备的频率信息。

函数定义：

```c++
stcmlReturn_t stcmlDeviceGetFrequency(stcDevice_t *device, stcmlFrequencyInfo_t *frequency)
```

函数参数：

| **名称**  | **输入/输出** | **类型**               | **描述**       |
| --------- | ------------- | ---------------------- | -------------- |
| device    | 输入参数      | stcDevice_t *          | 指定设备句柄。 |
| frequency | 输出参数      | stcmlFrequencyInfo_t * | 设备频率信息。 |

函数返回值：

| **类型**      | **说明**                                                     |
| ------------- | ------------------------------------------------------------ |
| stcmlReturn_t | - 返回值为0：成功。<br/>- 返回值为其他值：失败，详细的说明请参见错误码章节。 |

#### stcmlDeviceSetFrequency

函数描述：调用stcmlDeviceSetFrequency设置当前设备的频率信息。

函数定义：

```c++
stcmlReturn_t stcmlDeviceSetFrequency(stcDevice_t *device, unsigned int index, unsigned int frequency)
```

函数参数：

| **名称**  | **输入/输出** | **类型**      | **描述**                                                     |
| --------- | ------------- | ------------- | ------------------------------------------------------------ |
| device    | 输入参数      | stcDevice_t * | 指定设备句柄。                                               |
| index     | 输入参数      | unsigned int  | soc区域索引。                                                |
| frequency | 输入参数      | unsigned int  | 设置频率值，默认值为1000，其他支持的值为624、800、900、 1100、1200、1300、1400。 |

函数返回值：

| **类型**      | **说明**                                                     |
| ------------- | ------------------------------------------------------------ |
| stcmlReturn_t | - 返回值为0：成功。<br/>- 返回值为其他值：失败，详细的说明请参见错误码章节。 |

#### stcmlDeviceGetVoltage

函数描述：调用stcmlDeviceGetVoltage获取当前设备的电压。

函数定义：

```c++
stcmlReturn_t stcmlDeviceGetVoltage(stcDevice_t *device, stcmlVoltageInfo_t *voltage)
```

函数参数：

| **名称** | **输入/输出** | **类型**             | **描述**       |
| -------- | ------------- | -------------------- | -------------- |
| device   | 输入参数      | stcDevice_t *        | 指定设备句柄。 |
| voltage  | 输出参数      | stcmlVoltageInfo_t * | 设备电压信息。 |

函数返回值：

| **类型**      | **说明**                                                     |
| ------------- | ------------------------------------------------------------ |
| stcmlReturn_t | - 返回值为0：成功。<br/>- 返回值为其他值：失败，详细的说明请参见错误码章节。 |

#### stcmlDeviceSetVoltage

函数描述：调用stcmlDeviceSetVoltage设置当前设备的电压。

函数定义：

```c++
stcmlReturn_t stcmlDeviceSetVoltage(stcDevice_t *device, stcmlVoltageInfo_t voltage)
```

函数参数：

| **名称** | **输入/输出** | **类型**             | **描述**             |
| -------- | ------------- | -------------------- | -------------------- |
| device   | 输入参数      | stcDevice_t *        | 指定设备句柄。       |
| voltage  | 输入参数      | stcmlVoltageInfo_t * | 指定设备的电压信息。 |

函数返回值：

| **类型**      | **说明**                                                     |
| ------------- | ------------------------------------------------------------ |
| stcmlReturn_t | - 返回值为0：成功。<br/>- 返回值为其他值：失败，详细的说明请参见错误码章节。 |

#### stcmlDeviceSetVmacVoltageAlarm

函数描述：调用stcmlDeviceSetVmacVoltageAlarm设置当前设备的电压报警值。

函数定义：

```c++
stcmlReturn_t stcmlDeviceSetVmacVoltageAlarm(stcDevice_t *device, float base, float offset)
```

函数参数：

| **名称** | **输入/输出** | **类型**      | **描述**             |
| -------- | ------------- | ------------- | -------------------- |
| device   | 输入参数      | stcDevice_t * | 指定设备句柄。       |
| base     | 输入参数      | float         | 电压报警值的下限。   |
| offset   | 输入参数      | float         | 电压报警值的间隔值。 |

函数返回值：

| **类型**      | **说明**                                                     |
| ------------- | ------------------------------------------------------------ |
| stcmlReturn_t | - 返回值为0：成功。<br/>- 返回值为其他值：失败，详细的说明请参见错误码章节。 |

#### stcmlDeviceGetTemperatureInfo

函数描述：调用stcmlDeviceGetTemperatureInfo获取当前设备的温度信息。

函数定义：

```c++
stcmlReturn_t stcmlDeviceGetTemperatureInfo(stcDevice_t *device, stcmlTemperatureInfo_t *temperatureInfo)
```

函数参数：

| **名称**        | **输入/输出** | **类型**                 | **描述**       |
| --------------- | ------------- | ------------------------ | -------------- |
| device          | 输入参数      | stcDevice_t *            | 指定设备句柄。 |
| temperatureInfo | 输出参数      | stcmlTemperatureInfo_t * | 设备温度信息。 |

函数返回值：

| **类型**      | **说明**                                                     |
| ------------- | ------------------------------------------------------------ |
| stcmlReturn_t | - 返回值为0：成功。<br/>- 返回值为其他值：失败，详细的说明请参见错误码章节。 |

#### stcmlDeviceSetAlertTemperature

函数描述：调用stcmlDeviceSetAlertTemperature设置当前设备的告警温度。

函数定义：

```c++
stcmlReturn_t stcmlDeviceSetAlertTemperature(stcDevice_t *device, float temperature)
```

函数参数：

| **名称**    | **输入/输出** | **类型**      | **描述**        |
| ----------- | ------------- | ------------- | --------------- |
| device      | 输入参数      | stcDevice_t * | 指定设备句柄。  |
| temperature | 输入参数      | float         | 设备告警温度 。 |

函数返回值：

| **类型**      | **说明**                                                     |
| ------------- | ------------------------------------------------------------ |
| stcmlReturn_t | - 返回值为0：成功。<br/>- 返回值为其他值：失败，详细的说明请参见错误码章节。 |

#### stcmlDeviceSetShutdownTemperature

函数描述：调用stcmlDeviceSetShutdownTemperature设置当前设备的关机温度。

函数定义：

```c++
stcmlReturn_t stcmlDeviceSetShutdownTemperature(stcDevice_t *device, float temperature)
```

函数参数：

| **名称**    | **输入/输出** | **类型**      | **描述**        |
| ----------- | ------------- | ------------- | --------------- |
| device      | 输入参数      | stcDevice_t * | 指定设备句柄。  |
| temperature | 输入参数      | float         | 设备关机温度 。 |

函数返回值：

| **类型**      | **说明**                                                     |
| ------------- | ------------------------------------------------------------ |
| stcmlReturn_t | - 返回值为0：成功。<br/>- 返回值为其他值：失败，详细的说明请参见错误码章节。 |

#### stcmlDeviceEnableMonitor

函数描述：调用stcmlDeviceEnableMonitor打开设备监控，与设置监控值配合使用，例如报警电压、告警温度、关机温度等。

函数定义：

```c++
stcmlReturn_t stcmlDeviceEnableMonitor(stcDevice_t *device)
```

函数参数：

| **名称** | **输入/输出** | **类型**      | **描述**       |
| -------- | ------------- | ------------- | -------------- |
| device   | 输入参数      | stcDevice_t * | 指定设备句柄。 |

函数返回值：

| **类型**      | **说明**                                                     |
| ------------- | ------------------------------------------------------------ |
| stcmlReturn_t | - 返回值为0：成功。<br/>- 返回值为其他值：失败，详细的说明请参见错误码章节。 |

#### stcmlDeviceGetBoardStatus

函数描述：调用stcmlDeviceGetBoardStatus获取当前设备状态。

函数定义：

```c++
stcmlReturn_t stcmlDeviceGetBoardStatus(stcDevice_t *device, unsigned int *status)
```

函数参数：

| **名称** | **输入/输出** | **类型**       | **描述**                           |
| -------- | ------------- | -------------- | ---------------------------------- |
| device   | 输入参数      | stcDevice_t *  | 指定设备句柄。                     |
| status   | 输出参数      | unsigned int * | 设备状态值，0代表打开，1代表关闭。 |

函数返回值：

| **类型**      | **说明**                                                     |
| ------------- | ------------------------------------------------------------ |
| stcmlReturn_t | - 返回值为0：成功。<br/>- 返回值为其他值：失败，详细的说明请参见错误码章节。 |

#### stcmlDeviceStartBoard

函数描述：调用stcmlDeviceStartBoard打开因超过温度阈值被关闭的设备。

函数定义：

```c++
stcmlReturn_t stcmlDeviceStartBoard(stcDevice_t *device)
```

函数参数：

| **名称** | **输入/输出** | **类型**      | **描述**       |
| -------- | ------------- | ------------- | -------------- |
| device   | 输入参数      | stcDevice_t * | 指定设备句柄。 |

函数返回值：

| **类型**      | **说明**                                                     |
| ------------- | ------------------------------------------------------------ |
| stcmlReturn_t | - 返回值为0：成功。<br/>- 返回值为其他值：失败，详细的说明请参见错误码章节。 |

#### stcmlSystemGetSTCMLVersion

函数描述：调用stcmlSystemGetSTCMLVersion获取当前STCML的版本。

函数定义：

```c++
stcmlReturn_t stcmlSystemGetSTCMLVersion(char *version, unsigned int length)
```

函数参数：

| **名称** | **输入/输出** | **类型**     | **描述**                         |
| -------- | ------------- | ------------ | -------------------------------- |
| version  | 输出参数      | char *       | STCML版本。                      |
| length   | 输入参数      | unsigned int | 返回字符串最大长度，至少32字节。 |

函数返回值：

| **类型**      | **说明**                                                     |
| ------------- | ------------------------------------------------------------ |
| stcmlReturn_t | - 返回值为0：成功。<br/>- 返回值为其他值：失败，详细的说明请参见错误码章节。 |

#### stcmlSystemGetHPEVersion

函数描述：调用stcmlSystemGetHPEVersion获取当前系统的HPE版本。

函数定义：

```c++
stcmlReturn_t stcmlSystemGetHPEVersion(char *version, unsigned int length)
```

函数参数：

| **名称** | **输入/输出** | **类型**     | **描述**                         |
| -------- | ------------- | ------------ | -------------------------------- |
| version  | 输出参数      | char *       | HPE版本。                        |
| length   | 输入参数      | unsigned int | 返回字符串最大长度，至少32字节。 |

函数返回值：

| **类型**      | **说明**                                                     |
| ------------- | ------------------------------------------------------------ |
| stcmlReturn_t | - 返回值为0：成功。<br/>- 返回值为其他值：失败，详细的说明请参见错误码章节。 |

#### stcmlSystemGetDriverVersion

函数描述：调用stcmlSystemGetDriverVersion获取当前系统的驱动版本。

函数定义：

```c++
stcmlReturn_t stcmlSystemGetDriverVersion(char *version, unsigned int length)
```

函数参数：

| **名称** | **输入/输出** | **类型**     | **描述**                         |
| -------- | ------------- | ------------ | -------------------------------- |
| version  | 输出参数      | char *       | 驱动版本。                       |
| length   | 输入参数      | unsigned int | 返回字符串最大长度，至少32字节。 |

函数返回值：

| **类型**      | **说明**                                                     |
| ------------- | ------------------------------------------------------------ |
| stcmlReturn_t | - 返回值为0：成功。<br/>- 返回值为其他值：失败，详细的说明请参见错误码章节。 |

#### stcmlDeviceGetMcuFirmwareVersion

函数描述：调用stcmlDeviceGetMcuFirmwareVersion获取当前设备的MCU固件版本。

函数定义：

```c++
stcmlReturn_t stcmlDeviceGetMcuFirmwareVersion(stcDevice_t *device, char *version, unsigned int length)
```

函数参数：

| **名称** | **输入/输出** | **类型**      | **描述**                         |
| -------- | ------------- | ------------- | -------------------------------- |
| device   | 输入参数      | stcDevice_t * | 指定设备句柄。                   |
| length   | 输入参数      | char *        | 返回字符串最大长度，至少32字节。 |
| version  | 输出参数      | unsigned int  | MCU固件版本。                    |

函数返回值：

| **类型**      | **说明**                                                     |
| ------------- | ------------------------------------------------------------ |
| stcmlReturn_t | - 返回值为0：成功。<br/>- 返回值为其他值：失败，详细的说明请参见错误码章节。 |

#### stcmlDeviceGetNpuCtrlFirmwareVersion

函数描述：调用stcmlDeviceGetNpuCtrlFirmwareVersion获取当前设备的NPU Ctrl固件版本。

函数定义：

```c++
stcmlReturn_t stcmlDeviceGetNpuCtrlFirmwareVersion(stcDevice_t *device, char *version, unsigned int length)
```

函数参数：

| **名称** | **输入/输出** | **类型**      | **描述**                         |
| -------- | ------------- | ------------- | -------------------------------- |
| device   | 输入参数      | stcDevice_t * | 指定设备句柄。                   |
| version  | 输出参数      | unsigned int  | NPU Ctrl固件版本。               |
| length   | 输入参数      | char *        | 返回字符串最大长度，至少32字节。 |

函数返回值：

| **类型**      | **说明**                                                     |
| ------------- | ------------------------------------------------------------ |
| stcmlReturn_t | - 返回值为0：成功。<br/>- 返回值为其他值：失败，详细的说明请参见错误码章节。 |

#### stcmlErrorString

函数描述：调用stcmlErrorString从获取的错误码得到错误详情。

函数定义：

```c++
const char* stcmlErrorString(stcmlReturn_t result)
```

函数参数：

| **名称** | **输入/输出** | **类型**      | **描述** |
| -------- | ------------- | ------------- | -------- |
| result   | 输入参数      | stcmlReturn_t | 错误码。 |

函数返回值：

| **类型**    | **说明**               |
| ----------- | ---------------------- |
| const char* | 错误码对应错误字符串。 |

### 数据类型

#### stcmlFrequencyInfo_t

数据描述：设备频率信息。包含的成员变量如下所示：

| **成员变量**    | **类型**       | **说明**   |
| ----------- | ------------ | -------- |
| socWestFreq | unsigned int | soc西侧频率。 |
| socEastFreq | unsigned int | soc东侧频率。 |
| ddrFreq     | unsigned int | ddr频率。   |

#### stcmlVoltageInfo_t

数据描述：设备电压信息。包含的成员变量如下所示：

| **成员变量** | **类型**     | **说明**                                   |
| ------------ | ------------ | ------------------------------------------ |
| index        | unsigned int | 设置电压选项，仅用于设置mac电压和soc电压： |
| vmac         | unsigned int | mac电压，有效值550~800 mV。                |
| vsoc         | unsigned int | soc电压，有效值800~950 mV。                |

#### stcmlTemperatureInfo_t

数据描述：设备温度信息。包含的成员变量如下所示：

| **成员变量**      | **类型** | **说明**                  |
| ------------- | ------ | ----------------------- |
| coreValue     | float  | NPU设备核心温度，合理范围为25℃～90℃。 |
| alertValue    | float  | NPU设备告警温度。              |
| shutdownValue | float  | NPU设备关机温度。              |
| frontValue    | float  | PCIE单板前侧温度。             |
| backValue     | float  | PCIE单板后侧温度。             |

### 错误码

stcmlReturn_t记录调用STCML时接口返回的错误码。支持返回的错误类型如下所示：

| **错误码**                | **值** | **说明**                         |
| ------------------------- | ------ | -------------------------------- |
| STCML_SUCCESS             | 0      | 函数调用成功，未返回错误。       |
| STCML_ERROR_IO            | -1     | 输入/输出错误。                  |
| STCML_ERROR_INVALID_PARAM | -2     | 无效参数错误。                   |
| STCML_ERROR_ACCESS        | -3     | 权限错误。                       |
| STCML_ERROR_NO_DEVICE     | -4     | 未发现该设备（可能已断开连接）。 |
| STCML_ERROR_NOT_FOUND     | -5     | 未找到实体。                     |
| STCML_ERROR_BUSY          | -6     | 资源繁忙。                       |
| STCML_ERROR_TIMEOUT       | -7     | 响应超时。                       |
| STCML_ERROR_OVERFLOW      | -8     | 长度溢出。                       |
| STCML_ERROR_PIPE          | -9     | 管道错误。                       |
| STCML_ERROR_INTERRUPTED   | -10    | 系统调用中断（可能由信号引发）。 |
| STCML_ERROR_NO_MEM        | -11    | 内存不足。                       |
| STCML_ERROR_NOT_SUPPORTED | -12    | 此平台不支持或未实现该操作。     |
| STCML_ERROR_INVALID_FILE  | -13    | 升级文件损坏或无效。             |
| STCML_ERROR_OTHER         | -99    | 其他错误。                       |

