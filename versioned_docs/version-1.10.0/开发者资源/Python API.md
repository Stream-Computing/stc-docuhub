# Python API

## MLTC API

### 调用要求

调用MLTC的API时，请确保：

* 已进入符合要求的Python环境，且已安装MLTC。具体要求和操作，请参见STCRP安装指南。

* 在代码文件中导入所需的模块，包括但不限于：

  ```python
  import mltc
  ```

### TfToStc().run()

接口描述：转换传入的TensorFlow模型为MLTC自定义的图层IR。

接口定义：

```Python
def run(self, input_file: str, output_file: str, input_info: str, output_name: str = "", ymlconfig: str = "", external_bin=False, dump=False):
```

参数说明：

| **参数**     | **类型** | **是否必选** | **描述**                                                 |
| ------------ | -------- | ------------ | -------------------------------------------------------- |
| input_file   | string   | 是           | 需要转换的TensorFlow模型路径。                           |
| output_file  | string   | 是           | 输出转换后的MLIR文件或者fatbin文件。                     |
| input_inf    | string   | 是           | 转换模型配置参数，具体参数说明可参考下方的转换配置参数。 |
| output_name  | string   | 否           | 输出节点名称。                                           |
| ymlconfig    | string   | 否           | 配置文件路径。                                           |
| external_bin | boolean  | 否           | 是否将模型权重额外保存。                                 |
| dump         | boolean  | 否           | 是否需要生成中间编译IR文件。                             |

转换配置参数如下：

| **参数选项**                                                 | **描述**                                                     | **是否必选** |
| ------------------------------------------------------------ | ------------------------------------------------------------ | ------------ |
| `-i <name0>:<dim0>x<dim1>x<datatype>,<name1>:<dim0>x<dim1>x<datatype>` | 通过该参数指定模型输入节点的名字和shape。<br/>目前支持的datatype和对应的简写：<br/>FLOAT64：f64 <br/>FLOAT32：f32<br/>FLOAT16：f16<br/>INT64：i64<br/>INT32：i32<br/>INT16：i16<br/>INT8：i8<br/>UINT64：ui64<br/>UINT32：ui32<br/>UINT16：ui16<br/>UINT8：ui8 | 是           |
| `-s`                                                         | 指定该参数后，编译时会输出STC IR文件。                       | 否           |
| `-t <string>`                                                | 通过该参数指定模型输出节点的名字。                           | 是           |
| `-o <filename>`                                              | 通过该参数指定输出对应的MLIR文件或者fatbin文件。             | 是           |
| `-e`                                                         | 指定该参数后，编译时会保存常量数据到额外的bin文件中。        | 否           |

返回值：

无

调用示例：

```Python
from mltc import TfToStc
TfToStc().run("deepfm.pb", "deepfm_stc.mlir", "feat_index:1024x39xi32,feat_value:1024x39xf32 -s", "Sigmoid")
```

### OnnxToStc().run()

接口描述：转换传入的ONNX模型为MLTC自定义的图层IR。

接口定义：

```Python
def run(self, inputfile: str, outputfile: str, constpath: str = "", runargs: str = ""):
```

参数说明：

| **参数**     | **类型** | **是否必选** | **描述**                                                 |
| ------------ | -------- | ------------ | -------------------------------------------------------- |
| `inputfile`  | string   | 是           | 需要转换的ONNX模型路径。                                 |
| `outputfile` | string   | 是           | 输出转换后的MLIR文件或者fatbin文件。                     |
| `constpath`  | string   | 否           | 编译参数。                                               |
| `runargs`    | string   | 否           | 转换模型配置参数，具体参数说明可参考下方的转换配置参数。 |

转换配置参数如下：

| **参数选项**                                     | **描述**                                                 | **是否必选** |
| ------------------------------------------------ | -------------------------------------------------------- | ------------ |
| `-i <name0>:<dim0>x<dim1>,<name1>:<dim0>x<dim1>` | 通过该参数指定模型输入节点的名字和shape。                | 是           |
| `-s`                                             | 指定该参数后，编译时会输出STC IR文件。                   | 是           |
| `-v <name0>:<value0>,<name1>:<value1>`           | 通过该参数指定模型输入节点的值。                         | 否           |
| `-o <filename>`                                  | 通过该参数指定输出对应的MLIR文件或者fatbin文件。         | 是           |
| `-e`                                             | 指定该参数后，编译时会保存常量到外部的bin文件中。        | 否           |
| `--dump`                                         | 指定该参数后，编译时会生成中间编译IR文件。               | 否           |
| `--close-const-fold`                             | 关闭常量折叠。量化模型转换时需要使用该参数关闭常量折叠。 | 否           |

