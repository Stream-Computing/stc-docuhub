---
sidebar_position: 1
sidebar_label: STCRP Release Notes
sidebar_class_name: green
---

# STCRP Release Notes

## 概述

STCRP是为自研AI推理芯片以及加速卡开发的配套软件，其中包括异构编程环境、AI编译器以及满足模型监控调试、部署集成等用途的工具。STCRP Release Notes记录了各软件的版本、功能变更、问题修复等信息。STCRP V1.9.0中配套软件的版本信息如下：
- HPE V1.9.3
  - stc-dkms V1.9.3
  - stc-kernel-common V1.9.3
  - hpert V1.4.1
  - hpert-dev V1.4.1
  - stcc V1.9.3
  - stc-smi V1.8.4
  - stc-prof V1.2.10
  - stc-gdb V1.8.2
  - stc-vprof V1.8.0
  - hpe-example V1.9.1
- HPE Python V1.4.0
- MLTC V1.3.0
- SNQ V1.0.0
- STC_LLM V1.2.0
- STC_LLM_DNN V1.2.0
- STC_LLM_MLTC V1.3.0
- SNC V1.0.1

## HPE V1.9.3

### HPE操作系统支持

* Ubuntu 22.04

* Ubuntu 25.04
* 麒麟V10

### HPE固件兼容

* MCU firmware V10.0.13
* NPU ctrl firmware V10.3.6

### 功能新增或变更

- 新增stc-topo工具感知设备拓扑。
- HPE支持Ubuntu 25.04操作系统。
- 新增STCML系列API。
- 新增通过stc-smi查询hpe-host的版本号功能。

## MLTC V1.3.0

算子支持列表，请参见*MLTC算子支持说明*。

模型支持说明，请参见*模型支持说明*。

### 功能新增或变更

- 新增PyTorch模型支持。
- 新增图分组性能调优工具。
- 增强精度分析工具。

## STC_LLM V1.2.0

新增模型支持，详细说明请参见*模型支持说明*。

