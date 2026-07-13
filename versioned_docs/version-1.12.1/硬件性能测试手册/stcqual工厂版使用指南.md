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

  <table>
  <thead>
  <tr>
  <th><strong>操作系统版本</strong></th>
  <th><strong>Linux内核版本</strong></th>
  <th><strong>glibc版本</strong></th>
  <th><strong>推荐的GCC版本</strong></th>
  <th><strong>推荐的dkms版本</strong></th>
  </tr>
  </thead>
  <tbody>
  <tr>
  <td>Ubuntu 18.04</td>
  <td><ul> <li>4.15.0</li> <li>5.4.0</li> </ul></td>
  <td>2.27</td>
  <td>7.5.0</td>
  <td>2.3-3</td>
  </tr>
  <tr>
  <td>Ubuntu 20.04</td>
  <td><ul> <li>5.8.0</li> <li>5.4.0</li> </ul></td>
  <td>2.31</td>
  <td>9.40</td>
  <td>2.8.1-5</td>
  </tr>
  <tr>
  <td>Ubuntu 22.04</td>
  <td>5.15.0-89</td>
  <td>2.35</td>
  <td>11.4.0</td>
  <td>2.8.7</td>
  </tr>
  <tr>
  <td>Debian 10</td>
  <td><ul> <li>4.19.0</li> <li>5.4.56</li> </ul></td>
  <td>2.28</td>
  <td>8.3</td>
  <td>2.6.1-4</td>
  </tr>
  <tr>
  <td>CentOS 7</td>
  <td>3.10.0-1160</td>
  <td>2.17</td>
  <td>7.3.1</td>
  <td>3.0.3-1</td>
  </tr>
  </tbody>
  </table>

* 联系希姆计算技术支持获取stcqual工具包。

* 推荐以root用户登录主机，使用stcqual时需要访问一些系统目录。

* 主机已安装依赖包，以Ubuntu为例：

* 主机已安装编译C/C++程序所需的工具包，以Ubuntu为例：

### 使用流程

1. 停止运行任何依赖HPE驱动的程序。在使用stcqual之前，NPU设备必须处于初始状态。

   执行`lsmod | grep stc`命令查看正在依赖HPE驱动的程序。示例如下，stc模块正在被48个其他模块依赖。

2. 如果存在依赖HPE驱动的程序，可以执行`stc-smi`命令查看程序的Pid，然后视情况等待程序执行完成或者自行终止程序。

3. 解压stcqual工具包并进入工具目录，工具目录中包含了若干目录和文件。

4. 选择测试时需要使用的内核驱动。stcqual单独提供了用于支持测试的驱动，而非使用HPE驱动，因此在执行测试前需要使用system_prepare.sh脚本切换驱动。

   > 说明：首次切换stcdma.ko或stcqual stc.ko时，会进行自动编译，下方示例简化了过程中输出的回显信息，看到DONE即代表编译完成。如果您需要重新编译驱动，可以删除./result目录下的stcdma.ko或stc.ko文件，然后重新运行system_prepare.sh脚本。

   * 切换stcdma.ko：

   * 切换stcqual stc.ko：

5. 执行测试。stcqual为PCIe带宽、DDR带宽、NPU算力、板卡功耗、系统级测试等提供了测试用例，您可以通过命令方便地选择测试用例，详细说明，请参见*命令说明*和*命令示例*章节。测试完成后，会自动在log目录下生成日志文件。

   > 注意：部分测试可能耗时较长，例如系统级测试耗时约10分钟。在测试过程中请不要通过Ctrl+C等方式强制退出，否则会导致系统不稳定。

6. 完成测试后，切换回HPE驱动，恢复NPU设备至正常工作状态。

### 文件说明

stcqual工具目录中包含了若干目录和文件，建议您关注的目录和文件如下：

