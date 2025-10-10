# MLTC使用指南

## MLTC概述

MLTC（Multi-Level Tensor Compiler）是基于[MLIR](https://mlir.llvm.org/)研发的端到端深度学习编译器，可以将来自不同框架的AI模型编译为面向希姆计算硬件产品的可执行文件，同时加速AI模型的计算过程，提高系统的健壮性。

MLTC具有以下特性：

- 通过多层IR设计实现逐层下降 ，解决代码生成的复杂性。每次IR层级的转换只专注代码生成的一个局部方面，例如多核执行模型、bufferization、算子逻辑的指令组合等。
- 提供一套算子无关的tiling系统，把一些算子的公共逻辑提升到编译器框架中，减轻算子编程的开发负担，提高系统的健壮性。面向NeuralScale架构编写算子时，不管是手写算子还是compute/schedule的DSL描述，其中大部分代码逻辑是管理多层存储结构和其间的数据传输。
- 性能优化以独立的优化pass形式作用在特定层级的IR上，可以任意打开或关闭，不影响系统健壮性。
- 保持图优化之后的编译器主干流程与算子无关，不存在任何针对特定算子的定制化逻辑。
- 保持图层IR算子的原子性，不包含可以由简单算子组合而成的复杂算子，没有融合算子。

## 前提条件

- 准备好模型推理环境，安装HPE、MLTC、Python 3.10。具体操作，请参见[STCRP安装指南](https://docs.streamcomputing.com/_/sharing/vSxLMI20nalGphdpXdEVoDg6JkUcfEkT?next=/zh/latest/)。

- MLTC安装路径可通过`mltc.__path__ `能找到MLTC的安装路径。

  ```Bash
  $ python3
  Python 3.10.11 (main, May 16 2023, 00:28:57) [GCC 11.2.0] on linux
  Type "help", "copyright", "credits" or "license" for more information.
  >>> import mltc
  >>> mltc.__path__
  ['/root/miniconda3/envs/py310/lib/python3.10/site-packages/mltc']
  >>>
  ```

## 编译模型

### 转换模型

MLTC提供了MLTC前端工具解析AI框架导出的模型文件，转换为MLTC自定义的图层IR。目前MLTC支持TensorFlow、ONNX前端框架，不同框架模型可用不同的前端工具脚本进行转换：

- mltc-tf：MLTC TensorFlow前端转换工具。

  以DeepFM模型为例，将模型的pb文件转换成MLIR文件：

  ```Bash
  # 命令行格式
  $ mltc-tf -i <name0>:<dim0>x<dim1>x<datatype>,<name1>:<dim0>x<dim1>x<datatype> -s -t {output_tensor_name} -o {filename}.mlir {model}.pb
  
  # 命令行示例
  $ mltc-tf -i feat_index:1024x39xi32,feat_value:1024x39xf32 -s -t Sigmoid -o ./mlir_files/deepfm_stc.mlir ./models/deepfm.pb
  ```

  配置参数如下：

  | **参数选项** | **描述**                                                     | **是否必选** |
  | ------------ | ------------------------------------------------------------ | ------------ |
  | ？？？       | 通过该参数指定模型输入节点的名字和shape。目前支持的datatype和对应的简写：FLOAT64：f64FLOAT32：f32FLOAT16：f16INT64：i64INT32：i32INT16：i16INT8：i8UINT64：ui64UINT32：ui32UINT16：ui16UINT8：ui8 | 是           |
  | -s           | 指定该参数后，编译时会输出STC IR文件。                       | 否           |
  | -t string    | 通过该参数指定模型输出节点的名字。                           | 是           |
  | -o filename  | 通过该参数指定输出对应的MLIR文件或者fatbin文件。             | 是           |
  | -e           | 指定该参数后，编译时会保存常量数据到额外的bin文件中。        | 否           |
  | --dump       | 指定该参数后，编译时会生成中间编译IR文件。                   | 否           |

- mltc-onnx：MLTC ONNX前端转换工具。

  以ResNet18模型为例，将模型的ONNX文件转换成MLIR文件：

  ```Bash
  # 命令行格式
  $ mltc-onnx -i <name0>:<dim0>x<dim1> -s -o {filepath}.mlir {model}.onnx
  
  # 命令行示例
  $ mltc-onnx -i input.1:1x3x224x224 -s -o ./mlir_files/resnet18_stc.mlir ./models/resnet18.onnx
  ```

  配置参数如下：

  | **参数选项**       | **描述**                                                 | **是否必选** |
  | ------------------ | -------------------------------------------------------- | ------------ |
  | ？？？             | 通过该参数指定模型输入节点的名字和shape。                | 是           |
  | -s                 | 指定该参数后，编译时会输出STC IR文件。                   | 是           |
  | -v ？？？          | 通过该参数指定模型输入节点的值。                         | 否           |
  | -o filename        | 通过该参数指定输出对应的MLIR文件或者fatbin文件。         | 是           |
  | -e                 | 指定该参数后，编译时会保存常量到外部的bin文件中。        | 否           |
  | --dump             | 指定该参数后，编译时会生成中间编译IR文件。               | 否           |
  | --close-const-fold | 关闭常量折叠。量化模型转换时需要使用该参数关闭常量折叠。 |              |

### 编译模型

以编译DeepFM模型为例，将转换得到的MLIR文件编译为在目标设备上部署的vmfb文件。

> 说明：Python接口定义请参见[Python API](https://docs.streamcomputing.com/_/sharing/vSxLMI20nalGphdpXdEVoDg6JkUcfEkT?next=/zh/latest/)。

1. 编写Python脚本，调用MLTC的`Compiler().compile`接口编译模型，需要指定输入输出文件路径，支持编译编译参数控制编译过程。

   ```Bash
   $ cat compile_deepfm.py
   from mltc import Compiler
   
   # 输入mlir文件路径
   input_file = "deepfm_stc.mlir"
   # 输出vmfb文件路径
   output_file = "deepfm.vmfb"
   # 编译参数
   compile_args = "-arch=npu-v1 --dump-ir-after-all"
   Compiler().compile(input_file, output_file, compile_args)
   ```

2. 执行Python脚本。

   ```Bash
   $ python3 compile_deepfm.py
   ```

## 在CPU上验证模型

### 执行步骤

以部署ResNet34模型为例，将通过MLTC前端转换后模型的MLIR部署到CPU上验证模型。

> 说明：Python接口定义请参见[Python API](https://docs.streamcomputing.com/_/sharing/vSxLMI20nalGphdpXdEVoDg6JkUcfEkT?next=/zh/latest/)。

1. 编写Python脚本，调用MLTC的`Simulator().run()`接口在CPU上部署模型，需要指定输入的mlir文件路径、运行参数，支持部署参数控制部署过程。

   ```Bash
   $ cat run_resnet34_cpu.py
   from mltc import Simulator
   Simulator().run("resnet34_stc.mlir", "-i data.bin -o output.bin")
   ```

2. 执行Python脚本。

   ```Bash
   $ python3 run_resnet34_cpu.py
   ```

## 在NPU上部署模型

### 执行步骤

以部署DeepFM模型为例，将编译得到的vmfb文件部署到NPU板卡上。

> 说明：Python接口定义请参见[Python API](https://docs.streamcomputing.com/_/sharing/vSxLMI20nalGphdpXdEVoDg6JkUcfEkT?next=/zh/latest/)。

1. 编写Python脚本，调用MLTC的`Executor().run()`接口部署模型，需要指定输入的vmfb文件路径以及输入数据文件。

   ```Bash
   $ cat run_deepfm.py
   import os
   import numpy as np
   from mltc import Executor
   
   def gen_fake_data(input_shapes, input_dtype, low=0, high=2):
       input_data = {}
       for (name, shape), dtype in zip(input_shapes.items(), input_dtype.split(",")):
           if "FLOAT" in dtype.upper():
               dtype = "float16"
           input_data[name] = np.random.uniform(low=low, high=high, size=tuple(shape)).astype(dtype.lower())
       return input_data
   
   if __name__ == "__main__":
       input_shapes = {}
       input_shapes["feat_index"] = [1024,39]
       input_shapes["feat_value"] = [1024,39]
       input_type = "int32,float32"
       input_data = gen_fake_data(input_shapes, input_type)
       output = Executor("./deepfm.vmfb").run(input_data)
       print("=============== stc out ====================")
       print(output)
   ```

   > 说明：部署模型时，可设置`STC_SET_DEVICES`环境变量，指定部署模型时使用的Cluster。例如设置 `export STC_SET_DEVICES=0,1`，模型在Cluster0和Cluster1上部署。

2. 设置环境变量并执行Python脚本。

   ```Bash
   # hpe安装路径
   $ export RISCV=/usr/local/hpe
   $ python3 run_deepfm.py
   ```

### 推理效果对比

以YOLOv5模型为例，对比NPU和CPU的推理效果，示例执行步骤如下：

1. 获取官方的YOLOv5镜像以及repo。

   ```Bash
   $ git clone https://github.com/ultralytics/yolov5.git
   ```

   ![img](/_static/images/mltc-01.png)

2. 从[HuggingFace](https://huggingface.co/fcakyon/yolov5s-v7.0/tree/main)下载pt格式的权重（`yolov5s.pt`），并将权重文件移动到YOLOv5 repo所在的平级目录。

   ![img](/_static/images/mltc-02.png)

3. 使用官方脚本（`export.py`）将权重从pt格式转换为onnx格式，注意opset版本为11，保留动态轴。

   ```Bash
   $ # 设置环境变量
   $ export PYTHONPATH=<downloaded_yolov5_repo_path>
   $ # 安装必须的Python模块
   $ pip3 install torch==1.12.1 --index-url https://download.pytorch.org/whl/cpu
   $ pip3 install torchvision==0.13.1 --index-url https://download.pytorch.org/whl/cpu
   $ pip3 install onnx==1.12.0
   $ pip3 install onnxruntime==1.12.0
   $ pip3 install opencv-python
   $ # 打开官方YOLOv5 repository目录并转换权重
   $ cd yolov5
   $ python3 ./export.py --weights ../yolov5s.pt --include onnx --dynamic --opset 11
   ```

4. 验证ONNX模型在CPU上的执行效果。

   ```Bash
   $ python3 ./detect.py --weights ../yolov5s.onnx
   ```

   ![img](/_static/images/mltc-03.png)

5. 您可以选择使用Netron查看ONNX模型的输入shape、输出shape、动态轴。

   ![img](/_static/images/mltc-04.png)

6. 您可以选择将ONNX模型的metadata导出到YAML文件中。

   ```Python
   import onnx
   import yaml
   
   onnx_model_path = '../yolov5s.onnx'
   yaml_output_path = '../yolov5s.metadata'
   model = onnx.load(onnx_model_path)
   metadata_dict = {prop.key: eval(prop.value) for prop in model.metadata_props}
   with open(yaml_output_path, 'w') as yaml_file:
       yaml.dump(metadata_dict, yaml_file, default_flow_style=False)
   ```

7. 将ONNX模型转换为MLIR格式文件。

   ```Bash
   $ mltc-onnx ../yolov5s.onnx -i images:1x3x640x640 -s -e -o ../yolov5s.mlir
   ```

8. 编写脚本将MLIR格式文件转换为vmfb格式文件。

   转换脚本示例如下：

   ```Python
   from mltc import Compiler
   
   input_file = "../yolov5s.mlir"
   output_file = "../yolov5s.vmfb"
   compile_args = "-arch=npu-v1"
   Compiler().compile(input_file, output_file, compile_args)
   ```

9. 部署模型并修改部分代码适配YOLOv5的repo。

   - 修改文件1：common.py，修改点如下：

      ![img](/_static/images/mltc-05.png)
   - 修改文件2：export.py。修改点如下：

      ![img](/_static/images/mltc-06.png)

10. 验证模型在NPU上的执行效果。

    ```Bash
    $ python3 ./detect.py --weights ../yolov5s.vmfb --data ../yolov5s.metadata
    ```

    ![img](/_static/images/mltc-07.png)

     生成的图片示例如下：
    
    ![img](/_static/images/mltc-08.png)
    
    ![img](/_static/images/mltc-09.png)

11. 在NPU和CPU上分别批量验证。

    - NPU上的执行结果：

      ```Bash
      python3 ./detect.py --weights ../yolov5s.vmfb --data ../yolov5s.metadata
      ```

      ![mg](/_static/images/mltc-10.png)

    - CPU上的执行结果（ORT）

      ```Bash
      python3 ./detect.py --weights ../yolov5s.vmfb --data ../yolov5s.metadata --source ./data/images/
      ```

      ![mg](/_static/images/mltc-11.png)


### 故障排查

在NPU板卡上部署模型时，如果出现板卡运行异常的情况，如下图所示：

![mg](/_static/images/mltc-12.png)

图中提示mme或vme指令访存越界，引发异常的指令编码是0x06ABe8FB（图中红色标记部分）。以现有的报错信息无法确定具体是哪条指令的问题，需手动修改CC文件来确定具体指令，过程较为繁琐，因此我们提供了一个指令编码翻译脚本工具，可直接查询具体哪条指令导致的放存越界。

指令编码翻译脚本工具（inst_decoder.py）放在MLTC安装目录下的`python/tools`下。使用脚本解析报错的指令编码，得到指令编码对应的具体指令。

运行`inst_decoder.py`脚本，使用`--inst`参数传入异常指令编码：

```Bash
$ python inst_decoder.py --inst 0x06ABe8FB
isnt binary code: ['000001', '1', '01010', '10111', '1', '10', '10001', '1111011']
inst asm: veadd.mv.dimw (x17), (x23), (x10)
```

解析完成后直接输出编码对应的具体指令。其中`inst asm: veadd.mv.dimw (x17), (x23), (x10)`打印的是异常指令编码用到的是(x17)，(x23)，(x10)这三个指令， 根据上图中的显示信息，可得出不同指令的地址：x17=0xc0400000, x10=0xf8300000, x23=0xc0097f00，其中0xf8300000地址不在L1地址范围，可以得出x10中的地址为非法地址。

而`['000001', '1', '01010', '10111', '1', '10', '10001', '1111011']`打印的是指令二进制编码8个字段信息，示例如下：

![mg](/_static/images/mltc-13.png)

参数说明：

| **参数选项** | **描述**                                   |
| ------------ | ------------------------------------------ |
| --inst       | 异常出错的指令编码。默认值为：0x06ABE8FB。 |

## 分析推理性能

使用性能分析工具可以快速分析性能问题。性能分析工具可获取整网中融合算子详细的性能信息，并详细显示图调度后融合算子每次运行的性能信息。性能分析工具中主要包含获取性能数据脚本：`run_perf_analysis.py`。

### 使用限制

目前性能分析工具，不支持copy类算子及DMA cycle性能数据统计。

### 执行步骤

1. 获取性能分析工具脚本。

   性能分析工具脚本（run_perf_analysis.py）放在MLTC安装目录下的`python/tools/dump_memory`下。

2. 设置环境变量。

   使用`DUMP_PERF_PATH`设置性能数据dump后存放的目录，用于存放模型执行过程中的性能数据。

   ```Bash
   # 设置性能数据存放目录
   $ export DUMP_PERF_PATH=${perf_dir_name}
   # 示例
   $ export DUMP_PERF_PATH=~/perf_dump
   ```

3. 获取模型的性能数据。

   运行需要性能分析的网络模型用例，具体示例可参考*使用示例章节*。

4. 运行工具中的NPU数据分析脚本，获取节点每次运行的详细性能数据。

   性能分析工具脚本放在MLTC安装目录下的`python/tools/dump_memory`下。

   ```Bash
   $ python3 run_perf_analysis.py
   ```

### 使用示例

将以ResNet34网络为例，使用性能分析工具获取性能数据：

```Bash
# 设置性能数据存放目录
$ export DUMP_PERF_PATH=~/perf_dump/resnet34_perf_dump
# 模型转换成MLIR
$ mltc-tf -i data:16x224x224x3xf32 -t softmax/Softmax -s resnet34/resnet34.pb -o resnet34/resnet34.mlir
# 编译模型，示例可参考编译模型章节
$ python3 compile_resnet34.py
# 部署ResNet34模型，示例可参考部署模型章节
$ python3 run_resnet34.py
# 运行性能分析脚本
$ cd python/tools/dump_memory
$ python3 run_perf_analysis.py
```

最终对比结果生成在您指定的dump数据存放目录下，即设置的`DUMP_PERF_PATH`下，其中包含：

- dump_data文件夹：主要保存的是dump出来的16进制的数据。
- result文件夹：主要保存的是最终对比分析结果。
  - skip_perf_dict.csv：执行过程中被跳过的节点以及详细跳过信息。
  - op_perf_coreid.csv：每个核上的性能数据。

以op_perf_0.csv性能数据为例，结果文件如下图所示：

![mg](/_static/images/mltc-14.png)

字段说明：

| **字段名**          | **描述**                               |
| ------------------- | -------------------------------------- |
| name                | 节点名称。                             |
| mcu_cycle           | 总的执行周期数。                       |
| vme_cycle           | vme执行单元的周期数。                  |
| mme_cycle           | mme执行单元的周期数。                  |
| vec_cycle           | rvv执行单元的周期数。                  |
| syn_cycle           | sync执行单元的周期数。                 |
| mte_total_cycle     | mte总周期数。                          |
| vme_inst            | vme指令条数。                          |
| mme_inst            | mme指令条数。                          |
| vec_inst            | rvv指令条数。                          |
| syn_inst            | sync指令条数。                         |
| mte_pld_inst        | pld指令条数。                          |
| mte_icmov_inst      | icmov指令条数。                        |
| mte_mov_inst        | mov指令条数。                          |
| pal_vme_mme_cycle   | vme和mme指令并行运行周期数。           |
| pal_mte_mme_cycle   | vme和mme指令并行运行周期数。           |
| pal_vme_mte_cycle   | vme和mte指令并行运行周期数。           |
| pal_total_cycle     | vme、mme、mte总并行运行周期数。        |
| mte_icmov_cycle     | icmov指令周期数。                      |
| mte_l12llb_cycle    | mov_l12llb指令周期数。                 |
| mte_llb2l1_cycle    | mov_llb2l1指令周期数。                 |
| mte_pld_cycle       | pld指令周期数。                        |
| mte_pld_byte        | pld搬移的数据总量，字节为单位。        |
| mte_l12llb_byte     | mov_l12llb搬移的数据总量，字节为单位。 |
| mte_llb2l1_byte     | mov_llb2l1搬移的数据总量，字节为单位。 |
| mte_icmov_byte      | icmov搬移的数据总量，字节为单位。      |
| syn_wait_cycle      | syn等待的周期数。                      |
| vec_slot_wait_cycle | rvv指令等待执行的周期数。              |
| mme_slot_wait_cycle | mme指令等待执行的周期数。              |
| mte_slot_wait_cycle | mte指令等待执行的周期数。              |
| l1_conflict_cycle   | l1冲突周期数。                         |
| im_conflict_cycle   | imb冲突周期数。                        |
| dcache_miss_cnt     | dcache没命中次数。                     |
| icache_miss_cnt     | icache没命中次数。                     |
| instruction_cnt     | 总指令条数。                           |

## 分析精度

使用精度分析工具可以快速定位精度问题。精度分析工具可提供生成的网络模型在CPU与NPU运行的数据对比结果分析表，还提供精度对比失败算子的详细信息，包括精度对比失败发生位置的索引号以及在CPU和NPU上的索引位置的值。精度分析工具中主要包含以下脚本:

- `run_npu_data_analysis.py`：NPU数据拼接脚本。
- `run_precision_analysis.py`：NPU和CPU精度对比脚本。

### 执行步骤

1. 获取精度分析工具脚本。

   精度分析工具的所有脚本放在MLTC安装目录下的`python/tools/dump_memory`下。可通过`mltc.__path__ `找到MLTC的安装路径。

   ```Bash
   $ python3
   Python 3.10.11 (main, May 16 2023, 00:28:57) [GCC 11.2.0] on linux
   Type "help", "copyright", "credits" or "license" for more information.
   >>> import mltc
   >>> mltc.__path__
   ['/root/miniconda3/envs/py310/lib/python3.10/site-packages/mltc']
   >>>
   
   $ ls /root/miniconda3/envs/py310/lib/python3.10/site-packages/mltc/python/tools/dump_memory
   ci_compare.py  common.py  __init__.py  __pycache__  run_analysis.py  run_npu_data_analysis.py  run_perf_analysis.py  run_precision_analysis.py
   ```

2. 设置环境变量。

   使用`DUMP_MEMORY_PATH`设置dump数据存放的目录，用于存放dump模型执行过程中的数据，基于dump数据分析出的NPU/CPU数据，以及精度对比结果。

   > 注意：该设置在运行时会影响cycle数，可通过`unset DUMP_MEMORY_PATH`删除环境变量设置。

   ```Bash
   # 设置dump数据存放目录
   $ export DUMP_MEMORY_PATH=${dump_dir_name}
   # 示例
   $ export DUMP_MEMORY_PATH=~/data_dump/test_1
   ```

   > 注意：目标路径只能设置为**绝对路径**，且路径字符长度不超过50个字符。如果目标目录不存在，则会自动新建目录；如果目标目录已存在，则会自动**删除**整个目录后再自动新建。设置目录时，请多加注意。

3. 获取模型的NPU数据。

   编译并运行需要精度分析的网络模型用例，dump出NPU数据存放在`$DUMP_MEMORY_PATH/dump_data`文件夹中对应卡的文件夹下，单卡情况下数据只会dump到0文件夹中。多卡情况下dump出来的数据会放在对应的文件夹下，下图以两卡为例，0，1文件夹下分别存放着0卡和1卡dump出来的数据。

   ![mg](/_static/images/mltc-15.png)

   > 说明：具体模型示例可参考*使用示例章节*。

4. 获取模型的CPU数据。

   编写Python脚本，调用MLTC的`Simulator().run()`接口在CPU上部署模型获取dump数据。

   其中`--dump-dir`设置的路径为`DUMP_MEMORY_PATH`设置的目录下cpu文件夹路径并且为绝对路径。

   ```bash
   $ cat run_resnet34_cpu.py
   from mltc import Simulator
   Simulator().run("resnet34.mlir", "-i data.bin -o output.bin --dump-each-op-result --dump-dir=/root/data_dump/test_1/cpu")
   
   $ python3 run_resnet34_cpu.py
   ```

5. 运行工具中的NPU数据拼接脚本，对NPU数据进行拼接。

   ```Bash
   $ python3 run_npu_data_analysis.py
   ```

   运行后得到拼接后的NPU数据：

   ![mg](/_static/images/mltc-16.png)

6. 运行精度对比脚本，对比NPU和CPU数据。

   ```Bash
   $ python3 run_precision_analysis.py --ref_dtype="float32"
   ```

   其中，`run_precision_analysis.py`脚本，运行时可传入不同参数，获取不同结果文件。您可以使用`-h，--help`查看帮助信息中的可选参数，其中`--atol`、`--rtol`可设置阈值、`--show_graph`可获取错误节点的分析图，其他参数值不建议修改。

   可选参数说明：

   | **参数选项**            | **描述**                                                     | **是否建议修改** |
   | ----------------------- | ------------------------------------------------------------ | ---------------- |
   | -h，--help              | 显示帮助信息并退出。                                         | /                |
   | --ref_dtype             | 模型输入数据类型。                                           | 是               |
   | --cpu_dir               | CPU数据的存放目录。                                          | 否               |
   | --npu_dir               | NPU数据的存放目录。                                          | 否               |
   | --node_runtime_filename | 存放每个节点的运行时刻，主要用来排序。                       | 否               |
   | -op_config_name         | 每个节点的比较时候用的atol和rtol，默认是NA表示用全局的atol/rtol。特殊需求时使用。 | 否               |
   | --diff_cnt              | 最大导出的出错数据个数，默认值为128。                        | 否               |
   | --atol                  | 绝对误差阈值，默认值为0.005。脚本会根据绝对误差阈值的设置来统计误差超过该阈值的结果在全部结果中的占比。 | 是               |
   | --rtol                  | 相对误差阈值，默认值为0.2，范围在[0.0 ~ 1.0]。脚本会根据相对误差阈值的设置来统计误差超过该阈值的结果在全部结果中的占比。 | 是               |
   | --show_graph            | 是否显示所有错误节点的分析图，取值含义：<br />True：显示分析图。如果数据量大，绘图会比较耗时。<br/>False：默认值，不显示分析图。<br/>分析图包括以下类型：<br/>op_name\_diff.png ：错误数据对应的绝对误差和相对误差散点图。<br/>op_name\_diff_hist.png ： 相对误差和绝对误差的直方图分布。<br/>op_name\_hist.png：CPU和NPU数据的直方图分布。 | 是               |
   | --max_bins              | 直方图最大bin数，默认值为128。                               | 否               |
   | --min_bins              | 直方图最小bin数，默认值为1，范围为[1, max_bins]。            | 否               |
   | --max_cores             | 精度分析时用到最大核数，默认值为16。                         | 否               |
   | --map_node_dict         | 人为给定的参考节点与NPU节点映射dict，内容示例 ：？？？。映射关系唯一性和正确性需得到保证。 | 否               |
   | --force_compare         | 精度分析时，是否对shape不一致但size一致的节点进行分析，默认值为False。 | 否               |

### 使用示例

#### 获取精度

将以ResNet34网络为例，使用精度分析工具获取精度数据：

```Bash
# 设置dump数据存放目录
$ export DUMP_MEMORY_PATH=~/data_dump/test_1
# 模型转换成MLIR
$ mltc-tf -i data:16x224x224x3xf32 -t softmax/Softmax -s resnet34/resnet34.pb -o resnet34/resnet34.mlir
# 编译模型，示例可参考编译模型章节
$ python3 compile_resnet34.py
# 部署ResNet34模型，示例可参考在NPU上部署模型章节
$ python3 run_resnet34.py
# CPU数据获取，示例可参考在CPU上验证模型章节
$ python3 run_resnet34_cpu.py
# 运行精度分析工具中的NPU拼接脚本
$ cd /root/miniconda3/envs/py310/lib/python3.10/site-packages/mltc/python/tools/dump_memory
$ python3 run_npu_data_analysis.py
# 运行精度分析脚本
$ python3 run_precision_analysis.py --ref_dtype="float32"
```

最终对比结果生成在您指定的dump数据存放目录下，即设置的`DUMP_MEMORY_PATH`下，其中包含：

- cpu文件夹：主要保存的是获取网络模型在CPU上的数据。数据文件是按照实际网络模型中的节点名称来命名，将名称中的 “/” 替换成 “_”。
- dump_data文件夹：主要保存的是dump出来的16进制的数据。经过`run_npu_data_analysis.py`脚本转成二进制形式并进行数据拼接，最终输出到npu文件夹。
- npu文件夹：主要保存的是获取网络模型在NPU上的数据，命名规则与cpu文件夹中一样。
- result文件夹：主要保存的是最终对比分析结果。
  - skip_file_dict.csv：执行数据拼接前由于校验错误而被跳过的节点以及详细跳过信息。
  - compare_skip.log：执行CPU和NPU数据比对时被跳过的节点以及详细跳过信息。
  - cpu_vs_npu.csv：CPU和NPU数据比较结果分析表。
  - node_runtime.file：节点运行时序文件。
  - md5.csv：记录每个dump文件的md5值。
  - op_name.csv：以算子名称命名的错误算子的详细错误信息。

> 说明：结果文件具体说明可查看结果文件说明*章节*。

若`--show_grap`设为`True`，则在result文件夹下还会显示以算子名称命名的错误算子的分析图：

- op_name_diff.png：错误节点对应的绝对误差和相对误差散点图。
- op_name_diff_hist.png：相对误差和绝对误差的直方图分布。
- op_name_hist.png：CPU和NPU数据的直方图分布。

#### 分析结果

按照上述步骤获取精度后，分析误差节点的精度问题。

查看cpu_vs_npu.csv表中的节点误差。

![mg](/_static/images/mltc-17.png)

主要查看nan/inf、errors/total和cos_sim三列，分析精度问题：

- nan/inf列有数据显示True，说明出现过NaN或inf数据，可能存在精度问题。
- errors/total列不满足用户设置的相对误差和绝对误差的个数占比太大，可能存在现精度问题。
- cos_sim列数值小于0.95，可能存在精度问题。

> 说明：每一列数据的具体说明可查看*结果文件说明*章节。

若遇到csv文件中无法显示完整的大批量错误数据并且是按照index排列，无法确定哪一个节点误差较大。可自行对比cpu文件夹与npu文件夹中的数据文件，分析精度误差的原因。

> 注意：网络模型在cpu和npu上的数据格式，数据格式可能存在NHWC或NCHW。对比时如果CPU与NPU上的数据格式不一致，需要先使用transpose函数改变数据排布。

此外，若`--show_grap`设为`True`，可查看精度对比失败节点的分析图。

- 错误节点对应的绝对误差和相对误差散点图（op_name_diff.png）：
  
  ![mg](/_static/images/mltc-18.png)
- CPU和NPU数据的直方图分布（op_name_hist.png）：
  
  ![mg](/_static/images/mltc-19.png)
- 相对误差和绝对误差的直方图分布（op_name_diff_hist.png）：
  
  ![mg](/_static/images/mltc-20.png)

#### 结果文件说明

##### cpu_vs_npu.csv

文件描述：最终的精度对比分析结果文件。

![mg](/_static/images/mltc-21.png)

字段说明：

| **字段名**                            | **描述**                                                     |
| ------------------------------------- | ------------------------------------------------------------ |
| op_name                               | 网络中节点的名称（附带显示atol/rtol参数值）。                |
| nan/inf                               | NPU结果数据中是否出现过nan或inf数据（比较前nan会被转成0，inf会被转成最大值）。 |
| errors/total                          | 不满足用户设置的相对误差和绝对误差的个数/当前算子的总个数（单位：个）。 |
| cos_sim                               | NPU结果和CPU结果的余弦相似度，数据越大越好。                 |
| 1st_diff_offset/offset_dim/data_shape | 第一个数据错误的位置，对应的维度信息，数据shape信息。        |
| ref_value                             | 标准模型（TensorFlow模型、ONNX模型）第一个发生错误时的数据（目前仅保留小数点后6位有效数字），若当前算子均未发生精度对比失败，此时的值为算子输出的第一个数据。 |
| npu_value                             | 基于九章NPU框架的推理模型，第一个发生错误时的数据（目前仅保留小数点后6位有效数字），若当前算子均未发生精度对比失败，此时的值为算子输出的第一个数据。 |
| max_abs_err                           | 节点错误数据的最大绝对误差。                                 |
| mean_abs_err                          | 节点错误数据的平均绝对误差。                                 |
| max_abs_total                         | 节点数据的最大相对误差。                                     |
| mean_abs_total                        | 节点数据的平均相对误差。                                     |
| mean                                  | 参考数据（TensorFlow模型、ONNX模型的数据）的均值。           |
| std                                   | 参考数据（TensorFlow模型、ONNX模型的数据）的方差。           |
| rms                                   | 参考数据（TensorFlow模型、ONNX模型的数据）的均方根值（root mean square）。 |

##### op_name.csv

文件描述：精度对比失败算子详细信息。

![mg](/_static/images/mltc-22.png)

字段说明：

| **字段名**    | **说明**                      |
| ------------- | ----------------------------- |
| index         | 精度对比失败发生的索引号。    |
| std_value     | 标准模型相应索引位置的值。    |
| npu_value     | 九章NPU模型相应索引位置的值。 |
| abs_diff      | 绝对误差。                    |
| relative_diff | 相对误差。                    |

#### 误差类型及判断方法

NPU每个节点计算输出的误差可以分为两类：

- 计算错误：由硬件或软件Bug问题导致的错误。
- 累积精度误差：由于在NPU上采用FP16计算，相对于CPU上使用FP32计算存在精度损失，并且这个精度损失逐层累积造成的误差。

#### 其他精度问题

- CPU与NPU输出结果均存在NaN。
  
  当发现CPU与NPU运行出来的结果都存在NaN的问题时，可考虑网络模型本身的问题，可能存在模型中算子的参数不合法的情况。
- 可能是算子参数为inf，使得与其他数字相乘会出错，导致结果都是NaN，此时应考虑算子问题。
- 可能是模型输入不合适，例如输入中包含负数，而网络模型中存在Log这一类的算子，经过该节点是会出现计算错误，使得CPU和NPU的运行结果为NaN。
- CPU输出正常而NPU结果为NaN。
  
  当发现CPU的输出正常而NPU运行出来的结果为NaN的问题时，可考虑是算子参数导致，其表现是中间输出结果超FP16范围（65504），通常两个大数相乘或者除以一个极小的数时容易出现结果超出FP16范围问题（65504）。

#### 精度分析定位技巧

- 随机精度问题定位
  
  如果网络存在随机精度问题且在打开Dump Memory功能时也存在随机问题的情况下，可以用以下方法定位：
  
  将模型网络运行两遍，数据分别dump在两个不同的路径下，然后分别运行`run_npu_data_analysis.py`脚本，在脚本运行过程中，运行完下图中第一个进度条后就可停止，工具会计算每个dump文件的md5并记录在`result/md5.csv`文件中。
  
  ![mg](/_static/images/mltc-23.png)
  
  比较两个dump路径下的`result/md5.csv`文件就能知道那个节点的输出存在随机问题。
  
  此外可以观察md5值是否是变化，来判断网络是否存在随机精度问题。
  
  ![mg](/_static/images/mltc-24.png)
  
- 不跑stc-run进行精度分析
  
  在修改过程中可能会引入一些问题导致之前精度正确的网络出现精度错误问题，则可以通过以下方法加速定位：
  
  1. 分别获取精度正确和精度错误的网络的NPU上的数据，dump数据后使用`run_npu_data_analysis.py`脚本完成数据拼接。
  2. 将精度正确的网络Dump出来的放在npu文件夹下的所有NPU数据文件，拷贝到精度错误网络的cpu文件夹下，作为参考数据进行对比。
  3. 使用`run_precision_analysis.py`脚本对比数据。
  
  相比跑stc-run的优势在于，参考结果也是由NPU运行获取的，精度对比数据差异几乎没有，进而避免了查看精度分析结果时考虑FP16累加引入的不确定性。

### 常见问题

- stc-run运行失败问题

  目前stc-run支持的算子及支持的数据类型并不完善，在跑stc-run时可能遇到folder失败问题，正在完善修复中。

- 重复/丢失节点问题

  - 重复节点问题：
    
    PASS在Span传递过程中各种原因导致Span重名问题，导致dump出来的节点名称出现重复的现象，工具在分析过程中会报以下错误：
    
    ![mg](/_static/images/mltc-25.png)
    
  - 丢失节点问题：
    
    节点名重复导致信息不一致，会出现节点丢失的现象，工具在分析过程中中会报以下错误：
    
    ![mg](/_static/images/mltc-26.png)

  上述两个节点问题的错误日志会记录在`result/skip_file_dict.csv`，如下所示：

  ![mg](/_static/images/mltc-27.png)

- 多轮运行导致伪重复节点问题

  在获取大模型数据时只能跑单轮，多轮运行会导致Span重复问题。查看数据如何区分是不是多轮dump导致，可以通过以下方式，如果文件数多于1个，说明是跑多轮导致。

  ```Bash
  $ ls dump_data/0/0_map_name@0.*
  dump_data/0/0_map_name@0.011fda60_000001d2.dat dump_data/0/0_map_name@0.013fda60_000001d2.dat
  ```

- 不支持dump的算子

  -  数据拷贝类算子暂不支持dump功能，例如slice/concat/split等算子。

## 生成量化模型

量化工具可以对模型进行PTQ量化，量化工具能够直接支持的模型格式有ONNX、CAFFE，其他模型模型格式需先转成ONNX。

![mg](/_static/images/mltc-28.png)

> 说明：如果在GPU上使用工具，请安装CUDA 11.8版本、CUDA驱动（cuda-repo-ubuntu2004-12-1-local_12.1.0-530.30.02-1_amd64.deb）以及显卡。

### 执行步骤

以Bert128模型为例演示执行步骤：

1. 确保已经获取MLTC和量化工具文件安装包。

   安装MLTC时已包含量化工具脚本（auto_quant），量化工具依赖文件安装MLTC同级目录下的ppq文件中。

2. 配置YAML文件。

   根据网络的不同填写模型运行的基本参数，如果模型不是ONNX格式的需要做模型转换，内部提供了pb与pth模型的转化。量化策略与精度校准可以根据模型验证结果自行调节，找到合适当前网络的策略。

   以下是Bert128模型的YAML文件：

   ```Bash
   # ----------------------------------------------------------
   # 模型运行基本参数
   # ----------------------------------------------------------
   
   model_name: "bert_128"
   local_model_path: "./bert_128_tf.onnx"
   input_name: ["embedding_lookup:0","input_mask:0","one_hot:0"]
   input_shape: [[1024,768],[8,1,128],[1024,2]]
   input_dtype: ["torch.float32", "torch.float32", "torch.float32"]
   batch_size: 64
   output_node: "loss/Softmax:0"
   # ----------------------------------------------------------
   # 模型转为onnx
   # ----------------------------------------------------------
   
   # 是否需要转化为ONNX模型，True：若输入模型不是onnx,需要转换 False：不需要转换
   is_translate: False
   # 提供两种模型的转换：pb, pth
   model_type: "onnx"
   onnx_target_file: "./bert_128.onnx"
   
   # ----------------------------------------------------------
   # 模型输入数据
   # ----------------------------------------------------------
   
   # 输入是否已经经过预处理，True: 已经过预处理，可从本地直接读取， False: 未经过预处理，需要添加预处理函数，返回模型输入数据
   input_preprocess: False
   # 已预处理后的数据，可以直接输入模型运行
   # 提供两种文件读取：npy, bin
   # 默认文件命名格式：file_path+file_name+index+file_type
   #                 ./bert128_datasets/embedding_look_up_0.npy
   dataset:
         file_type: "npy"
         file_path: "./bert128_dataset/"
         file_name: ["embedding_lookup_","input_mask_","one_hot_"]
   
   # 未预处理的数据，请修改预处理脚本文件，提供校准数据，8-256组即可
   # def pre_process(config:dict, data_num:int) -> List[{inputname_0:tensor,inputname_1:tensor},...]:
   #    ...
   # 预处理脚本文件名
   pre_process: "pre_process"
   file_list: []
   
   # ----------------------------------------------------------
   # 量化策略, 目前在NPUv1上可以改动的有限 
   # ----------------------------------------------------------
   
   # 量化总开关 
   do_quantize: true
   target_file: "./bert128_quant.onnx"
   
   # 参数可选项：
   #        calibrate: kl, minmax, percentile, mse
   #        round: ROUND_TOWARDS_ZERO, ROUND_HALF_EVEN
   #        policy: PerTensor, PerChannel
   #        # 按照哪个轴做per_channel 开启PerChannel时需要指定，PerTensor不可包含这条属性
   #        channel_axis: -2, -1, 0, 1
   #        Symmetric: true, false(open asymmetric)
   conv:
     activation:
       calibrate: "kl"
       round: "ROUND_TOWARDS_ZERO"
       policy: "PerTensor"
       Symmetric: true
     parameter:
       calibrate: "minmax" 
       round: "ROUND_HALF_EVEN"
       policy: "PerChannel"
       Symmetric: true
       channel_axis: 0
   
   matmul:
     activation:
       calibrate: "kl"
       round: "ROUND_TOWARDS_ZERO"
       policy: "PerTensor"
       Symmetric: true
     parameter:
       calibrate: "minmax" 
       round: "ROUND_HALF_EVEN"
       policy: "PerChannel"
       Symmetric: true
       channel_axis: 1
   
   # ----------------------------------------------------------
   # 量化精度校准选项，不改变量化策略的情况下，主要通过关闭量化误差
   # 较大的算子来提高精度
   # ----------------------------------------------------------
   
   # 总开关————是否开启关闭算子来提高量化精度
   close_op: true
   # 关闭误差最大的算子数量
   close_op_num: 0
   # 关闭量化精度小于阈值的所有算子，close_op_num为0时生效
   close_value: 0.999
   # 关闭指定算子，填入算子名称
   close_op_name: []
   
   # 寻找最优激活校准方式
   activate_calib_algo: false
   
   # ----------------------------------------------------------
   # 模型精度验证方式
   # ----------------------------------------------------------
   
   # ppq验证模型精度标志，开启时不进行激活函数————gelu融合
   test_flag: true
   # 验证模型精度脚本
   # def quantonnxrun(config:dict):
   #    ...
   # 验证模型精度脚本文件名
   test_run: test_run
   # 验证数据组数
   test_num: 5
   atol: 0.04
   rtol: 0.01
   
   # 模型运行设备（cpu、cuda）
   device: cpu
   ```

   输入数据如果未经过预处理，需要添加预处理函数，并在YAML文件中标明预处理脚本。Bert128的预处理脚本可参考代码示例中的`pre_process.py`。已经做好了预处理的数据不一定适合所有场景，所以为了量化效果更加完善，建议用户选取自己需要的校准集来进行网络量化。

   ```YAML
   # 输入是否已经经过预处理，true: 已经过预处理，可从本地直接读取， False: 未经过预处理，需要添加预处理函数，返回模型输入数据
   input_preprocess: False
   # 已预处理后的数据，可以直接输入模型运行
   # 提供两种文件读取：npy, bin
   # 默认文件命名格式：file_path+file_name+index+file_type
   #                 ./bert128_datasets/embedding_look_up_0.npy
   dataset:
         file_type: "npy"
         file_path: "./bert128_dataset/"
         file_name: ["embedding_lookup_","input_mask_","one_hot_"]
   
   # 未预处理的数据，请修改预处理脚本文件，提供校准数据，8-256组即可
   # def pre_process(config:dict, data_num:int) -> List[{inputname_0:tensor,inputname_1:tensor},...]:
   #    ...
   # 预处理脚本文件名
   pre_process: "pre_process"
   file_list: []
   ```

   对精度有要求的模型，可接入结构的后处理，添加结果对比代码，并在YAML文件中标明预处理脚本。Bert128的验证模型精度脚本可参考代码示例中的`test_tun.py`。

   原始模型与量化后的模型都会运行，可对它们的结果进行比较，得到精度对比结果。不同网络的验证模型精度脚本需要根据用户自己对网络的结果评判标准自己构建代码。

   > 说明：测试模块使用的是ONNX Runtime运行，不能含有ONNX Runtime无法运行的算子。

   ```YAML
   # ----------------------------------------------------------
   # 模型精度验证方式
   # ----------------------------------------------------------
   
   # ppq验证模型精度标志，开启时不进行激活函数————gelu融合
   test_flag: true
   # 验证模型精度脚本
   # def quantonnxrun(config:dict):
   #    ...
   # 验证模型精度脚本文件名
   test_run: test_run
   # 验证数据组数
   test_num: 5
   atol: 0.04
   rtol: 0.01
   ```

   > 说明：配置的YMAL文件、数据预处理脚本和验证精度脚本需放在同一目录下。

3. 启动量化命令，生成量化后模型和模型参数。

   ```Bash
   $ cd bert128
   $ ls
   bert128_dataset  bert_128_tf.onnx  default_config.yaml  pre_process.py  test_run.py
   $ auto_quant --config default_config.yaml
   ```

4. 将量化后的模型和分离的模型参数一起放到NPU上使用MLTC编译运行。具体编译运行方式可参考编译模型和部署模型章节。

### 代码示例

Bert128模型预处理脚本（pre_process.py），请自行准备好Bert128的数据集和Bert128的ONNX模型。

```Python
import torch
import numpy as np
import os
from minio import Minio
from utilities.utils import pull_from_minio


def pre_process(config: dict, data_num: int = 64) -> list:
    """model preprocessed data

    Args:
        filelist (list, optional): input file list. Defaults to [].
        data_num (int, optional): output data number.  Return the number of date.

    Returns:
        dict: model input data
    """

    result = []
    # code ...
    current_dir = config["local_model_path"]
    BATCH_SIZE = data_num
    INPUT_NAME = config["input_name"]

    if config["dataset"]["file_type"] == "npy":
        result = [
            {
                INPUT_NAME[x]: torch.from_numpy(
                    np.load(config["dataset"]["file_path"] + config["dataset"]["file_name"][x] + str(idx) + ".npy")
                ).to(torch.float32)
                for x in range(len(INPUT_NAME))
            }
            for idx in range(BATCH_SIZE)
        ]
    elif config["dataset"]["file_type"] == "bin":
        result = [
            {
                INPUT_NAME[x]: torch.load(
                    np.load(config["dataset"]["file_path"] + config["dataset"]["file_name"][x] + str(idx) + ".bin")
                ).to(torch.float32)
                for x in range(len(INPUT_NAME))
            }
            for idx in range(BATCH_SIZE)
        ]
    else:
        raise ("not support data  file type")
    """result type

    Returns:
        result = [
            {
                "input_name1": data1,
                "input_name2": data2
            },
            {
                "input_name1": data3,
                "input_name2": data4
            },...
        ]
    data type-----> tensor of torch
    """
    config["input_preprocess"] = True
    return result
```

Bert128模型验证精度脚本（test_run.py）

```Python
import onnxruntime
import torch
import os
import math
import numpy as np
import importlib
import torch.nn.functional as Fun
import matplotlib.pyplot as plt


def compare(result, ref, atol=0.005, rtol=2, accumulate=1):
    """compare"""
    if len(result) != len(ref):
        raise RuntimeError(f"result length:{len(result)} is not equal to gold data length: {len(ref)}")
    atol = max(atol, atol / 50 * accumulate)
    rtol = int(rtol * np.sqrt(accumulate * 2))
    # print(f"Comparing result using atol={atol}, rtol={rtol}")

    result_int = np.copy(result)
    result_int.dtype = "int16"
    ref_int = np.copy(ref)
    ref_int.dtype = "int16"

    mismatch = 0
    max_abs_diff = 0.0
    max_rel_diff = 0
    abs_diff_list = []
    rel_diff_list = []

    all_mismatch = []
    for i, _ in enumerate(result):
        abs_diff = abs(result[i] - ref[i])
        rel_diff = abs(result_int[i] - ref_int[i])
        abs_diff_list.append(abs_diff)
        rel_diff_list.append(rel_diff)
        if abs_diff > max_abs_diff:
            max_abs_diff = abs_diff
        if rel_diff > max_rel_diff:
            max_rel_diff = rel_diff
        if abs_diff > atol and rel_diff > rtol:
            all_mismatch.append((i, abs_diff, rel_diff))
            mismatch += 1

    # if len(abs_diff_list) > 0:
    #     print("mean absolute diff: {}".format(sum(abs_diff_list) / len(abs_diff_list)))
    # else:
    #     print("mean absolute diff: 0.0")
    # if len(rel_diff_list) > 0:
    #     print("mean relative diff: {}".format(sum(rel_diff_list) / len(rel_diff_list)))
    # else:
    #     print("mean relative diff: 0.0")
    if mismatch != 0:
        # print(
        #     f"Failed: {mismatch}/{len(result)} mismatch,"
        #     f"max absolute diff: {max_abs_diff}, max relative diff: {max_rel_diff}"
        # )
        n = min(10, mismatch)

        def show_mismatch(n, idx, msg):
            mismatches = sorted(all_mismatch, key=lambda x: x[idx], reverse=True)[:n]
            for item in mismatches:
                i = item[0]
                # print(
                #     f"{msg} mismatch: out[{i}] = {result[i]}({result_int[i]}),"
                #     f"ref[{i}] = {ref[i]}({ref_int[i]}), atol={item[1]}, rtol={item[2]}",
                #     flush=True,
                # )

        # print(f"\n---------- top {n} max abs mismatches ----------")
        show_mismatch(n, 1, "abs")
        # print(f"\n---------- top {n} max rel mismatches ----------")
        show_mismatch(n, 2, "rel")
        return False
    # print(
    #     f"Success: {mismatch}/{len(result)} mismatch,"
    #     f"max absolute diff: {max_abs_diff}, max relative diff: {max_rel_diff}"
    # )
    # print("Succeed")
    return True


def result_process(test_num, label_path, tf_position_path, tf_prob_path):
    label = np.loadtxt(label_path)
    tc = np.loadtxt("./model_zoo/quant_argmax.txt")
    tc_prob = np.loadtxt("./model_zoo/quant_prob.txt")
    tf = np.loadtxt(tf_position_path)
    tf_prob = np.loadtxt(tf_prob_path)
    equal_size = 0
    for i in range(0, test_num):
        if label[i] == tc[i]:
            equal_size += 1
    print("tc true_label_accuracy: ", equal_size, equal_size / test_num)
    equal_size = 0
    for i in range(0, test_num):
        if label[i] == tf[i]:
            equal_size += 1
    print("tf true_label_accuracy: ", equal_size, equal_size / test_num)
    # tf_label_accuracy
    equal_size = 0
    for i in range(0, test_num):
        if tf[i] == tc[i]:
            equal_size += 1
    print("tf_label_accuracy: ", equal_size, equal_size / test_num)
    # max_abs_diff
    max_diff = 0
    total_diff = 0
    abs_diff_list = []
    for i in range(0, test_num):
        cur_diff = abs(tf_prob[i][int(tf[i])] - tc_prob[i][int(tf[i])])
        abs_diff_list.append(cur_diff)
        total_diff += cur_diff
        if cur_diff > max_diff:
            max_diff = cur_diff
    print("max_abs_diff: ", max_diff)
    # mean_abs_diff
    mean_diff = total_diff / test_num
    print("mean_abs_diff: ", mean_diff)

    plt.hist(abs_diff_list, bins=100, density=False, histtype="bar")
    plt.title("Histogram of absolute error, samples 10570")
    plt.savefig("cmp.png")
    # std_abs_diff
    acc_diff = 0
    for i in range(0, test_num):
        cur_diff = abs(tf_prob[i][int(tf[i])] - tc_prob[i][int(tf[i])])
        std_diff = (cur_diff - mean_diff) * (cur_diff - mean_diff)
        acc_diff += std_diff
    print("std_abs_diff: ", math.sqrt(acc_diff) / (test_num - 1))
    # max_rel_diff
    tf_prob_int = np.copy(tf_prob)
    tf_prob_int.dtype = "int16"
    tc_prob_int = np.copy(tc_prob)
    tc_prob_int.dtype = "int16"

    total_rel_diff = 0
    max_rel_diff = 0
    for i in range(0, test_num):
        cur_rel_diff = abs(int(tf_prob_int[i][int(tf[i])]) - int(tc_prob_int[i][int(tf[i])]))
        total_rel_diff += cur_rel_diff
        if cur_rel_diff > max_rel_diff:
            max_rel_diff = cur_rel_diff
    print("max_rel_diff: ", max_rel_diff)

    # mean_rel_diff
    mean_rel_diff = total_rel_diff / test_num
    print("mean_rel_diff: ", mean_rel_diff)
    # std _rel_diff
    acc_rel_diff = 0
    for i in range(0, test_num):
        cur_rel_diff = abs(int(tf_prob_int[i][int(tf[i])]) - int(tc_prob_int[i][int(tf[i])]))
        std_rel_diff = (cur_rel_diff - mean_rel_diff) * (cur_rel_diff - mean_rel_diff)
        acc_rel_diff += std_rel_diff
    print("std_rel_diff: ", math.sqrt(acc_rel_diff) / (test_num - 1))


def quantonnxrun(config: dict):
    module_name = config["pre_process"]
    module = importlib.import_module(module_name)
    pre_process = getattr(module, "pre_process")
    test_num = config["test_num"]
    input_name = config["input_name"]
    if config["input_preprocess"]:
        if config["dataset"]["file_type"] == "npy":
            dataset = [
                {
                    input_name[x]: np.load(
                        config["dataset"]["file_path"] + config["dataset"]["file_name"][x] + str(idx) + ".npy"
                    ).astype(np.float32)
                    for x in range(len(input_name))
                }
                for idx in range(test_num)
            ]
        elif config["dataset"]["file_type"] == "bin":
            dataset = [
                {
                    input_name[x]: np.load(
                        config["dataset"]["file_path"] + config["dataset"]["file_name"][x] + str(idx) + ".bin"
                    ).astype(np.float32)
                    for x in range(len(input_name))
                }
                for idx in range(test_num)
            ]
        else:
            raise ("not support data  file type")
    else:
        dataset = pre_process(config, test_num)

        for idx in range(test_num):
            for x in range(len(input_name)):
                if not torch.is_tensor(dataset[idx][input_name[x]]):
                    raise TypeError("data type is not torch")
                else:
                    dataset[idx][input_name[x]] = dataset[idx][input_name[x]].numpy()
    onnx_run = onnxruntime.InferenceSession(config["local_model_path"], providers=onnxruntime.get_available_providers())
    onnx_outputs = [onnx_run.run([config["output_node"]], dataset[idx]) for idx in range(test_num)]

    quant_run = onnxruntime.InferenceSession(config["target_file"], providers=onnxruntime.get_available_providers())
    quant_outputs = [quant_run.run([config["output_node"]], dataset[idx]) for idx in range(test_num)]

    # you can modify the following code to achieve accuracy comparison
    pass_count = 0
    pos_count = 0
    for idx in range(test_num):
        golden = onnx_outputs[idx][0]
        quant = quant_outputs[idx][0]
        position_quant = np.argmax(quant, axis=1)
        position_golden = np.argmax(golden, axis=1)
        for x in range(8):
            ret = compare(quant[x], golden[x], atol=config["atol"], rtol=config["rtol"])
            if ret:
                pass_count += 1
            if position_golden[x] == position_quant[x]:
                pos_count += 1

        print("quant::", idx, quant)
        print("golden::", idx, golden)
    print("pass_count:", pass_count, "\t pass_rate:", "%.2f%%" % (pass_count / (8 * test_num) * 100))
    print("position_count:", pos_count, "\t pass_rate:", "%.2f%%" % (pos_count / (8 * test_num) * 100))
```
