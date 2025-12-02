# NPU-Viewer使用指南

## NPU-Viewer概述

NPU-Viewer用于验证NPU设备的功能和性能，支持PCIe带宽、DDR带宽、NPU算力以及压力测试。

## 使用NPU-Viewer测试NPU设备

### 前提条件

* 主机配置满足以下要求：

  * Intel/AMD的64位CPU。

  * 系统内存大小不低于2GiB。

  * NPU ctrl firmware版本为V10.3.7。

  * MCU firmware版本为V10.0.14。

  * HPE版本为V1.9.3。

* 获取NPU-Viewer工具包。

* 推荐以root用户登录主机，使用NPU-Viewer时需要访问一些系统目录。

* 主机已安装依赖包，以Ubuntu为例：

  ```Bash
  $ sudo apt-get install bc vim-common numactl 
  ```

* 主机已安装编译C/C++程序所需的工具包，以Ubuntu为例：

  ```Bash
  $ sudo apt-get install make
  $ sudo apt-get install build-essential
  ```

### 使用流程

1. 停止运行任何依赖HPE驱动的程序。在使用NPU-Viewer之前，建议NPU设备处于初始状态。执行`lsmod | grep stc`命令查看正在依赖HPE驱动的程序。示例如下，stc模块正在被48个其他模块依赖。

   ```Bash
   $ lsmod | grep stc
   stc                   512000  48
   ```

2. 如果存在依赖HPE驱动的程序，可以执行`stc-smi`命令查看程序的Pid，然后视情况等待程序执行完成或者自行终止程序。

3. 解压NPU-Viewer工具包并进入工具目录。以工具包名称为npu-viewer\_STC-v1.0.2-\*\_x86\_64.tar.gz为例，工具目录中包含了若干目录和文件。

   ```Bash
   $ tar -zxvf npu-viewer_STC-v1.0.2-*_x86_64.tar.gz
   $ ls npu-viewer_STC
   build_info  cases  driver  pub_key  README.md  script  stress  tools  viewer_start
   ```

4. 选择测试时需要使用的内核驱动。PCIe带宽测试用pcidma驱动，其他测试用stc驱动，用户在执行测试前可使用system_prepare.sh脚本切换驱动。

   > 说明：首次切换stcdma.ko或stcqual stc.ko时，会进行自动编译，下方示例简化了过程中输出的回显信息，看到DONE即代表编译完成。如果您需要重新编译驱动，可以删除./result目录下的stcdma.ko或stc.ko文件，然后重新运行system_prepare.sh脚本。

   - 切换pcidma驱动：

     ```Bash
     $ ./script/system_prepare.sh 1
     Check numactl commands on this host...
     Remove standard ko ...
     Load dma driver to kernel...
     ...
     DONE
     ```

   - 切换stc驱动：

     ```Bash
     $ ./script/system_prepare.sh 0
     Remove standard ko ...
     Load driver...
     ...
     DONE
     ```

5. 执行测试。NPU-Viewer为PCIe带宽、DDR带宽、NPU算力、压力测试提供了测试用例，您可以通过命令方便地选择测试用例，详细说明，请参见*命令说明*和*命令示例*章节。测试完成后，会自动生成log和result目录并存储日志和结果文件。

   > 注意：部分测试可能耗时较长，例如压力测试耗时约5分钟。在测试过程中请不要通过Ctrl+C等方式强制退出，否则会导致系统不稳定。

6. 完成测试后，切换回HPE驱动，恢复NPU设备至正常工作状态。

   ```Bash
   $ sudo rmmod stc
   $ sudo modprobe stc
   ```


### 文件说明

NPU-Viewer工具目录中包含了若干目录和文件，建议您关注的目录和文件如下：

| **名称**    | **类型** | **描述**                         |
| --------- | ------ | ------------------------------ |
| log       | 目录     | 在执行测试时自动生成的目录，保存测试过程中产生的日志。    |
| result    | 目录     | 保存测试结果文件，例如DDR压力测试过程中输出的bin文件。 |
| README.md | 文件     | NPU-Viewer工具的使用说明。             |

### 命令说明

了解NPU-Viewer命令的使用方法：

