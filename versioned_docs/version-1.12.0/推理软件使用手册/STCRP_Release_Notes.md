# STCRP Release Notes



## 概述

STCRP是为自研AI推理芯片以及加速卡开发的配套软件，其中包括异构编程引擎、AI编译器以及满足模型监控调试、部署集成等用途的工具。STCRP Release Notes记录了各软件的版本、功能变更、问题修复等信息。STCRP V1.12.0中配套软件的版本信息如下：

* HPE V1.9.6

  * stc-dkms V1.9.6

  * stc-kernel-common V1.9.6

  * hpert V1.4.3

  * hpert-dev V1.4.3

  * stcc V1.9.5

  * stc-smi V1.8.5

  * stc-prof V1.2.12

  * stc-gdb V1.8.3

  * stc-vprof V1.8.0

  * hpe-example V1.9.1

* HPE Python V1.4.1

* MLTC V1.6.0

* SNQ V1.0.0

* STC_LLM V1.3.2

* STC_LLM_DNN V1.3.1

* STC_IE V1.6.0

* SNC V1.0.1

## HPE V1.9.6

### HPE操作系统支持

* Ubuntu 22.04

* Ubuntu 25.04

* 麒麟V10

### HPE固件兼容

* MCU firmware V10.0.14

* NPU ctrl firmware V10.3.7

### 功能新增或变更

* DMA P2P支持带stride的copy。

## MLTC V1.6.0

算子支持列表，请参见[MLTC算子支持说明](https://docs.streamcomputing.com/_/sharing/vSxLMI20nalGphdpXdEVoDg6JkUcfEkT?next=/zh/latest/)。

模型支持说明，请参见[模型支持说明](https://docs.streamcomputing.com/_/sharing/vSxLMI20nalGphdpXdEVoDg6JkUcfEkT?next=/zh/latest/)。

### 功能新增或变更

* 优化 copySchedule updateResourceInfoMap func 编译耗时。

* 优化 copySchedule normalize func 编译耗时。

* 打通qwen2-7b 动态kv_cache_len。

* Onnx前端支持用户自定义算子。

* 支持模型输入Reduce轴的动态Shape。

## STC_LLM V1.3.2

### 功能新增或变更

* API接口request支持新的openai格式。

* stc_llm_dnn调试断点清理。

* stc-llm接口支持Token计费。
