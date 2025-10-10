# STCRP Release Notes

## 概述

希姆计算为自研AI推理芯片以及加速卡开发了配套软件，包括异构编程环境、AI编译器以及满足模型监控调试、部署集成等用途的工具。配套软件打包为STCRP交付，STCRP Release Notes记录了各软件的版本、功能变更、问题修复等信息。STCRP V1.7.0中配套软件的版本信息如下：

- HPE V1.9.0
  - stc-dkms V1.9.0
  - stc-kernel-common V1.9.0
  - hpert V1.3.0
  - hpert-dev V1.3.0
  - stcc V1.9.0
  - stc-smi V1.8.1
  - stc-prof V1.2.8
  - stc-gdb V1.8.1
  - stc-vprof V1.8.0
  - hpe-example V1.8.1
  - libstc-common V1.0.0
- HPE Python V1.4.0
- MLTC V1.1.0
- PPQ V0.6.6
- STC_LLM V1.0.0
- STC_LLM_DNN V1.0.0

## HPE V1.9.0

### HPE操作系统支持

- Ubuntu 20.04 
- Ubuntu 22.04

### HPE固件兼容

- MCU firmware V1.0.9
- NPU ctrl firmware V1.3.4

### HPE解决的问题

- 修复容器里面SetP2PMap失败的问题。
- 修复STC_LLM测试FlagAlpha/Llama2-Chinese-7b-Chat模型出现模型卡住cluster down的问题。
- 修复stcGetDeviceAttribute/stcGetDeviceName/接口device参数是最后一个cluster时报错的问题。
- 修复使用STC_LLM跑大模型期间频繁ctrl+c + smi -r，概率出现板卡breakdown导致服务器无法连接的问题。

## HPE Python V1.4.0

新增HPE Python V1.4.0，支持在Python环境中调用异构编程接口，STC_LLM就依赖了HPE Python。

## MLTC V1.1.0

新增编译器MLTC V1.1.0，将来自不同框架的AI模型编译为面向希姆计算硬件产品的可执行文件，同时加速AI模型的计算过程，提高系统的健壮性。

## PPQ V0.6.6

新增量化工具PPQ V0.6.6，支持对模型进行PTQ量化。

## STC_LLM V1.0.0

新增大模型推理框架STC_LLM V1.0.0，配合STC_LLM_DNN V1.0.0，可以方便地基于希姆计算软硬件导入、替换大模型并完成推理任务，简化了大模型的部署和使用过程。
