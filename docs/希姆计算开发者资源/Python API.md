# Python API

## HPE主机端运行时API

### 调用要求

调用HPE主机端运行时（hpert）API时，请确保：

- 已进入符合要求的Python环境，且已安装HPE Python。具体要求和操作，请参见[STCRP安装指南](https://docs.streamcomputing.com/_/sharing/vSxLMI20nalGphdpXdEVoDg6JkUcfEkT?next=/zh/latest/)。

- 在代码文件中导入所需的模块，包括但不限于：

  ```Python
  import hpe.hpert.api
  ```

> 说明：系统的HPE异构编程介绍，请参见[STCRP开发指南](https://docs.streamcomputing.com/_/sharing/vSxLMI20nalGphdpXdEVoDg6JkUcfEkT?next=/zh/latest/)。

### 设备管理

#### hpe.hpert.api.detect

函数描述：显示主机上NPU设备的信息，输出所有NPC Cluster的标识符、名称、PCI信息。

函数类型：同步函数

函数定义：

```Python
hpe.hpert.api.detect()
```

函数参数：

None

函数返回值：

| **类型** | **描述**                                    |
| -------- | ------------------------------------------- |
| bool     | True：发现了NPU设备。False：未发现NPU设备。 |

#### hpe.hpert.api.set_device

函数描述：指定执行设备端程序时使用的NPC Cluster。

函数类型：同步函数

函数定义：

```Python
hpe.hpert.api.set_device(device_id)
```

函数参数：

| **名称**  | **输入/输出** | **类型** | **描述**                                                 |
| --------- | ------------- | -------- | -------------------------------------------------------- |
| device_id | 输入参数      | int      | NPC Cluster的标识符。如果不指定，默认使用NPC Cluster 0。 |

函数返回值：

None

#### hpe.hpert.api.get_device

函数描述：获取执行设备端程序时使用的NPC Cluster。

函数类型：同步函数

函数定义：

```Python
hpe.hpert.api.get_device()
```

函数参数：

None

返回值：

| **类型** | **描述**              |
| -------- | --------------------- |
| int      | NPC Cluster的标识符。 |

#### hpe.hpert.api.synchronize

函数描述：等待当前进程的所有设备端操作执行结束。

函数类型：同步函数

函数定义：

```Python
hpe.hpert.api.synchronize(device_id=None)
```

函数参数：

| **名称**  | **输入/输出** | **类型** | **描述**                                                     |
| --------- | ------------- | -------- | ------------------------------------------------------------ |
| device_id | 输入参数      | int      | NPC Cluster的标识符。默认值为None，代表等待默认NPC Cluster上的设备端操作执行结束。<br/>说明：如果已调用hpe.hpert.api.set_device指定NPC Cluster，则为该NPC Cluster为默认NPC Cluster；否则NPC Cluster 0为默认NPC Cluster。 |

返回值：

None

### 内存管理

#### hpe.hpert.api.device_mem

函数描述：在设备端全局内存的0GiB ~ 3GiB范围动态分配内存。

函数类型：同步函数

函数定义：

```Python
hpe.hpert.api.device_mem(size, device_id=None)
```

函数参数：

| **名称**  | **输入/输出** | **类型** | **描述**                                                     |
| --------- | ------------- | -------- | ------------------------------------------------------------ |
| size      | 输入参数      | int      | 所需分配的内存大小，单位为字节。                             |
| device_id | 输入参数      | int      | NPC Cluster的标识符。默认值为None，代表等待默认NPC Cluster。<br/>说明：如果已调用hpe.hpert.api.set_device指定NPC Cluster，则为该NPC Cluster为默认NPC Cluster；否则NPC Cluster 0为默认NPC Cluster。 |

函数返回值：

| **类型**                | **描述**                                                     |
| ----------------------- | ------------------------------------------------------------ |
| hpe.hpert.api.DeviceMem | hpe.hpert.api.DeviceMem的对象，包括了管理在设备端分配的一段内存所需的信息。 |

#### hpe.hpert.api.host_mem

函数描述：在主机端分配内存并设置为不会被换出的页锁定内存。

函数类型：同步函数

函数定义：

```Python
hpe.hpert.api.host_mem(shape, dtype=numpy.float16)
```

函数参数：

| **名称** | **输入/输出** | **类型**    | **描述**                                |
| -------- | ------------- | ----------- | --------------------------------------- |
| shape    | 输入参数      | tuple       | 数据的形状。                            |
| dtype    | 输入参数      | numpy.dtype | 数据元素的类型，默认值为numpy.float16。 |

函数返回值：

| 类型          | 描述                                                         |
| ------------- | ------------------------------------------------------------ |
| numpy.ndarray | numpy.ndarray的对象，包括了管理在主机端分配的一段内存所需的信息。 |

#### hpe.hpert.api.host_pinned

函数描述：将主机端的内存设置为不会被换出的页锁定内存。

函数类型：同步函数

函数定义：

```Python
hpe.hpert.api.host_pinned(array)
```

函数参数：

| **名称** | **输入/输出** | **类型**      | **描述**                            |
| -------- | ------------- | ------------- | ----------------------------------- |
| array    | 输入参数      | numpy.ndarray | 锁定numpy.ndarray对象的数据页内存。 |

函数返回值：

None

#### hpe.hpert.api.DeviceMem.offset_address

函数描述：获取设备端的偏移地址。

函数类型：同步函数

函数定义：

```Python
hpe.hpert.api.DeviceMem.offset_address(offset)
```

函数参数：

| **名称** | **输入/输出** | **类型** | **描述**                                                     |
| -------- | ------------- | -------- | ------------------------------------------------------------ |
| offset   | 输入参数      | int      | 相对hpe.hpert.api.DeviceMem对象设备端基址的偏移量，单位为字节。 |

返回值：

| **类型** | **描述**           |
| -------- | ------------------ |
| int      | 设备端的偏移地址。 |

#### hpe.hpert.api.DeviceMem.copy_from_host

函数描述：将主机端numpy.ndarray对象内存的数据拷贝到设备端内存。

函数类型：stream取值为0时是同步函数；stream取值非0时是异步函数。

函数定义：

```Python
hpe.hpert.api.DeviceMem.copy_from_host(host_array, device_offset=0, host_offset=0, size=None, stream=0)
```

函数参数：

| **名称**      | **输入/输出** | **类型**             | **描述**                                                     |
| ------------- | ------------- | -------------------- | ------------------------------------------------------------ |
| host_array    | 输入参数      | numpy.ndarray        | 主机端numpy.ndarray对象。                                    |
| device_offset | 输入参数      | int                  | 设备端内存地址上的偏移量，单位为字节。默认值为0，代表无偏移，从hpe.hpert.api.DeviceMem对象设备端基址开始存放数据。 |
| host_offset   | 输入参数      | int                  | 主机端内存地址上的偏移量，单位为字节。默认值为0，代表无偏移，从host_array内存的基址开始拷贝数据。 |
| size          | 输入参数      | int                  | 待拷贝内存的大小，单位为字节。默认值为None，代表按整个host_array的大小拷贝数据。 |
| stream        | 输入参数      | hpe.hpert.api.Stream | 流标识符，默认值为0。                                        |

函数返回值：

None

#### hpe.hpert.api.DeviceMem.copy_to_host

函数描述：将设备端内存的数据拷贝到主机端numpy.ndarray对象的内存。

函数类型：stream取值为0时是同步函数；stream取值非0时是异步函数。

函数定义：

```Python
hpe.hpert.api.DeviceMem.copy_to_host(host_array, device_offset=0, host_offset=0, size=None, stream=0)
```

函数参数：

| **名称**      | **输入/输出** | **类型**             | **描述**                                                     |
| ------------- | ------------- | -------------------- | ------------------------------------------------------------ |
| host_array    | 输入参数      | numpy.ndarray        | 主机端numpy.ndarray对象。                                    |
| device_offset | 输入参数      | int                  | 设备端内存地址上的偏移量，单位为字节。默认值为0，代表无偏移，从hpe.hpert.api.DeviceMem对象设备端基址开始拷贝数据。 |
| host_offset   | 输入参数      | int                  | 主机端内存地址上的偏移量，单位为字节。默认值为0，代表无偏移，从host_array内存的基址开始存放数据。 |
| size          | 输入参数      | int                  | 拷贝字节大小。默认值为None，代表按整个host_array的大小拷贝数据。 |
| stream        | 输入参数      | hpe.hpert.api.Stream | 流标识符，默认值为0。                                        |

函数返回值：

None

### 执行控制

#### hpe.hpert.api.module

函数描述：加载设备端目标程序。

函数类型：同步函数

函数定义：

```Python
hpe.hpert.api.module(image, device_id=None)
```

函数参数：

| **名称**  | **输入/输出** | **类型**   | **描述**                                                     |
| --------- | ------------- | ---------- | ------------------------------------------------------------ |
| image     | 输入参数      | str或bytes | 要加载的目标程序文件路径或内存字节串。                       |
| device_id | 输入参数      | int        | NPC Cluster的标识符。默认值为None，代表使用默认NPC Cluster。<br/>说明：如果已调用hpe.hpert.api.set_device指定NPC Cluster，则为该NPC Cluster为默认NPC Cluster；否则NPC Cluster 0为默认NPC Cluster。 |

函数返回值：

| **类型**             | **描述**                                                     |
| -------------------- | ------------------------------------------------------------ |
| hpe.hpert.api.Module | hpe.hpert.api.Module的对象，包括了管理加载到设备端的程序所需的信息。 |

#### hpe.hpert.api.Module.launch_kernel

函数描述：执行核函数，支持通过参数指定核函数的运行配置。

函数类型：异步函数

函数定义：

```Python
hpe.hpert.api.Module.launch_kernel(kernel_name, kernel_params=[], stream=0, core_num=8, flag=KernelFlag.stcKernelFlagNone)
```

函数参数：

| **名称**      | **输入/输出** | **类型**             | **描述**                                                     |
| ------------- | ------------- | -------------------- | ------------------------------------------------------------ |
| kernel_name   | 输入参数      | str                  | 核函数名称。                                                 |
| kernel_params | 输入参数      | list或tuple          | 核函数的参数数组。                                           |
| stream        | 输入参数      | hpe.hpert.api.Stream | 流标识符，默认值为0。                                        |
| core_num      | 输入参数      | int                  | 在一个NPC Cluster上并行执行核函数时所使用NPC的数量，默认值为8。 |
| flags         | 输入参数      | KernelFlag           | 核函数的执行标志，默认值为KernelFlag.stcKernelFlagNone，代表无运行标志。详细的运行标志含义，请参见*class hpe.hpert.api.KernelFlag*章节。 |

函数返回值：

None

### 流管理

#### hpe.hpert.api.stream

函数描述：创建一个流。

函数类型：同步函数

函数定义：

```Python
hpe.hpert.api.stream(device_id=None)
```

函数参数：

| **名称**  | **输入/输出** | **类型** | **描述**                                                     |
| --------- | ------------- | -------- | ------------------------------------------------------------ |
| device_id | 输入参数      | int      | NPC Cluster的标识符。默认值为None，代表使用默认NPC Cluster。<br/>说明：如果已调用hpe.hpert.api.set_device指定NPC Cluster，则为该NPC Cluster为默认NPC Cluster；否则NPC Cluster 0为默认NPC Cluster。 |

函数返回值：

| **类型**             | **描述**                                             |
| -------------------- | ---------------------------------------------------- |
| hpe.hpert.api.Stream | hpe.hpert.api.Stream的对象，包括了管理流所需的信息。 |

#### hpe.hpert.api.Stream.synchronize

函数描述：等待当前流上的所有操作执行结束。如果核函数执行异常退出，输出触发异常时核函数的调用栈。

函数类型：同步函数

函数定义：

```Python
hpe.hpert.api.Stream.synchronize()
```

函数参数：

None

函数返回值：

None

#### hpe.hpert.api.event

函数描述：创建一个事件。

函数类型：同步函数

函数定义：

```Python
hpe.hpert.api.event(device_id=None)
```

函数参数：

| **名称**  | **输入/输出** | **类型** | **描述**                                                     |
| --------- | ------------- | -------- | ------------------------------------------------------------ |
| device_id | 输入参数      | int      | NPC Cluster的标识符。默认值为None，代表使用默认NPC Cluster。<br/>说明：如果已调用hpe.hpert.api.set_device指定NPC Cluster，则为该NPC Cluster为默认NPC Cluster；否则NPC Cluster 0为默认NPC Cluster。 |

函数返回值：

| **类型**            | **描述**                                              |
| ------------------- | ----------------------------------------------------- |
| hpe.hpert.api.Event | hpe.hpert.api.Event的对象，包括了管理事件所需的信息。 |

#### hpe.hpert.api.Event.synchronize

函数描述：等待当前事件执行完成。

函数类型：同步函数

函数定义：

```Python
hpe.hpert.api.Event.synchronize()
```

函数参数：

None

函数返回值：

None

#### hpe.hpert.api.Event.record

函数描述：在指定流的当前运行点添加该事件。

函数类型：同步函数

函数定义：

```Python
hpe.hpert.api.Event.record(stream=0)
```

函数参数：

| **名称** | **输入/输出** | **类型**             | **描述**                                                |
| -------- | ------------- | -------------------- | ------------------------------------------------------- |
| stream   | 输入参数      | hpe.hpert.api.Stream | 流标识符，默认值为0，代表在所有流的当前运行点添加事件。 |

函数返回值：

None

#### hpe.hpert.api.Stream.wait

函数描述：当前流需要等指定事件被置为完成状态后再开始处理请求。

函数类型：同步函数

函数定义：

```Python
hpe.hpert.api.Stream.wait(event)
```

函数参数：

| **名称** | **输入/输出** | **类型**            | **描述**     |
| -------- | ------------- | ------------------- | ------------ |
| event    | 输入参数      | hpe.hpert.api.Event | 事件标识符。 |

函数返回值：

None

### 类/数据类型描述

#### class hpe.hpert.api.Module

类描述：管理加载到设备端的程序。

#### class hpe.hpert.api.DeviceMem

类描述：管理在设备端分配的一段内存。

#### class hpe.hpert.api.Stream

类描述：管理流信息。

#### class hpe.hpert.api.Event

类描述：管理事件信息。

#### class hpe.hpert.api.CruntimeException

类描述：管理接口执行报错时返回的Error Message。支持返回的Error Message及描述如下所示：

| **Error Code**                  | **Error Message**                                            | **描述**                                                     |
| ------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| stcErrorInvalidValue            | parameters is not within an acceptable range of values       | 一个或多个参数的取值超出了有效值范围。                       |
| stcErrorInvalidDevice           | invalid NPC Cluster device ID                                | 使用了无效的NPC Cluster ID。                                 |
| stcErrorHostMemoryAllocation    | fail to allocate host memory                                 | 在主机端分配内存失败。                                       |
| stcErrorDeviceMemoryAllocation  | fail to allocate device memory                               | 在设备端分配内存失败。                                       |
| stcErrorInvalidDevicePointer    | invalid device memory pointer                                | 使用了无效的设备端内存地址。                                 |
| stcErrorLinkFailure             | fail to link device image                                    | 设备端目标程序链接失败。                                     |
| stcErrorInvalidKernel           | invalid kernel name                                          | 使用了无效的核函数名称。                                     |
| stcErrorInvalidImage            | invalid device image                                         | 设备端目标程序不可用。<br/>说明：设备端目标程序对应fat binary，而设备端目标模块则对应具体的binary。 |
| stcErrorNoImage                 | no device image                                              | 设备端目标程序不存在。                                       |
| stcErrorInvalidModule           | invalid module                                               | 设备端目标模块不可用。<br/>说明：设备端目标程序对应fat binary，而设备端目标模块则对应具体的binary。 |
| stcErrorNoModule                | no module                                                    | 设备端目标模块不存在。                                       |
| stcErrorInvalidStream           | invalid stream                                               | 流不可用。                                                   |
| stcErrorInvalidEvent            | invalid event                                                | 事件不可用。                                                 |
| stcErrorInvalidFifo             | invalid fifo                                                 | 队列不可用。                                                 |
| stcErrorDeviceImageException    | device image run into exception                              | 设备端目标程序运行时出现异常。                               |
| stcErrorSyscallFailure          | system call failure                                          | 主机端的系统调用失败。                                       |
| stcErrorForkForbidden           | forbid to call runtime API, if parent process called runtime API | 父进程已调用过运行时接口，禁止子进程再次调用。               |
| stcErrorInvalidCoreNum          | invalid core number                                          | 使用了无效的核数量。                                         |
| stcErrorGDBFailure              | stcgdb can't trace current process                           | stc-gdb跟踪失败，无法获取调试信息。                          |
| stcErrorDriverMismatch          | mismatch between version of hpert and version of stc-drv     | NPU驱动版本和NPU设备不匹配。                                 |
| stcErrorDeviceBreakdown         | device break down                                            | NPU设备出现故障，无法继续使用。                              |
| stcErrorNoFreeNpu               | no free NPU device                                           | 没有可用的NPU设备。                                          |
| stcErrorNpuNotAcquired          | the npu is not acquired                                      | NPU设备未被占用，但无法访问该NPU设备。                       |
| stcErrorInvalidNpuTask          | invalid NPU task                                             | NPU任务不可用。                                              |
| stcErrorInvalidImageDataSection | too many data section in device image                        | 设备端目标程序包含了太多可写数据段，导致程序无法正常运行。   |
| stcErrorNpuTaskRunning          | NPU task is running with the active NPU module               | NPU任务正在使用NPU模块，不可以卸载该NPU模块。                |
| stcErrorDriverFailure           | PCIe driver internal failure                                 | NPU驱动错误。                                                |

#### class hpe.hpert.api.KernelFlag

类描述：设置核函数的运行标志。支持设置的运行标志如下所示：

| **枚举定义**                       | **枚举值** | **说明**                                            |
| ---------------------------------- | ---------- | --------------------------------------------------- |
| stcKernelFlagNone                  | 0          | NPC执行核函数前后均处理DCache，可以视为无运行标志。 |
| stcKernelFlagInputDataBypassDcache | 1          | NPC执行核函数前，不需要处理DCache。                 |
| stcKernelFlagOutputDataBypassDache | 2          | NPC执行核函数后，不需要处理DCache。                 |
| stcKernelFlagIODataBypassDache     | 3          | NPC执行核函数前后，均不需要处理DCache。             |

## HPE性能数据采集API

### 调用要求

调用HPE性能数据采集API时，请确保：

- 已进入符合要求的Python环境，且已安装HPE Python。具体要求和操作，请参见[STCRP安装指南](https://docs.streamcomputing.com/_/sharing/vSxLMI20nalGphdpXdEVoDg6JkUcfEkT?next=/zh/latest/)。

- 在代码文件中导入所需的模块，包括但不限于：

  ```Python
  import hpe.profiler.api
  ```

> 说明：系统的HPE异构编程介绍，请参见[STCRP开发指南](https://docs.streamcomputing.com/_/sharing/vSxLMI20nalGphdpXdEVoDg6JkUcfEkT?next=/zh/latest/)。

### 接口说明

#### hpe.profiler.api.init

函数描述：初始化性能数据采集的上下文。

函数类型：同步函数

函数定义：

```Python
hpe.profiler.api.init()
```

函数参数：

None

函数返回值：

| **类型** | **描述**                                                     |
| -------- | ------------------------------------------------------------ |
| enum     | 如果成功，返回hpe.profiler.capi_ret.STC_PROFILER_SUCCESS。如果失败，返回hpe.profiler.capi_ret.STC_PROFILER_ERROR。 |

#### hpe.profiler.api.enable

函数描述：开始采集目标程序的性能数据。

函数类型：同步函数

函数定义：

```Python
hpe.profiler.api.enable()
```

函数参数：

None

函数返回值：

| **类型** | **描述**                                                     |
| -------- | ------------------------------------------------------------ |
| enum     | 如果成功，返回hpe.profiler.capi_ret.STC_PROFILER_SUCCESS。如果失败，返回hpe.profiler.capi_ret.STC_PROFILER_ERROR。 |

#### hpe.profiler.api.get_perf_datas

函数描述：获取性能数据采集的结果。

函数类型：同步函数

函数定义：

```Python
hpe.profiler.api.get_perf_datas()
```

函数参数：

None

函数返回值：

| **类型**                         | **描述**                                                     |
| -------------------------------- | ------------------------------------------------------------ |
| hpe.profiler.api.ProfilingResult | hpe.profiler.api.ProfilingResult的对象，包括了性能数据采集的结果。 |

#### hpe.profiler.api.disable

函数描述：停止采集目标程序的性能数据。

函数类型：同步函数

函数定义：

```Python
hpe.profiler.api.disable()
```

函数参数：

None

函数返回值：

| **类型** | **描述**                                                     |
| -------- | ------------------------------------------------------------ |
| enum     | 如果成功，返回hpe.profiler.capi_ret.STC_PROFILER_SUCCESS。如果失败，返回hpe.profiler.capi_ret.STC_PROFILER_ERROR。 |

#### hpe.profiler.api.release

函数描述：释放性能数据采集的上下文。

函数类型：同步函数

函数定义：

```Python
hpe.profiler.api.release()
```

函数参数：

None

函数返回值：

| **类型** | **描述**                                                     |
| -------- | ------------------------------------------------------------ |
| enum     | 如果成功，返回hpe.profiler.capi_ret.STC_PROFILER_SUCCESS。如果失败，返回hpe.profiler.capi_ret.STC_PROFILER_ERROR。 |

### 类/数据类型描述

#### class hpe.profiler.api.ProfilingResult

类描述：性能数据采集结果，保存了所有核函数的性能数据，包括所有核函数在每个NPC上的性能数据和sysDMA相关的性能数据。

#### class hpe.profiler.api.KernelFunction

类描述：单个核函数的性能数据，保存了单个核函数使用NPC的性能数据，包括单个核函数在每个NPC上的性能数据，包括MCU指令、VME指令、MME指令、MTE指令等的性能信息，例如cycle数等。

#### hpe.profiler.capi_ret.STC_PROFILER_SUCCESS

数据描述：性能数据采集接口执行成功。

#### hpe.profiler.capi_ret.STC_PROFILER_ERROR

数据描述：性能数据采集接口执行失败。

## MLTC API

### 调用要求

调用MLTC的API时，请确保：

- 已进入符合要求的Python环境，且已安装MLTC。具体要求和操作，请参见[STCRP安装指南](https://docs.streamcomputing.com/_/sharing/vSxLMI20nalGphdpXdEVoDg6JkUcfEkT?next=/zh/latest/)。

- 在代码文件中导入所需的模块，包括但不限于：

  - ```Python
    import mltc
    ```

### Compiler().compile()

接口描述：编译传入的模型MLIR文件。

接口定义：

```Python
def compile(self, inputfiles: Union[str, List[str]], outputfile: str, compileargs: compileargs: Union[str, List[str]] = ""):
```

参数说明：

| **参数**    | **类型**               | **是否必选** | **描述**                                                     |
| ----------- | ---------------------- | ------------ | ------------------------------------------------------------ |
| inputfiles  | string或list of string | 是           | 模型的MLIR文件名。例如：test.mlir。在静态多版本中，也可包含多个MLIR文件名。例如：["test_shape_1.mlir", "test_shape_2.mlir"]。 |
| outputfile  | string                 | 是           | 输出的模型vmfb文件名，只会有一个输出文件。例如：test.vmfb。  |
| compileargs | string或list of string | 是           | 编译参数。当数据类型为string时，多个参数之间使用空格隔开。例如："--dump-ir-after-all --dump-ir-before-all"。也可将多个参数组成list，例如： ["--dump-ir-after-all", "--dump-ir-before-all"]。 |

编译参数说明：

| **参数选项**                 | **描述**                                                     | **是否必选** |
| ---------------------------- | ------------------------------------------------------------ | ------------ |
| --arch                       | 针对指定的npu架构。<br />npu-v1 （默认值）<br />npu-v2       | 否           |
| --high-precision             | 是否启用高精度模式，用matmul_vme代替matmul进行高精度矩阵乘法，使用牛顿迭代提升超越函数精度（损失性能），某些需要更高计算精度的算子也在此处控制。<br />True：打开高精度模式。<br />False（默认值）：关闭高精度模式。 | 否           |
| --bisection-reduce           | 是否reduceSum启用二分法。<br />True：reduceSum启用二分法。<br />False（默认值）：reduceSum不启用二分法。 | 否           |
| --bisection-matmul           | 是否matmul启用二分法。<br />True：matmul启用二分法。<br />False（默认值）：matmul不启用二分法。 | 否           |
| --dump-ir-after-all          | 是否输出每个pass处理之后的IR。<br />True：输出每个pass处理之后的IR。<br />False（默认值）：不输出每个pass处理之后的IR。 | 否           |
| --dump-ir-before-all         | 是否输出每个pass处理之前的IR。<br />True：输出每个pass处理之前的IR。<br />False（默认值）：不输出每个pass处理之前的IR。 | 否           |
| --dump-ir-clean-mode         | 是否打印IR简洁信息。<br />True（默认值）：打印IR简洁信息，省略模型权重数据。<br />False：打印IR信息，会以16进制显示模型权重数据，IR文件会较大。 | 否           |
| --enable-merge-attention     | 是否将matmul替换为matmul_batchinner，matmul_batchinner优化了attention的计算过程。<br />True（默认值）：将matmul替换为matmul_batchinner。<br />False：不将matmul替换为matmul_batchinner。 | 否           |
| --graph-partition-factor=Num | Num的取值数据类型为Int8。<br />当Num=1时：默认值，不开启graph partition。<br />当Num>1时：开启graph partition，切分出N个dispatch.workgroup | 否           |

返回值：

无

调用示例：

```Python
from mltc import Compiler
Compiler().compile("deepfm_stc.mlir", "deepfm.vmfb", "-arch=npu-v1")
```

### Executor().run()

接口描述：部署传入的模型vmfb文件。

接口定义：

```Python
def run(self, inputs: dict):
```

参数说明：

| **参数** | **类型** | **是否必选** | **描述**       |
| -------- | -------- | ------------ | -------------- |
| inputs   | dict     | 是           | 模型输入数据。 |

返回值：

| **类型** | **描述**       |
| -------- | -------------- |
| dict     | 模型输出数据。 |

调用示例：

```Python
from mltc import Executor
output = Executor("./deepfm.vmfb").run(input_data)
```

### Simulator().run()

接口描述：MLTC前端工具转换后的模型部署到CPU上。

接口定义：

```Python
def run(self, inputfile: str, runargs: str = ""):
```

参数说明：

| **参数**  | **类型** | **是否必选** | **描述**                                                     |
| --------- | -------- | ------------ | ------------------------------------------------------------ |
| inputfile | string   | 是           | 经过MLTC前端转换工具后的模型MLIR文件。例如：test.mlir。      |
| runargs   | string   | 是           | 运行参数。多个参数之间使用空格隔开。例如："-i data.bin -o output.bin"。 |

运行参数说明：

| **参数选项**          | **描述**                   | **是否必选** |
| --------------------- | -------------------------- | ------------ |
| -i                    | 模型输入数据文件。         | 是           |
| -o                    | 模型输出数据文件。         | 是           |
| --dump-each-op-result | dump出每个op的结果。       | 否           |
| --dump-dir            | dump出来的数据的保存路径。 | 否           |

返回值：

无

调用示例：

```Python
from mltc import Simulator
Simulator().run("resnet34.mlir", "-i data.bin -o output.bin --dump-each-op-result --dump-dir=~/data_dump/cpu")
```