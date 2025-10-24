---
sidebar_position: 2
sidebar_label: stcqual工厂版使用指南
sidebar_class_name: green
---

# stcqual工厂版使用指南

## stcqual概述

stcqual用于验证希姆计算NPU设备的功能和性能，支持测试PCIe带宽、DDR带宽、NPU算力、板卡功耗等，以及全面的系统级测试，并对应提供了测试用例。

本文中会提及以下驱动：

* stcdma.ko：stcqual提供的驱动，用于支持PCIe带宽测试。

* stcqual stc.ko：stcqual提供的驱动，用于支持除PCIe带宽以外的其他测试。

* standard stc.ko：HPE提供的驱动，是希姆计算异构编程引擎包括的模块之一。

## 使用stcqual测试NPU设备

### 前提条件

* 主机配置满足以下要求：

  * Intel/AMD的64位CPU。

  * 系统内存大小不低于2GiB。

* 操作系统配置要求：

  | **操作系统版本** | **Linux内核版本** | **glibc版本** | **推荐的GCC版本** | **推荐的dkms版本** |
  | ---------------- | ----------------- | ------------- | ----------------- | ------------------ |
  | Ubuntu 18.04     | 4.15.0<br/>5.4.0  | 2.27          | 7.5.0             | 2.3-3              |
  | Ubuntu 20.04     | 5.8.0<br/>5.4.0   | 2.31          | 9.40              | 2.8.1-5            |
  | Ubuntu 22.04     | 5.15.0-89         | 2.35          | 11.4.0            | 2.8.7              |
  | Debian 10        | 4.19.0<br/>5.4.56 | 2.28          | 8.3               | 2.6.1-4            |
  | CentOS 7         | 3.10.0-1160       | 2.17          | 7.3.1             | 3.0.3-1            |

* 联系希姆计算技术支持获取stcqual工具包。

* 推荐以root用户登录主机，使用stcqual时需要访问一些系统目录。

* 主机已安装依赖包，以Ubuntu为例：

  ```bash
  $ sudo apt-get install bc vim-common numactl 
  ```

* 主机已安装编译C/C++程序所需的工具包，以Ubuntu为例：

  ```bash
  $ sudo apt-get install make
  $ sudo apt-get install build-essential
  ```

### 使用流程

1. 停止运行任何依赖HPE驱动的程序。在使用stcqual之前，NPU设备必须处于初始状态。

   执行`lsmod | grep stc`命令查看正在依赖HPE驱动的程序。示例如下，stc模块正在被48个其他模块依赖。

   ```bash
   $ lsmod | grep stc
   stc                   512000  48
   ```

2. 如果存在依赖HPE驱动的程序，可以执行`stc-smi`命令查看程序的Pid，然后视情况等待程序执行完成或者自行终止程序。

3. 解压stcqual工具包并进入工具目录，工具目录中包含了若干目录和文件。

   ```bash
   $ tar -zxvf stcqual_factory_{chip_version}-{stcqual_version}-{abi}_{arch_version}.tar.gz
   $ cd stcqual_factory__{chip_version}
   $ ls
   build_info          npu.ai_net.sh          npu.pcie_ber.sh         npu.tops.sh     stcqual.thermal.parallel.sh
   cases               npu.burn_in.sh         npu.pcie_bw.sh          packages        switch_freq.sh
   driver              npu.ddr_bw.sh          npu.pcie_eye.sh         pcie_common.sh  system_prepare.sh
   factory_pcie_bw.sh  npu.ddr_cache_err.sh   npu.pcie_eye.sh.strict  pub_key         tools
   factory_test.sh     npu.ddr_stress.sh      npu.power.sh            pvtdef.sh
   npc_clean.sh        npu.isa.sh             npu.sdma_err.sh         README.md
   npc_load.sh         npu.memtest.sh         npu.slt.sh              result
   npc_run.sh          npu.pcie_aer_check.sh  npu.thermal.sh          stcqual
   ```

