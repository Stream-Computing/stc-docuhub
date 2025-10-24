---
sidebar_position: 1
sidebar_label: Firmware Release Notes
sidebar_class_name: green
---

# Firmware Release Notes

## 概述

firmware预装在各个硬件设备上用于直接控制设备，并供驱动程序加载以和更上层的软件进行交互。STCP920中预装了以下firmware：

* NPU ctrl firmware：负责初始化NPU的SoC系统。

* MCU firmware：配合主机管理PCIe卡的电源供应。

为满足功能需求或解决问题，希姆计算会发布新版本的firmware，为已有设备升级firmware的具体操作，请参见固件更新指南。

## NPU ctrl firmware功能变化

- V10.3.6：更新PCIe Device ID规则，新增Sub-System ID配置。
- V10.3.5：设置电压告警。

- V1.3.4：

  - 支持PCIe Gen3/Gen4自动识别。

  - 增加数字签名。

  - 固件同时支持HOST和KVM使用。

- V1.3.3：支持AI推理卡passthrough到基于KVM的VM。

- V1.2.3：定期清除AER（Advanced Error Reporting）状态。

- V1.2.2：优化firmware升级过程。

- V1.2.0：去掉ATS（Address Translation Service）功能。

- V1.1.9：更新NPU序列号（SN）的格式。

- V1.1.8：设置PCIe错误掩码，清除PCIe错误状态。

- V1.1.5：改进PCIe链路质量。

- V1.1.0：变更板卡的PCIe class code：将显示类型从Non-VGA unclassified device修改为Processing accelerators。

- V1.0.0：初始版本。

## MCU firmware功能变化

- V10.0.13：增加产品部件号Part Number查询功能，统一版本号查询规则。
- V10.0.12：增加查询UUID大端序命令。
- V10.0.11：更新PCIe Device ID规则，新增Sub-System ID配置。
- V10.0.10：增加vr查询及powercfg设置功能。

- V1.0.9：设置vmac默认电压值。
- V1.0.8：增加固件签名。
- V1.0.7：增加加密信息。
- V1.0.6：优化firmware升级过程。
- V1.0.5：更新版本号格式。
- V1.0.1.rc0：初始版本。

