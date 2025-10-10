# HPE错误信息分类标识

## 阅读须知

- 版权声明

本文档版权为广州希姆半导体科技有限公司所有（Copyright️ ©️ 2019-2024 Stream Computing Inc.）。未经本公司书面许可，任何单位或个人不得以任何形式或通过任何途径，包括使用影印、录制在内的电子或机械手段对本文档的部分或者全部进行复制或传播。

- 警告和承诺

我们尽最大努力使文档尽可能的完善和准确，但疏漏和缺陷之处在所难免。广州希姆半导体科技有限公司保留随时修改更新文档的权利。

- 反馈信息

您的反馈意见将使我们受益匪浅。如果您对文档有任何疑问、意见或建议，请与我们联系，感谢您对我们的支持和帮助。

<internal>

## 版本历史

| **文档版本** | **对应产品版本** | **作者** | **日期**   | **描述**                             |
| ------------ | ---------------- | -------- | ---------- | ------------------------------------ |
| V1.1.1       | STCRP V1.5.1     | 张肇颖   | 2024-05-20 | 结构化整改。                         |
| V1.1.0       | STCRP V1.4.0     | 袁凯     | 2023-01-31 | 增加smi错误，在NPU设备温度过高提示。 |
| V1.0.2       | STCRP V1.2.0     | 袁凯     | 2022-11-30 | 编辑优化。                           |
| V1.0.1       | HPE V1.4.0       | 袁凯     | 2022-09-09 | 编辑优化。                           |
| V1.0.0       | HPE V1.3.0       | 袁凯     | 2022-07-22 | 初始版本。                           |

</internal>

## 概述

计算机在启动时会将内核加载到内存，在加载的过程中会显示包括检测硬件设备在内的诸多系统信息。如果在开机时来不及查看，您也可以在开机后通过`dmesg`命令查看。

为了方便您识别希姆计算硬件相关错误的类型并定位出错位置，我们将HPE的错误信息按功能分类并通过一个或多个EID标识。在安装了希姆计算板卡和异构编程环境的服务器中，执行`dmesg`命令即可查看服务器启动过程中HPE相关的错误。示例如下，为方便查看仅保留了HPE错误相关的log：

```Bash
$ dmesg
...
[774728.211443] stc Eid(PCI:0000:b1:00.0):16, 2 mbox_send_command:85:(stc-smi 3785967):mail box full to tx cmd
[774728.311440] stc Eid(PCI:0000:b1:00.0):16, 2 mbox_send_command:85:(stc-smi 3785967):mail box full to tx cmd
[774728.411439] stc Eid(PCI:0000:b1:00.0):16, 2 mbox_send_command:85:(stc-smi 3785967):mail box full to tx cmd
[774728.511443] stc Eid(PCI:0000:b1:00.0):16, 2 mbox_send_command:85:(stc-smi 3785967):mail box full to tx cmd
[774728.611439] stc Eid(PCI:0000:b1:00.0):16, 2 mbox_send_command:85:(stc-smi 3785967):mail box full to tx cmd
[774728.711435] stc Eid(PCI:0000:b1:00.0):16, 2 mbox_send_command:85:(stc-smi 3785967):mail box full to tx cmd
[774728.811434] stc Eid(PCI:0000:b1:00.0):16, 2 mbox_send_command:85:(stc-smi 3785967):mail box full to tx cmd
[774728.911433] stc Eid(PCI:0000:b1:00.0):16, 2 mbox_send_command:85:(stc-smi 3785967):mail box full to tx cmd
[774729.011434] stc Eid(PCI:0000:b1:00.0):16, 2 mbox_send_command:85:(stc-smi 3785967):mail box full to tx cmd
[774729.111436] stc Eid(PCI:0000:b1:00.0):16, 2 mbox_send_command:85:(stc-smi 3785967):mail box full to tx cmd
...
```

## HPE错误格式

HPE错误信息的格式为`stc Eid(<card-id>):<error-major>, <error-minor> <custom-log>`，其中：

- stc Eid：log前缀，方便您识别和搜索HPE错误信息。

- \<card-id\>：出现错误的板卡标识。

- \<error-major\>：错误类型。

- \<error-minor\>：细分的错误类型。 

- \<custom-log\>：自定义输出的log内容。

以`stc Eid(PCI:0000:b1:00.0):16, 2 mbox_send_command:85:(stc-smi 3785967):mail box full to tx cmd`为例，其中：

- stc Eid：出现了HPE错误。