4. 选择测试时需要使用的内核驱动。stcqual单独提供了用于支持测试的驱动，而非使用HPE驱动，因此在执行测试前需要使用system\_prepare.sh脚本切换驱动。

   > 说明：首次切换stcdma.ko或stcqual stc.ko时，会进行自动编译，下方示例简化了过程中输出的回显信息，看到DONE即代表编译完成。如果您需要重新编译驱动，可以删除./result目录下的stcdma.ko或stc.ko文件，然后重新运行system\_prepare.sh脚本。

   * 切换stcdma.ko：

     ```bash
     $ ./system_prepare.sh 1
     Check numactl commands on this host...
     Remove standard stc.ko ...
     Load stcdma.ko to kernel...
     ...
     DONE
     ```

   * 切换stcqual stc.ko：

     ```bash
     $ ./system_prepare.sh 0
     Remove stcdma.ko ...
     Load stcqual stc.ko to kernel...
     ...
     DONE
     ```

5. 执行测试。stcqual为PCIe带宽、DDR带宽、NPU算力、板卡功耗、系统级测试等提供了测试用例，您可以通过命令方便地选择测试用例，详细说明，请参见*命令说明*和*命令示例*章节。测试完成后，会自动在log目录下生成日志文件。

   > 注意：部分测试可能耗时较长，例如系统级测试耗时约10分钟。在测试过程中请不要通过Ctrl+C等方式强制退出，否则会导致系统不稳定。

6. 完成测试后，切换回HPE驱动，恢复NPU设备至正常工作状态。

   ```bash
   $ sudo rmmod stc
   $ sudo modprobe stc 
   ```

### 文件说明

stcqual工具目录中包含了若干目录和文件，建议您关注的目录和文件如下：

| **名称**             | **类型** | **描述**                             |
| ------------------ | ------ | ---------------------------------- |
| log                | 目录     | 在执行测试时自动生成的目录，保存测试过程中产生的日志。        |
| result             | 目录     | 保存测试结果文件，例如DDR压力测试过程中输出的bin文件。     |
| stcqual            | 文件     | 使用stcqual工具的入口，支持通过选项选择测试用例、输出形式等。 |
| system\_prepare.sh | 文件     | 用于切换驱动的脚本。                         |
| README.md          | 文件     | stcqual工具的使用说明。                    |

### 命令说明

执行`./stcqual -h`获取stcqual命令的使用方法：

```bash
$ cd stcqual
$ ./stcqual -h
------------------------------------------------------------
STCQual - A qualify toolset for StreamComputing NPU product.
------------------------------------------------------------

Option list：
  -h, --help:                Print usage
  -v, --version:             STCQual version info
  -l, --list:                Show list of currently detected NPUs on the host.
  -t, --test:                Specify the test to be run [1-8]. Default value is 8
  -p, --pcibus:              Specify the PCI Slot bus ID for the test
  -i, --index:               Specify the NPU ID for the test
      --loops:               Provide number of loops for specified test
      --set_freq:            Specify the frequence NPU running at (1200 1100 1000 900 800 624,default 1000)Mhz
      --prod_id:             Provide product id for log file
      --prod_type:           Provide product name for stcqual test,please input full name with capital letters
      --cust_time:           Provide a customized timestamp for log file

------------------------------------------------
Test list:
        [1]  PCIe bandwidth test
        [2]  PCIe eye data test
        [3]  DDR bandwidth test
        [4]  Computing power (TOPS) test
        [5]  AI net performance test
        [6]  Thermal test
        [7]  Power test
        [8]  System Level Test (SLT) - sequence order
        [9]  System Level Test (SLT) - random order
        [10] DDR stress test
        [11] DDR data/addr line scan
        [12] NPU ISA test
        [13] NPU burn in test
        [14] SinglePoint: ddr cache err test case
        [15] SinglePoint: pcie ber test
        [16] SinglePoint: sdma 2chan ddr write test
        [17] pcie aer check
```

stcqual命令支持以下选项：