| **名称**             | **类型** | **描述**                             |
| ------------------ | ------ | ---------------------------------- |
| log                | 目录     | 在执行测试时自动生成的目录，保存测试过程中产生的日志。        |
| result             | 目录     | 保存测试结果文件，例如DDR压力测试过程中输出的bin文件。     |
| stcqual            | 文件     | 使用stcqual工具的入口，支持通过选项选择测试用例、输出形式等。 |
| system_prepare.sh | 文件     | 用于切换驱动的脚本。                         |
| README.md          | 文件     | stcqual工具的使用说明。                    |

### 命令说明

执行`./stcqual -h`获取stcqual命令的使用方法：

stcqual命令支持以下选项：

| **选项**          | **描述**                                                                  |
| --------------- | ----------------------------------------------------------------------- |
| `-h, --help`    | 查看stcqual支持的选项和测试集。                                                     |
| `-v, --version` | 查看stcqual的版本信息。                                                         |
| `-l, --list`    | 查看主机中检测到的NPU设备。                                                         |
| `-t, --test`    | 通过编号指定测试集，默认值为8。取值范围为1~8。                                              |
| `-p, --pcibus`  | 在使用指定PCI总线的NPU设备上执行测试。                                                  |
| `-i, --index`   | 在指定NPU上执行测试。                                                            |
| `--loops`       | 指定循环测试的次数，默认值为1。                                                        |
| `--set_freq`    | 指定NPU运行频率，取值为：1200MHZ、1100MHZ、1000MHZ、900MHZ、800MHZ、624MHZ。默认值为1000MHZ。 |
| `--prod_id`     | 生成日志文件时，在文件名中添加自定义信息。                                                   |
| `--prod_type`   | 用于指定产品类型，产品类型会影响测试时使用的时钟频率。                                             |
| `--cust_time`   | 生成日志文件时，在文件名中添加指定的时间戳。                                                  |

stcqual支持以下测试集，测试集1-8和测试集16为必测项：