返回值：

无

调用示例：

```Python
from mltc import OnnxToStc
OnnxToStc().run(input_file,mlir_file , "./mlir_files/resnet18_stc_const_data", "-i input.1:1x3x224x224 -e")
```

### optimize()

接口描述：转换传入的Torch模型。

接口定义：

```Python
def optimize(model, args, model_name, input_names, output_names, op_black_list=None, use_cache=True, cache_dir="torch_mltc"):
```

参数说明：

| **参数**        | **类型**        | **是否必选** | **描述**                                                 |
| --------------- | --------------- | ------------ | -------------------------------------------------------- |
| `model`         | torch.nn.Module | 是           | 原始的Torch模型，建议调用eval() 。                       |
| `args`          | tuple           | 是           | 模型的Dummy输入。                                        |
| `model_name`    | string          | 是           | 模型的名字，用来保存在cache路径，避免重复编译。          |
| `input_names`   | string          | 是           | 模型的输入名字。                                         |
| `output_names`  | string          | 是           | 模型的输出名字。                                         |
| `op_black_list` | list            | 否           | NPU不支持的算子列表。                                    |
| `use_cache`     | boolean         | 否           | 是否使用cache路径里已经编译过的nn.Module，默认值为True。 |
| `cache_dir`     | string          | 否           | cache 路径，默认值为`torch_mltc`。                       |

返回值：

| **类型**        | **描述**            |
| --------------- | ------------------- |
| torch.nn.Module | 转换后的Torch模型。 |

调用示例：

```Python
from mltc import optimize
optimized_model = optimize(
    TestModule().eval(),
    (input,),
    model_name=model.__class__.__name__,  # use a new name for new input shapes
    input_names=["input"],
    output_names=["output0", "output1"],
    op_black_list=["mylib.numpy_sin.default"],
    use_cache=False,
    cache_dir="torch_mltc",
    )
```

### Compiler().compile()

接口描述：编译传入的模型MLIR文件。

接口定义：

```Python
def compile(self, inputfiles: Union[str, List[str]], outputfile: str, compileargs: compileargs: Union[str, List[str]] = ""):
```

参数说明：

| **参数**      | **类型**               | **是否必选** | **描述**                                                     |
| ------------- | ---------------------- | ------------ | ------------------------------------------------------------ |
| `inputfiles`  | string或list of string | 是           | 模型的MLIR文件名。例如：test.mlir。<br/>在静态多版本中，也可包含多个MLIR文件名。例如：["test_shape_1.mlir", "test_shape_2.mlir"]。 |
| `outputfile`  | string                 | 是           | 输出的模型vmfb文件名，只会有一个输出文件。例如：test.vmfb。  |
| `compileargs` | string或list of string | 是           | 编译参数。当数据类型为string时，多个参数之间使用空格隔开。例如："--dump-ir-after-all --dump-ir-before-all"。也可将多个参数组成list，例如： ["--dump-ir-after-all", "--dump-ir-before-all"]。 |

编译参数说明：