| **选项**          | **描述**                                                                  |
| --------------- | ----------------------------------------------------------------------- |
| `-h, --help`    | 查看stcqual支持的选项和测试集。                                                     |
| `-v, --version` | 查看stcqual的版本信息。                                                         |
| `-l, --list`    | 查看主机中检测到的NPU设备。                                                         |
| `-t, --test`    | 通过编号指定测试集，默认值为8。取值范围为1\~8。                                              |
| `-p, --pcibus`  | 在使用指定PCI总线的NPU设备上执行测试。                                                  |
| `-i, --index`   | 在指定NPU上执行测试。                                                            |
| `--loops`       | 指定循环测试的次数，默认值为1。                                                        |
| `--set_freq`    | 指定NPU运行频率，取值为：1200MHZ、1100MHZ、1000MHZ、900MHZ、800MHZ、624MHZ。默认值为1000MHZ。 |
| `--prod_id`     | 生成日志文件时，在文件名中添加自定义信息。                                                   |
| `--prod_type`   | 用于指定产品类型，产品类型会影响测试时使用的时钟频率。                                             |
| `--cust_time`   | 生成日志文件时，在文件名中添加指定的时间戳。                                                  |

stcqual支持以下测试集，测试集1-8和测试集16为必测项：

| **测试集编号** | **测试集名称**                           | **描述**                                                     |
| -------------- | ---------------------------------------- | ------------------------------------------------------------ |
| 1              | PCIe bandwidth test                      | PCIe带宽测试，通过PCIe DMA通道在主机端内存和设备端内存之间传输数据，根据传输的最大数据量和传输时间计算出PCIe的带宽。 |
| 2              | PCIe eye data test                       | PCIe眼图数据测试，逐个lane打印眼图数据，并根据若干个检测点，汇总判断眼图质量是否满足要求。 |
| 3              | DDR bandwidth test                       | DDR带宽测试，通过NPU内部的sysDMA通道在设备端DDR与LLB之间传输数据，根据传输的最大数据量和传输时间（基于clock数）计算出DDR的带宽。 |
| 4              | Computing power (TOPS) test              | NPU算力测试，运行指定的MAC运算，根据运算消耗的时间（基于clock数）评估NPU的算力。 |
| 5              | AI Net performance test                  | AI网络性能测试，顺序执行ResNet-50、ResNet-50 INT8、BERT，根据执行各个网络时所处理的数据量和消耗的时间，计算出在NPU上执行AI网络的性能。 |
| 6              | Thermal test                             | 发热测试，在所有NPU上运行高功耗用例，后台线程定期轮询板卡温度。检测到温度过高时，则记录一次error到结果文件。 |
| 7              | Power test                               | 功耗测试，在后台运行高功耗用例，并在前台监控功耗状况。       |
| 8              | System Level Test (SLT) - sequence order | 系统级测试（SLT），顺序执行10项测试，全面验证NPU的功能和性能，包括scan_sram、ddr_stress、pld、sdma、l1_im、mac、mac_x8、resnet50_x8、resnet50、bert。<br/>- scan_sram：测试内存读写的准确性。<br/>- ddr_stress：对主机端向DDR搬运数据进行压力测试。<br/>- pld：测试板卡内部LLB向L1搬运数据。<br/>- sdma：测试板卡内部通过DMA从DDR向LLB搬运数据。<br/>- l1_im：测试板卡内部从L1向IM搬运数据。<br/>- mac：测试MAC运算的正确性和稳定性。<br/>- mac_x8：测试MAC运算（INT8数据）的正确性和稳定性。<br/>- resnet50_x8：测试执行ResNet-50模型（INT8数据）的正确性和稳定性。<br/>- resnet50：测试执行ResNet50模型的正确性和稳定性。<br/>- bert：测试执行BERT模型的正确性和稳定性。 |
| 9              | System Level Test (SLT) - random order   | 系统级测试（SLT），随机执行10项测试。                        |
| 10             | DDR stress test                          | Host侧通过PCIe通路对设备DDR做随机数读写压力测试。            |
| 11             | DDR data/addr line scan                  | 将DDR空间按照对应Cluster内NPC数量分区，按照数据bit位逐位覆盖和bit翻转，对DDR做bit位级别的压力测试。 |
| 12             | NPU ISA test                             | 对NPU的RISC-V核心做开源的标量指令、向量指令的功能测试。      |
| 13             | NPU burn in test                         | 在系统级测试（SLT）测试的基础上，每个测试项之间穿插PCIe的数据拷贝，测试系统是否挂死，是SLT测试增强版。 |
| 14             | SinglePoint: ddr cache err test case     | DDR Cache一致性测试。                                        |
| 15             | SinglePoint: pcie ber test               | PCIe寄存器空间健壮性测试。                                   |
| 16             | SinglePoint: sdma 2chan ddr write test   | 启用每个bank上DDR对LLB的两个通道，对两个通道做并行的读写压力测试，SDMA测试的增强版。 |
| 17             | pcie aer check                           | 检测板卡是否存在硬件兼容性错误。                             |

