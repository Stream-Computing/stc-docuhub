# STC_LLM使用指南

## STC_LLM概述

本文档以chatglm3-6b模型为例，演示如何基于希姆计算软硬件部署LLM，提供推理服务、处理推理任务并监控推理过程中的指标。

主流的开源LLM往往基于HuggingFace等格式，权重保存为bin或者safetensors，为更高效地完成LLM推理任务，希姆计算面向LLM自研了推理框架STC_LLM。STC_LLM在AI编译器、手写算子的基础上对LLM的推理过程进行了封装，您可以方便地导入、替换LLM并完成推理任务，简化了LLM的部署和使用过程。

STC_LLM面向LLM支持以下特性：

- 编译阶段：支持权重转换、量化预处理、Tensor并行处理超大规模的权重等。
- 服务阶段：支持动态batch管理优化端到端吞吐。
- 推理阶段：支持kernel级别的优化、KV Cache优化等。

基于STC_LLM的典型推理流程如下图所示：

![img](/_static/images/stc_llm-01.png)

## 部署模型

### 前提条件

- 确保服务器的内存满足模型的要求，例如chatglm3-6b的HuggingFace项目文件大小在13G左右，在转换权重时还会创建副本，因此需要配备尽量大的内存。
- 确保能访问HuggingFace等渠道，且可以下载带有LFS标记的文件。
- 准备好希姆计算LLM推理环境，安装HPE、Python v3.10、HPE Python、STC_LLM、STC_LLM_DNN。具体操作，请参见[STCRP安装指南](https://docs.streamcomputing.com/_/sharing/vSxLMI20nalGphdpXdEVoDg6JkUcfEkT?next=/zh/latest/)。

### 部署流程

以chatglm3-6b为例演示部署步骤：

1. 设置环境变量。

   ```Bash
   $ export RISCV=/usr/local/hpe
   ```

2. 从HuggingFace等渠道获取[chatglm3-6b](https://huggingface.co/THUDM/chatglm3-6b/tree/main)的文件，包括包括模型文件、权重文件、分词器文件、词表等，并复制到目标服务器。

   ![img](/_static/images/stc_llm-02.png)

3. 编写Python脚本部署并验证模型。脚本示例中主要包括以下步骤：

   1. 准备模型配置，支持的配置项请参见*模型配置*章节。

   2. 调用`AutoGeneration4.from_config`接口部署模型。

   3. 发送messages验证LLM的对话效果。

      ```Bash
      $ cat test_chatglm3-6b.py
      import asyncio
      
      from stc_llm_dnn.runtime import AsyncGeneration
      
      
      async def print_stream(gen, model, gen_name, prompt):
          async for task in gen:
              print("[{}] prompt = {}, gen = {}".format(gen_name, prompt, model.decode_token_ids(task.gen_tokens)))
      
      
      async def test_async_generation():
          # 配置信息
          config = {
              "model_name": "THUDM/chatglm3-6b",           # 模型名称
              "devices": [0, 1],                           # 使用的 npu id 列表
              "tok_dir": "./chatglm3-6b",             # tokenizer 目录
              "original_weight_dir": "./chatglm3-6b", # 原始权重路径
              "weight_dir": "chatglm2-6b-2npu-dataset",    # 转换后权重路径
              "max_tasks": 256,
              "custom_parameters": True,
              "quant_type": "fp16",
              "compress_factor": 1,
          }
      
          # 创建 generation
          generation = AsyncGeneration(config)
      
          # 运行测试
          messages = [
              {"role": "system", "content": "你是资深的技术支持专家，可以为用户提供希姆计算软硬件产品的技术支持，解答用户使用产品时的疑问。"},
              {"role": "user", "content": "你好，你是谁啊？"},
          ]
          task = await generation.create_task(messages=messages, temperature=0.5, top_p=0.2, top_k=20, max_output_len=256)
          gen = generation.generate_stream(task)
          user_task = asyncio.create_task(print_stream(gen, generation.model, f"gen", "你好"))
          await user_task
      
          await generation.shutdown()
      
      
      if __name__ == "__main__":
          asyncio.run(test_async_generation())
          
      $ python3 test_chatglm3-6b.py
      # 忽略部分回显
      
      ---------------------------- Model Info Begin ----------------------------
      model name: THUDM/chatglm3-6b
      npus: [0, 1]
      total slot number: 157053
      slot number per segment: 256
      total segment number: 613
      bytes per slot: 14336
      temporary cpp dir: /home/superadmin/.cache/stc_llm_dnn/THUDM/chatglm3-6b
      tokenizer dir: ./chatglm3-6b
      weight dir: chatglm2-6b-2npu-dataset
      embedding on host: False
      output on host: False
      dma preload: True
      max sequence length: 8192
      compress_factor: 1
      quant_type: fp16
      ---------------------------- Model Info End ----------------------------
      
      # 忽略部分回显
      
      [gen] prompt = 你好, gen =
       你好，我是希姆计算的资深技术支持专家，很高兴为您提供技术支持。请问有什么软硬件产品需要我帮助您解答疑问吗？
      ```

### 模型配置

部署模型时支持的模型配置如下表所示：

| **配置项**                       | **是否必填** | **数据类型** | **示例**                 | **描述**                                                     |
| -------------------------------- | ------------ | ------------ | ------------------------ | ------------------------------------------------------------ |
| model_name                       | 是           | str          | THUDM/chatglm3-6b        | 待部署模型的名称，建议与HuggingFace等渠道中的名称保持一致。  |
| devices                          | 是           | list         | [0, 1]                   | 模型推理时占用NPU设备的ID列表，STC_LLM会根据NPU设备的数量将原始权重自动切分为匹配的份数。 |
| tok_dir                          | 是           | str          | ./chatglm3-6b            | 加载模型的分词器（tokenizer）文件的路径。                    |
| original_weight_dir              | 否           | str          | ./chatglm3-6b            | 加载模型的原始权重文件的路径。如果您没有在目标服务器上转换过权重，则至少需要从原始权重转换一次，这时`original_weight_dir`为必填项。 |
| weight_dir                       | 否           | str          | chatglm3-6b-2npu-dataset | 从原始权重转换后可以在NPU设备上使用的权重的路径。<br />如果`weight_dir`指向的路径存在权重文件，则使用这些权重。<br />如果`weight_dir`指向的路径不存在权重文件，则STC_LLM尝试从`original_weight_dir`获取原始权重进行转换，并将转换后的权重放到`weight_dir`指向的路径。 |
| max_tasks                        | 否           | int          | 256                      | 支持同时执行的最大task数量，每个task分配一个stream完成一轮对话。默认值：256。 |
| custom_parameters                | 否           | bool         | False                    | True：允许task自定义temperature、top_p、top_k、logprobs、top_logprobs。<br />False：默认值。禁止task自定义temperature、top_p、top_k、logprobs、top_logprobs。 |
| temperature                      | 否           | float        | 0.5                      | 超参数之一，控制生成输出的随机性，值越低保证更多的确定性，值越高引入更多的随机性。需要将custom_parameters配置为True才可以修改，默认值：0.5，数值范围为[0.0, 2.0]。 |
| top_p                            | 否           | float        | 0.2                      | 超参数之一，在生成输出抽样时排除累积概率低于该值的token。需要将custom_parameters配置为True才可以修改，默认值：0.2，数值范围为(0.0, 1.0]。 |
| top_k                            | 否           | int          | 20                       | 超参数之一，在生成输出抽样时只在概率top k个token中进行。需要将custom_parameters配置为True才可以修改，默认值：20，数值范围为[1, 词表长度]。 |
| <internal>dma_preload</internal> | 否           | bool         | True                     | True：默认值。启用DMA预取，通过拷贝权重、矩阵计算等并行操作加速推理。<br />False：禁用DMA预取。 |
| <internal>render_cpp</internal>  | 否           | bool         | True                     | True：默认值。部署模型时重新生成并覆盖当前的模型代码（cpp）文件。<br />False：部署模型时使用当前的模型代码（cpp）文件，不重新生成。 |
| quant_type                       | 否           | str          | fp16                     | 指定是否通过量化节省内存空间。fp16：默认值，不启用压缩。w8a16：启用压缩。 |
| compress_factor                  | 否           | int          | 64                       | 压缩倍数，仅在`quant_type`为`w8a16`时生效，支持的压缩倍数包括128、64、32、16、8、1、-1，压缩倍数越高，能节省的内存空间越多。压缩倍数为-1时对应per-channel方式。 |

### 问题排查

#### 未设置RISC-V环境变量

- 问题现象：执行脚本示例时报错`RuntimeError("Can`t find RISCV environment variable")`。

- 解决方式：必须设置RISC-V环境变量。

  ```Bash
  $ export RISCV=/usr/local/hpe
  ```

#### 可用内存不足

- 问题现象：执行脚本示例时报错`run weight convert ... Killed`。

- 解决方式：查看可用内存是否足以放下模型、权重等文件。

  ```Bash
  $ free -h
  ```

## 提供推理服务

### 使用流程

STC_LLM中封装了OpenAI风格的接口，服务端可以提供推理服务并处理推理请求，客户端通过Python脚本、curl命令等方式和LLM交互。

1. 准备模型配置，并在服务端启动推理服务。

   ```Bash
   $ python3 -m stc_llm.entrypoints.openai.api_server_langchain \
   --model_name THUDM/chatglm3-6b \
   --tok_dir ./chatglm3-6b \
   --weight_dir ./chatglm3-6b-2npu-dataset \
   --temperature 0.8 \
   --top_p 0.8 \
   --max_output_len 256 \
   --port 18000 \
   --device 0 1
   
   # 忽略部分回显
   ---------------------------- Model Info Begin ----------------------------
   model name: THUDM/chatglm3-6b
   npus: [0, 1]
   total slot number: 157053
   slot number per segment: 256
   total segment number: 613
   bytes per slot: 14336
   temporary cpp dir: /home/superadmin/.cache/stc_llm_dnn/THUDM/chatglm3-6b
   tokenizer dir: ./chatglm3-6b
   weight dir: ./chatglm3-6b-2npu-dataset
   embedding on host: False
   output on host: False
   dma preload: True
   max sequence length: 8192
   compress_factor: 1
   quant_type: fp16
   ---------------------------- Model Info End ----------------------------
   
   # 忽略部分回显
   INFO:     Application startup complete.
   INFO:     Uvicorn running on http://0.0.0.0:18000 (Press CTRL+C to quit)
   ```

2. 在客户端调用completions或者chat_completions接口发起推理请求。

   - 补全文本示例，向LLM提供起始文本，LLM自动将起始文本补全为一段话、文章等形式。

     - curl方式：

       ```Bash
       # 调用completions接口示例
       $ curl http://172.16.xxx.xxx:18000/v1/completions \
           -H "Content-Type: application/json" \
           -d '{
               "model": "THUDM/chatglm3-6b",
               "prompt": "中国位于",
               "max_tokens": 1024,
               "temperature": 0
           }'
        
        {"model":"THUDM/chatglm3-6b","object":"text_completion","created":1720773513,"choices":[{"index":0,"text":"亚洲的东部，是一个多民族国家，拥有悠久的历史和灿烂的文化。中国有着丰富的自然资源，包括煤炭、石油、天然气、金属矿产等。同时，中国还拥有众多美丽的风景，如长城、故宫、黄山、张家界等。\n \n中国是一个农业大国，农作物包括粮食、蔬菜、水果、棉花、油料等。中国也是世界上最大的蔬菜生产国之一，蔬菜种植面积和产量都非常高。此外，中国还有丰富的畜牧业资源，包括猪肉、牛肉、羊肉、禽类等。\n\n中国有着众多的人口，人口数量庞大，城市化进程快速。中国是一个多民族国家，拥有56个民族，汉族是最大的民族，占总人口的近90%。除了汉族外，中国还有壮族、回族、藏族、维吾尔族、蒙古族、朝鲜族等55个少数民族。\n\n中国是一个历史悠久的国家，拥有悠久的历史和灿烂的文化。中国有着丰富的自然资源，包括煤炭、石油、天然气、金属矿产等。同时，中国还拥有众多美丽的风景，如长城、故宫、黄山、张家界等。中国有着众多的文化底蕴，包括儒家文化、道家文化、佛教文化等。\n\n中国是一个农业大国，农作物包括粮食、蔬菜、水果、棉花、油料等。中国也是世界上最大的蔬菜生产国之一，蔬菜种植面积和产量都非常高。此外，中国还有丰富的畜牧业资源，包括猪肉、牛肉、羊肉、禽类等。\n\n中国有着众多的人口，人口数量庞大，城市化进程快速。中国是一个多民族国家，拥有56个民族，汉族是最大的民族，占总人口的近90%。除了汉族外，中国还有壮族、回族、藏族、维吾尔族、蒙古族、朝鲜族等55个少数民族。\n\n中国是一个历史悠久的国家，拥有悠久的历史和灿烂的文化。中国有着丰富的自然资源，包括煤炭、石油、天然气、金属矿产等。同时，中国还拥有众多美丽的风景，如长城、故宫、黄山、张家界等。中国有着众多的文化底蕴，包括儒家文化、道家文化、佛教文化等。","finish_reason":"stop"}]}
       ```

     - Python脚本方式：

       ```Bash
       # 调用completions接口示例
       $ pip3 install openai
       
       $ cat test_chatglm3-6b-completions.py
       from openai import OpenAI
       openai_api_key = "EMPTY"
       openai_api_base = "http://172.16.xxx.xxx:18000/v1"
       client = OpenAI(
           api_key=openai_api_key,
           base_url=openai_api_base,
       )
       completion = client.completions.create(model="THUDM/chatglm3-6b",
                                             prompt="中国位于")
       print("Completion result:", completion)
       
       $ python3 test_chatglm3-6b-completions.py
       Completion result: Completion(id=None, choices=[CompletionChoice(finish_reason='stop', index=0, logprobs=None, text='亚洲的东部，是一个多民族国家，有 56 个民族。中国是一个农业大国，农业劳动力资源丰富，农业 output value 农业增加值 农业劳动生产率 农业资源利用效率高。中国是一个工业大国,工业发展水平较高,拥有许多著名的企业和品牌。中国的经济发展水平较高,人均 GDP 高于世界平均水平。\n 中国是一个多民族国家，拥有 56 个民族。汉族是最大的民族，占总人口的近 90%。')], created=1720774449, model='THUDM/chatglm3-6b', object='text_completion', system_fingerprint=None, usage=None)
       ```

   - 发起聊天示例，向LLM提供系统角色信息以及聊天输入，LLM理解输入并按其系统角色回复用户。

     - curl方式：

       ```Bash
       # 调用chat_completions接口示例
       $ curl http://172.16.xxx.xxx:18000/v1/chat/completions \
           -H "Content-Type: application/json" \
           -d '{
               "model": "THUDM/chatglm3-6b",
               "messages": [
                   {"role": "system", "content": "你是一个资深体育评论员，可以为用户提供足球世界杯的权威信息，回答尽量精简。"},
                   {"role": "user", "content": "你好，谁赢得了2002年足球世界杯的冠军？"}
               ]
           }'
           
        {"model":"THUDM/chatglm3-6b","object":"chat.completion","choices":[{"index":0,"message":{"role":"assistant","content":"\n 2002年足球世界杯冠军是巴西。","function_call":null},"finish_reason":"stop"}],"created":1720774488}
       ```

     - Python脚本示例：

       ```Bash
       # 调用chat_completions接口示例
       $ pip3 install openai
       
       $ cat test_chatglm3-6b-chat-completions.py
       from openai import OpenAI
       openai_api_key = "EMPTY"
       openai_api_base = "http://172.16.xxx.xxx:18000/v1"
       client = OpenAI(
           api_key=openai_api_key,
           base_url=openai_api_base,
       )
       chat_response = client.chat.completions.create(
           model="THUDM/chatglm3-6b",
           messages=[
               {"role": "system", "content": "你是一个资深体育评论员，可以为用户提供足球世界杯的权威信息，回答尽量精简。"},
               {"role": "user", "content": "你好，谁赢得了2002年足球世界杯的冠军？"},
           ]
       )
       print("Chat response:", chat_response)
       
       $ python3 test_chatglm3-6b-chat-completions.py
       Chat response: ChatCompletion(id=None, choices=[Choice(finish_reason='stop', index=0, logprobs=None, message=ChatCompletionMessage(content='\n 2002年足球世界杯冠军是巴西。', role='assistant', function_call=None, tool_calls=None))], created=1720774627, model='THUDM/chatglm3-6b', object='chat.completion', service_tier=None, system_fingerprint=None, usage=None)
       ```

### completions参数

| **参数名**   | **是否必填** | **数据类型** | **示例**          | **描述**                                                     |
| ------------ | ------------ | ------------ | ----------------- | ------------------------------------------------------------ |
| model        | 是           | str          | THUDM/chatglm3-6b | 待调用模型的名称，一般为启动推理服务时所运行的模型名称。     |
| prompt       | 是           | str          | 中国位于          | 描述要求模型完成的任务，例如补全文本、回答问题。             |
| temperature  | 否           | float        | 0.8               | 超参数之一，控制生成输出的随机性，值越低保证更多的确定性，值越高引入更多的随机性。需要在部署模型时将custom_parameters配置为True才可以修改，数值范围为[0.0, 2.0]。 |
| top_p        | 否           | float        | 0.8               | 超参数之一，在生成输出抽样时排除累积概率低于该值的token。需要在部署模型时将custom_parameters配置为True才可以修改，数值范围为(0.0, 1.0]。 |
| top_k        | 否           | int          | 1                 | 超参数之一，在生成输出抽样时只在概率top k个token中进行。需要在部署模型时将custom_parameters配置为True才可以修改，数值范围为[1, 词表长度]。 |
| max_tokens   | 否           | int          | 256               | 最长返回的token数量。数值范围为[1, 模型支持上下文长度]。     |
| logprobs     | 否           | bool         | true              | 需要在部署模型时将custom_parameters配置为True才可以修改。<br />true：启用返回生成输出token的对数概率。<br />false：默认值，禁用返回生成输出token的对数概率。 |
| top_logprobs | 否           | int          | 5                 | 指定在每个生成输出token时一并返回最有可能的token数量，每个token都带有对数概率。需要将logprobs开关设置为true方可生效，数值范围为[0, 5]。 |
| stream       | 否           | bool         | true              | true：启用流式传输，当模型生成一定数量的token后，立即将token传输给客户端，而不是等所有token生成完毕后，从而减少用户的等待时间。<br />false：默认值，禁用流式传输，等所有token生成完毕后，再将所有token传输给客户端。 |

### chat_completions参数

| **参数名**   | **是否必填** | **数据类型** | **示例**          | **描述**                                                     |
| ------------ | ------------ | ------------ | ----------------- | ------------------------------------------------------------ |
| model        | 是           | str          | THUDM/chatglm3-6b | 待调用模型的名称，一般为启动推理服务时所运行的模型名称。     |
| messages     | 是           | dict         | ？？？            | 传给模型的消息对象，您可以通过字段组合控制模型行为，获得预期的输出。<br />role字段：用于设置角色，例如system（系统角色）、user（用户角色）。<br />content字段：用于描述要求，例如通过system描述助手扮演的系统角色，通过user描述用户要求助手完成创作文章、回答问题等任务。 |
| temperature  | 否           | float        | 0.8               | 超参数之一，控制生成输出的随机性，值越低保证更多的确定性，值越高引入更多的随机性。需要在部署模型时将custom_parameters配置为True才可以修改，数值范围为[0.0, 2.0]。 |
| top_p        | 否           | float        | 0.8               | 超参数之一，在生成输出抽样时排除累积概率低于该值的token。需要在部署模型时将custom_parameters配置为True才可以修改，数值范围为(0.0, 1.0]。 |
| top_k        | 否           | int          | 1                 | 超参数之一，在生成输出抽样时只在概率top k个token中进行。需要在部署模型时将custom_parameters配置为True才可以修改，数值范围为[1, 词表长度]。 |
| max_tokens   | 否           | int          | 256               | 最长返回的token数量。数值范围为[1, 模型支持上下文长度]。     |
| logprobs     | 否           | bool         | true              | 需要在部署模型时将custom_parameters配置为True才可以修改。<br />true：启用返回生成输出token的对数概率。<br />false：默认值，禁用返回生成输出token的对数概率。 |
| top_logprobs | 否           | int          | 5                 | 指定在每个生成输出token时一并返回最有可能的token数量，每个token都带有对数概率。需要将logprobs开关设置为true方可生效，数值范围为[0, 5]。 |
| stream       | 否           | bool         | true              | true：启用流式传输，当模型生成一定数量的token后，立即将token传输给客户端，而不是等所有token生成完毕后，从而减少用户的等待时间。<br />false：默认值，禁用流式传输，等所有token生成完毕后，再将所有token传输给客户端。 |

## 监控推理指标

### 前提条件

- 已在服务端启动推理服务。

### 指标类型

STC_LLM基于Prometheus、Grafana生态实现了监控功能，遵循Prometheus expression语法添加需要监控的推理指标即可。支持的推理指标包括：

| **推理指标**                  | **推理指标含义**                                | **Prometheus expression示例**                                |
| ----------------------------- | ----------------------------------------------- | ------------------------------------------------------------ |
| prompt处理吞吐                | 每秒处理输入prompt token的吞吐量                | stc_llm:avg_prompt_throughput_toks_per_s{model_name="THUDM/chatglm3-6b"} |
| generation处理吞吐            | 每秒输出token的吞吐量                           | stc_llm:avg_generation_throughput_toks_per_s{model_name="THUDM/chatglm3-6b"} |
| 推理次数                      | 启动推理服务后完成推理的次数                    | stc_llm:time_to_inference_count{model_name="THUDM/chatglm3-6b"} |
| 首token时延                   | 输出首字token花费的时间                         | stc_llm:first_token_time{model_name="THUDM/chatglm3-6b"}     |
| 任务推理总时延                | 完成单轮输出花费的时间                          | stc_llm:task_duration{model_name="THUDM/chatglm3-6b"}        |
| 任务decoder时延               | 从输出首字token开始，到完成单轮输出所花费的时间 | stc_llm:task_decoder_latency{model_name="THUDM/chatglm3-6b"} |
| avg generation latency        | 输出单位token所花费的时间                       | stc_llm:avg_generation_latency{model_name="THUDM/chatglm3-6b"} |
| running tasks count           | 进行中的对话任务数量                            | stc_llm:num_requests_running{model_name="THUDM/chatglm3-6b"} |
| swapped tasks count           | 因故停止的对话任务数量                          | stc_llm:num_requests_swapped{model_name="THUDM/chatglm3-6b"} |
| waiting tasks count           | 等待中的对话任务数量                            | stc_llm:num_requests_waiting{model_name="THUDM/chatglm3-6b"} |
| prompt tokens total count     | 输入prompt token的总数量                        | stc_llm:prompt_tokens_total{model_name="THUDM/chatglm3-6b"}  |
| generation tokens total count | 输出token的总数量                               | stc_llm:generation_tokens_total{model_name="THUDM/chatglm3-6b"} |

### 服务端操作

您需要在服务端安装Prometheus、Grafana并确保相关服务正常运行。

1. 安装Prometheus。请根据服务器情况选择合适的安装方式，例如APT源、离线安装包等，相关说明可以参见[Prometheus官方开源项目](https://github.com/prometheus/prometheus)。

2. 修改Prometheus配置，默认配置文件为`/etc/prometheus/prometheus.yml`。

   - 提供Prometheus服务的地址，默认端口号为9090。

     ```YAML
     - job_name: "prometheus"
       static_configs:
       - targets: ["localhost:9090"]
     ```

   - 监控推理服务的地址，在对应job（即通过stc_llm.entrypoints.openai.api_server启动的推理服务）的`scrape_configs`字段下添加IP地址和端口号即可。

     ```YAML
     - job_name: "openai_api"
       scrape_interval: 5s
       static_configs:
       - targets: ["localhost:18000"]
     ```

3. 启动Prometheus服务并确认服务状态。

   ```bash
   $ sudo systemctl start prometheus
   $ sudo systemctl status prometheus
   prometheus.service - Prometheus
        Loaded: loaded (/etc/systemd/system/prometheus.service; enabled; vendor preset: enabled)
        Active: active (running) since Mon 2024-08-19 16:24:11 CST; 1h 6min ago
      Main PID: 3112690 (prometheus)
         Tasks: 53 (limit: 629145)
        Memory: 48.4M
        CGroup: /system.slice/prometheus.service
                └─3112690 /usr/local/bin/prometheus --config.file /etc/prometheus/prometheus.yml --storage.tsdb.path /var/lib/prometheus/ --web.console.templates=/etc/prometheus/consoles --web.console.libra>
   ```

4. 安装Grafana。请根据服务器情况选择合适的安装方式，例如APT源、离线安装包等，相关说明可以参见[Grafana官方开源项目](https://github.com/grafana/grafana)。

5. 修改Grafana配置，默认配置文件为`/etc/grafana/grafana.ini`。

   - 提供Grafana服务的地址，默认端口号为3000。

   - 登录Grafana Web端的用户名和密码。

     ```YAML
     http_port = 3000
     admin_user = admin
     admin_password = 123.com
     ```

6. 启动Grafana服务并确认服务状态。

   ```bash
   $ sudo systemctl start grafana-server
   $ sudo systemctl status grafana-server
   grafana-server.service - Grafana instance
        Loaded: loaded (/lib/systemd/system/grafana-server.service; disabled; vendor preset: enabled)
        Active: active (running) since Mon 2024-08-19 10:01:25 CST; 7h ago
          Docs: http://docs.grafana.org
      Main PID: 2970010 (grafana)
         Tasks: 38 (limit: 629145)
        Memory: 53.8M
        CGroup: /system.slice/grafana-server.service
                └─2970010 /usr/share/grafana/bin/grafana server --config=/etc/grafana/grafana.ini --pidfile=/run/grafana/grafana-server.pid --packaging=deb cfg:default.paths.logs=/var/log/grafana cfg:defaul>
   ```

### Web端操作（Prometheus）

Prometheus提供了指标收集和告警等监控功能，您可以登录Prometheus的Web页面管理需要监控的推理指标。

1. 访问Prometheus Web页面。如果Prometheus服务使用了默认端口，则Web页面地址为`http://{server_ip}:9090`。

2. 单击**Add Panel**添加指标面板。

3. 在输入框中填写Prometheus expression，以监控THUDM/chatglm3-6b模型的generation吞吐量为例，填写`stc_llm:avg_generation_throughput_toks_per_s{model_name="THUDM/chatglm3-6b"}`。

4. 单击**Execute**完成指标添加。

5. 单击**Graph**，调整时间范围至执行了推理任务的时间段，即可查看到对应的推理指标。

   ![img](/_static/images/stc_llm-03.png)

### Web端操作（Grafana）

Grafana提供了丰富和美观的可视化功能，使用时将Prometheus添加为数据源并创建Dashboard汇总Panel，即可一站式多维度展示推理指标。

#### 登录Grafana

1. 访问Grafana Web页面。如果Grafana服务使用了默认端口，则Web页面地址为`http://{server_ip}:3000`。
2. 输入配置的用户名和密码。

#### 添加Prometheus数据源

1. 在左侧导航栏，单击**Connections** > **Data sources**。

2. 单击**Add datasource**。

3. 选择**Prometheus**。

   ![img](/_static/images/stc_llm-04.png)

4. 在Settings页面，完成Name、Prometheus server URL等配置，然后单击**Save & Test。**提示`Successfully queried the Prometheus API.`，即代表数据源添加成功。

   ![img](/_static/images/stc_llm-05.png)

#### 创建STC_LLM Dashboard

1. 在左侧导航栏，单击**Dashboards**。

2. 单击**New** > **New dashboard**。

   ![img](/_static/images/stc_llm-06.png)

3. 单击**Add visualization**。

   ![img](/_static/images/stc_llm-07.png)

4. 选择已添加的Prometheus数据源。

   ![img](/_static/images/stc_llm-08.png)

5. 添加Panel。切换到Code模式，在输入框中填写Prometheus expression，以监控THUDM/chatglm3-6b模型的推理次数为例，填写`stc_llm:time_to_inference_count{model_name="THUDM/chatglm3-6b"}`，单击**Run queries**查看效果，然后单击**Save**。

   ![img](/_static/images/stc_llm-09.png)

6. 按提示填入信息，然后单击**Save**。

   ![img](/_static/images/stc_llm-10.png)

7. 在Dashboards页面即可看到新添加的STC_LLM Dashboard。

   ![img](/_static/images/stc_llm-11.png)

8. 进入STC_LLM Dashboard，即可查看已添加的Panel。

   ![img](/_static/images/stc_llm-12.png)

#### 编辑Dashboard中的Panel

1. 在左侧导航栏，单击**Dashboards**。

2. 单击STC_LLM Dashboard。

3. 在待修改Panel右上角，单击Menu图标 > **Edit**。

   ![img](/_static/images/stc_llm-13.png)

4. 按需修改Panel信息，例如将Title修改为推理次数，然后单击**Save**。

   ![img](/_static/images/stc_llm-14.png)

5. 按需填写信息，然后单击**Save**。

   ![img](/_static/images/stc_llm-15.png)

#### 为Dashboard添加新Panel

1. 在左侧导航栏，单击**Dashboards**。

2. 单击STC_LLM Dashboard。

3. 在Dashboard中单击**Add** > **Visualization**。

   ![img](/_static/images/stc_llm-16.png)

4. 添加Panel。切换到Code模式，在输入框中填写Prometheus expression，以监控THUDM/chatglm3-6b模型的prompt处理吞吐和generation处理吞吐为例，分别填写`stc_llm:avg_prompt_throughput_toks_per_s{model_name="THUDM/chatglm3-6b"}`和`stc_llm:avg_generation_throughput_toks_per_s{model_name="THUDM/chatglm3-6b"}`，单击**Run queries**查看效果，然后单击**Save**。

   ![img](/_static/images/stc_llm-17.png)

5. 按要求填入信息，然后单击**Save**。

   ![img](/_static/images/stc_llm-18.png)

6. 进入进入STC_LLM Dashboard，即可查看展示效果。

   ![img](/_static/images/stc_llm-19.png)