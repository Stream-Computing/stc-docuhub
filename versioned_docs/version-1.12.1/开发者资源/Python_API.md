# Python API



## MLTC API

### 调用要求

调用MLTC的API时，请确保：

* 已进入符合要求的Python环境，且已安装MLTC。具体要求和操作，请参见[STCRP安装指南](https://docs.streamcomputing.com/_/sharing/vSxLMI20nalGphdpXdEVoDg6JkUcfEkT?next=/zh/latest/)。

* 在代码文件中导入所需的模块，包括但不限于：

  ```python
  import mltc
  ```

### TfToStc().run()

接口描述：转换传入的TensorFlow模型为MLTC自定义的图层IR。

接口定义：

```python
def run(self, input_file: str, output_file: str, input_info: str, output_name: str = "", ymlconfig: str = "", external_bin=False, dump=False):
```

参数说明：

| **参数**        | **类型**  | **是否必选** | **描述**                       |
| ------------- | ------- | -------- | ---------------------------- |
| input_file   | string  | 是        | 需要转换的TensorFlow模型路径。         |
| output_file  | string  | 是        | 输出转换后的MLIR文件或者fatbin文件。      |
| input_inf    | string  | 是        | 转换模型配置参数，具体参数说明可参考下方的转换配置参数。 |
| output_name  | string  | 否        | 输出节点名称。                      |
| ymlconfig     | string  | 否        | 配置文件路径。                      |
| external_bin | boolean | 否        | 是否将模型权重额外保存。                 |
| dump          | boolean | 否        | 是否需要生成中间编译IR文件。              |

转换配置参数如下：

<table>
<thead>
<tr>
<th><strong>参数选项</strong></th>
<th><strong>描述</strong></th>
<th><strong>是否必选</strong></th>
</tr>
</thead>
<tbody>
<tr>
<td>-i &#123;name0&#125;:&#123;dim0&#125;x&#123;dim1&#125;x&#123;datatype&#125;,&#123;name1&#125;:&#123;dim0&#125;x&#123;dim1&#125;x&#123;datatype&#125;<br /></td>
<td>通过该参数指定模型输入节点的名字和shape。目前支持的datatype和对应的简写：<ul> <li>FLOAT64：f64 </li> <li>FLOAT32：f32</li> <li>FLOAT16：f16</li> <li>INT64：i64</li> <li>INT32：i32</li> <li>INT16：i16</li> <li>INT8：i8</li> <li>UINT64：ui64</li> <li>UINT32：ui32</li> <li>UINT16：ui16</li> <li>UINT8：ui8</li> </ul></td>
<td>是</td>
</tr>
<tr>
<td>-s</td>
<td>指定该参数后，编译时会输出STC IR文件。</td>
<td>否</td>
</tr>
<tr>
<td>-t &#123;string&#125;</td>
<td>通过该参数指定模型输出节点的名字。</td>
<td>是</td>
</tr>
<tr>
<td>-o &#123;filename&#125;</td>
<td>通过该参数指定输出对应的MLIR文件或者fatbin文件。</td>
<td>是</td>
</tr>
<tr>
<td>-e</td>
<td>指定该参数后，编译时会保存常量数据到额外的bin文件中。</td>
<td>否</td>
</tr>
</tbody>
</table>

返回值：

无

调用示例：

```python
from mltc import TfToStc
TfToStc().run("deepfm.pb", "deepfm_stc.mlir", "feat_index:1024x39xi32,feat_value:1024x39xf32 -s", "Sigmoid")
```

### OnnxToStc().run()

接口描述：转换传入的ONNX模型为MLTC自定义的图层IR。

接口定义：

```python
def run(self, inputfile: str, outputfile: str, constpath: str = "", runargs: str = ""):
```

参数说明：

| **参数**     | **类型** | **是否必选** | **描述**                       |
| ---------- | ------ | -------- | ---------------------------- |
| inputfile  | string | 是        | 需要转换的ONNX模型路径。               |
| outputfile | string | 是        | 输出转换后的MLIR文件或者fatbin文件。      |
| constpath  | string | 否        | 编译参数。                        |
| runargs    | string | 否        | 转换模型配置参数，具体参数说明可参考下方的转换配置参数。 |

转换配置参数如下：

| **参数选项**                                         | **描述**                        | **是否必选** |
| ------------------------------------------------ | ----------------------------- | -------- |
| `-i {name0}:{dim0}x{dim1},{name1}:{dim0}x{dim1}` | 通过该参数指定模型输入节点的名字和shape。       | 是        |
| `-s`                                             | 指定该参数后，编译时会输出STC IR文件。        | 是        |
| `-v {name0}:{value0},{name1}:{value1}`           | 通过该参数指定模型输入节点的值。              | 否        |
| `-o {filename}`                                  | 通过该参数指定输出对应的MLIR文件或者fatbin文件。 | 是        |
| `-e`                                             | 指定该参数后，编译时会保存常量到外部的bin文件中。    | 否        |
| `--dump`                                         | 指定该参数后，编译时会生成中间编译IR文件。        | 否        |
| `--close-const-fold`                             | 关闭常量折叠。量化模型转换时需要使用该参数关闭常量折叠。  | 否        |

返回值：

无

调用示例：

```python
from mltc import OnnxToStc
OnnxToStc().run(input_file,mlir_file , "./mlir_files/resnet18_stc_const_data", "-i input.1:1x3x224x224 -e")
```

### optimize()

接口描述：转换传入的Torch模型。

接口定义：

```python
def optimize(model, args, model_name, input_names, output_names, op_black_list=None, use_cache=True, cache_dir="torch_mltc"):
```

参数说明：

| **参数**          | **类型**          | **是否必选** | **描述**                                |
| --------------- | --------------- | -------- | ------------------------------------- |
| model           | torch.nn.Module | 是        | 原始的Torch模型，建议调用eval() 。               |
| args            | tuple           | 是        | 模型的Dummy输入。                           |
| model_name     | string          | 是        | 模型的名字，用来保存在cache路径，避免重复编译。            |
| input_names    | string          | 是        | 模型的输入名字。                              |
| output_names   | string          | 是        | 模型的输出名字。                              |
| op_black_list | list            | 否        | NPU不支持的算子列表。                          |
| use_cache      | boolean         | 否        | 是否使用cache路径里已经编译过的nn.Module，默认值为True。 |
| cache_dir      | string          | 否        | cache 路径，默认值为`torch_mltc`。            |

返回值：

| **类型**          | **描述**       |
| --------------- | ------------ |
| torch.nn.Module | 转换后的Torch模型。 |

调用示例：

```python
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

```python
def compile(self, inputfiles: Union[str, List[str]], outputfile: str, compileargs: compileargs: Union[str, List[str]] = ""):
```

参数说明：

| **参数**      | **类型**                | **是否必选** | **描述**                                                                                                                                            |
| ----------- | --------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| inputfiles  | string或list of string | 是        | 模型的MLIR文件名。例如：test.mlir。<br />在静态多版本中，也可包含多个MLIR文件名。例如：["test_shape_1.mlir", "test_shape_2.mlir"]。                                           |
| outputfile  | string                | 是        | 输出的模型vmfb文件名，只会有一个输出文件。例如：test.vmfb。                                                                                                              |
| compileargs | string或list of string | 是        | 编译参数。当数据类型为string时，多个参数之间使用空格隔开。例如："--dump-ir-after-all --dump-ir-before-all"。也可将多个参数组成list，例如： ["--dump-ir-after-all", "--dump-ir-before-all"]。 |

编译参数说明：

<table>
<thead>
<tr>
<th><strong>参数选项</strong></th>
<th><strong>描述</strong></th>
<th><strong>是否必选</strong></th>
</tr>
</thead>
<tbody>
<tr>
<td>--arch<br /></td>
<td>针对指定的npu架构。<ul> <li>npu-v1 （默认值）</li> <li>npu-v2</li> </ul></td>
<td>否</td>
</tr>
<tr>
<td>--high-precision</td>
<td>是否启用高精度模式，用matmul_vme代替matmul进行高精度矩阵乘法，使用牛顿迭代提升超越函数精度（损失性能），某些需要更高计算精度的算子也在此处控制。<ul> <li>True：打开高精度模式。</li> <li>False（默认值）：关闭高精度模式。</li> </ul></td>
<td>否</td>
</tr>
<tr>
<td>--bisection-reduce</td>
<td>是否reduceSum启用二分法。<ul> <li>True：reduceSum启用二分法。</li> <li>False（默认值）：reduceSum不启用二分法。</li> </ul></td>
<td>否</td>
</tr>
<tr>
<td>--bisection-matmul</td>
<td>是否matmul启用二分法。<ul> <li>True：matmul启用二分法。</li> <li>False（默认值）：matmul不启用二分法。</li> </ul></td>
<td>否</td>
</tr>
<tr>
<td>--dump-ir-after-all<br /></td>
<td>是否输出每个pass处理之后的IR。<ul> <li>True：输出每个pass处理之后的IR。</li> <li>False（默认值）：不输出每个pass处理之后的IR。</li> </ul></td>
<td>否</td>
</tr>
<tr>
<td>--dump-ir-before-all<br /></td>
<td>是否输出每个pass处理之前的IR。<ul> <li>True：输出每个pass处理之前的IR。</li> <li>False（默认值）：不输出每个pass处理之前的IR。</li> </ul></td>
<td>否</td>
</tr>
<tr>
<td>--dump-ir-clean-mode<br /></td>
<td>是否打印IR简洁信息。<ul> <li>True（默认值）：打印IR简洁信息，省略模型权重数据。</li> <li>False：打印IR信息，会以16进制显示模型权重数据，IR文件会较大。</li> </ul></td>
<td>否</td>
</tr>
<tr>
<td>--enable-merge-attention</td>
<td>是否将matmul替换为matmul_batchinner，matmul_batchinner优化了attention的计算过程。<ul> <li>True（默认值）：将matmul替换为matmul_batchinner。</li> <li>False：不将matmul替换为matmul_batchinner。</li> </ul></td>
<td>否</td>
</tr>
<tr>
<td>--graph-partition-factor=&#123;Num&#125;</td>
<td>Num的取值数据类型为Int8。<ul> <li>当Num=1时：默认值，不开启graph partition。</li> <li>当Num>1时：开启graph partition，切分出N个dispatch.workgroup。</li> </ul></td>
<td>否</td>
</tr>
<tr>
<td>--attention-shrink-factor</td>
<td>设置attention Q*K计算过程的缩小系数，缩小Qweight并不影响性能。默认值为1.0，数据类型为FLOAT。</td>
<td>否</td>
</tr>
<tr>
<td>--pipeline-partition-factor</td>
<td>设置每个Pipeline Parallism Stage与它的Graph Partition Factor。例如，设置值为[4,4]，代表两个Pipeline Parallism Stage，并且它的Graph Partition Factor分别为4。默认值为[]，数据类型为list[int]。</td>
<td>否</td>
</tr>
<tr>
<td>--pipeline-partition-file</td>
<td>指定Pipeline Parallism切分节点的输入文件路径。与<code>--pipeline-partition-factor</code>组合使用，用于指定切分方案。默认值为""，数据类型为String。</td>
<td>否</td>
</tr>
<tr>
<td>--manual-partition-file</td>
<td>指定手动图分组的配置文件的绝对路径。</td>
<td>否</td>
</tr>
</tbody>
</table>

返回值：

无

调用示例：

```python
from mltc import Compiler
Compiler().compile("deepfm_stc.mlir", "deepfm.vmfb", "-arch=npu-v1")
```

### Executor().run()

接口描述：部署传入的模型vmfb文件。

接口定义：

```python
def run(self, inputs: dict):
```

参数说明：

| **参数** | **类型** | **是否必选** | **描述**  |
| ------ | ------ | -------- | ------- |
| inputs | dict   | 是        | 模型输入数据。 |

返回值：

| **类型** | **描述**  |
| ------ | ------- |
| dict   | 模型输出数据。 |

调用示例：

```python
from mltc import Executor
output = Executor("./deepfm.vmfb").run(input_data)
```

### Simulator().run()

接口描述：MLTC前端工具转换后的模型部署到CPU上。

接口定义：

```python
def run(self, inputfile: str, runargs: str = ""):
```

参数说明：

| **参数**    | **类型** | **是否必选** | **描述**                                            |
| --------- | ------ | -------- | ------------------------------------------------- |
| inputfile | string | 是        | 经过MLTC前端转换工具后的模型MLIR文件。例如：test.mlir。              |
| runargs   | string | 是        | 运行参数。多个参数之间使用空格隔开。例如："-i data.bin -o output.bin"。 |

运行参数说明：

| **参数选项**               | **描述**          | **是否必选** |
| ---------------------- | --------------- | -------- |
| -i                     | 模型输入数据文件。       | 是        |
| -o                     | 模型输出数据文件。       | 是        |
| --dump-each-op-result  | dump出每个op的结果。   | 否        |
| --dump-dir             | dump出来的数据的保存路径。 | 否        |

返回值：

无

调用示例：

```python
from mltc import Simulator
Simulator().run("resnet34.mlir", "-i data.bin -o output.bin --dump-each-op-result --dump-dir=~/data_dump/cpu")
```

### from_torch()

接口描述：将传入的Torch模型转换编译为vmfb文件。

接口定义：

```python
def from_torch(
    f: Union[nn.Module, ExportedProgram],
    *args,
    output_type: Union[str, OutputType] = OutputType.TORCH,
    dynamic_shapes: Optional[Union[Dict[str, Any], Tuple[Any]]] = None,
    output: str = "",
    experimental_support_mutation: bool = True,
    import_symbolic_shape_expressions: bool = False,
    func_name: str = "main",
    enable_graph_printing: bool = False,
    enable_ir_printing: bool = False,
    backend_legal_ops: Optional[list[str]] = None,
    extra_library_file_name: Optional[str] = None,
    input_names: Optional[Sequence[str]] = None,
    output_names: Optional[Sequence[str]] = None,
    compilearg: str = "",
    **kwargs,
)
```

参数说明：

| 参数                                   | 类型                            | **是否必选** | 描述                                                                                    |
| ------------------------------------ | ----------------------------- | -------- | ------------------------------------------------------------------------------------- |
| f                                    | nn.Module 或 ExportedProgram   | 是        | 待转换的 PyTorch 模型。可以是nn.Module实例，也可以是已导出的ExportedProgram。                               |
| *args                               | -                             | 是        | 传递给模型输入张量。                                                                            |
| output_type                         | str或OutputType                | 否        | 期望的中间输出类型，当前仅支持OutputType.TORCH。                                                      |
| dynamic_shapes<br />                | Dict[str, Any] 或 Tuple[Any] | 否        | 动态shape说明。用于指定哪些维度是动态的。默认值为 None。<br />                                               |
| output                               | str                           | 否        | 输出`.vmfb`的文件名。传入空字符串时将自动生成默认文件名。                                                      |
| experimental_support_mutation      | bool                          | 否        | 是否启用对原地修改（mutation）操作的实验性支持。默认值为True。                                                 |
| import_symbolic_shape_expressions | bool                          | 否<br />  | 是否将torch导出中产生的动态shape表达式保留到MLIR中。当需要导出动态shape IR时通常应设为True，会在Torch IR中加入描述shape信息的操作。 |
| enable_graph_printing              | bool                          | 否        | 是否在捕获过程中打印PyTorch计算图（fx.Graph）。默认值为False。                                             |
| enable_ir_printing                 | bool                          | 否        | 是否在 Lowering 过程中打印各阶段的中间表示（IR）。默认值为False。                                             |
| extra_library_file_name           | str                           | 否        | 额外的算子库文件路径。用于注册自定义算子或后端特定实现。                                                          |
| input_names                         | Sequence[str]                | 否        | 为模型输入指定名称。当 ioutput_names同时显式指定时，将覆盖 MLIR 函数上自动推导的input_names 与 output_names 属性。   |
| output_names                        | Sequence[str]                | 否        | 为模型输出指定名称。用法与 `input_names` 一致。                                                       |
| compilearg                           | str                           | 否        | 用于指定额外的编译参数。默认为空。                                                                     |

返回值：

| **类型** | **描述**        |
| ------ | ------------- |
| str    | 转换编译后的vmfb文件。 |

调用示例：

```python
import torch
import torchvision.models as models
from mltc.mltc.frontend.torch_frontend import from_torch

resnet18 = models.resnet18(pretrained=True).eval()
pseudo_input = torch.ones(1, 3, 224, 224)
vmfb_path = from_torch(resnet18, pseudo_input)
```

