# STCRP开发指南

## HPE异构编程指南

HPE异构编程指南介绍了异构程序的编写方式。如需了解HPE监控调试工具的使用方法，请参见[HPE使用指南](https://docs.streamcomputing.com/_/sharing/vSxLMI20nalGphdpXdEVoDg6JkUcfEkT?next=/zh/latest/)。

### 异构编程模型

在异构编程环境中，设备端与主机端在计算和存储结构上存在差别，因此需要通过不同的方式执行函数和访问内存。异构编程模型中需要考虑核函数、内存管理、异步函数等因素。

#### 核函数

##### 定义核函数

异构程序包括主机端程序和设备端程序，并引入核函数的概念来关联两类程序，核函数是两类代码的桥梁。核函数在主机端调用，由主机端部署到设备端，并在设备端的NPC上并行执行。

核函数使用`__global__`作为函数修饰符。在调用核函数时，需要通过`<<< N >>>`指定执行核函数时所用NPC的个数。`__global__`的详细用法，请参见*C++语言扩展接口*章节。

在下方的异构程序用例中，核函数的作用为打印hello word信息，然后在主机端指定8个NPC同时执行该核函数，执行结果为8个NPC分别输出一条hello word信息并在主机端显示。

> 说明：异构程序的C++源文件以.hc作为扩展名。

```c++
#include <hpe.h>
#include <npurt.h>

__global__ void kernel(void) {
    printf("hello world in NPC %d/%d.\n", CoreID, CoreNum);
}

int main(void) {
    kernel<<<8>>>();
    stcDeviceSynchronize();
    return 0;
}
```

##### 编译核函数

使用stcc统一编译异构程序，包括核函数。示例如下：

- 编译单个源文件：编译hello_world.hc，输出名为hello_world的二进制文件。

  ```bash
  $ stcc hello_world.hc -o hello_world
  ```

- 编译多个源文件：编译hello_world_1.hc和hello_world_2.hc，输出名为hello_world的二进制文件。

  > 说明：编译多个源文件时需要添加`--shc-combine-device`选项。

  ```bash
  $ stcc hello_world_1.hc hello_world_2.hc --shc-combine-device -o hello_world
  ```

##### 执行核函数

运行编译生成的二进制文件，在执行到核函数时，会自动转到设备端。

```bash
$ ./hello_world
```

默认在NPC Cluster 0上执行核函数，您也可以自行指定NPC Cluster。支持以下方式：

- 通过环境变量STC_SET_DEVICES修改默认的起始NPC Cluster。例如`STC_SET_DEVICES`为3指定在NPC Cluster 3上执行核函数。
- 通过`stcSetDevice`单次指定NPC Cluster，`stcSetDevice`的效果为STC_SET_DEVICES基础上的增量。例如：
  - `STC_SET_DEVICES`为0，则`stcSetDevice(1)`指定在NPC Cluster 1上执行核函数。
  - `STC_SET_DEVICES`为2，则`stcSetDevice(1)`指定在NPC Cluster 3上执行核函数。

> 说明：一个NPC Cluster只能同时运行一个核函数，即使在执行当前核函数时只使用了部分NPC，也不能在空闲的NPC上立即执行下一个核函数。

#### 内存管理

##### 内存布局

希姆计算自研NPU中的内存分为本地内存（L1）、共享内存（LLB）、全局内存（DDR），各类型内存的大小和访问速度存在差别。

- 全局内存：每个NPC Cluster私有的内存，由NPC Cluster内的NPC共享，访问速度最慢。STCP920芯片中，每个NPC Cluster的全局内存大小为4GiB。
- 共享内存：每个NPC Cluster私有的内存，由NPC Cluster内的NPC共享，访问速度较快。STCP920芯片中，每个NPC Cluster的共享内存大小为8MiB。
- 本地内存：每个NPC私有的内存，访问速度最快。STCP920芯片中，每个NPC的本地内存大小为1.25MiB。

NPU中各NPC Cluster的内存布局完全相同，如下所示： 

![](/_static/images/heterogeneous-programming-01.png)

##### 访问内存

在STCP920芯片中，每个NPC Cluster的4GiB全局内存分为以下类型：

- NPC可以直接访问的3GiB内存（0GiB ~ 3GiB）。
- 只能通过sysDMA访问的3GiB内存（3GiB+8M~3GiB+896M），也称为高端内存。

主机端支持动态分配内存：

- 在主机端调用`stcMalloc()`动态分配设备端全局内存（0GiB ~ 3GiB）。
- 在主机端调用`stcMallocHigh()`动态分配设备端全局内存（3GiB+8M~3GiB+896M）。

设备端不支持动态分配内存，希姆计算提供了变量修饰符在指定的地址空间定义局部变量：

- `__device__`：定义位于全局内存的局部变量和全局变量。如果定义局部变量时不添加变量修饰符，则默认位于全局内存。
- `__shared__`：定义位于共享内存的局部变量。
- `__local__`：定义位于本地内存的局部变量。

> 说明：本地内存（1.25MiB）、共享内存（8MiB）以及全局内存设备端运行栈（64KiB）的大小有限，请避免定义过大的局部变量。

各类型内存支持的访问来源和访问方式的差别如下：

- 支持从设备端访问本地内存、共享内存，支持从主机端和设备端访问全局内存。
- 在设备端调用`memcpy`读写设备端本地内存、共享内存、全局内存。
- 在主机端调用`stcMemcpy`、`stcMemcpyAsync`读写设备端全局内存。

> 说明：在设备端访问全局内存时（访问局部变量除外），请确保访问区域不会被其他NPC缓存。因为NPC的cache line大小为32字节，如果多个NPC访问同一个32字节地址对齐且大小不超过32字节的区域，NPC刷新缓存会导致无法保障全局内存中数据的正确性。

##### 访问内存用例

下方的用例中，在主机端分配全局内存并写入数据，然后在设备端使用8个NPC分别将全局内存中的数据拷贝到共享内存和本地内存，并打印拷贝结果。

> 说明：各变量修饰符和接口的详细说明，请参见*变量修饰符*章节和*运行时接口*章节。

```c++
#include <hpe.h>
#include <npurt.h>

#define NCORE 8
__global__ void kernel(int *global_data) {
    __shared__ int shared_data[NCORE];
    __local__ int local_data[NCORE];

    memcpy(shared_data, global_data, sizeof(shared_data));
    memcpy(local_data, global_data, sizeof(local_data));

    printf("core %d read shared data %d local data %d\n", CoreID,
           shared_data[CoreID], local_data[CoreID]);
}

int main(void) {
    int host_data[] = {1, 2, 3, 4, 5, 6, 7, 8};
    int *dev_data;
    stcMalloc((void **)&dev_data, sizeof(host_data));
    stcMemcpy(dev_data, host_data, sizeof(host_data), stcMemcpyHostToDevice);
    kernel<<<NCORE>>>(dev_data);
    stcDeviceSynchronize();
    stcFree(dev_data);
    return 0;
}
```

#### 异步函数

部分运行时接口的函数类型设计为异步函数，在主机端调用异步函数后会立即返回，不用等待完成异步函数规定的所有操作，有利于主机端和设备端并行处理任务。例如，调用`stcLaunchKernel`在主机端启动核函数后，主机端无需等待完成核函数的所有操作即可开始处理下一个任务；调用`stcMemcpyAsync`在主机端和设备端之间拷贝数据后，主机端无需等待拷贝完所有数据即可开始处理下一个任务。

异步函数的返回值不是异步操作的结果。如果您调用了异步函数，但仍然需要等待所有操作完成，可以调用`stcDeviceSynchronize`、`stcStreamSynchronize`或`stcStreamSynchronizeUnified`等待设备或流上的所有操作完成后再处理下一个任务。`stcDeviceSynchronize`、`stcStreamSynchronize`和`stcStreamSynchronizeUnified`的返回值是异步操作的结果，但仅返回最后一个异步操作的结果。

> 说明：核函数没有返回值，如果核函数在真正开始执行前出错退出，只能通过`stcGetLastError`获取错误信息。例如指定的NPC数量超过实际的NPC数量，导致启动核函数后还未实际执行就出错退出。

### 异构编程典型操作

希姆计算提供了丰富的运行时接口，方便您从主机端控制在设备端执行任务。

#### 指定运行设备

主机端访问设备端时需要指定运行设备。在主机端程序中启动核函数后，默认在NPC Cluster 0上执行核函数，您也可以提前通过调用`stcSetDevice`或修改STC_SET_DEVICES指定其他NPC Cluster。示例如下：

1. 推导NPC Cluster ID。

   以STCP920芯片为例，执行`stc-smi -q`命令获取NPU的信息，包括NPU设备标识符、NPC Cluster设备标识符等。

   代码中使用的NPC Cluster ID由NPU设备标识符、NPC Cluster设备标识符推导得出。假设需要指定一个NPC Cluster，查看得知其对应的NPU设备标识符为x、NPC Cluster设备标识符为y，则推导方式为NPC Cluster ID = 4 * x + y。例如，NPU设备标识符为为0，NPC Cluster设备标识符为1，则NPC Cluster ID为1。

2. 在代码中调用`stcSetDevice`指定NPC Cluster ID。

   下方的用例中，指定使用NPC Cluster 1，然后8个NPC分别输出一条hello word信息并在主机端显示。

   > 说明：一个进程中各个线程调用`stcSetDevice`互不影响，如果需要修改使用的NPC Cluster，请分别设置。

   ```c++
   #include <hpe.h>
   #include <npurt.h>
   
   __global__ void kernel(void) {
       printf("hello world in NPC %d/%d.\n", CoreID, CoreNum);
   }
   
   int main(void) {
       stcSetDevice(1);
       kernel<<<8>>>();
       stcDeviceSynchronize();
       return 0;
   }
   ```

#### 访问设备端全局内存

访问设备端全局内存的运行时接口如下：

- 在主机端调用`stcMalloc`动态分配设备端全局内存（0GiB ~ 3GiB）。
- 在主机端调用`stcMallocHigh`动态分配设备端全局内存（3GiB+8M~3GiB+896M）。
- 在主机端调用`stcMemcpy`、`stcMemcpyAsync`读写设备端全局内存。

在STCP920芯片中，每个NPC Cluster的4GiB全局内存分为以下类型：

- NPC可以直接访问的3GiB内存（0GiB ~ 3GiB）。
- 只能通过sysDMA访问的1GiB内存（3GiB+8M~3GiB+896M），也称为高端内存。

下方的用例中，分别在不同的内存范围中分配了内存：

- 在主机端分配0GiB ~ 3GiB范围的全局内存并写入数据，然后在设备端打印数据。

  ```c++
  #include <hpe.h>
  #include <npurt.h>
  
  __global__ void kernel(int *data) {
      printf("core %d read data %d\n", CoreID, data[CoreID]);
  }
  
  int main(void) {
      int host_data[] = {1, 2, 3, 4, 5, 6, 7, 8};
      int *dev_data;
  
      stcMalloc((void **)&dev_data, sizeof(host_data));
      stcMemcpy(dev_data, host_data, sizeof(host_data), stcMemcpyHostToDevice);
      kernel<<<8>>>(dev_data);
      stcDeviceSynchronize();
      stcFree(dev_data);
      return 0;
  }
  ```

- 在主机端分配3GiB+8M~3GiB+896M范围的全局内存并写入数据，然后在设备端将数据从高端内存拷贝到NPC可以直接访问的范围，并打印拷贝结果。

  > 说明：NPC不能直接访问高端内存，因此本用例中，核函数内的`memcpy`不能替换为`data = high[CoreID]`，否则会触发NPC读访问异常。

  ```c++
  #include <npurt.h>
  #include <hpe.h>
  
  __global__ void kernel(int *high) {
          int data;
          memcpy(&data, &high[CoreID], sizeof(data));
          printf("core %d read data %d\n", CoreID, data);
  }
  
  int main(void) {
      int host_data[] = {1, 2, 3, 4, 5, 6, 7, 8};
      int *dev_data;
  
      stcMallocHigh((void **)&dev_data, sizeof(host_data));
      stcMemcpy(dev_data, host_data, sizeof(host_data), stcMemcpyHostToDevice);
      kernel<<<8>>>(dev_data);
      stcDeviceSynchronize();
      stcFree(dev_data);
      return 0;
  }
  ```

#### 并行执行

主机端发送给设备端的请求类型包括执行核函数（Kernel）、从主机端向设备端拷贝数据（H2D）、从设备端向主机端拷贝数据（D2H）。主机端可以并行发起不同类型的请求，但一个或多个NPC Cluster内是顺序处理请求的。希姆计算提供了流的运行时接口，您可以基于流实现一个或多个NPC Cluster内并行处理请求。

在异构编程环境中，流分为UnifiedHS模式的流和DividedHS模式的流。在DividedHS模式上流在一个Cluster上运行，每一个同步域中包含8个NPC。在UnifiedHS模式下可以将一个核函数放在多个NPC Cluster乃至多张板卡上运行，适用于需要更多NPC并行以及更大片上内存的场景，例如运行大模型。在UnifiedHS模式上流在四个Cluster上运行，每一个同步域中包含32个NPC。

> 说明： UnifiedHS流上的核函数在执行时，因为其占用了所有32个NPC，所以其它普通流的核函数均无法被调度。

##### 流定义

流（stream）是由主机端发起、设备端处理的一系列请求。同一个流内的请求顺序处理，不同流间的不同类型请求可以并行处理。 流包括以下类型：

- 隐式声明流：默认创建的流，只有一个，可以包括同步、异步请求。执行核函数、拷贝数据时默认使用隐式声明流。
- 显示声明流：您自行创建的流，只能包括异步请求。执行核函数、拷贝数据（异步）时可以使用显示声明流。

> 说明：在一个NPC Cluster上创建的DividedHS模式的流只能在该NPC Cluster上使用。

下方的用例中，创建了一个显示声明流来执行核函数。如果需要等待流上的所有操作完成后再处理下一个请求，调用`stcStreamSynchronize`或`stcDeviceSynchronize`即可。

```c++
#include <npurt.h>
#include <hpe.h>

__global__ void kernel(void) {
    printf("hello world in NPC %d/%d.\n", CoreID, CoreNum);
}

int main(void) {
    stcStream_t stream;

    stcStreamCreate(&stream);
    kernel<<<8, stream>>>();
    stcStreamSynchronize(stream);
    stcStreamDestroy(stream);
    return 0;
}
```

##### 流调度

同一流内的请求只能顺序调度，不同流间的不同类型请求可以并行调度。假定有三组请求，均包括H2D、Kernel、D2H请求，且不同组的请求之间没有依赖关系，采取并行调度可以提高性能。顺序调度和并行调度的性能对比如下：

![](/_static/images/heterogeneous-programming-02.png)

> 说明：仅当所有cluster都空闲时才能执行UnifiedHS模式流中的kernel任务。在执行UnifiedHS模式下的kernel任务时，其它DividedHS流中的kernel任务不能被调度。

顺序调度和并行调度的代码示例如下：

- 顺序调度，顺序在NPC Cluster上处理每组请求。

  ```c++
  #include <hpe.h>
  #include <npurt.h>
  #include <stdio.h>
  
  __global__ void kernel(int *in, int *out) { *out = *in; }
  
  #define NJOB 3
  int main(void) {
      int host_in[NJOB] = {1, 2, 3};
      int host_out[NJOB];
      int *dev_in[NJOB], *dev_out[NJOB];
  
      for (int i = 0; i < NJOB; i++) {
          stcMalloc((void **)&dev_in[i], sizeof(int));
          stcMalloc((void **)&dev_out[i], sizeof(int));
      }
  
      for (int i = 0; i < NJOB; i++) {
          stcMemcpyAsync(dev_in[i], &host_in[i], sizeof(int),
                         stcMemcpyHostToDevice);
          kernel<<<1>>>(dev_in[i], dev_out[i]);
          stcMemcpyAsync(&host_out[i], dev_out[i], sizeof(int),
                         stcMemcpyDeviceToHost);
      }
  
      stcDeviceSynchronize();
  
      for (int i = 0; i < NJOB; i++) {
          printf("%d, ", host_out[i]);
          stcFree(dev_in[i]);
          stcFree(dev_out[i]);
      }
      printf("\n");
      return 0;
  }
  ```

- 并行调度，为每组请求创建一个显示声明流，并在NPC Cluster上并行处理三个流中的请求。

  ```c++
  #include <hpe.h>
  #include <npurt.h>
  #include <stdio.h>
  
  __global__ void kernel(int *in, int *out) { *out = *in; }
  
  #define NJOB 3
  int main(void) {
      int host_in[NJOB] = {1, 2, 3};
      int host_out[NJOB];
      int *dev_in[NJOB], *dev_out[NJOB];
      stcStream_t stream[NJOB];
  
      for (int i = 0; i < NJOB; i++) {
          stcMalloc((void **)&dev_in[i], sizeof(int));
          stcMalloc((void **)&dev_out[i], sizeof(int));
          stcStreamCreate(&stream[i]);
      }
  
      for (int i = 0; i < NJOB; i++) {
          stcMemcpyAsync(dev_in[i], &host_in[i], sizeof(int),
                         stcMemcpyHostToDevice, stream[i]);
          kernel<<<1, stream[i]>>>(dev_in[i], dev_out[i]);
          stcMemcpyAsync(&host_out[i], dev_out[i], sizeof(int),
                         stcMemcpyDeviceToHost, stream[i]);
      }
  
      stcDeviceSynchronize();
  
      for (int i = 0; i < NJOB; i++) {
          printf("%d, ", host_out[i]);
          stcFree(dev_in[i]);
          stcFree(dev_out[i]);
          stcStreamDestroy(stream[i]);
      }
      printf("\n");
      return 0;
  }
  ```

##### 流同步

事件（event）用于在流中插入标记，当流中该标记前的请求处理完毕后，会将事件置为完成状态。事件具有以下用途：

- 监控流的进展：调用`stcEventElapsedTime`获取处理两个事件间请求所消耗的时间。
- 同步流的执行：在多流场景中，如果不同流中的请求之间有依赖关系，可以调用`stcStreamWaitEvent`进行同步，在事件被置为完成状态后再开始处理其他流中的请求。

下方的用例中，定义了两个核函数kernel1、kernel2，kernel1循环执行共20次，在kernel1执行10次后添加事件，触发执行1次kernel2。

> 说明：调用`stcEventRecord`添加事件时，如果不指定流，则为所有流添加事件，在所有流中标记前的请求都处理完毕后，才会将事件置为完成状态。

```c++
#include <hpe.h>
#include <npurt.h>

__global__ void kernel1(int index) {
    printf("%s index %d come in\n", __func__, index);
}

__global__ void kernel2(void) {
    printf("%s come in\n", __func__);
}

int main(void) {
    stcStream_t stream1, stream2;
    stcEvent_t event1;

    stcStreamCreate(&stream1);
    stcStreamCreate(&stream2);
    stcEventCreate(&event1);

    for (int i = 1; i <= 20; i++) {
        kernel1<<<1, stream1>>>(i);
        if (i == 10)
            stcEventRecord(event1, stream1);
    }

    stcStreamWaitEvent(stream2, event1);
    kernel2<<<1, stream2>>>();
    stcDeviceSynchronize();
    
    stcStreamDestroy(stream1);
    stcStreamDestroy(stream2);
    stcEventDestroy(event1);
    return 0;
}
```

#### 获取性能数据

##### 使用流程示例

使用STCPTI分析目标异构程序性能的流程如下：

1. 在异构程序源代码中添加STCPTI性能数据采集代码。

   1. 包含头文件stcpti.h。
   2. 定义用于记录性能数据的STCpti_PerfDatas结构体。
   3. 调用`stcptiKernelContextCreate`为当前进程创建核函数性能数据采集的上下文。
   4. 调用`stcptiKernelEnable`开始采集性能数据。
   5. 执行核函数。
   6. 调用`stcDeviceSynchronize`等待执行完成。
   7. 调用`stcptiKernelGetPerfDatas`获取核函数性能数据。
   8. 调用`stcptiKernelDisable`停止采集性能数据。
   9. 输出核函数性能数据。输出方法和STCpti_PerfDatas结构体的元素有关，详细的元素说明，请参见*数据类型*章节。
   10. 调用`stcptiKernelContextRelease`为当前进程释放核函数性能数据采集的上下文。

2. 编译添加了性能数据代码采集的异构程序，编译时需要添加链接选项`-lprofiler_stc`和`-ltracer_stc`。以在matrix-multiply.hc中添加STCPTI性能数据采集代码后的matrix-multiply-stcpti.hc为例：

   ```bash
   $ stcc --rtlib=compiler-rt matrix-multiply-stcpti.hc -DNCORE=8 -lprofiler_stc -ltracer_stc -o matrix-multiply-stcpti
   ```

3. 执行编译得到的二进制文件。

   ```bash
   $ ./matrix-multiply-stcpti
   ```

##### 代码示例

添加了STCPTI性能数据采集代码后的matrix-multiply-stcpti.hc的完整示例代码如下：

```C++
/*
 * Copyright (c) 2019-2021 北京希姆计算科技有限公司 (Stream Computing Inc.)
 * All Rights Reserved.
 *
 * NOTICE: All intellectual and technical information contained herein
 * are proprietary to Stream Computing Inc. Any unauthorized disemination,
 * copying or redistribution of this file via any medium is strictly prohibited,
 * unless you get a prior written permission or an applicable license agreement
 * from Stream Computing Inc.
 */
/*
 * This example uses internal instructions to do matrix multiply.
 */

#include <asm_macro.h>
#include <hpe.h>
#include <npurt.h>
#include <stdio.h>
#if !defined(__SHC_NPU_COMPILE__)
#include <stcpti.h>
#endif

// number of left matrix's col and right matrix's row
#define LCOL_RROW 8

// local_left * local_right = local_out
__device__ void matmul(__fp16 *local_out, __fp16 *local_left,
                       __fp16 *local_right) {
    int shape1, shape2;

    // do matrix multiply and result must be stored in IM buffer
    shape1 = DEFINE_SHAPE(LCOL_RROW, 1);
    shape2 = DEFINE_SHAPE(1, LCOL_RROW);
    CONFIG_VE_BC_CSR(shape1, shape2, 0, 0);
    memul_mm((__fp16 *)IM_BUFFER_START, local_left, local_right);

    // move result from IM buffer to local memory
    shape1 = DEFINE_SHAPE(1, 1);
    shape2 = 0;
    CONFIG_VE_CSR(shape1, shape2, 0, 0);
    mov_m(local_out, (__fp16 *)IM_BUFFER_START);
}

__global__ void matmul_kernel(__fp16 *global_out, __fp16 *global_left,
                              __fp16 *global_right) {
    __local__ __fp16 local_left[LCOL_RROW];
    __local__ __fp16 local_right[LCOL_RROW];
    __local__ __fp16 local_out;
    __shared__ __fp16 share_out[CoreNum];
    printf("CoreNum is %d\n", CoreNum);
    // copy right matrix to each core
    memcpy(local_right, global_right, LCOL_RROW * sizeof(__fp16));

    // copy a row of left matrix for each core
    memcpy(local_left, global_left + CoreID * LCOL_RROW,
           LCOL_RROW * sizeof(__fp16));
    // matrix multiply
    matmul(&local_out, local_left, local_right);

    // copy result in local memory of each core to shared memory
    memcpy(share_out + CoreID, &local_out, sizeof(__fp16));

    // sync to wait each of the core compute share_out data filled
    sync();

    if (CoreID == 0) {
        // copy result in share memory of each core to global memory
        memcpy(global_out, share_out, CoreNum * sizeof(__fp16));
    }
}

#define NCORE 8

int main(void) {
    __fp16 *dev_left, *dev_right, *dev_out;
    // define struct for recording performance data
    STCpti_PerfDatas perf_data = {0};

    // enable stcpti
    stcptiKernelContextCreate();
    stcptiKernelEnable();

    // left matrix data for 8 cores
    __fp16 host_left[8 * LCOL_RROW] = {
        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, // row1
        1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, // row2
        2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, // row3
        3.0, 3.0, 3.0, 3.0, 3.0, 3.0, 3.0, 3.0, // row4
        4.0, 4.0, 4.0, 4.0, 4.0, 4.0, 4.0, 4.0, // row5
        5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, // row6
        6.0, 6.0, 6.0, 6.0, 6.0, 6.0, 6.0, 6.0, // row7
        7.0, 7.0, 7.0, 7.0, 7.0, 7.0, 7.0, 7.0, // row8
    };
    // right matrix data
    __fp16 host_right[LCOL_RROW] = {1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0};

    // copy left matrix to device
    int mat_size_left = NCORE * LCOL_RROW * sizeof(__fp16);
    stcMalloc((void **)&dev_left, mat_size_left);
    stcMemcpy(dev_left, host_left, mat_size_left, stcMemcpyHostToDevice);

    // copy right matrix to device
    int mat_size_right = LCOL_RROW * sizeof(__fp16);
    stcMalloc((void **)&dev_right, mat_size_right);
    stcMemcpy(dev_right, host_right, mat_size_right, stcMemcpyHostToDevice);

    // allocate result buffer in device
    int mat_size_out = NCORE * sizeof(__fp16);
    __fp16 host_out[NCORE];
    stcMalloc((void **)&dev_out, mat_size_out);

    matmul_kernel<<<NCORE>>>(dev_out, dev_left, dev_right);
    stcDeviceSynchronize();

    // copy result from device to host
    stcMemcpy(host_out, dev_out, mat_size_out, stcMemcpyDeviceToHost);

    printf("matrix multiply result:");
    for (int i = 0; i < NCORE; i++)
        printf("%.1f, ", (float)(host_out[i]));
    printf("\n");

    // get performance data
    stcptiKernelGetPerfDatas(&perf_data);
    stcptiKernelDisable();
    const char* name = NULL;
     for (int i = 0; i < perf_data.kernelPerfDataSize; i++) {
        STCpti_KernelPerfDatas *kernel_perf_datas_ptr =
            &perf_data.pKernelPerfDatas[i];
        for (int j = 0; j < kernel_perf_datas_ptr->kernelNpcPerfDataSize; j++) {
            STCpti_KernelNpcPerfData *kernel_npc_perf_data_ptr =
                &kernel_perf_datas_ptr->arrKernelNpcPerfData[j];
            for (int m = 0; m < STC_PTI_EVENT_ID_SYSDMA0_DMA_ID; m++) {
                stcptiGetEventNameFromID(m, &name);
                printf("kernel: %d npc: %d event %02d %s [%u]\n", i, j, m, name,
                       kernel_npc_perf_data_ptr->event[m]);
            }
        }
        for ( int k = STC_PTI_EVENT_ID_SYSDMA0_DMA_ID; k < STC_PTI_EVENT_ID_MAX; k++ ){
                stcptiGetEventNameFromID(k, &name);
                STCpti_KernelDmaPerfData* kernel_dma_perf_data_ptr = 
                &(kernel_perf_datas_ptr->kernelDmaPerfData);
                printf("kernel: %d dma event %02d %s [%u]\n", i, k, name,
               kernel_dma_perf_data_ptr->event[ k - STC_PTI_EVENT_ID_SYSDMA0_DMA_ID]);
        }
    }
    stcptiKernelContextRelease();

    stcFree(dev_left);
    stcFree(dev_right);
    stcFree(dev_out);
    return 0;
}
```

其中，STCPTI性能数据采集代码如下，省略号部分代表其他代码：

```C++
......
// !defined(__SHC_NPU_COMPILE__)宏用于控制仅在主机端代码进行编译时生效。
#if !defined(__SHC_NPU_COMPILE__)
#include <stcpti.h>
#endif
......
int main(void) {
    ......
    // 定义用于记录性能数据的结构体。
    STCpti_PerfDatas perf_data = {0};
    ......
    // 为当前进程创建核函数性能数据采集的上下文。
    stcptiKernelContextCreate();
    // 开始采集性能数据。
    stcptiKernelEnable();
    ......
    // 执行核函数并等待执行完成。
    matmul_kernel<<<NCORE>>>(dev_out, dev_left, dev_right);
    stcDeviceSynchronize();
    ......
    // 获取核函数性能数据。
    stcptiKernelGetPerfDatas(&perf_data);
    // 停止采集性能数据。
    stcptiKernelDisable();
    // 输出核函数性能数据。
    const char* name = NULL;
     for (int i = 0; i < perf_data.kernelPerfDataSize; i++) {
        STCpti_KernelPerfDatas *kernel_perf_datas_ptr =
            &perf_data.pKernelPerfDatas[i];
        for (int j = 0; j < kernel_perf_datas_ptr->kernelNpcPerfDataSize; j++) {
            STCpti_KernelNpcPerfData *kernel_npc_perf_data_ptr =
                &kernel_perf_datas_ptr->arrKernelNpcPerfData[j];
            for (int m = 0; m < STC_PTI_EVENT_ID_SYSDMA0_DMA_ID; m++) {
                stcptiGetEventNameFromID(m, &name);
                printf("kernel: %d npc: %d event %02d %s [%u]\n", i, j, m, name,
                       kernel_npc_perf_data_ptr->event[m]);
            }
        }
                for ( int k = STC_PTI_EVENT_ID_SYSDMA0_DMA_ID; k < STC_PTI_EVENT_ID_MAX; k++ ){
                        stcptiGetEventNameFromID(k, &name);
                        STCpti_KernelDmaPerfData* kernel_dma_perf_data_ptr = 
                        &(kernel_perf_datas_ptr->kernelDmaPerfData);
                        printf("kernel: %d dma event %02d %s [%u]\n", i, k, name,
                       kernel_dma_perf_data_ptr->event[ k - STC_PTI_EVENT_ID_SYSDMA0_DMA_ID]);
                }
    }
    // 为当前进程释放核函数性能数据采集的上下文。
    stcptiKernelContextRelease();
    ......
}
```

### C++语言扩展接口

#### 接口功能

SHC完整兼容C++17标准，并针对异构程序扩展了语法和函数库。基于SHC提供的运行时接口编写代码时，您可以使用C++扩展语言接口方便地控制执行代码的逻辑。

> 说明：C++语言拓展接口详细说明，请参见[C++ API](https://docs.streamcomputing.com/_/sharing/vSxLMI20nalGphdpXdEVoDg6JkUcfEkT?next=/zh/latest/)。

主机端运行时接口提供以下功能：

- 设备管理：提供操作设备（NPC Cluster）相关的功能，例如指定待使用的设备、获取设备信息等。
- 内存管理：提供操作内存相关的功能，例如分配/释放内存、拷贝内存数据等。
- 执行控制：提供执行目标程序相关的功能，例如注册/释放目标程序、指定运行配置、启动核函数、加载/卸载目标程序等。
- 流管理：提供操作流相关的功能，例如创建/销毁流、创建/销毁事件、添加事件等。
- 错误处理：提供获取错误信息相关的功能，例如获取错误码、获取错误详情等。

设备端运行时接口则提供以下功能：

- 设备查看：获取设备信息。
- 执行控制：退出核函数。
- 内存管理：在设备间拷贝内存。

性能数据采集接口：采集异构程序的执行性能数据，获取MME、MTE等粒度的执行cycle数。

#### 调用核函数

在SHC中，调用核函数的方式如下：

```C++
kernel_function<<<NCORE, stream, flags>>>(arg0, ...)
```

命令中配置部分和参数部分的含义如下所示：

| **命令内容**         | **说明**                                                     |
| -------------------- | ------------------------------------------------------------ |
| NCORE, stream, flags | 指定设备端的配置，配置项含义如下：<br />NCORE：执行核函数所使用NPC的个数。<br />stream：指定执行核函数时所在的流，默认为0代表使用隐式声明流。详细的流使用说明，请参见*并行执行*章节。<br />flags：指定核函数的运行标志，默认为0（stcKernelFlagNone）代表无运行标志。详细的运行标志含义，请参见*stcKernelFlag_t*章节。 |
| (arg0, ...)          | 指定核函数的参数，参数需要满足以下条件：<br />参数列表中的变量类型和个数必须和核函数的定义相匹配。<br />每个参数的大小不能超过4字节。 |

#### 函数修饰符

SHC支持函数修饰符`__host__`、`__global__`、`__device__`，用于区分不同用途的函数。函数修饰符以及函数用途说明如下所示：

| **函数用途** | **修饰符**               | **说明**                                                     |
| ------------ | ------------------------ | ------------------------------------------------------------ |
| 主机端函数   | `__host__`               | 具有以下特点：<br />在主机端执行，对设备端程序不可见。<br />主机端函数中可以调用主机端函数、核函数、双边函数，可以使用STL、libc、libc++库，支持递归调用自身。<br />参数来自于用户输入。<br />与普通C++函数没有任何区别，可以作为函数模板、类方法或匿名函数。<br />说明：如果函数没有添加任何函数修饰符，默认是主机端函数，编译器会自动添加函数修饰符。 |
| 核函数       | `__global__`             | 具有以下特点：<br />能且只能由主机端函数调用，并在设备端执行。<br />核函数中可以调用设备端函数、双边函数，可以使用libnpurt库。<br />从栈上取参数。<br />能且只能是普通函数。返回类型必须是void。<br />具有以下限制：<br />不支持递归调用自身。<br />不能包含`long`、`longlong`或`double`类型的参数。<br />不支持使用其他变量修饰符修饰核函数的参数。 |
| 设备端函数   | `__device__`             | 具有以下特点：<br />在设备端执行，对主机端程序不可见。<br />设备端函数中可以调用设备端函数、双边函数，可以使用libnpurt库，支持递归调用自身。<br />从寄存器取参数。<br />与普通C++函数没有任何区别，可以作为函数模板、类方法或匿名函数。<br />说明：如果需要函数需要在设备端执行，则不可省略函数修饰符。 |
| 双边函数     | `__host__`和`__device__` | 具有以下特点：<br />可以在主机端、设备端执行。<br />能且只能调用双边函数，支持递归调用自身。<br />可以被主机端函数、核函数、双边函数调用，参数来自于调用者。<br />双边函数一般是一些主机端和设备端都会用到的小型辅助函数，例如求数组最大值。 |

> 说明：不建议使用`__device__`和`__host__`各自修饰类方法，会导致在主机端和设备端看到的类定义不同。

#### 变量修饰符

设备端不支持动态分配内存，但SHC支持通过变量修饰符`__device__`、 `__local__`、 `__shared__`、 `__mutable__`静态分配内存。每种变量修饰符对应不同的分配规则，各变量类型的基本属性如下：

| **变量修饰符**                                               | **存放位置** | **有效范围**                                                 | **读写属性**                                 | **变量初始化**                                               | **多核访问**                                                 |
| ------------------------------------------------------------ | ------------ | ------------------------------------------------------------ | -------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| `__device__`                                                 | 全局内存     | 全局变量、全局静态变量、局部变量、静态局部变量               | 单独使用：只读<br />和`__thread`联用：可读写 | 只读时，必须显式初始化。                                     | 单独使用：可以被多个核共同访问。<br />和`__thread`联用：变量在每个核都保存一份副本。对单核上的副本的修改，对其它核不可见。 |
| `__local__`                                                  | 本地内存     | 局部变量                                                     | 可读写                                       | 推荐定义`__local__`数组作为buffer使用。<br />说明：`__local__`变量允许初始化，但是初始化会降低执行效率，因此不推荐初始化。 | 定义的`__local__`变量在每个NPC都保存一份副本。对单核上的副本的修改，对其它核不可见。 |
| `__shared__`                                                 | 共享内存     | 局部变量                                                     | 可读写                                       | 推荐定义`__shared__`数组作为buffer使用。<br />说明：`__shared__`变量允许初始化，但是初始化会降低执行效率，因此不推荐初始化。另外，如果需要从多个NPC访问`__shared__`变量，读写变量前注意执行sync指令，保证在多个NPC中完成并发初始化。 | 定义的`__shared__`变量可以被多个NPC共同访问。如果希望使用`__shared__`变量在NPC间传递信息，需要使用`volatile`修饰。 |
| `__mutable__`<br />说明：不能单独使用，需要和`__device__`一起使用，且不可以修饰指针。 | 全局内存     | 全局变量、全局静态变量、局部变量、局部静态变量<br />说明：全局变量地址默认非32字节对齐，您需要自行添加对齐属性`__attribute__((aligned(32)))`。 | 可读写                                       | 可读写，因此无需显式初始化。                                 | 定义的`__mutable__`变量可以被多个核共同访问。如果希望使用`__mutable__`变量在核间传递信息，需要使用`volatile`修饰。 |
| `__imb__`                                                    | 本地内存     | 局部变量                                                     | 可读写                                       | `__imb__`变量不允许初始化，只能作为高速buffer使用。          | 定义的`__imb__`变量在每个NPC都保存一份副本。对单核上的副本的修改，对其它核不可见。 |

变量类型会影响访问速度和内存占用情况：

- 访问速度
  - 由变量存放位置决定，本地内存最快（`__local__`、`__imb__`），共享内存次之（`__shared__`），全局内存最慢（`__device__`、`__mutable__`）。
- 内存占用
  - 函数内所有的`__imb__`变量和`__local__`变量的总大小不能超出本地内存空间（1.25MiB）。
  - 函数内所有的`__shared__`变量的总大小不能超出共享内存空间（8MiB）。
  - `__local__`、`__shared__`、`__imb__`所需内存在调用函数时动态分配，因此未调用函数时不占用空间，递归调用会占用多倍空间。
  - 全局内存空间（4GiB）充足，不太可能出现超出问题。

使用本章节所述的变量修饰符时，请注意以下限制：

- 仅支持在核函数、设备端函数中使用，不支持在主机端函数、双边函数中使用。
- 变量修饰符都不支持修饰函数参数。
- 变量修饰符都不支持修饰C++对象，仅支持修饰POD类型（例如普通变量、数组、结构体）。

### Python语言扩展接口

#### 接口功能

基于HPE异构编程模型和C++语言扩展接口的设计，我们还提供了Python接口方便您在Python项目中使用HPE异构编程能力。在安装了HPE异构编程环境的机器上进入符合要求的Python环境并安装HPE Python扩展库，即可使用主机端运行时（hpert）和性能数据采集（stcpti）的Python接口。

> 说明：Python语言拓展接口详细说明，请参见[Python API](https://docs.streamcomputing.com/_/sharing/vSxLMI20nalGphdpXdEVoDg6JkUcfEkT?next=/zh/latest/)。

主机端运行时接口提供了以下功能：

- 设备管理：提供操作设备相关的功能，例如指定待使用的设备、获取设备信息等。
- 内存管理：提供操作内存相关的功能，例如分配/释放内存、拷贝内存数据等。
- 执行控制：提供执行目标程序相关的功能，例如指定运行配置、加载/卸载目标程序。
- 流管理：提供操作流相关的功能，例如创建/销毁流、创建/销毁事件、添加事件等。

> 说明：主机端运行时接口执行报错时，会通过异常（RuntimeAPIError）方式上报错误码，您可以通过返回的Error Message定位和排查问题。详细的Error Message及说明，请参见[Python API](https://docs.streamcomputing.com/_/sharing/vSxLMI20nalGphdpXdEVoDg6JkUcfEkT?next=/zh/latest/)中*class hpe.hpert.api.CruntimeException*章节的说明。

性能数据采集接口：采集异构程序的执行性能数据，获取MME、MTE等粒度的执行cycle数。

#### 使用示例

1. 编写并编译设备端程序。设备端程序需要用C++实现，因此需要单独编译后供Python实现的主机端程序读入。示例程序的作用是使用指定的核在数组间拷贝数据。编译时将copy.cc编译为copy.o，并用copy.o生成Fat Binary文件copy-fatbin.o。

   ```bash
   $ cat copy.cc
   #include <npurt.h>
   
   extern "C" {
   void copy(int *in, int *out, int num) {
       if (CoreID == 0){
           for(int i=0; i<num; i++)
                   out[i] = in[i];
       }
   }
   }
   
   $ stc-clang++ --target=riscv32npu -c copy.cc
   $ stc-ld.lld -flavor gnu copy.o /usr/local/hpe/riscv32npu/lib/libnpurt_hld.a -r -o copy-fatbin.o
   ```

   

2. 编写并运行主机端程序。示例程序用Python实现，其中读入了已经单独编译得到的设备端目标程序。示例程序的作用是使用主机端运行时接口从主机端向设备端拷贝100个整数，然后拷贝回主机端，同时使用性能数据采集接口获取过程中的性能数据。

   ```bash
   $ cat copy-example.py
   #!/usr/bin/env python
   # coding=utf-8
   
   import numpy as np
   import hpe.hpert.api as hpe
   import hpe.profiler.api as prof
   
   def main():
       '''
       copy 100 integers from host to device and then back to host
   
       '''
       DATA_NUM = 100
       try:
           print("version", hpe.version())
           hpe.detect()
           print('get device:', hpe.get_device())
   
           prof.init()
           prof.enable()
   
           # prepare host memory
           host_in = np.arange(DATA_NUM, dtype=np.int32)
           host_out = np.zeros(DATA_NUM, dtype=np.int32)
           # prepare device memory
           device_in = hpe.device_mem(host_in.nbytes)
           device_out = hpe.device_mem(host_out.nbytes)
   
           # move 100 integers from host to device
           device_in.copy_from_host(host_in)
   
           # 'hello' kernel function in hello.o moves 100 integers from device_in to device_out
           mod = hpe.module('copy-fatbin.o')
           mod.launch_kernel('copy', [device_in, device_out, DATA_NUM])
           hpe.synchronize()
   
           # move 100 integers from device to host
           device_out.copy_to_host(host_out)
           print("host_out:")
           print(host_out)
   
           prof.disable()
           perf_datas = prof.get_perf_datas()
           print("*************profiler data*************")
           print(perf_datas)
           prof.release()
   
       except hpe.CruntimeException as e:
           print(e)
   
   if __name__ == "__main__":
       main()
   
   $ python copy-example.py
   ```
