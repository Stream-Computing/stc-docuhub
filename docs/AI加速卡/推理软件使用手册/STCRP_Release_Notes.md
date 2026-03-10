# STCRP Release Notes



## 概述

STCRP是为自研AI推理芯片以及加速卡开发的配套软件，其中包括异构编程引擎、AI编译器以及满足模型监控调试、部署集成等用途的工具。STCRP Release Notes记录了各软件的版本、功能变更、问题修复等信息。STCRP V1.11.0中配套软件的版本信息如下：

* HPE V1.9.5

  * stc-dkms V1.9.5

  * stc-kernel-common V1.9.5

  * hpert V1.4.2

  * hpert-dev V1.4.2

  * stcc V1.9.4

  * stc-smi V1.8.5

  * stc-prof V1.2.11

  * stc-gdb V1.8.3

  * stc-vprof V1.8.0

  * hpe-example V1.9.1

* HPE Python V1.4.1

* MLTC V1.5.0

* SNQ V1.0.0

* STC_LLM V1.3.1

* STC_LLM_DNN V1.3.0

* STC_IE V1.5.0

* SNC V1.0.1

## HPE V1.9.5

### HPE操作系统支持

* Ubuntu 22.04

* Ubuntu 25.04

* 麒麟V10

### HPE固件兼容

* MCU firmware V10.0.14

* NPU ctrl firmware V10.3.8

### 功能新增或变更

* mecpy-p2p增加目的地到IRAM的copy，用于存放正式数据传输的目的地址。

## MLTC V1.5.0

算子支持列表，请参见[MLTC算子支持说明](https://docs.streamcomputing.com/_/sharing/vSxLMI20nalGphdpXdEVoDg6JkUcfEkT?next=/zh/latest/)。

模型支持说明，请参见[模型支持说明](https://docs.streamcomputing.com/_/sharing/vSxLMI20nalGphdpXdEVoDg6JkUcfEkT?next=/zh/latest/)。

### 功能新增或变更

* torch 自定义算子stcLib::attention 增加对于len(kv) != len(q)的支持。

* Torch前端支持框架自定义算子。

* 更新torch-mlir版本。

* 支持模型输入Parallel轴的动态Shape。

* PyTorch框架接入支持torch.compile。

* 编译时间优化。

## STC_LLM V1.3.1

### 功能新增或变更

* 增加STC_IE模型看护。

* 流式接口提供 token 统计。

* 修复推理请求消息体序列化报错。

* stream参数不传时，默认以流式返回。

* Qwen2-14B通过投机采样进行性能优化。

