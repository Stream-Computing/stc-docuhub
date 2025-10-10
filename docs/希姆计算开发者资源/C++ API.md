# C++ API

## HPE主机端运行时API

### 调用要求

调用HPE主机端运行时API时，请确保：

- 已安装HPE。具体操作，请参见[STCRP安装指南](https://docs.streamcomputing.com/_/sharing/vSxLMI20nalGphdpXdEVoDg6JkUcfEkT?next=/zh/latest/)。

- 在代码文件中导入所需的头文件，包括但不限于：

  ```c++
  #include <hpe.h>
  ```

> 说明：系统的HPE异构编程介绍，请参见[STCRP开发指南](https://docs.streamcomputing.com/_/sharing/vSxLMI20nalGphdpXdEVoDg6JkUcfEkT?next=/zh/latest/)，安装HPE后自带的异构编程示例，请参见[HPE使用指南](https://docs.streamcomputing.com/_/sharing/vSxLMI20nalGphdpXdEVoDg6JkUcfEkT?next=/zh/latest/)。

### 调用限制

- 因为PCIe BAR0空间增大为16GB，不能在大部分桌面型CPU平台上运行（例如物理地址寻址位数小于40的CPU）。
- 在没有PCIe Switch的Intel平台上，存在P2P性能很差的问题（约为0.85GB/s）。
- 在带PCIe Switch的Intel平台上，跨NUMA的P2P存在性能很差的问题（约为0.85GB/s）。

### 接口说明

#### 设备管理

##### stcSetDevice

函数描述：调用stcSetDevice设置用于执行设备端程序的NPC Cluster。

函数类型：同步函数

函数定义：

```C++
stcError_t stcSetDevice (int device)
```

函数参数：

| **名称** | **输入/输出** | **类型** | **说明**                                                     |
| -------- | ------------- | -------- | ------------------------------------------------------------ |
| device   | 输入参数      | int      | NPC Cluster ID，由NPU设备标识符、NPC Cluster设备标识符推导得出。详细的推导说明，请参见*指定NPC Cluster ID*章节。 |

函数返回值：

| **类型**   | **说明**                                     |
| ---------- | -------------------------------------------- |
| stcError_t | 详细的错误类型含义，请参见*stcError_t*章节。 |

##### stcGetDevice

函数描述：调用stcGetDevice获取用于执行设备端程序的NPC Cluster。

函数类型：同步函数

函数定义：

```C++
stcError_t stcGetDevice (int *device)
```

函数参数：

| **名称** | **输入/输出** | **类型** | **说明**                         |
| -------- | ------------- | -------- | -------------------------------- |
| device   | 输出参数      | int*     | 指向所获取NPC Cluster ID的指针。 |

函数返回值：

| **类型**   | **说明**                                     |
| ---------- | -------------------------------------------- |
| stcError_t | 详细的错误类型含义，请参见*stcError_t*章节。 |

##### stcGetDeviceAttribute 

函数描述：调用stcGetDeviceAttribute获取一个NPC Cluster所在NPU的属性，例如NPU硬件版本、NPC Cluster数量等。

函数类型：同步函数

函数定义：

```C++
stcError_t stcGetDeviceAttribute (int *value, stcDeviceAttr attr, int device)
```

函数参数：

| **名称** | **输入/输出** | **类型**      | **说明**                                                     |
| -------- | ------------- | ------------- | ------------------------------------------------------------ |
| value    | 输出参数      | int*          | 指向所获取属性数据的指针。                                   |
| attr     | 输入参数      | stcDeviceAttr | 属性名称，例如代表NPU硬件版本的stcDevAttrChipHWVersion。详细的属性名称含义，请参见*stcDeviceAttr*章节。 |
| device   | 输入参数      | int           | NPC Cluster ID。                                             |

函数返回值：

| **类型**   | **说明**                                     |
| ---------- | -------------------------------------------- |
| stcError_t | 详细的错误类型含义，请参见*stcError_t*章节。 |

##### stcGetDeviceName

函数描述：调用stcGetDeviceName获取一个NPC Cluster所在NPU的设备名称。

函数类型：同步函数

函数定义：

```C++
stcError_t stcGetDeviceName (const char **name, int device)
```

函数参数：

| **名称** | **输入/输出** | **类型**      | **说明**                       |
| -------- | ------------- | ------------- | ------------------------------ |
| name     | 输出参数      | const char ** | 指向所获取设备名称的二级指针。 |
| device   | 输入参数      | int           | NPC Cluster ID。               |

函数返回值：

| **类型**   | **说明**                                     |
| ---------- | -------------------------------------------- |
| stcError_t | 详细的错误类型含义，请参见*stcError_t*章节。 |

##### stcGetDeviceCount

函数描述：调用stcGetDeviceCount获取所有NPU上NPC Cluster的数量。

函数类型：同步函数

函数定义：

```C++
stcError_t stcGetDeviceCount (int *count)
```

函数参数：

| **名称** | **输入/输出** | **类型** | **说明**                          |
| -------- | ------------- | -------- | --------------------------------- |
| count    | 输出参数      | int*     | 指向所获取NPC Cluster数量的指针。 |

函数返回值：

| **类型**   | **说明**                                     |
| ---------- | -------------------------------------------- |
| stcError_t | 详细的错误类型含义，请参见*stcError_t*章节。 |

##### stcDeviceSynchronize

函数描述：调用stcDeviceSynchronize等待当前进程的所有设备端操作执行结束。如果核函数执行异常退出，则输出触发异常时核函数的调用栈。

> 说明：只在对应cluster上有效，不能用来推测其他cluster的状态。

函数类型：同步函数

函数定义：

```C++
stcError_t stcDeviceSynchronize (void)
```

函数参数：

无

函数返回值：

| **类型**   | **说明**                                     |
| ---------- | -------------------------------------------- |
| stcError_t | 详细的错误类型含义，请参见*stcError_t*章节。 |

#### 内存管理

##### stcMalloc 

函数描述：调用stcMalloc在设备端全局内存的0GiB ~ 3GiB范围动态分配内存。

函数类型：同步函数

函数定义：

```C++
stcError_t stcMalloc (void **devPtr, size_t size)
```

函数参数：

| **名称** | **输入/输出** | **类型** | **说明**                         |
| -------- | ------------- | -------- | -------------------------------- |
| devPtr   | 输出参数      | void**   | 指向所分配内存地址的指针。       |
| size     | 输入参数      | size_t   | 所需分配的内存大小，单位为字节。 |

函数返回值：

| **类型**   | **说明**                                     |
| ---------- | -------------------------------------------- |
| stcError_t | 详细的错误类型含义，请参见*stcError_t*章节。 |

##### stcMallocHigh

函数描述：调用stcMallocHigh在设备端全局内存的3GiB ~ 4GiB范围（也称为高端内存）动态分配内存。

函数类型：同步函数

函数定义：

```C++
stcError_t stcMallocHigh(void **devPtr, size_t size)
```

函数参数：

| **名称** | **输入/输出** | **类型** | **说明**                         |
| -------- | ------------- | -------- | -------------------------------- |
| devPtr   | 输出参数      | void**   | 指向所分配内存地址的指针。       |
| size     | 输入参数      | size_t   | 所需分配的内存大小，单位为字节。 |

函数返回值：

| **类型**   | **说明**                                     |
| ---------- | -------------------------------------------- |
| stcError_t | 详细的错误类型含义，请参见*stcError_t*章节。 |

##### stcFree

函数描述：调用stcFree释放在设备端动态分配的全局内存。

函数类型：同步函数

函数定义：

```C++
stcError_t stcFree (void *devPtr)
```

函数参数：

| **名称** | **输入/输出** | **类型** | **说明**               |
| -------- | ------------- | -------- | ---------------------- |
| devPtr   | 输入参数      | void*    | 指向待释放内存的指针。 |

函数返回值：

| **类型**   | **说明**                                     |
| ---------- | -------------------------------------------- |
| stcError_t | 详细的错误类型含义，请参见*stcError_t*章节。 |

##### stcMallocHost

函数描述：调用stcMallocHost在主机端分配内存，并设置为不会被换出的页锁定内存。

函数类型：同步函数

函数定义：

```C++
stcError_t stcMallocHost (void **ptr, size_t size)
```

函数参数：

| **名称** | **输入/输出** | **类型** | **说明**                         |
| -------- | ------------- | -------- | -------------------------------- |
| ptr      | 输出参数      | void**   | 指向所分配内存地址的指针。       |
| size     | 输入参数      | size_t   | 所需分配的内存大小，单位为字节。 |

函数返回值：

| **类型**   | **说明**                                     |
| ---------- | -------------------------------------------- |
| stcError_t | 详细的错误类型含义，请参见*stcError_t*章节。 |

##### stcFreeHost

函数描述：调用stcFreeHost释放在主机端分配的页锁定内存。

函数类型：同步函数

函数定义：

```C++
stcError_t stcFreeHost (void *ptr)
```

函数参数：

| **名称** | **输入/输出** | **类型** | **说明**               |
| -------- | ------------- | -------- | ---------------------- |
| ptr      | 输入参数      | void*    | 指向待释放内存的指针。 |

函数返回值：

| **类型**   | **说明**                                     |
| ---------- | -------------------------------------------- |
| stcError_t | 详细的错误类型含义，请参见*stcError_t*章节。 |

##### stcHostRegister

函数描述：调用stcHostRegister将主机端的内存设置为不会被换出的页锁定内存。

函数类型：同步函数

函数定义：

```C++
stcError_t stcHostRegister (void *ptr, size_t size)
```

函数参数：

| **名称** | **输入/输出** | **类型** | **说明**                         |
| -------- | ------------- | -------- | -------------------------------- |
| ptr      | 输入参数      | void*    | 指向待锁定内存的指针。           |
| size     | 输入参数      | size_t   | 所需锁定的内存大小，单位为字节。 |

函数返回值：

| **类型**   | **说明**                                     |
| ---------- | -------------------------------------------- |
| stcError_t | 详细的错误类型含义，请参见*stcError_t*章节。 |

##### stcHostUnregister

函数描述：调用stcHostUnregister解锁主机端的页锁定内存。

函数类型：同步函数

函数定义：

```C++
stcError_t stcHostUnregister (void *ptr)
```

函数参数：

| **名称** | **输入/输出** | **类型** | **说明**               |
| -------- | ------------- | -------- | ---------------------- |
| ptr      | 输入参数      | void*    | 指向待解锁内存的指针。 |

函数返回值：

| **类型**   | **说明**                                     |
| ---------- | -------------------------------------------- |
| stcError_t | 详细的错误类型含义，请参见*stcError_t*章节。 |

##### stcMemcpy

函数描述：调用stcMemcpy拷贝内存，该函数支持主机间拷贝、主机端向设备端拷贝、设备端向主机端拷贝。

函数类型：同步函数

函数定义：

```C++
stcError_t stcMemcpy (void *dst, const void *src, size_t count, stcMemcpyKind kind)
```

函数参数：

| **名称** | **输入/输出** | **类型**      | **说明**                                                     |
| -------- | ------------- | ------------- | ------------------------------------------------------------ |
| dst      | 输入参数      | void*         | 拷贝操作的目的地址，向该指针指向的内存写入数据。             |
| src      | 输入参数      | const void*   | 拷贝操作的源地址，从该指针指向的内存读取数据。               |
| count    | 输入参数      | size_t        | 待拷贝内存的大小，单位为字节。                               |
| kind     | 输入参数      | stcMemcpyKind | 拷贝的方向，支持主机间拷贝、主机端向设备端拷贝、设备端向主机端。详细的类型说明，请参见*stcMemcpyKind*章节。 |

函数返回值：

| **类型**   | **说明**                                     |
| ---------- | -------------------------------------------- |
| stcError_t | 详细的错误类型含义，请参见*stcError_t*章节。 |

##### stcMemcpyAsync

函数描述：调用stcMemcpyAsync异步拷贝内存，调用后立即返回，不用等待拷贝完成。该函数支持主机间拷贝、主机端向设备端全局内存拷贝、设备端全局内存向主机端拷贝。

函数类型：异步函数

函数定义：

```C++
stcError_t stcMemcpyAsync (void *dst, const void *src, size_t count, stcMemcpyKind kind, stcStream_t stream=0)
```

函数参数：

| **名称** | **输入/输出** | **类型**      | **说明**                                                     |
| -------- | ------------- | ------------- | ------------------------------------------------------------ |
| dst      | 输入参数      | void*         | 拷贝操作的目的地址，向该指针指向的内存写入数据。             |
| src      | 输入参数      | const void*   | 拷贝操作的源地址，从该指针指向的内存读取数据。               |
| count    | 输入参数      | size_t        | 待拷贝内存的大小，单位为字节。                               |
| kind     | 输入参数      | stcMemcpyKind | 拷贝的方向，支持主机间拷贝、主机端向设备端拷贝、设备端向主机端。详细的类型说明，请参见*stcMemcpyKind*章节。 |
| stream   | 输入参数      | stcStream_t   | 流标识符，默认为0，代表隐式声明流。                          |

函数返回值：

| **类型**   | **说明**                                     |
| ---------- | -------------------------------------------- |
| stcError_t | 详细的错误类型含义，请参见*stcError_t*章节。 |

##### stcMemcpyPeer

函数描述：调用stcMemcpyPeer在NPC Cluster间拷贝全局内存。

函数类型：同步函数

函数定义：

```C++
stcError_t stcMemcpyPeer (void *dst, int dstDevice, const void *src, int srcDevice, size_t count)
```

函数参数：

| **名称**  | **输入/输出** | **类型**    | **说明**                                         |
| --------- | ------------- | ----------- | ------------------------------------------------ |
| dst       | 输入参数      | void*       | 拷贝操作的目的地址，向该指针指向的内存写入数据。 |
| dstDevice | 输入参数      | int         | 目的NPC Cluster的ID。                            |
| src       | 输入参数      | const void* | 拷贝操作的源地址，从该指针指向的内存读取数据。   |
| srcDevice | 输入参数      | int         | 源NPC Cluster的ID。                              |
| count     | 输入参数      | size_t      | 待拷贝内存的大小，单位为字节。                   |

函数返回值：

| **类型**   | **说明**                                     |
| ---------- | -------------------------------------------- |
| stcError_t | 详细的错误类型含义，请参见*stcError_t*章节。 |

##### stcMemcpyPeerAsync

函数描述：调用stcMemcpyPeerAsync在NPC Cluster间异步拷贝全局内存，调用后立即返回，不用等待拷贝完成。

函数类型：异步函数

函数定义：

```C++
stcError_t stcMemcpyPeerAsync (void *dst, int dstDevice, const void *src, int srcDevice, size_t count, stcStream_t stream=0)
```

函数参数：

| **名称**  | **输入/输出** | **类型**    | **说明**                                         |
| --------- | ------------- | ----------- | ------------------------------------------------ |
| dst       | 输入参数      | void*       | 拷贝操作的目的地址，向该指针指向的内存写入数据。 |
| dstDevice | 输入参数      | int         | 目的NPC Cluster的ID。                            |
| src       | 输入参数      | const void* | 拷贝操作的源地址，从该指针指向的内存读取数据。   |
| srcDevice | 输入参数      | int         | 源NPC Cluster的ID。                              |
| count     | 输入参数      | size_t      | 待拷贝内存的大小，单位为字节。                   |
| stream    | 输入参数      | stcStream_t | 流标识符，默认为0，代表隐式声明流。              |

函数返回值：

| **类型**   | **说明**                                     |
| ---------- | -------------------------------------------- |
| stcError_t | 详细的错误类型含义，请参见*stcError_t*章节。 |

#### 执行控制

##### stcRegisterFatBinary

函数描述：调用stcRegisterFatBinary注册在设备端执行的目标程序。

函数类型：同步函数

函数定义：

```C++
stcError_t stcRegisterFatBinary (const void *data)
```

函数参数：

| **名称** | **输入/输出** | **类型**    | **说明**                     |
| -------- | ------------- | ----------- | ---------------------------- |
| data     | 输入参数      | const void* | 指向目标程序所占内存的指针。 |

函数返回值：

| **类型**   | **说明**                                     |
| ---------- | -------------------------------------------- |
| stcError_t | 详细的错误类型含义，请参见*stcError_t*章节。 |

##### stcUnregisterFatBinary

函数描述：调用stcUnregisterFatBinary释放所有已注册的目标程序。

函数类型：同步函数

函数定义：

```C++
stcError_t stcUnregisterFatBinary (void)
```

函数参数：

无

函数返回值：

stcSuccess

##### stcConfigureCall

函数描述：调用stcConfigureCall指定执行核函数的配置。

函数类型：同步函数

函数定义：

```C++
stcError_t stcConfigureCall(int core_num, stcStream_t stream=0, unsigned int flags=stcKernelFlagNone)
```

函数参数：

| **名称** | **输入/输出** | **类型**     | **说明**                                                     |
| -------- | ------------- | ------------ | ------------------------------------------------------------ |
| core_num | 输入参数      | int          | 在一个NPC Cluster上并行执行核函数所使用的NPC个数。           |
| stream   | 输入参数      | stcStream_t  | 流标识符，默认为0，代表将配置应用于隐式声明流。              |
| flags    | 输入参数      | unsigned int | 指定核函数的运行标志，默认无运行标志（stcKernelFlagNone）。详细的运行标志含义，请参见*stcKernelFlag_t*章节。 |

函数返回值：

| **类型**   | **说明**                                     |
| ---------- | -------------------------------------------- |
| stcError_t | 详细的错误类型含义，请参见*stcError_t*章节。 |

##### stcLaunchKernel

函数描述：调用stcLaunchKernel启动核函数。

函数类型：异步函数

函数定义：

```C++
stcError_t stcLaunchKernel（stcModule_t *module, const char *kname, stcKernelParams_t kernelParams)
```

函数参数：

| **名称**     | **输入/输出** | **类型**          | **说明**                           |
| ------------ | ------------- | ----------------- | ---------------------------------- |
| module       | 输出参数      | stcModule_t*      | 指向核函数所在目标程序模块的指针。 |
| kname        | 输入参数      | const char*       | 核函数的名称。                     |
| kernelParams | 输入参数      | stcKernelParams_t | 核函数的参数信息。                 |

函数返回值：

| **类型**   | **说明**                                     |
| ---------- | -------------------------------------------- |
| stcError_t | 详细的错误类型含义，请参见*stcError_t*章节。 |

##### stcModuleLoadData

函数描述：调用stcModuleLoadData将目标程序加载到设备端。

函数类型：同步函数

函数定义：

```C++
stcError_t stcModuleLoadData (stcModule_t *module, const void *data, size_t size)
```

函数参数：

| **名称** | **输入/输出** | **类型**     | **说明**                                   |
| -------- | ------------- | ------------ | ------------------------------------------ |
| module   | 输出参数      | stcModule_t* | 指向加载到设备端的目标程序模块的指针。     |
| data     | 输入参数      | const void*  | 待加载目标程序的内存地址。                 |
| size     | 输入参数      | size_t       | 待加载目标程序占用的内存大小，单位为字节。 |

函数返回值：

| **类型**   | **说明**                                     |
| ---------- | -------------------------------------------- |
| stcError_t | 详细的错误类型含义，请参见*stcError_t*章节。 |

##### stcModuleUnload

函数描述：调用stcModuleUnload从设备端卸载目标程序模块。

函数类型：同步函数

函数定义：

```C++
stcError_t stcModuleUnload (stcModule_t module)
```

函数参数：

| **名称** | **输入/输出** | **类型**    | **说明**               |
| -------- | ------------- | ----------- | ---------------------- |
| module   | 输入参数      | stcModule_t | 待释放的目标程序模块。 |

函数返回值：

| **类型**   | **说明**                                     |
| ---------- | -------------------------------------------- |
| stcError_t | 详细的错误类型含义，请参见*stcError_t*章节。 |

#### 流管理

##### stcStreamCreate

函数描述：调用stcStreamCreate在cluster范围内创建一个具有DividedHS模式的流。

函数类型：同步函数

函数定义：

```C++
stcError_t stcStreamCreate (stcStream_t *pStream)
```

函数参数：

| **名称** | **输入/输出** | **类型**     | **说明**                   |
| -------- | ------------- | ------------ | -------------------------- |
| pStream  | 输出参数      | stcStream_t* | 指向创建的流标识符的指针。 |

函数返回值：

| **类型**   | **说明**                                                     |
| ---------- | ------------------------------------------------------------ |
| stcError_t | 返回值为0：成功；返回值为其他值：错误码，其中详细的错误类型含义，请参见*stcError_t*章节。 |

##### stcStreamCreateUnified

函数描述：使用stcStreamCreateUnified在NPU范围内创建的一个具有UnifiedHS模式的流。

函数类型：同步函数

函数定义：

```C++
stcError_t stcStreamCreateUnified(stcStream_t *pStream)
```

函数参数：

| **名称** | **输入/输出** | **类型**     | **说明**                   |
| -------- | ------------- | ------------ | -------------------------- |
| pStream  | 输出参数      | stcStream_t* | 指向创建的流标识符的指针。 |

函数返回值：

| **类型**   | **说明**                                                     |
| ---------- | ------------------------------------------------------------ |
| stcError_t | 返回值为0：成功；返回值为其他值：错误码，其中详细的错误类型含义，请参见*stcError_t*章节。 |

##### stcStreamDestroy

函数描述：调用stcStreamDestroy销毁指定流。如果流中有未完成的操作，会终止执行并释放相关资源。

函数类型：同步函数

函数定义：

```C++
stcError_t stcStreamDestroy (stcStream_t stream)
```

函数参数：

| **名称** | **输入/输出** | **类型**    | **说明**           |
| -------- | ------------- | ----------- | ------------------ |
| stream   | 输入参数      | stcStream_t | 待销毁流的标识符。 |

函数返回值：

| **类型**   | **说明**                                                     |
| ---------- | ------------------------------------------------------------ |
| stcError_t | 返回值为0：成功；返回值为其他值：错误码，其中详细的错误类型含义，请参见*stcError_t*章节。 |

##### stcStreamDestroyUnified

函数描述：调用stcStreamDestroyUnified销毁指定的UnifiedHS流。在销毁前会清除正在运行和待运行的任务。

函数类型：同步函数

函数定义：

```C++
stcError_t stcStreamDestroyUnified(stcStream_t pStream)
```

函数参数：

| **名称** | **输入/输出** | **类型**    | **说明**           |
| -------- | ------------- | ----------- | ------------------ |
| pstream  | 输入参数      | stcStream_t | 待销毁流的标识符。 |

函数返回值：

| **类型**   | **说明**                                                     |
| ---------- | ------------------------------------------------------------ |
| stcError_t | 返回值为0：成功；返回值为其他值：错误码，其中详细的错误类型含义，请参见*stcError_t*章节。 |

##### stcStreamSynchronize

函数描述：调用stcStreamSynchronize等待指定流上的所有操作执行结束。如果核函数执行异常退出，则输出触发异常时核函数的调用栈。

函数类型：同步函数

函数定义：

```C++
stcError_t stcStreamSynchronize (stcStream_t stream)
```

函数参数：

| **名称** | **输入/输出** | **类型**    | **说明**                                 |
| -------- | ------------- | ----------- | ---------------------------------------- |
| stream   | 输入参数      | stcStream_t | 流标识符，等待该流上的所有操作执行结束。 |

函数返回值：

| **类型**   | **说明**                                                     |
| ---------- | ------------------------------------------------------------ |
| stcError_t | 返回值为0：成功；返回值为其他值：错误码，其中详细的错误类型含义，请参见*stcError_t*章节。 |

##### stcStreamSynchronizeUnified

函数描述：调用stcStreamSynchronizeUnified等待指定流上的所有操作执行结束。如果核函数执行异常退出，则输出触发异常时核函数的调用栈。

> 说明：在UnifiedHS模式下，核函数需要加载四次到所有四个Cluster上，不同Cluster开始执行核函数的时间不是精确同步的。如果需要保证核函数在同一时间开始执行有效代码，用户需要自行在核函数最开始处显示地执行同步指令。同样的，如果需要保证核函数在所有Cluster同时完成，您需要自行在核函数结束前显示地执行同步指令。

函数类型：同步函数

函数定义：

```C++
stcError_t stcStreamSynchronizeUnified(stcStream_t pStream)
```

函数参数：

| **名称** | **输入/输出** | **类型**    | **说明**                                 |
| -------- | ------------- | ----------- | ---------------------------------------- |
| pstream  | 输入参数      | stcStream_t | 流标识符，等待该流上的所有操作执行结束。 |

函数返回值：

| **类型**   | **说明**                                                     |
| ---------- | ------------------------------------------------------------ |
| stcError_t | 返回值为0：成功；返回值为其他值：错误码，其中详细的错误类型含义，请参见*stcError_t*章节。 |

##### stcStreamClean

函数描述：调用stcStreamClean停止处理流上的请求并销毁所有请求，但不会销毁流本身。

函数类型：同步函数

函数定义：

```C++
stcError_t stcStreamClean(stcStream_t stream)
```

函数参数：

| **名称** | **输入/输出** | **类型**    | **说明**                                       |
| -------- | ------------- | ----------- | ---------------------------------------------- |
| stream   | 输入参数      | stcStream_t | 流标识符，停止处理该流的请求，并销毁所有请求。 |

函数返回值：

| **类型**   | **说明**                                     |
| ---------- | -------------------------------------------- |
| stcError_t | 详细的错误类型含义，请参见*stcError_t*章节。 |

##### stcEventCreate

函数描述：调用stcEventCreate创建一个事件。

函数类型：同步函数

函数定义：

```C++
stcError_t stcEventCreate(stcEvent_t *pEvent)
```

函数参数：

| **名称** | **输入/输出** | **类型**    | **说明**                     |
| -------- | ------------- | ----------- | ---------------------------- |
| pEvent   | 输出参数      | stcEvent_t* | 指向创建的事件标识符的指针。 |

函数返回值：

| **类型**   | **说明**                                     |
| ---------- | -------------------------------------------- |
| stcError_t | 详细的错误类型含义，请参见*stcError_t*章节。 |

##### stcEventDestroy

函数描述：调用stcEventDestroy销毁指定事件。

函数类型：同步函数

函数定义：

```C++
stcError_t stcError_t stcEventDestroy(stcEvent_t event)
```

函数参数：

| **名称** | **输入/输出** | **类型**   | **说明**             |
| -------- | ------------- | ---------- | -------------------- |
| event    | 输入参数      | stcEvent_t | 待销毁事件的标识符。 |

函数返回值：

| **类型**   | **说明**                                     |
| ---------- | -------------------------------------------- |
| stcError_t | 详细的错误类型含义，请参见*stcError_t*章节。 |

##### stcEventSynchronize

函数描述：调用stcEventSynchronize等待指定事件进入完成状态。

函数类型：同步函数

函数定义：

```C++
stcError_t stcEventSynchronize(stcEvent_t event)
```

函数参数：

| **名称** | **输入/输出** | **类型**   | **说明**                                                     |
| -------- | ------------- | ---------- | ------------------------------------------------------------ |
| event    | 输入参数      | stcEvent_t | 事件标识符，等待流中该事件前的所有操作执行结束后，才会将事件置为完成状态。 |

函数返回值：

| **类型**   | **说明**                                     |
| ---------- | -------------------------------------------- |
| stcError_t | 详细的错误类型含义，请参见*stcError_t*章节。 |

##### stcEventRecord

函数描述：调用stcEventRecord在指定流的当前运行点添加事件。

函数类型：同步函数

函数定义：

```C++
stcEventRecord(stcEvent_t event, stcStream_t stream=0)
```

函数参数：

| **名称** | **输入/输出** | **类型**    | **说明**                                                     |
| -------- | ------------- | ----------- | ------------------------------------------------------------ |
| event    | 输入参数      | stcEvent_t  | 待添加事件的标识符。                                         |
| stream   | 输入参数      | stcStream_t | 待添加事件的流的标识符，默认为0，代表在所有流的当前运行点添加事件。 |

函数返回值：

| **类型**   | **说明**                                     |
| ---------- | -------------------------------------------- |
| stcError_t | 详细的错误类型含义，请参见*stcError_t*章节。 |

##### stcEventElapsedTime

函数描述：调用stcEventElapsedTime获取处理两个事件间请求所消耗的时间。

函数类型：同步函数

函数定义：

```C++
stcError_t stcEventElapsedTime(float *ms, stcEvent_t start, stcEvent_t end)
```

函数参数：

| **名称** | **输入/输出** | **类型**   | **说明**                                       |
| -------- | ------------- | ---------- | ---------------------------------------------- |
| ms       | 输出参数      | float*     | 指向所获取消耗时间的指针，消耗时间的单位为ms。 |
| start    | 输入参数      | stcEvent_t | 开始事件的标识符。                             |
| end      | 输入参数      | stcEvent_t | 结束事件的标识符。                             |

函数返回值：

| **类型**   | **说明**                                     |
| ---------- | -------------------------------------------- |
| stcError_t | 详细的错误类型含义，请参见*stcError_t*章节。 |

##### stcStreamWaitEvent

函数描述：调用stcStreamWaitEvent在多流场景中建立流之间的同步关系，指定某个流需要等指定事件被置为完成状态后再开始处理请求。

函数类型：同步函数

函数定义：

```C++
stcError_t stcStreamWaitEvent(stcStream_t stream, stcEvent_t event)
```

函数参数：

| **名称** | **输入/输出** | **类型**    | **说明**                                                 |
| -------- | ------------- | ----------- | -------------------------------------------------------- |
| stream   | 输入参数      | stcStream_t | 流标识符，该流在对应事件被置为完成状态后再开始处理请求。 |
| event    | 输入参数      | stcEvent_t  | 事件标识符。                                             |

函数返回值：

| **类型**   | **说明**                                     |
| ---------- | -------------------------------------------- |
| stcError_t | 详细的错误类型含义，请参见*stcError_t*章节。 |

#### 卡卡互联

##### stcSetP2PMap

函数描述：设置跨卡程序需要使用的板卡信息，包含板卡的数量，以及板卡的编号列表。

> 说明：所有的板卡均需要设置，并且在使用前请使用stcSetDevice接口指定板卡。

函数类型：同步函数

函数定义：

```C++
stcError_t stcSetP2PMap(char *json_config);
```

函数参数：

| **名称**     | **输入/输出** | **类型** | **说明**                                                     |
| ------------ | ------------- | -------- | ------------------------------------------------------------ |
| *json_config | 输入参数      | char     | 设置P2P工作组需要板卡信息，包含所在主机的IP地址，板卡的虚拟和物理ID。 |

配置信息使用json字符串，格式如下：

```json
{        
    nr_npus: N,        
    npus: [                
            { host: "xxx.xxx.xxx.xxx", virt_npu_id: 0, phys_npu_id: X },                
            { host: "xxx.xxx.xxx.xxx", virt_npu_id: 1, phys_npu_id: Y },               
            ...,                
            { host: "xxx.xxx.xxx.xxx", virt_npu_id: N-1, phys_npu_id: Z }        
           ]
}
```

函数返回值：

| **类型**   | **说明**                                     |
| ---------- | -------------------------------------------- |
| stcError_t | 详细的错误类型含义，请参见*stcError_t*章节。 |

##### stcClearP2PMap

函数描述：清除跨卡程序的板卡信息。

> 说明：所有的板卡均需要设置，并且在使用前请使用stcSetDevice接口指定板卡。

函数类型：同步函数

函数定义：

```C++
stcError_t stcClearP2PMap()
```

函数参数：

无

函数返回值：

| **类型**   | **说明**                                     |
| ---------- | -------------------------------------------- |
| stcError_t | 详细的错误类型含义，请参见*stcError_t*章节。 |

#### 错误处理

##### stcGetLastError

函数描述：调用stcGetLastError返回一个线程调用主机端运行时接口时产生的最后一个错误，然后将结果重置为stcSuccess。如果没有错误，则返回stcSuccess。

函数类型：同步函数

函数定义：

```C++
stcError_t stcGetLastError(void)
```

函数参数：

无

函数返回值：

| **类型**   | **说明**                                     |
| ---------- | -------------------------------------------- |
| stcError_t | 详细的错误类型含义，请参见*stcError_t*章节。 |

##### stcGetErrorName

函数描述：调用stcGetErrorName从获取的错误码得到错误名称。

函数类型：同步函数

函数定义：

```C++
const char* stcGetErrorName (stcError_t error)
```

函数参数：

| **名称** | **输入/输出** | **类型**   | **说明**                              |
| -------- | ------------- | ---------- | ------------------------------------- |
| error    | 输入参数      | stcError_t | 调用`stcGetLastError`获取到的错误码。 |

函数返回值：

| **类型**    | **说明**                                     |
| ----------- | -------------------------------------------- |
| const char* | 指向错误名称字符串的指针，字符串以NULL结尾。 |

##### stcGetErrorString

函数描述：调用stcGetErrorString从获取的错误码得到错误详情。

函数类型：同步函数

函数定义：

```C++
const char* stcGetErrorString (stcError_t error)
```

函数参数：

| **名称** | **输入/输出** | **类型**   | **说明**                              |
| -------- | ------------- | ---------- | ------------------------------------- |
| error    | 输入参数      | stcError_t | 调用`stcGetLastError`获取到的错误码。 |

函数返回值：

| **类型**    | **说明**               |
| ----------- | ---------------------- |
| const char* | 指向NULL结尾的字符串。 |

#### 数据类型

##### stcKernelParams_t

数据描述：记录一个核函数的所有参数信息。

##### stcModule_t

数据描述：记录一个NPC Cluster设备目标程序模块的相关信息。

##### stcStream_t

数据描述：记录一个流的相关信息。

##### stcEvent_t

数据描述：记录一个事件的相关信息。

##### stcError_t

数据描述：记录调用主机端运行时接口时返回的错误。支持返回的错误类型如下所示：

| **枚举成员**                    | **枚举值** | **说明**                                                     |
| ------------------------------- | ---------- | ------------------------------------------------------------ |
| stcSuccess                      | 0          | 函数调用成功，未返回错误。                                   |
| stcErrorInvalidValue            | 1          | 一个或多个参数的取值超出了有效值范围。                       |
| stcErrorInvalidDevice           | 2          | 使用了无效的NPC Cluster ID。                                 |
| stcErrorHostMemoryAllocation    | 3          | 在主机端分配内存失败。                                       |
| stcErrorDeviceMemoryAllocation  | 4          | 在设备端分配内存失败。                                       |
| stcErrorInvalidDevicePointer    | 5          | 使用了无效的设备端内存地址。                                 |
| stcErrorLinkFailure             | 6          | 设备端目标程序链接失败。                                     |
| stcErrorInvalidKernel           | 7          | 使用了无效的核函数名称。                                     |
| stcErrorInvalidImage            | 8          | 设备端目标程序不可用。<br/>说明：设备端目标程序对应fat binary，而设备端目标模块则对应具体的binary。 |
| stcErrorNoImage                 | 9          | 设备端目标程序不存在。                                       |
| stcErrorInvalidModule           | 10         | 设备端目标模块不可用。<br/>说明：设备端目标程序对应fat binary，而设备端目标模块则对应具体的binary。 |
| stcErrorNoModule                | 11         | 设备端目标模块不存在。                                       |
| stcErrorInvalidStream           | 12         | 流不可用。                                                   |
| stcErrorInvalidEvent            | 13         | 事件不可用。                                                 |
| stcErrorDeviceImageException    | 15         | 设备端目标程序运行时出现异常。                               |
| stcErrorSyscallFailure          | 16         | 主机端的系统调用失败。                                       |
| stcErrorForkForbidden           | 17         | 父进程已调用过运行时接口，禁止子进程再次调用。               |
| stcErrorInvalidCoreNum          | 18         | 使用了无效的核数量。                                         |
| stcErrorGDBFailure              | 19         | stc-gdb跟踪失败，无法获取调试信息。                          |
| stcErrorDriverMismatch          | 20         | NPU驱动版本和NPU设备不匹配。                                 |
| stcErrorDeviceBreakdown         | 21         | NPU设备出现故障，无法继续使用。                              |
| stcErrorInvalidNpuTask          | 24         | NPU任务不可用。                                              |
| stcErrorInvalidImageDataSection | 25         | 设备端目标程序包含了太多可写数据段，导致程序无法正常运行。   |
| stcErrorOutOfHostMemory         | 27         | 主机端内存不足。                                             |
| stcErrorTooManyOpenStreams      | 28         | 打开流的数量过多，已超过上限。                               |
| stcErrorTooManyOpenEvents       | 29         | 打开事件的数量过多，已超过上限。                             |
| stcErrorDriverFailure           | 99         | NPU驱动错误。                                                |

##### stcMemcpyKind_t

数据描述：设置拷贝内存操作的类型。支持设置的操作类型如下所示：

| **枚举定义**          | **枚举值** | **说明**                             |
| --------------------- | ---------- | ------------------------------------ |
| stcMemcpyHostToHost   | 0          | 在同一台主机的不同内存段间拷贝数据。 |
| stcMemcpyHostToDevice | 1          | 从主机端向设备端拷贝数据。           |
| stcMemcpyDeviceToHost | 2          | 从设备端向主机端拷贝数据。           |
| stcMemcpyP2P          | 4          | 从一台主机向另外一台主机拷贝数据。   |
| stcMemcpyMax          | 5          | 用于检查传入参数中的种类是否合法。   |

##### stcDeviceAttr_t

数据描述：记录NPU设备的属性。支持查看的属性如下所示：

| **枚举定义**                  | **枚举值** | **说明**                                                     |
| ----------------------------- | ---------- | ------------------------------------------------------------ |
| stcDevAttrChipHWVersion       | 0          | NPU硬件版本。                                                |
| stcDevAttrBoardHWVersion      | 1          | 板卡硬件版本。                                               |
| stcDevAttrClusterCount        | 2          | NPC Cluster的数量。                                          |
| stcDevAttrNPCPerCluster       | 3          | 每个NPC Cluster包含的NPC数量。                               |
| stcDevAttrSharedmemPerCluster | 4          | 每个NPC Cluster中共享内存的大小。                            |
| stcDevAttrGlobalmemPerCluster | 5          | 每个NPC Cluster中全局内存的大小。                            |
| stcDevAttrConcurrentKernels   | 6          | 每个NPC Cluster可以并行执行的核函数的数量。                  |
| stcDevAttrPciBusId            | 7          | PCIe总线的ID。                                               |
| stcDevAttrPciDeviceId         | 8          | PCIe设备的ID，即希姆计算板卡的ID，例如STCP920的为0100。      |
| stcDevAttrFirmwareVersion     | 9          | 设备端固件的版本。                                           |
| stcDevAttrDriverVersion       | 10         | 主机端安装的设备驱动版本。                                   |
| stcDevAttrCount               | 11         | 支持查看的属性数量，即本表格中除stcDevAttrCount外枚举定义的数量。 |

##### stcKernelFlag_t

数据描述：设置核函数的运行标志。支持设置的运行标志如下所示：

| **枚举定义**                       | **枚举值** | **说明**                                            |
| ---------------------------------- | ---------- | --------------------------------------------------- |
| stcKernelFlagNone                  | 0          | NPC执行核函数前后均处理DCache，可以视为无运行标志。 |
| stcKernelFlagInputDataBypassDcache | 1          | NPC执行核函数前，不需要处理DCache。                 |
| stcKernelFlagOutputDataBypassDache | 2          | NPC执行核函数后，不需要处理DCache。                 |

##### stcKernelData_t

数据描述：核函数输入输出对应的主机端数据区的属性。包含的成员变量如下所示：

| **成员变量** | **说明**       |
| ------------ | -------------- |
| data         | 数据区的地址。 |
| size         | 数据区的大小。 |

#### 环境变量

##### STC_SET_DEVICES

数据描述：运行时修改`stcSetDevice`的执行结果，支持同时设置多个NPC Cluster ID，以半角逗号分隔即可。每个设置的索引为原NPC Cluster ID，设置的值为新NPC Cluster ID。示例如下：

| **设置**                    | **说明**                                                     |
| --------------------------- | ------------------------------------------------------------ |
| export STC_SET_DEVICES=2    | 设置`STC_SET_DEVICES`为2后：默认使用NPC Cluster 2。执行`stcSetDevice`的起始NPC Cluster ID为2。例如，stcSetDevice(0)代表使用NPC Cluster ID为2，stcSetDevice(1)代表使用NPC Cluster ID为3。 |
| export STC_SET_DEVICES=2, 3 | 设置`STC_SET_DEVICES`为2和3后：默认使用NPC Cluster 2，可以使用NPC Cluster 2和NPC Cluster 3。执行`stcSetDevice`的起始NPC Cluster ID为2。例如，stcSetDevice(0)代表使用NPC Cluster 2，stcSetDevice(1)代表使用NPC Cluster 3。 |

## HPE设备端运行时API

### 调用要求

调用HPE设备端运行时API时，请确保：

- 已安装HPE。具体操作，请参见[STCRP安装指南](https://docs.streamcomputing.com/_/sharing/vSxLMI20nalGphdpXdEVoDg6JkUcfEkT?next=/zh/latest/)。

- 在代码文件中导入所需的头文件，包括但不限于：

  ```c++
  #include <npurt.h>
  ```

> 说明：系统的HPE异构编程介绍，请参见[STCRP开发指南](https://docs.streamcomputing.com/_/sharing/vSxLMI20nalGphdpXdEVoDg6JkUcfEkT?next=/zh/latest/)，安装HPE后自带的异构编程示例，请参见[HPE使用指南](https://docs.streamcomputing.com/_/sharing/vSxLMI20nalGphdpXdEVoDg6JkUcfEkT?next=/zh/latest/)。

### 接口说明

#### exit

函数描述：调用exit退出核函数并返回您指定的退出码。

函数类型：同步函数

函数定义：

```C++
__device__ void exit(int exit_code)
```

函数参数：

| **名称**  | **输入/输出** | **类型** | **说明**             |
| --------- | ------------- | -------- | -------------------- |
| exit_code | 输入参数      | int      | 您自行定义的退出码。 |

函数返回值：

无

#### abort

函数描述：调用abort退出核函数并返回退出码128。

函数类型：同步函数

函数定义：

```C++
__device__ void abort()
```

函数参数：

无

函数返回值：

无

#### assert

函数描述：调用assert验证指定的条件，在未满足断言时，退出核函数并返回退出码128。

函数类型：同步函数

函数定义：

```C++
__device__ void assert(int exp)
```

函数参数：

| **名称** | **输入/输出** | **类型** | **说明**                                                     |
| -------- | ------------- | -------- | ------------------------------------------------------------ |
| exp      | 输入参数      | int      | 指定的条件。如果未满足断言，则值为0，退出核函数并返回错误码128。 |

函数返回值：

无

#### memcpy

函数描述：调用memcpy在设备端拷贝内存，支持以指定内存大小或信息格式（通过cpy_config_t描述）的形式拷贝。该函数支持以下拷贝方向：

- 本地内存之间、共享内存之间、全局内存（0GiB ~ 4GiB）之间
- 本地内存与共享内存之间
- 本地内存和全局内存（0GiB ~ 3GiB）之间
- 共享内存与全局内存（0GiB ~ 4GiB）之间

函数类型：同步函数

函数定义：

```C++
__device__ int memcpy(void* dest, void* src, int len)
__device__ int memcpy(void* dest, void* src, cpy_config_t info)
```

函数参数：

| **名称** | **输入/输出** | **类型**     | **说明**                                                     |
| -------- | ------------- | ------------ | ------------------------------------------------------------ |
| dest     | 输入参数      | void*        | 拷贝操作的目的地址，向该指针指向的内存写入数据。             |
| src      | 输入参数      | void*        | 拷贝操作的源地址，从该指针指向的内存读取数据。               |
| len      | 输入参数      | int          | 待拷贝内存的大小，单位为字节。                               |
| info     | 输入参数      | cpy_config_t | 待拷贝内存的信息格式的描述，详细的信息格式说明，请参见*cpy_config_t*章节。 |

> 注意：建议您使用stcMalloc或stcMallocHigh分配内存。如果dest和src对应的内存不是通过stcMalloc或stcMallocHigh分配，则必须在传入dest和src前自行添加对齐属性，保证地址满足64字节对齐。添加对齐属性的方法：定义变量时，在原语句前添加关键字`__attribute__((aligned(64)))`，例如`__local__ __attribute__((aligned(64))) int local_data[NCORE]`。

函数返回值：

| **类型** | **说明**                                       |
| -------- | ---------------------------------------------- |
| int      | 详细的错误类型含义，请参见*npurtError_t*章节。 |

#### get_npu_idx

函数描述：获取调用者所在NPU卡的ID。

函数类型：同步函数

函数定义：

```C++
int get_npu_idx()
```

函数参数：

无

函数返回值：

| **类型** | **说明**                                 |
| -------- | ---------------------------------------- |
| int      | NPU卡的逻辑ID，范围：0~（NPU卡数量-1）。 |

#### get_npu_nr

函数描述：查询程序可以使用的NPU卡数量。

函数类型：同步函数

函数定义：

```C++
int get_npu_nr()
```

函数参数：

无

函数返回值：

| **类型** | **说明**                                                     |
| -------- | ------------------------------------------------------------ |
| int      | 返回值为0：非跨卡程序<br/>返回值为其他数值：跨卡程序使用的NPU卡数量 |

#### memcpy_p2p

函数描述：在本地发起一个向远端NPU DDR的数据传输，将本NPU卡的数据传输到远端NPU卡。当远端flag_addr为非0时，可以同时向该远端地址写入一个4字节的flag值。

由于卡卡互联的功能性与主机系统的配置（包括BIOS设置和Linux引导参数）有关系，所以通常情况下，完全关闭CPU的虚拟化功能即可支持P2P传输。若需在开启CPU的虚拟化功能的情况下使用P2P功能，则需设置`intel_iommu=on`（或`amd_iommu=on`）和`iommu=pt`。有时，也可能需要升级主机的BIOS（或CPU Microcode）才可使能P2P功能。

> 说明：每个NPC均可发起P2P传输任务，传输任务是异步执行的。在该任务完成前，该NPC不能发起另一个任务；此时如果再次调用该接口，会等待上次一任务完成后才能完成新任务提交。

函数类型：同步函数

函数定义：

```C++
int memcpy_p2p(uint64_t dst, uint64_t src, uint64_t len, int dst_npu_idx, uint64_t flag_addr, uint32_t flag)
```

函数参数：

| **名称**    | **输入/输出** | **类型** | **说明**                                                   |
| ----------- | ------------- | -------- | ---------------------------------------------------------- |
| dst         | 输入参数      | uint64_t | 远端NPU卡的目的地址，必须4字节对齐。                       |
| src         | 输入参数      | uint64_t | 本地NPU卡的源地址，必须4字节对齐。                         |
| len         | 输入参数      | uint64_t | 传输的数据长度，必须为4字节倍数。当len为零时，不传输数据。 |
| dst_npu_idx | 输入参数      | int      | 远端NPU卡的ID。                                            |
| flag_addr   | 输入参数      | uint64_t | 远端NPU卡的flag地址。当flag_addr为零时，不传输flag的值。   |
| flag        | 输入参数      | uint32_t | flag的值。                                                 |

> 说明：当len和flag_addr都为零时，为无效传输，系统报错。

函数返回值：

| **类型** | **说明**                              |
| -------- | ------------------------------------- |
| int      | 返回值为0：任务创建成功（始终成功）。 |

#### memcpy_p2p_wait

函数描述：等待本地发起的p2p传输完成。

函数类型：同步函数

函数定义：

```C++
void memcpy_p2p_wait()
```

函数参数：

无

函数返回值：

无

#### wait_flag

函数描述：等待远端NPU卡上的地址值被修改为预期标识值，用于确认远端发起的P2P传输是否完成。

函数类型：同步函数

函数定义：

```C++
void wait_flag(uint32_t addr, uint32_t flag)
```

函数参数：

| **名称** | **输入/输出** | **类型** | **说明**              |
| -------- | ------------- | -------- | --------------------- |
| addr     | 输入参数      | uint32_t | 远端NPU卡的目的地址。 |
| flag     | 输入参数      | uint32_t | 预期标识值。          |

函数返回值：

无

### 数据类型

#### npurtError_t

数据描述：记录调用设备端运行时接口时返回的错误。支持返回的错误类型如下所示：

| **枚举定义**                          | **枚举值** | **说明**                                                     |
| ------------------------------------- | ---------- | ------------------------------------------------------------ |
| npurtSuccess                          | 0          | 函数调用成功，未返回错误。                                   |
| npurtErrorSysdmaInvalidDmaID          | 1          | 使用SysDMA在共享内存和全局内存间传输数据时，指定了无效的DMA控制器ID。 |
| npurtErrorSysdmaInvalidChannelID      | 2          | 指定了无效的DMA通道ID。                                      |
| npurtErrorSysdmaInvalidDataRow        | 3          | 指定了无效的数据行。                                         |
| npurtErrorSysdmaInvalidDataCol        | 4          | 指定了无效的数据列。                                         |
| npurtErrorSysdmaInvalidDataStride     | 5          | 指定了无效的数据Stride。                                     |
| npurtErrorSysdmaInvalidDataSize       | 6          | 指定了无效的数据大小。                                       |
| npurtErrorSysdmaInvalidState          | 7          | 无效的DMA状态。                                              |
| npurtErrorSysdmaReqFull               | 8          | DMA请求队列已满，无法处理更多请求。                          |
| npurtErrorSysdmaInvalidAddress        | 9          | 指定了无效的地址。                                           |
| npurtErrorSysdmaInvalidXferType       | 10         | 指定了无效的传输类型。                                       |
| npurtErrorSysdmaBusy                  | 11         | DMA正在使用中，无法执行其他任务。                            |
| npurtErrorSysdmaXferFailure           | 12         | 数据传输失败。                                               |
| npurtMemcpyIncompatibleParamLen       | 13         | 拷贝内存时，指定了无法识别的参数。                           |
| npurtErrorMemcpyInvalidAddress        | 14         | 指定了无效的地址。                                           |
| npurtErrorMemcpyInvalidConfigRows     | 15         | 指定了无效的数据行。                                         |
| npurtErrorMemcpyInvalidConfigCols     | 16         | 指定了无效的数据列。                                         |
| npurtErrorMemcpyInvalidDataStrides    | 17         | 指定了无效的数据Stride。                                     |
| npurtErrorMemcpyInvalidConfigDtype    | 18         | 指定了无效的数据类型。                                       |
| npurtErrorMemcpyInvalidConfigDestcore | 19         | 指定了无效的目标NPC。                                        |
| npurtErrorMemcpyInvalidDataSize       | 20         | 指定了无效的数据大小。                                       |
| npurtErrorMemcpyOverflowBoundary      | 21         | 超过了源或目的地址空间。                                     |
| npurtErrorMemcpyGlbmem32Unaligned     | 22         | 发现源或目的地址没有32字节对齐。                             |

#### cpy_config_t

数据描述：待拷贝内存的信息格式。包含的成员变量如下：

| **成员变量** | **说明**                                                     |
| ------------ | ------------------------------------------------------------ |
| rows         | 待拷贝数据的行数。                                           |
| cols         | 待拷贝数据的列数。                                           |
| stride_cols  | 拷贝数据时使用的列数Stride。                                 |
| dtype        | 待拷贝数据的类型。详细的数据类型定义，请参见*cpy_dtype_t*章节。 |
| dest_core    | 拷贝数据时NPC Cluster内目标NPC的标识符，该参数只适用于在不同NPC的本地内存间传输数据。<br/>说明：目前`memcpy`仅支持在同一NPC Cluster内拷贝。 |

#### cpy_dtype_t

数据描述：待拷贝数据的类型。支持的数据类型如下所示：

| **枚举定义** | **枚举值** | **说明**                     |
| ------------ | ---------- | ---------------------------- |
| DTYPE_BYTE_1 | 0          | 每个数据元素占一个字节大小。 |
| DTYPE_BYTE_2 | 1          | 每个数据元素占两个字节大小。 |

### 变量

#### CoreID

描述：获取NPC在NPC Cluster内的标识符，例如STCP920芯片中CoreID的范围为0 ~ 7。

类型：整型只读

#### CoreNum

描述：获取运行核函数时所使用NPC的个数。

类型：整型只读

## STCPTI性能数据采集API

### 调用要求

调用STCPTI性能数据采集API时，请确保：

- 已安装HPE。具体操作，请参见[STCRP安装指南](https://docs.streamcomputing.com/_/sharing/vSxLMI20nalGphdpXdEVoDg6JkUcfEkT?next=/zh/latest/)。

- 在代码文件中导入所需的头文件，包括但不限于：

  ```C++
  #include <stcpti.h>
  ```

### 接口说明

#### stcptiKernelContextCreate

函数描述：为当前进程创建核函数性能数据采集的上下文。

函数类型：同步函数

函数定义：

```C++
__host__ stcProfilerResult_t stcptiKernelContextCreate()
```

函数参数：

None

函数返回值：

| **类型**            | **描述**                                              |
| ------------------- | ----------------------------------------------------- |
| stcProfilerResult_t | 详细的数据类型描述，请参见*stcProfilerResult_t*章节。 |

#### stcptiKernelContextRelease

函数描述：释放当前进程的核函数性能数据采集的上下文。

函数类型：同步函数

函数定义：

```C++
__host__ stcProfilerResult_t stcptiKernelContextRelease()
```

函数参数：

None

函数返回值：

| **类型**            | **描述**                                              |
| ------------------- | ----------------------------------------------------- |
| stcProfilerResult_t | 详细的数据类型描述，请参见*stcProfilerResult_t*章节。 |

#### stcptiKernelContextReleaseAll

函数描述：释放所有进程的核函数性能数据采集的上下文。

函数类型：同步函数

函数定义：

```C++
__host__ stcProfilerResult_t stcptiKernelContextReleaseAll()
```

函数参数：

None

函数返回值：

| **类型**            | **描述**                                              |
| ------------------- | ----------------------------------------------------- |
| stcProfilerResult_t | 详细的数据类型描述，请参见*stcProfilerResult_t*章节。 |

#### stcptiKernelEnable

函数描述：启动当前进程的性能数据采集。

函数类型：同步函数

函数定义：

```C++
__host__ stcProfilerResult_t stcptiKernelEnable()
```

函数参数：

None

函数返回值：

| **类型**            | **描述**                                              |
| ------------------- | ----------------------------------------------------- |
| stcProfilerResult_t | 详细的数据类型描述，请参见*stcProfilerResult_t*章节。 |

#### stcptiKernelDisable

函数描述：停止当前进程的性能数据采集。

函数类型：同步函数

```C++
__host__ stcProfilerResult_t stcptiKernelDisable()
```

函数参数：

None

函数返回值：

| **类型**            | **描述**                                              |
| ------------------- | ----------------------------------------------------- |
| stcProfilerResult_t | 详细的数据类型描述，请参见*stcProfilerResult_t*章节。 |

#### stcptiKernelGetPerfDatas

函数描述：获取当前进程的性能数据采集结果。

函数类型：同步函数

函数定义：

```C++
__host__ stcProfilerResult_t stcptiKernelGetPerfDatas(struct STCpti_PerfDatas *perf_data)
```

函数参数：

| **名称**  | **输入/输出** | **类型**         | **描述**                                                     |
| --------- | ------------- | ---------------- | ------------------------------------------------------------ |
| perf_data | 输出参数      | STCpti_PerfDatas | 用于返回所有核函数在所有NPC上的性能数据。详细的数据类型描述，请参见*STCpti_PerfDatas*章节。 |

函数返回值：

| **类型**            | **描述**                                              |
| ------------------- | ----------------------------------------------------- |
| stcProfilerResult_t | 详细的数据类型描述，请参见*stcProfilerResult_t*章节。 |

#### stcptiGetEventNameFromID

函数描述：获取指定性能数据采集事件的值对应的名称。

函数类型：同步函数

函数定义：

```C++
__host__ stcProfilerResult_t stcptiGetEventNameFromID(int e, const char **eventName);
```

函数参数：

| **参数名称** | **输入/输出** | **类型**      | **描述**                                                     |
| ------------ | ------------- | ------------- | ------------------------------------------------------------ |
| e            | 输入参数      | int           | 待查询的性能数据采集事件的值。                               |
| eventName    | 输出参数      | const char ** | 查询到的event名称。event的值和名称的对应关系，请参见*stcPtiEventID_t*章节。 |

函数返回值：

| **类型**            | **描述**                                              |
| ------------------- | ----------------------------------------------------- |
| stcProfilerResult_t | 详细的数据类型描述，请参见*stcProfilerResult_t*章节。 |

#### stcptiKernelIsMcuCycle32Ovf

函数描述：判断32位的MCU Cycle寄存器是否溢出。

函数类型：同步函数

函数定义：

```C++
__host__ bool stcptiKernelIsMcuCycle32Ovf(struct STCpti_KernelNpcPerfData kernel_perf_data);
```

函数参数：

| **名称**         | **输入/输出** | **类型**                 | **描述**                                                     |
| ---------------- | ------------- | ------------------------ | ------------------------------------------------------------ |
| kernel_perf_data | 输入参数      | STCpti_KernelNpcPerfData | 需要查询的NPC性能数据。详细的数据类型描述，请参见*STCpti_PerfDatas*章节。 |

函数返回值：

| **类型** | **描述**                   |
| -------- | -------------------------- |
| bool     | 1：溢出。 <br/>0：未溢出。 |

#### stcptiKernelGetMcuCycle64

函数描述：获取64位的MCU cycle数值。

函数类型：同步函数

函数定义：

```C++
__host__ uint64_t stcptiKernelGetMcuCycle64(struct STCpti_KernelNpcPerfData kernel_perf_data);
```

函数参数：

| **名称**         | **输入/输出** | **类型**                 | **描述**                                                     |
| ---------------- | ------------- | ------------------------ | ------------------------------------------------------------ |
| kernel_perf_data | 输入参数      | STCpti_KernelNpcPerfData | 需要查询的NPC性能数据。详细的数据类型描述，请参见*STCpti_PerfDatas*章节。 |

函数返回值：

| **类型** | **描述**                |
| -------- | ----------------------- |
| uint64_t | 获取到的MCU cycle数值。 |

#### stcptiKernelIsMcuCycle64Ovf

函数描述：判断64位的MCU Cycle寄存器是否溢出。

函数类型：同步函数

函数定义：

```C++
__host__ bool stcptiKernelIsMcuCycle64Ovf(struct STCpti_KernelNpcPerfData kernel_perf_data);
```

函数参数：

| **参数名称**     | **输入/输出** | **类型**                 | **描述**                                                     |
| ---------------- | ------------- | ------------------------ | ------------------------------------------------------------ |
| kernel_perf_data | 输入参数      | STCpti_KernelNpcPerfData | 需要查询的NPC性能数据。详细的数据类型描述，请参见*STCpti_PerfDatas*章节。 |

函数返回值：

| **类型** | **描述**                   |
| -------- | -------------------------- |
| bool     | 1：溢出。 <br/>0：未溢出。 |

### 数据类型

#### STCpti_PerfDatas

STCpti_PerfDatas结构体的属性如下：

| **属性名称**       | **属性类型**             | **属性描述**                                                 |
| ------------------ | ------------------------ | ------------------------------------------------------------ |
| pKernelPerfDatas   | STCpti_KernelPerfDatas * | STCpti_KernelPerfDatas数组的指针，保存了所有核函数的性能数据。该数组的每个元素对应一个核函数中采集到的性能数据，包括在每个NPC上的性能数据和sysDMA相关的性能数据。 |
| kernelPerfDataSize | size_t                   | STCpti_KernelPerfDatas数组的大小。                           |

其中，STCpti_KernelPerfDatas结构体的属性如下：

| **属性名称**          | **属性类型**               | **属性描述**                                                 |
| --------------------- | -------------------------- | ------------------------------------------------------------ |
| pKernelName           | char *                     | 指向Kernel名称的指针。                                       |
| arrKernelNpcPerfData  | STCpti_KernelNpcPerfData * | STCpti_KernelNpcPerfData数组的指针，保存了单个核函数使用NPC的性能数据。该数组的每个元素对应一个NPC上的性能数据，包括MCU指令、VME指令、MME指令、MTE指令等的性能信息，例如cycle数等。 |
| kernelNpcPerfDataSize | size_t                     | STCpti_KernelNpcPerfData数组的大小。                         |
| kernelDmaPerfData     | STCpti_KernelDmaPerfData   | 保存了sysDMA相关的性能数据，例如LLB、DDR之间搬运的数据量和带宽。 |

#### stcProfilerResult_t

数据描述：记录了调用STCPTI接口的结果。支持的结果类型如下：

| **枚举成员**                    | **枚举值** | **描述**                     |
| ------------------------------- | ---------- | ---------------------------- |
| STC_PROFILER_ERROR              | -1         | 接口调用失败。               |
| STC_PROFILER_SUCCESS            | 0          | 接口调用成功。               |
| STC_PROFILER_ERROR_INVALID_ARGU | 1          | 调用接口时传入了无效的参数。 |
| STC_PROFILER_ERROR_UNKNOW       | 2          | 调用接口时产生了未知的错误。 |

#### stcPtiEventID_t

数据描述：记录了性能数据采集事件的类型。支持的类型如下：

| **枚举成员**                                | **枚举值** | **描述**                                                 |
| ------------------------------------------- | ---------- | -------------------------------------------------------- |
| STC_PTI_EVENT_ID_MCU_CYCLE                  | 0          | MCU指令耗费的cycle数。                                   |
| STC_PTI_EVENT_ID_VME_CYCLE                  | 1          | 自定义向量运算指令耗费的cycle数。                        |
| STC_PTI_EVENT_ID_MME_CYCLE                  | 2          | MME指令耗费的cycle数。                                   |
| STC_PTI_EVENT_ID_VEC_CYCLE                  | 3          | RISC-V原生向量运算指令耗费的cycle数。                    |
| STC_PTI_EVENT_ID_SYN_CYCLE                  | 4          | SYNC指令耗费的cycle数。                                  |
| STC_PTI_EVENT_ID_MTE_TOTAL_CYCLE            | 5          | 所有类型MTE指令耗费的cycle数。                           |
| STC_PTI_EVENT_ID_VME_INST                   | 6          | 自定义向量运算指令的数量。                               |
| STC_PTI_EVENT_ID_MME_INST                   | 7          | MME指令的数量。                                          |
| STC_PTI_EVENT_ID_VEC_INST                   | 8          | RISC-V原生向量运算指令的数量。                           |
| STC_PTI_EVENT_ID_SYN_INST                   | 9          | SYNC指令的数量。                                         |
| STC_PTI_EVENT_ID_MTE_PLD_INST               | 10         | MTE pld指令的数量。                                      |
| STC_PTI_EVENT_ID_MTE_ICMOV_INST             | 11         | MTE icmov指令的数量。                                    |
| STC_PTI_EVENT_ID_MTE_MOV_INST               | 12         | MTE mov指令的数量。                                      |
| STC_PTI_EVENT_ID_PAL_VME_MME_CYCLE          | 13         | 并行执行VME、MME指令耗费的cycle数。                      |
| STC_PTI_EVENT_ID_PAL_MTE_MME_CYCLE          | 14         | 并行执行MTE、MME指令耗费的cycle数。                      |
| STC_PTI_EVENT_ID_PAL_VME_MTE_CYCLE          | 15         | 并行执行VME、MTE指令耗费的cycle数。                      |
| STC_PTI_EVENT_ID_PAL_TOTAL_CYCLE            | 16         | 并行执行VME、MME、MTE指令耗费的cycle数。                 |
| STC_PTI_EVENT_ID_MTE_ICMOV_CYCLE            | 17         | MTE icmov指令耗费的cycle数。                             |
| STC_PTI_EVENT_ID_MTE_L12LLB_CYCLE           | 18         | 从L1向LLB搬运数据耗费的cycle数。                         |
| STC_PTI_EVENT_ID_MTE_LLB2L1_CYCLE           | 19         | 从LLB向L1搬运数据耗费的cycle数。                         |
| STC_PTI_EVENT_ID_MTE_PLD_CYCLE              | 20         | MTE pld指令耗费的cycle数。                               |
| STC_PTI_EVENT_ID_MTE_PLD_BYTE               | 21         | 通过MTE pld指令搬运的数据量，单位为字节。                |
| STC_PTI_EVENT_ID_MTE_L12LLB_BYTE            | 22         | 从L1向LLB搬运的数据量，单位为字节。                      |
| STC_PTI_EVENT_ID_MTE_LLB2L1_BYTE            | 23         | 从LLB向L1搬运的数据量，单位为字节。                      |
| STC_PTI_EVENT_ID_MTE_ICMOV_BYTE             | 24         | 通过MTE icmov指令搬运的数据量，单位为字节。              |
| STC_PTI_EVENT_ID_SYN_WAIT_CYCLE             | 25         | 开始SYNC后NPC Cluster内所有Core完成运算所等待的cycle数。 |
| STC_PTI_EVENT_ID_VEC_SLOT_WAIT_CYCLE        | 26         | 向量运算指令从接收到执行所等待的cycle数。                |
| STC_PTI_EVENT_ID_MME_SLOT_WAIT_CYCLE        | 27         | MME指令从接收到执行所等待的cycle数。                     |
| STC_PTI_EVENT_ID_MTE_SLOT_WAIT_CYCLE        | 28         | MTE指令从接收到执行所等待的cycle数。                     |
| STC_PTI_EVENT_ID_MIF_L1_CONFLICT_CYCLE      | 29         | 通过MIF（Memory Interface）访问L1时产生冲突的cycle数。   |
| STC_PTI_EVENT_ID_MIF_IM_CONFLICT_CYCLE      | 30         | 通过MIF访问IM时产生冲突的cycle数。                       |
| STC_PTI_EVENT_ID_MCU_EVENT3_TYPE_CNT        | 31         | 可配置寄存器。                                           |
| STC_PTI_EVENT_ID_MCU_EVENT4_TYPE_CNT        | 32         | 可配置寄存器。                                           |
| STC_PTI_EVENT_ID_MCU_EVENT5_TYPE_CNT        | 33         | 可配置寄存器。                                           |
| STC_PTI_EVENT_ID_MCU_EVENT6_TYPE_CNT        | 34         | 可配置寄存器。                                           |
| STC_PTI_EVENT_ID_MCU_EVENT6H_TYPE_CNT       | 35         | STC_PTI_EVENT_ID_MCU_EVENT6_TYPE_CNT的高32位。           |
| STC_PTI_EVENT_ID_MCU_MCOUNTER_OVERFLOW      | 36         | 判断性能数据采集事件的计数是否溢出。                     |
| STC_PTI_EVENT_ID_SYSDMA0_DMA_ID             | 37         | DMA控制器0的ID。                                         |
| STC_PTI_EVENT_ID_SYSDMA0_LLB_CONFLICT_CYCLE | 38         | 通过DMA控制器0访问LLB时产生冲突的cycle数。               |
| STC_PTI_EVENT_ID_SYSDMA0_DMA_C0_CYCLE0      | 39         | DMA控制器0上Channel 0最近一次数据传输耗费的cycle数。     |
| STC_PTI_EVENT_ID_SYSDMA0_DMA_C0_CYCLE1      | 40         | DMA控制器0上Channel 0所有数据传输耗费的cycle数。         |
| STC_PTI_EVENT_ID_SYSDMA0_DMA_C0_BYTE        | 41         | DMA控制器0上Channel 0传输的数据量，单位为字节。          |
| STC_PTI_EVENT_ID_SYSDMA0_DMA_C1_CYCLE0      | 42         | DMA控制器0上Channel 1最近一次数据传输耗费的cycle数。     |
| STC_PTI_EVENT_ID_SYSDMA0_DMA_C1_CYCLE1      | 43         | DMA控制器0上Channel 1所有数据传输耗费的cycle数。         |
| STC_PTI_EVENT_ID_SYSDMA0_DMA_C1_BYTE        | 44         | DMA控制器0上Channel 0传输的数据量，单位为字节。          |
| STC_PTI_EVENT_ID_SYSDMA1_DMA_ID             | 45         | DMA控制器1的ID。                                         |
| STC_PTI_EVENT_ID_SYSDMA1_LLB_CONFLICT_CYCLE | 46         | 通过DMA控制器1访问LLB时产生冲突的cycle数。               |
| STC_PTI_EVENT_ID_SYSDMA1_DMA_C0_CYCLE0      | 47         | DMA控制器1上Channel 0最近一次数据传输耗费的cycle数。     |
| STC_PTI_EVENT_ID_SYSDMA1_DMA_C0_CYCLE1      | 48         | DMA控制器1上Channel 0所有数据传输耗费的cycle数。         |
| STC_PTI_EVENT_ID_SYSDMA1_DMA_C0_BYTE        | 49         | DMA控制器1上Channel 0传输的数据量，单位为字节。          |
| STC_PTI_EVENT_ID_SYSDMA1_DMA_C1_CYCLE0      | 50         | DMA控制器1上Channel 1最近一次数据传输耗费的cycle数。     |
| STC_PTI_EVENT_ID_SYSDMA1_DMA_C1_CYCLE1      | 51         | DMA控制器1上Channel 1所有数据传输耗费的cycle数。         |
| STC_PTI_EVENT_ID_SYSDMA1_DMA_C1_BYTE        | 52         | DMA控制器1上Channel 1传输的数据量，单位为字节。          |
| STC_PTI_EVENT_ID_MAX                        | 53         | stcPtiEventID_t枚举定义的边界值。                        |