- PCI:0000:b1:00.0：出现错误的板卡标识为PCI:0000:b1:00.0。

- 16：错误类型为16（mailbox错误）。

- 2：细分的错误类型为2（mbox tx fifo 满），出现该错误的原因是发送的mbox消息太快。

- mbox_send_command:85:(stc-smi 3785967):mail box full to tx cmd：自定义输出的log内容。

## HPE错误类型

HPE错误信息可能的类型如下表所示：

> 说明：如果遇到表格中没提到的EID，请记录EID并联系希姆计算提供技术支持。

| **Error Major** | **Error Class** | **Error Minor** | **Error Descriptor**                         | **Cause**                                                    |
| --------------- | --------------- | --------------- | -------------------------------------------- | ------------------------------------------------------------ |
| 2               | 基本错误        | 0               | 无效值                                       | 使用了无效的值。                                             |
| 2               | 基本错误        | 1               | 主机内存分配失败                             | 主机端内存已耗尽。                                           |
| 2               | 基本错误        | 2               | 无效的主机地址                               | 使用了无效的主机端内存地址。                                 |
| 2               | 基本错误        | 3               | 无效的参数                                   | 下发的ioctl的参数无效。                                      |
| 2               | 基本错误        | 5               | Netlink错误                                  | 运行模拟器时出现Netlink的错误。                              |
| 2               | 基本错误        | 6               | 接收到SIGSTOP                                | 用户发送了SIGSTOP信号。                                      |
| 2               | 基本错误        | 7               | copy to user失败                             | 可能用户空间的地址无效，请尝试排查该问题或者联系希姆计算提供技术支持。 |
| 2               | 基本错误        | 8               | copy from user失败                           | 可能用户空间的地址无效，请尝试排查该问题或者联系希姆计算提供技术支持。 |
| 10              | 内存错误        | 0               | 设备内存分配失败                             | 设备端内存已耗尽。                                           |
| 10              | 内存错误        | 1               | 主机内存哈希表冲突                           | 主机端内存虚拟地址冲突，可能是地址被修改，请尝试排查该问题或者联系希姆计算提供技术支持。 |
| 10              | 内存错误        | 3               | 主机内存映射失败                             | 主机端内存已耗尽，或者vmalloc区内存已耗尽。                  |
| 10              | 内存错误        | 4               | 主机内存取消映射失败                         | 未获取到mm的信号量，或者umap的size不是page页对齐等。         |
| 10              | 内存错误        | 5               | 映射物理页面失败                             | 主机端物理内存已耗尽。                                       |
| 10              | 内存错误        | 7               | 物理页reserve失败                            | 物理页分配有问题。                                           |
| 10              | 内存错误        | 10              | 重复的页面                                   | 连续的两个虚拟页面映射到同一个物理页面。                     |
| 10              | 内存错误        | 11              | 获取物理页面失败                             | 进程退出或者主机物理内存耗尽。                               |
| 10              | 内存错误        | 12              | 获取物理页面数失败                           | buf地址不合理。                                              |
| 10              | 内存错误        | 13              | page的引用计数错误                           | 在代码中page引用的次数和释放次数不匹配。                     |
| 10              | 内存错误        | 14              | device memory地址无效                        | 查找的设备端内存的地址不在分配的链表中。                     |
| 10              | 内存错误        | 15              | device内存保护失败                           | 要保护的内存未分配。                                         |
| 10              | 内存错误        | 16              | iram分配器初始化失败                         | 记录IRAM分配器的主机内存无法分配。                           |
| 10              | 内存错误        | 17              | 主机内存分配失败                             | 主机端内存已耗尽。                                           |
| 12              | device sync     | 0               | sync忙等待                                   | 存在尚未处理的设备端的action。                               |
| 13              | NPC错误         | 0               | npc core资源分配失败                         | NPC的资源分配耗尽，或者要求分配无效的资源。                  |
| 13              | NPC错误         | 1               | 等待资源                                     | NPC正在执行任务，还未结束。                                  |
| 13              | NPC错误         | 2               | mbox发送消息失败                             | NPC正在执行任务，或者任务下发失败，或者唤醒NPC失败。         |
| 13              | NPC错误         | 3               | npc core未进入wifi                           | 可能有的NPC在执行sync或者pld操作，请尝试排查该问题或者联系希姆计算提供技术支持。 |
| 13              | NPC错误         | 4               | reset core错误                               | 传入了无效的参数，或者reset core和core map的值不一致。       |
| 13              | NPC错误         | 5               | unreset core错误                             | unreset以后和core map不一致。                                |
| 13              | NPC错误         | 6               | npc core没有进入idle                         | 可能有的NPC在执行sync或者pld操作，请尝试排查该问题或者联系希姆计算提供技术支持。 |
| 13              | NPC错误         | 7               | npc产生异常                                  | firmware或者kernel函数产生了异常。                           |
| 13              | NPC错误         | 8               | npc唤醒失败                                  | NPC可能未处于idle状态，或者mbox发送失败。                    |
| 14              | stream错误      | 0               | stream sync忙                                | stream中存在尚未处理的action。                               |
| 14              | stream错误      | 2               | device上未找到stream                         | 可能stream已释放，或者未查找到有效的stream，请尝试排查该问题或者联系希姆计算提供技术支持。 |
| 15              | 核函数错误      | 0               | 核函数队列满                                 | 提交的任务过快，或者核函数执行的过慢。                       |
| 15              | 核函数错误      | 1               | 核函数队列中未找到slot id                    | 无效的Slot ID。                                              |
| 15              | 核函数错误      | 2               | slot忙                                       | Slot ID大于有效的Slot ID取值。                               |
| 15              | 核函数错误      | 3               | iram上的kernel queue满                       | 任务提交过快，或者核函数执行过慢。                           |
| 15              | 核函数错误      | 4               | iram kernel queue未找到slot id               | 无效的Slot ID。                                              |
| 15              | 核函数错误      | 5               | dump核函数相关内存超时                       | dump的时间过长。                                             |
| 15              | 核函数错误      | 6               | slot 无效                                    | 无效的Slot ID。                                              |
| 15              | 核函数错误      | 7               | 遍历kernel queue错误                         | 恢复kernel queue时出现错误。                                 |
| 15              | 核函数错误      | 8               | kernel queue锁错误                           | kernel queue上锁失败。                                       |
| 15              | 核函数错误      | 9               | kernel queue解锁错误                         | kernel queue解锁失败。                                       |
| 15              | 核函数错误      | 10              | 读取kernel queue的状态失败                   | pio传输出错。                                                |
| 15              | 核函数错误      | 11              | 写入kernel queue的val失败                    | pio传输出错。                                                |
| 15              | 核函数错误      | 12              | 写入kernel queue的tail失败                   | pio传输失败。                                                |
| 16              | mailbox错误     | 2               | mbox tx fifo满                               | 发送的mbox消息太快，导致队列被占满。                         |
| 16              | mailbox错误     | 3               | mbox tx发送超时                              | mbox发送有问题。                                             |
| 16              | mailbox错误     | 4               | mbox rx fifo空                               | mbox未接收到消息。                                           |
| 16              | mailbox错误     | 5               | mbox线程唤醒错误                             | mbox唤醒出错。                                               |
| 16              | mailbox错误     | 6               | mbox kfifo满                                 | 存放mbox消息的fifo满，消息处理不及时。                       |
| 17              | event错误       | 0               | sync event忙                                 | event未处理。                                                |
| 17              | event错误       | 1               | event list空                                 | 查找时，event list尚未添加任务。                             |
| 17              | event错误       | 2               | 分配event失败                                | 主机内存耗尽。                                               |
| 18              | sysdma错误      | 0               | sysdma忙                                     | sysdma正在传输数据。                                         |
| 19              | pcie错误        | 0               | pcie cap read错误                            | 读取PCIe cap错误，PCIe枚举问题。                             |
| 19              | pcie错误        | 1               | pcie cap write错误                           | 写入PCIe cap错误，PCIe枚举问题。                             |
| 19              | pcie错误        | 2               | pcie dma engine slave config错误             | PCIe DMA engine slave config被修改。                         |
| 19              | pcie错误        | 3               | dma描述符提交失败                            | 返回了无效的cookie值。                                       |
| 19              | pcie错误        | 4               | dma sync wait超时                            | 可能DMA传输链路有问题，请尝试排查该问题或者联系希姆计算提供技术支持。 |
| 19              | pcie错误        | 5               | pcie dma map错误                             | PCIe DMA map的方向有问题，或者地址映射有问题。               |
| 19              | pcie错误        | 6               | alloc sg table错误                           | 主机端内存已耗尽。                                           |
| 19              | pcie错误        | 7               | 获取pin内存失败                              | 获取的地址不在pin内存的列表里。                              |
| 19              | pcie错误        | 8               | 准备描述符错误                               | 描述符方向有问题，或者sg_len < 1。                           |
| 19              | pcie错误        | 9               | 改变pcie速率失败                             | 可能链路有问题，请尝试排查该问题或者联系希姆计算提供技术支持。 |
| 19              | pcie错误        | 10              | dma channel已占用                            | DMA channel还未传输完成，下发了下一个传输。                  |
| 19              | pcie错误        | 11              | 取消dma传输                                  | 上层应用取消了DMA传输。                                      |
| 19              | pcie错误        | 12              | 取消pio传输                                  | 上层应用取消了pio传输。                                      |
| 19              | pcie错误        | 13              | 申请dma channel失败                          | DMA channel被占用。                                          |
| 19              | pcie错误        | 15              | pcie传输失败                                 | 传输的数据地址不对齐或者DMA链路有问题。                      |
| 19              | pcie错误        | 20              | pcie suspend错误                             | 可能系统在reset状态，或者正在传输数据，请尝试排查该问题或者联系希姆计算提供技术支持。 |
| 19              | pcie错误        | 25              | pcie resume错误                              | 系统无法唤醒PCIe设备。                                       |
| 19              | pcie错误        | 30              | pcie reset失败                               | 可能正在传输数据或者DDR初始化失败等，请尝试排查该问题或者联系希姆计算提供技术支持。 |
| 19              | pcie错误        | 31              | pcie flr错误                                 | PCIe function level reset失败。                              |
| 19              | pcie错误        | 32              | pcie数据链路link down                        | 数据链路休眠。                                               |
| 20              | cluster错误     | 0               | cluster breakdown                            | 可能DMA错误，或者NPC错误，请尝试排查该问题或者联系希姆计算提供技术支持。 |
| 22              | profiling错误   | 0               | malloc失败                                   | 主机端内存已耗尽。                                           |
| 22              | profiling错误   | 1               | 数据从内核态拷贝至用户态失败                 | 可能内存分配问题，导致内存越界，请尝试排查该问题或者联系希姆计算提供技术支持。 |
| 22              | profiling错误   | 2               | 数据从用户态拷贝至内核失败                   | 可能内存分配问题，导致内存越界，请尝试排查该问题或者联系希姆计算提供技术支持。 |
| 22              | profiling错误   | 3               | 非法的指针                                   | 可能是空指针，请尝试排查该问题或者联系希姆计算提供技术支持。 |
| 22              | profiling错误   | 4               | 创建核函数缓冲区失败                         | 可能是主机端内存已耗尽，请尝试排查该问题或者联系希姆计算提供技术支持。 |
| 22              | profiling错误   | 5               | 非法的npc序号                                | 可能是firmware的原因，获取NPC信息错误，请尝试排查该问题或者联系希姆计算提供技术支持。 |
| 22              | profiling错误   | 6               | 新增profiling字符设备失败                    | 驱动无法加载，生成设备节点失败。                             |
| 22              | profiling错误   | 7               | 创建profiling字符设备失败                    | 驱动无法加载，创建设备失败。                                 |
| 22              | profiling错误   | 8               | 获取核函数数据失败                           | 无法获取核函数数据，可能profiling context被破坏，或者是context没有被生成，请尝试排查该问题或者联系希姆计算提供技术支持。 |
| 22              | profiling错误   | 9               | 错误的DMA通道ID                              | 设置DMA channel ID 失败，应使用channel 0。                   |
| 22              | profiling错误   | 10              | 获取stream数据失败                           | 无法获stream data，可能profiling context被破坏，或者是context没有被生成，请尝试排查该问题或者联系希姆计算提供技术支持。 |
| 22              | profiling错误   | 11              | 非法的ioctl命令号                            | 传入了非法的ioctl命令。                                      |
| 22              | profiling错误   | 12              | 非法的cluster id                             | 软件错误导致cluster id < 0 或者 > 3。                        |
| 22              | profiling错误   | 13              | 获取主机memmory data失败                     | 无法获memory data，可能profiling context被破坏，或者是context没有被生成，请尝试排查该问题或者联系希姆计算提供技术支持。 |
| 22              | profiling错误   | 14              | profiling context中线程组下线程数量错误      | stc-prof保存的数据被破坏，或者context红黑树维护异常。        |
| 22              | profiling错误   | 15              | profiling上下文重复创建                      | stcpti接口重复使用，或者context有历史遗留。                  |
| 22              | profiling错误   | 16              | 按单个线程或者按线程组profiling标志错误      | stc-prof环境被破坏可能导致该问题，请尝试排查该问题或者联系希姆计算提供技术支持。 |
| 22              | profiling错误   | 17              | profiling context插入红黑树错误              | 可能context红黑树维护异常，请尝试排查该问题或者联系希姆计算提供技术支持。 |
| 22              | profiling错误   | 18              | profiling获取context失败                     | pid/tgid对应context不存在，可能stcpti接口使用顺序不对，请尝试排查该问题或者联系希姆计算提供技术支持。 |
| 22              | profiling错误   | 19              | profiling action num用户态数据与内核态不匹配 | 可能context维护错误，请尝试排查该问题或者联系希姆计算提供技术支持。 |
| 22              | profiling错误   | 20              | profiling action num为空                     | 可能context维护存在问题，请尝试排查该问题或者联系希姆计算提供技术支持。 |
| 23              | smi错误         | 1               | smi的mbox通讯失败                            | mbox发送消息超时。                                           |
| 23              | smi错误         | 2               | smi命令发送失败                              | 从IRAM发送数据超时。                                         |
| 23              | smi错误         | 3               | smi接收命令失败                              | 从IRAM接收数据超时。                                         |
| 23              | smi错误         | 4               | smi发送命令格式错误                          | 发送的命令数据命令字错误。                                   |
| 23              | smi错误         | 5               | smi接收命令格式错误                          | 接收的命令数据命令字错误。                                   |
| 23              | smi错误         | 6               | smi命令无回复                                | 发送到设备的命令忙没有应答。                                 |
| 23              | smi错误         | 7               | smi命令错误                                  | 发送到设备的命令设备不识别。                                 |
| 23              | smi错误         | 8               | smi命令包数据长度溢出                        | 一次发送的命令数据长度超过数据包长度。                       |
| 23              | smi错误         | 9               | smi的spi传输超时                             | spi总线发送等待超时。                                        |
| 23              | smi错误         | 10              | smi的spi接收超时                             | spi总线接收等待超时。                                        |
| 23              | smi错误         | 11              | smi的spi状态错误                             | spi总线状态错误。                                            |
| 23              | smi错误         | 12              | smi的spi地址错误                             | 发送的擦写地址没有4K对齐。                                   |
| 23              | smi错误         | 13              | smi的spi擦除错误                             | spi擦写超时错误。                                            |
| 23              | smi错误         | 14              | smi的CRC错误                                 | spi数据写入读出校验失败。                                    |
| 23              | smi错误         | 15              | smi电压错误警报                              | NPU设备电压过低警告。                                        |
| 23              | smi错误         | 16              | smi温度异常警报                              | NPU设备温度过高警告。                                        |
| 39              | probe初始化错误 | 0               | probe malloc失败                             | 主机端内存已耗尽。                                           |
| 39              | probe初始化错误 | 1               | pci io map失败                               | PCI io内存已耗尽。                                           |
| 39              | probe初始化错误 | 2               | dma位宽错误                                  | DMA位宽小于32bit。                                           |
| 39              | probe初始化错误 | 4               | 无效的cluster个数                            | 可能未初始化，请尝试排查该问题或者联系希姆计算提供技术支持。 |
| 39              | probe初始化错误 | 5               | device创建失败                               | 内存耗尽。                                                   |
| 39              | probe初始化错误 | 7               | 创建内核thread失败                           | 内存耗尽。                                                   |
| 39              | probe初始化错误 | 9               | dma版本不符合预期                            | PCIe链路有问题。                                             |
| 39              | probe初始化错误 | 10              | ioctl desc里的函数为空                       | 结构体初始化有问题。                                         |
| 39              | probe初始化错误 | 13              | 驱动版本不匹配                               | 驱动版本过低。                                               |
| 39              | probe初始化错误 | 14              | 设置调度方式失败                             | 可能权限不够，请尝试排查该问题或者联系希姆计算提供技术支持。 |
| 39              | probe初始化错误 | 15              | 中断初始化错误                               | 中断申请有问题，在使用MSI（Message Signaled Interrupts）中断时，有可能是VT-d未打开，请尝试排查该问题或者联系希姆计算提供技术支持。 |

<internal>

## 相关文档

- [HPE错误日志手册](http://code.streamcomputing.com/host-sdk/hsdk-docs/-/blob/master/产品文档/hpe/HPE日志手册.md)

</internal>