```bash
$ cd npu-viewer_STC/
$ ./viewer_start -h
------------------------------------------------------------
NPU viewer - A capability viewer for NPU product.
------------------------------------------------------------

Option list：
  -h, --help:                Print usage
  -v, --version:             NPU viewer version info
  -l, --list:                Show list of currently detected NPUs on the host.
  -t, --test:                Specify the test to be run [1-4].
  -i, --index:               Specify the NPU ID for the test
      --loops:               Provide number of loops for specified test
      --set_freq:            Specify the frequence NPU running at (1200 1100 1000 900 800 624,default 1000)Mhz

------------------------------------------------
Test list:
    [1]  PCIe bandwidth test
    [2]  DDR bandwidth test
    [3]  Computing power (TOPS) test
    [4]  Computing stress test
```

NPU-Viewer命令支持以下选项：

| **选项**          | **描述**                                                                  |
| --------------- | ----------------------------------------------------------------------- |
| `-h, --help`    | 查看NPU-Viewer支持的选项和测试集。                                                  |
| `-v, --version` | 查看NPU-Viewer的版本信息。                                                      |
| `-l, --list`    | 查看主机中检测到的NPU设备。                                                         |
| `-t, --test`    | 通过编号指定测试集，取值范围为1\~4。                                                    |
| `-i, --index`   | 在指定NPU上执行测试。如果未指定NPU，PCIe带宽测试、DDR带宽测试、NPU算力测试会串行测试每个NPU，压力测试则并行测试所有NPU。 |
| `--loops`       | 指定循环测试的次数，默认值为1。                                                        |
| `--set_freq`    | 设置测试时的NPU核心频率，仅在NPU算力测试时生效。                                             |

NPU-Viewer支持以下测试集：

| **测试集编号** | **测试集名称**                   | **描述**                                                                        |
| --------- | --------------------------- | ----------------------------------------------------------------------------- |
| 1         | PCIe bandwidth test         | PCIe带宽测试，通过PCIe DMA通道在主机端内存和设备端内存之间传输数据，根据传输的最大数据量和传输时间计算出PCIe的带宽。            |
| 2         | DDR bandwidth test          | DDR带宽测试，通过NPU内部的sysDMA通道在设备端DDR与LLB之间传输数据，根据传输的最大数据量和传输时间（基于clock数）计算出DDR的带宽。 |
| 3         | Computing power (TOPS) test | NPU算力测试，运行指定的MAC运算，根据运算消耗的时间（基于clock数）评估NPU的算力。                               |
| 4         | Computing stress test       | 压力测试，对NPU设备进行压力测试并输出NPU设备满载运行时的相关信息。压力测试单轮耗时约5分钟，日志文件存放在`log/npu-stress`下。    |

### 命令示例

#### 查看NPU设备

查看主机中检测到的NPU设备，回显内容和驱动类型有关，以STCP920为例：

```bash
$ ./viewer_start --list
NPU: 0
        STCP920    BUS-ID: 0:1b:00.0 (01PVK389K0030806)
```

示例为检测到1个NPU设备，产品类型为STCP920。

#### PCIe带宽测试

在NPU 0上执行PCIe带宽测试：

```bash
$ ./script/system_prepare.sh 1
$ ./viewer_start --test 1 --index 0
```

#### DDR带宽测试

在NPU 0上执行DDR带宽测试：

```bash
$ ./script/system_prepare.sh 0
$ ./viewer_start --test 2 --index 0
```

#### NPU算力测试

在NPU 0上执行NPU算力测试：

```bash
$ ./script/system_prepare.sh 0
$ ./viewer_start --test 3 --index 0
```

#### 压力测试

在NPU 0上执行压力测试：

> 说明：压力测试回显中会列出所有卡，其中NPU 0的利用率（NPU-Util）达到100%进行了压力测试。

```bash
$ ./script/system_prepare.sh 0
$ ./viewer_start --test 4 --index 0
```

#### 循环测试

在NPU 1上循环执行5次DDR带宽测试：

```bash
$ ./script/system_prepare.sh 0
$ ./viewer_start --test 2 --index 1 --loops 5
```