<table>
<thead>
<tr>
<th><strong>测试集编号</strong></th>
<th><strong>测试集名称</strong></th>
<th><strong>描述</strong></th>
</tr>
</thead>
<tbody>
<tr>
<td>1</td>
<td>PCIe bandwidth test</td>
<td>PCIe带宽测试，通过PCIe DMA通道在主机端内存和设备端内存之间传输数据，根据传输的最大数据量和传输时间计算出PCIe的带宽。</td>
</tr>
<tr>
<td>2</td>
<td>PCIe eye data test</td>
<td>PCIe眼图数据测试，逐个lane打印眼图数据，并根据若干个检测点，汇总判断眼图质量是否满足要求。</td>
</tr>
<tr>
<td>3</td>
<td>DDR bandwidth test<br /></td>
<td>DDR带宽测试，通过NPU内部的sysDMA通道在设备端DDR与LLB之间传输数据，根据传输的最大数据量和传输时间（基于clock数）计算出DDR的带宽。</td>
</tr>
<tr>
<td>4</td>
<td>Computing power (TOPS) test</td>
<td>NPU算力测试，运行指定的MAC运算，根据运算消耗的时间（基于clock数）评估NPU的算力。</td>
</tr>
<tr>
<td>5</td>
<td>AI Net performance test</td>
<td>AI网络性能测试，顺序执行ResNet-50、ResNet-50 INT8、BERT，根据执行各个网络时所处理的数据量和消耗的时间，计算出在NPU上执行AI网络的性能。</td>
</tr>
<tr>
<td>6</td>
<td>Thermal test</td>
<td>发热测试，在所有NPU上运行高功耗用例，后台线程定期轮询板卡温度。检测到温度过高时，则记录一次error到结果文件。</td>
</tr>
<tr>
<td>7</td>
<td>Power test</td>
<td>功耗测试，在后台运行高功耗用例，并在前台监控功耗状况。</td>
</tr>
<tr>
<td>8</td>
<td>System Level Test (SLT) - sequence order<br /></td>
<td>系统级测试（SLT），顺序执行10项测试，全面验证NPU的功能和性能，包括scan_sram、ddr_stress、pld、sdma、l1_im、mac、mac_x8、resnet50_x8、resnet50、bert。<ul> <li>scan_sram：测试内存读写的准确性。</li> <li>ddr_stress：对主机端向DDR搬运数据进行压力测试。</li> <li>pld：测试板卡内部LLB向L1搬运数据。</li> <li>sdma：测试板卡内部通过DMA从DDR向LLB搬运数据。</li> <li>l1_im：测试板卡内部从L1向IM搬运数据。</li> <li>mac：测试MAC运算的正确性和稳定性。</li> <li>mac_x8：测试MAC运算（INT8数据）的正确性和稳定性。</li> <li>resnet50_x8：测试执行ResNet-50模型（INT8数据）的正确性和稳定性。</li> <li>resnet50：测试执行ResNet50模型的正确性和稳定性。</li> <li>bert：测试执行BERT模型的正确性和稳定性。</li> </ul></td>
</tr>
<tr>
<td>9</td>
<td>System Level Test (SLT) - random order</td>
<td>系统级测试（SLT），随机执行10项测试。<br /></td>
</tr>
<tr>
<td>10</td>
<td>DDR stress test</td>
<td>Host侧通过PCIe通路对设备DDR做随机数读写压力测试。</td>
</tr>
<tr>
<td>11</td>
<td>DDR data/addr line scan</td>
<td>将DDR空间按照对应Cluster内NPC数量分区，按照数据bit位逐位覆盖和bit翻转，对DDR做bit位级别的压力测试。</td>
</tr>
<tr>
<td>12</td>
<td>NPU ISA test</td>
<td>对NPU的RISC-V核心做开源的标量指令、向量指令的功能测试。</td>
</tr>
<tr>
<td>13</td>
<td>NPU burn in test</td>
<td>在系统级测试（SLT）测试的基础上，每个测试项之间穿插PCIe的数据拷贝，测试系统是否挂死，是SLT测试增强版。</td>
</tr>
<tr>
<td>14</td>
<td>SinglePoint: ddr cache err test case</td>
<td>DDR Cache一致性测试。<br /></td>
</tr>
<tr>
<td>15</td>
<td>SinglePoint: pcie ber test</td>
<td>PCIe寄存器空间健壮性测试。</td>
</tr>
<tr>
<td>16</td>
<td>SinglePoint: sdma 2chan ddr write test</td>
<td>启用每个bank上DDR对LLB的两个通道，对两个通道做并行的读写压力测试，SDMA测试的增强版。</td>
</tr>
<tr>
<td>17</td>
<td>pcie aer check</td>
<td>检测板卡是否存在硬件兼容性错误。</td>
</tr>
</tbody>
</table>

### 命令示例

以STCP920板卡为例阐述命令说明：

#### 查看NPU列表

查看主机中检测到的NPU设备，回显内容和驱动类型有关：

示例为检测到一个NPU设备，产品类型为STCP920，NPU设备所使用PCI总线的ID为`0:03:00.0`。

#### 指定NPU测试

* 如果不指定NPU的index，默认在所有NPU上执行测试，以PCIe眼图数据测试为例：

* 在NPU 0上执行PCIe带宽测试：

* 在NPU 0上执行PCIe眼图数据测试：

#### 指定PCIe通道测试

在使用指定PCIe（地址为`0:03:00.0`）的NPU上执行DDR带宽测试：

> 说明：如果使用`./stcqual --list`得到的BUS-ID，无需包括末尾（例如`(01P9MV530002030a)`），否则会出现报错。

#### 指定循环次数测试

循环执行5次PCIe带宽测试：

#### 指定产品类型生成日志

在NPU 0上执行SLT测试，生成的日志文件名中包括产品类型：

测试完成后，log目录下的日志文件名称示例为stcqual-slt-npu0-01PSF60000060709-stcp920-**.log。

> 说明：SLT测试耗时约10分钟。

### 常见问题

* 如果在切换驱动时出现以下报错，说明存在依赖HPE驱动的程序，请参考*使用流程*章节中的步骤排查。

* 在指定PCI总线时，如果使用`./stcqual --list`得到的BUS-ID，无需包括末尾（例如`(00P8K2860206090d)`），否则会出现报错。