### 命令示例

以STCP920板卡为例阐述命令说明：

#### 查看NPU列表

查看主机中检测到的NPU设备，回显内容和驱动类型有关：

```bash
$ ./system_prepare.sh 0
Remove stcdma.ko ...
Load stcqual stc.ko to kernel...
DONE
$ ./stcqual --list
NPU: 0
        STCP920         BUS-ID: 0:03:00.0 (01PSF600000d0709)
```

示例为检测到一个NPU设备，产品类型为STCP920，NPU设备所使用PCI总线的ID为`0:03:00.0`。

#### 指定NPU测试

* 如果不指定NPU的index，默认在所有NPU上执行测试，以PCIe眼图数据测试为例：

  ```bash
  $ ./system_prepare.sh 0
  Remove stcdma.ko ...
  Load stcqual stc.ko to kernel...
  DONE
  $ ./stcqual --test 2
  ```

* 在NPU 0上执行PCIe带宽测试：

  ```bash
  $ ./system_prepare.sh 1
  Check numactl commands on this host...
  Remove stcqual stc.ko ...
  Load stcdma.ko to kernel...
  DONE
  $ ./stcqual --test 1 --index 0
  ```

* 在NPU 0上执行PCIe眼图数据测试：

  ```bash
  $ ./system_prepare.sh 0
  Remove stcdma.ko ...
  Load stcqual stc.ko to kernel...
  DONE
  $ ./stcqual --test 2 --index 0
  ```

#### 指定PCIe通道测试

在使用指定PCIe（地址为`0:03:00.0`）的NPU上执行DDR带宽测试：

> 说明：如果使用`./stcqual --list`得到的BUS-ID，无需包括末尾（例如`(01P9MV530002030a)`），否则会出现报错。

```bash
$ ./system_prepare.sh 0
stcqual stc.ko is already loaded...
$ ./stcqual --list
NPU: 0
        STCP920         BUS-ID: 0:03:00.0 (01PSF600000d0709)
$ ./stcqual --test 3 --pcibus 0:03:00.0
```

#### 指定循环次数测试

循环执行5次PCIe带宽测试：

```bash
$ ./system_prepare.sh 1
Check numactl commands on this host...
Remove stcqual stc.ko ...
Load stcdma.ko to kernel...
DONE
$ ./stcqual --test 1 --index 0 --loops 5
```

#### 指定产品类型生成日志

在NPU 0上执行SLT测试，生成的日志文件名中包括产品类型：

```bash
$ ./system_prepare.sh 0
Remove stcdma.ko ...
Load stcqual stc.ko to kernel...
DONE
$ ./stcqual --test 8 --index 0 --prod_id stcp920
```

测试完成后，log目录下的日志文件名称示例为stcqual-slt-npu0-01PSF60000060709-stcp920-\*\*.log。

> 说明：SLT测试耗时约10分钟。

### 常见问题

* 如果在切换驱动时出现以下报错，说明存在依赖HPE驱动的程序，请参考*使用流程*章节中的步骤排查。

  ```bash
  $ ./system_prepare.sh 0
  Remove standard stc.ko ...
  rmmod: ERROR: Module stc is in use

  ### Failed to remove old stc.ko
  $ ./system_prepare.sh 1
  Check numactl commands on this host...
  Remove standard stc.ko ...
  rmmod: ERROR: Module stc is in use

  ### Failed to remove old stc.ko
  ```

* 在指定PCI总线时，如果使用`./stcqual --list`得到的BUS-ID，无需包括末尾（例如`(00P8K2860206090d)`），否则会出现报错。

  ```bash
  $./stcqual --list
  NPU: 0
          STCP920         BUS-ID: 0:04:00.0 (00P8K2860206090d)
  $ ./stcqual --test 2 --pcibus 0:04:00.0 (00P8K2860206090d)
  -bash: syntax error near unexpected token `('
  ```