| **参数选项**                     | **描述**                                                     | **是否必选** |
| -------------------------------- | ------------------------------------------------------------ | ------------ |
| `--arch`                         | 针对指定的npu架构。<br/>- npu-v1 （默认值）<br/>- npu-v2     | 否           |
| `--high-precision`               | 是否启用高精度模式，用matmul_vme代替matmul进行高精度矩阵乘法，使用牛顿迭代提升超越函数精度（损失性能），某些需要更高计算精度的算子也在此处控制。<br/>- True：打开高精度模式。<br/>- False（默认值）：关闭高精度模式。 | 否           |
| `--bisection-reduce`             | 是否reduceSum启用二分法。<br/>- True：reduceSum启用二分法。<br/>- False（默认值）：reduceSum不启用二分法。 | 否           |
| `--bisection-matmul`             | 是否matmul启用二分法。<br/>- True：matmul启用二分法。<br/>- False（默认值）：matmul不启用二分法。 | 否           |
| `--dump-ir-after-all`            | 是否输出每个pass处理之后的IR。<br/>- True：输出每个pass处理之后的IR。<br/>- False（默认值）：不输出每个pass处理之后的IR。 | 否           |
| `--dump-ir-before-all`           | 是否输出每个pass处理之前的IR。<br/>- True：输出每个pass处理之前的IR。<br/>- False（默认值）：不输出每个pass处理之前的IR。 | 否           |
| `--dump-ir-clean-mode`           | 是否打印IR简洁信息。<br/>- True（默认值）：打印IR简洁信息，省略模型权重数据。<br/>- False：打印IR信息，会以16进制显示模型权重数据，IR文件会较大。 | 否           |
| `--enable-merge-attention`       | 是否将matmul替换为matmul_batchinner，matmul_batchinner优化了attention的计算过程。<br/>- True（默认值）：将matmul替换为matmul_batchinner。<br/>- False：不将matmul替换为matmul_batchinner。 | 否           |
| `--graph-partition-factor=<Num>` | Num的取值数据类型为Int8。<br/>- 当Num=1时：默认值，不开启graph partition。<br/>- 当Num>1时：开启graph partition，切分出N个dispatch.workgroup。 | 否           |
| `--attention-shrink-factor`      | 设置attention Q*K计算过程的缩小系数，缩小Qweight并不影响性能。默认值为1.0，数据类型为FLOAT。 | 否           |
| `--pipeline-partition-factor`    | 设置每个Pipeline Parallism Stage与它的Graph Partition Factor。例如，设置值为[4,4]，代表两个Pipeline Parallism Stage，并且它的Graph Partition Factor分别为4。默认值为[]，数据类型为list[int]。 | 否           |
| `--pipeline-partition-file`      | 指定Pipeline Parallism切分节点的输入文件路径。与`--pipeline-partition-factor`组合使用，用于指定切分方案。默认值为""，数据类型为String。 | 否           |
| `--manual-partition-file`        | 指定手动图分组的配置文件的绝对路径。                         | 否           |

返回值：

无

调用示例：

```Python
from mltc import Compiler
Compiler().compile("deepfm_stc.mlir", "deepfm.vmfb", "-arch=npu-v1")
```

### Executor().run()

接口描述：部署传入的模型vmfb文件。

接口定义：

```Python
def run(self, inputs: dict):
```

参数说明：

| **参数** | **类型** | **是否必选** | **描述**       |
| -------- | -------- | ------------ | -------------- |
| `inputs` | dict     | 是           | 模型输入数据。 |

返回值：

| **类型** | **描述**       |
| -------- | -------------- |
| `dict`   | 模型输出数据。 |

调用示例：

```Python
from mltc import Executor
output = Executor("./deepfm.vmfb").run(input_data)
```

### Simulator().run()

接口描述：MLTC前端工具转换后的模型部署到CPU上。

接口定义：

```Python
def run(self, inputfile: str, runargs: str = ""):
```

参数说明：

| **参数**    | **类型** | **是否必选** | **描述**                                                     |
| ----------- | -------- | ------------ | ------------------------------------------------------------ |
| `inputfile` | string   | 是           | 经过MLTC前端转换工具后的模型MLIR文件。例如：test.mlir。      |
| `runargs`   | string   | 是           | 运行参数。多个参数之间使用空格隔开。例如："-i data.bin -o output.bin"。 |

运行参数说明：

| **参数选项**            | **描述**                   | **是否必选** |
| ----------------------- | -------------------------- | ------------ |
| `-i`                    | 模型输入数据文件。         | 是           |
| `-o`                    | 模型输出数据文件。         | 是           |
| `--dump-each-op-result` | dump出每个op的结果。       | 否           |
| `--dump-dir`            | dump出来的数据的保存路径。 | 否           |

返回值：

无

调用示例：

```Python
from mltc import Simulator
Simulator().run("resnet34.mlir", "-i data.bin -o output.bin --dump-each-op-result --dump-dir=~/data_dump/cpu")
```
