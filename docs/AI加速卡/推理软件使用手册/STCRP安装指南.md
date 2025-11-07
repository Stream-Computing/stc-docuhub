---
sidebar_position: 3
sidebar_label: STCRP安装指南
sidebar_class_name: green
---

# STCRP安装指南

## 准备软硬件环境

### 安装AI推理卡

#### 安全须知

为确保人身安全和设备安全，请务必确保：

* 保持服务器以及周围工作区域清洁无尘土。

* 在打开服务器外壳前拔下电源线。

* 注意静电放电ESD（Electro-Static Discharge）。

在安装推理卡时操作不当可能因ESD损坏电子组件，并导致设备整体故障或间歇故障。进行拆卸和更换组件操作时，请始终遵循防ESD流程，包括但不限于：

* 确保佩戴ESD腕带或踝带，且与皮肤接触良好。将腕带或踝带的设备端连接到底座上未涂漆的金属表面。

* 避免让推理卡接触您的衣物。腕带或踝带只能防止身体产生的ESD影响电子组件，但无法防止衣物产生的ESD。

* 拿起推理卡时只能接触其托架或边缘，避免接触印刷电路板或连接器。

* 将推理卡放在防静电的表面上，例如套件中提供的防静电袋。

* 如需退还推理卡，请立即将其放入防静电袋内。

#### 准备工作

在开始安装推理卡前，请了解其硬件规格并完成以下准备工作：

* 预留安装的最小可用空间，即至少单宽、3/4长、全高（268.44mm × 111.15mm）的空间。

* 确保服务器支持PCIe 4.0 × 16接口。

* 确保PCIe接口的输入电压和输入电流满足规范。规范如下：

  | **PCIe接口**                | **最小电压** | **正常电压** | **最大电压** | **峰值电流需求** |
  | ------------------------- | -------- | -------- | -------- | ---------- |
  | PCIe Edge Connecter（12V）  | 11.04V   | 12V      | 12.96V   | 0.5A       |
  | PCIe 8-Pin Connecter（12V） | 11.04V   | 12V      | 12.96V   | 13A        |
  | PCIe Edge Connecter（3V3）  | 3.0V     | 3.3V     | 3.6V     | 0.3A       |

* 确保服务器满足冷却用的最小风量要求。推理卡采用被动散热，服务器需要满足最小风量需求以保证推理卡工作在安全温度范围。

  > 注意：进风口环境温度为平均温度，最小风量需求为通过推理卡进风口的风量。最小风量需求为建议值，即使针对同一温度，在不同系统中仍需要根据实际系统实测决定提供的最终风量。

* 吹风方向

  ![](\doc_img\s9f60MWIqjNL.png)

* 吸风方向

  ![](\doc_img\EW4J1NyWLOpD.png)

#### 安装步骤

1. 关闭服务器并拔下电源线。

2. 打开服务器外壳，在主板上找到PCIe 4.0 × 16插槽。如果该插槽周围空间狭小不便安装，可移除该插槽相邻的PCIe插槽盖。

3. 将推理卡插入PCIe 4.0 × 16插槽。

4. 为推理卡接入电源，使用服务器主板上的PCIe 8-Pin电源插头连接到推理卡的PCIe 8-Pin电源接口即可。

5. 为服务器装上外壳。

6. 为服务器连接电源线并启动服务器。

   > 警告：推理卡采用被动散热，在启动服务器前请再次确认推理卡上有足够的冷却风量通过。如果不能确保冷却风量要求，上电后可能导致推理卡损坏。在使用过程中推理卡可能发热，请及时关注并谨慎处理过热的情况。

7. 验证是否已成功安装推理卡。执行以下命令检查推理卡的安装状态，回显设备信息则说明操作系统已发现设备。下方为发现STCP920 NPU设备的示例：

   > 注意：请确保NPU设备信息显示正常，避免在硬件识别异常的情况下继续操作。

   ```bash
   $ lspci -vd 23e2:
   03:00.0 Processing accelerators: Device 23e2:0100
           Subsystem: Device 23e2:0000
           Physical Slot: 0-2
           Flags: bus master, fast devsel, latency 0, IRQ 22
           Memory at 800000000 (64-bit, prefetchable) [size=16G]
           Memory at fc000000 (64-bit, non-prefetchable) [size=32M]
           Memory at c00000000 (64-bit, prefetchable) [size=1G]
           Capabilities: <access denied>
           Kernel driver in use: stc
           Kernel modules: stc
   ```

#### 问题排查

##### 未正常回显PCIe Base Address

* 问题现象：查看NPU设备信息时，未能正常回显PCIe Base Address，如下所示：

  ```bash
  Region 0: Memory at <unassigned> (64-bit, prefetchable)
  Region 2: Memory at 98000000 (64-bit, non-prefetchable) [size=32M]
  Region 4: Memory at <unassigned> (64-bit, prefetchable)
  ```

* 可能原因：PCIe Base Address未匹配，推理卡PCIe接口的软件规格经历过调整，需要相应修改BIOS配置。

* 解决方法：在BIOS面板中启用`Above 4G Decoding`，如下所示：

  ![](\doc_img\img_v3_02ei_4f107f7d-e4ee-41a9-8419-40d3cd03b9dg.jpg)

### 检查软件环境

#### 检查操作权限

完成以下操作时，建议以拥有root权限或sudo权限的用户登录：

* 更新kernel headers版本

* 更新GCC版本

* 安装HPE


#### 检查操作系统版本

仅支持在Linux操作系统中使用配套软件。HPE对主机的编译器、C运行时库等有一定要求，主机环境和HPE能否正常运行紧密相关。在安装HPE前，请执行以下命令查看操作系统版本：

```bash
$ uname -m && cat /etc/*release
```

建议选择以下操作系统版本，在这些版本上进行了充分的验证。在其他版本上可能可以运行，但并不能始终得到保障。

| **操作系统版本**                                 | **Linux内核版本** | **glibc版本** | **GCC****版本**              | **dkms版本** |
| ------------------------------------------------ | ----------------- | ------------- | ---------------------------- | ------------ |
| Ubuntu 22.04                                     | 5.15.0-89         | 2.35          | 11.4.0                       | 2.8.7        |
| Ubuntu 25.04                                     | 6.14.0-15-generic | 2.41          | 14.2.0                       | 3.0.11       |
| 银河麒麟高级服务器操作系统V10（以下简称麒麟V10） | 4.19.90           | 2.31          | 7.3.0<br/>9.0.0（ MLTC要求） | 2.6.1-6      |

#### 检查kernel headers版本

安装HPE前，必须确保操作系统的kernel和kernel headers版本匹配，例如，kernel版本为5.4.0-42，则kernel headers也必须匹配5.4.0-42。

> 说明：必要时您可能需要更改kernel版本来满足要求，例如当前kernel版本并没有匹配的kernel headers时。

在Ubuntu中检查和安装kernel headers的参考步骤如下：

1. 检查操作系统中是否已正确安装kernel headers，回显kernel headers相关的信息且和kernel版本匹配即可。

   ```bash
   $ sudo dpkg --get-selections | grep $(uname -r)
   linux-headers-5.4.0-42-generic                  install
   linux-image-5.4.0-42-generic                    install
   linux-modules-5.4.0-42-generic                  install
   linux-modules-extra-5.4.0-42-generic            install
   ```

2. 如果尚未正确安装kernel headers，需要手动安装kernel headers。

   ```bash
   $ sudo apt-get install linux-headers-$(uname -r)
   ```

在麒麟V10中检查和安装kernel headers和kernel devel的参考步骤如下：

1. 检查操作系统中是否已正确安装kernel headers，回显kernel headers相关的信息且和kernel版本匹配即可。

   ```bash
   $ uname -r
   3.10.0-1160.76.1.el7.x86_64
   $ sudo yum list | grep kernel-headers
   kernel-headers.x86_64                      3.10.0-1160.76.1.el7   @updates
   ```

2. 如果尚未正确安装kernel headers，需要手动安装kernel headers。

   ```bash
   $ sudo yum install kernel-devel-$(uname -r) kernel-headers-$(uname -r)
   ```

#### 检查Python版本和依赖

安装MLTC时需要Python支持，请确保已安装Python 3.10版本。

> 注意：Ubuntu 25.04默认Python版本为3.13.3，因此需要自行安装Python 3.10版本。

### 配置软件源

我们提供了软件源，提供形式为离线安装包。您需要自行获取和管理离线安装包，配套软件安装包名称格式如下：

> 说明：请联系技术支持获取配套软件安装包。
>

| **配套软件**       | **安装包名称格式**                                           |
| ------------------ | ------------------------------------------------------------ |
| HPE                | - deb包名称格式：`hpe-repo-{OS}-{main_version}-local_{sub_version}_{arch_version}.deb`<br/>- HPE整包中包括了驱动以及stc-smi、stc-gdb、stc-prof、stc-vprof等监控调试工具，支持通过命令控制安装的模块分类。 |
| HPE Python         | `hpe_python-{mltc_version}-cp{python_version}-{abi}-linux_{arch_version}.whl` |
| MLTC               | `mltc-{mltc_version}-cp{python_version}-{abi}-linux_{arch_version}.whl` |
| SNQ                | `stcnq-{SNQ_version}-py3-none-any.whl`                       |
| SNC                | `stcnc-{SNC_version}-py3-none-any.whl`                       |
| STC_LLM            | `stc_llm-{stc_llm_version}-py{python_version}-{abi}-linux_x86_64.whl` |
| STC_LLM_DNN        | `stc_llm_dnn-{stc_llm_dnn_version}-py{python_version}-{abi}-linux_x86_64.whl` |
| STC_LLM_MLTC       | `stc_llm_mltc-{stc_llm_mltc_version}-py{python_version}-{abi}-linux_x86_64.whl` |
| 其他安装用附加文件 | - Dockerfile：Docker方式安装时构建Docker镜像的示例。<br/>- requirements：模型编译依赖，按需从requirements.txt、requirements_venv2.txt等中选择。 |

安装包名称示例如下：

| **配套软件** | **安装包名称示例**                            |
| ------------ | --------------------------------------------- |
| HPE          | hpe-repo-ubuntu2204-1-9-local_1.9.3_amd64.deb |
| HPE Python   | hpe_python-1.4.0-cp310-cp310-linux_x86_64.whl |
| MLTC         | mltc-1.3.0-cp310-cp310-linux_x86_64.whl       |
| SNQ          | stcnq-1.0.0-py3-none-any.whl                  |
| SNC          | stcnc-1.0.1-py3-none-any.whl                  |
| STC_LLM      | stc_llm-1.2.0-py3-none-any.whl                |
| STC_LLM_DNN  | stc_llm_dnn-1.2.0-py3-none-any.whl            |
| STC_LLM_MLTC | stc_llm_mltc-1.3.0-py3-none-any.whl           |

为HPE配置本地源时，将HPE安装包复制到服务器，然后安装本地存储库并添加GPG密钥。示例命令如下：

> 说明：用于安装HPE的deb包都是存储库包，存储库包会在操作系统中安装本地存储库并通知包管理器实际安装包的位置，然后从apt源获取并安装HPE的各个模块。

* Ubuntu 22.04

  ```bash
  $ sudo dpkg -i hpe-repo-ubuntu2204-1-9-local_1.9.3_amd64.deb
  $ sudo cp /var/hpe-repo-ubuntu2204-1-9-local/hpe-*.gpg /usr/share/keyrings/
  ```

* Ubuntu 25.04

  ```Bash
  $ sudo dpkg -i hpe-repo-ubuntu2504-1-9-local_1.9.3_amd64.deb
  $ sudo cp /var/hpe-repo-ubuntu2504-1-9-local/hpe-*.gpg /usr/share/keyrings/
  ```
  
* 麒麟V10

  ```bash
  $ sudo yum install hpe-repo-kylinV10-1-9-local_1.9.3_x86_64.rpm
  $ sudo rpm --import /var/hpe-*/hpe.pub
  ```

为MLTC及其他工具配置本地源时，将MLTC及其他工具的安装包复制到服务器即可。

## 容器中安装STCRP

### 安装须知

如果您选择Docker方式安装配套软件，请将HPE驱动模块安装在主机上，并将其他模块安装在容器中。

Docker方式方便您后续分别升级不同类型的配套软件，维护起来更加灵活。配套软件的模块被区分为Host侧和Docker侧模块：

* Host侧模块：包括了HPE驱动模块（hpe-host），升级时一般需要停机维护，此类迭代频率低但影响大，不适合频繁升级。

* Docker侧模块：包括了HPE非驱动模块（hpe-simple）、MLTC、不时引入的其他工具等，可以通过Docker快速构建，方便满足较高迭代频率的要求，以持续提升易用性。

### 安装驱动模块

配置软件源后，更新软件包信息并安装HPE驱动模块。命令如下所示：

```bash
$ sudo apt update
$ sudo apt install hpe-host
```

### 安装其他工具

1. 构建Docker镜像。示例流程如下：

   > 说明：自行构建Docker镜像时需要使用离线安装包。离线安装包中提供了安装文件以及Dockerfile示例，Dockerfile示例包括了安装HPE非驱动模块、MLTC以及Python版本和依赖相关的命令。

   1. 根据自身需求编写Dockerfile，将Dockerfile拷贝至主机，并将安装文件拷贝至用于管理安装文件的HTTP Server。

   2. 在主机中操作构建Docker镜像。构建命令中指定必要的信息，例如Dockerfile路径、镜像名称、安装包获取路径等。以Ubuntu 22.04为例，命令及主要参数说明如下：

      ```bash
      $ DOCKER_BUILDKIT=1 docker build -f Dockerfile -t stcrp190:ubuntu2204-hpe-1.9.3-mltc-1.3.0-py310 --build-arg URI=http://example.com --target final .
      ```

      * `-f Dockerfile`：指定使用当前目录下的Dockerfile。

      * `-t stcrp190:ubuntu2204-hpe-1.9.3-mltc-1.3.0-py310`：指定Docker镜像的名称为stcrp190，标签为ubuntu2204-hpe-v1.9.3-mltc-v1.3.0。

      * `--build-arg URI=http://example.com`：`--build-arg`传入的值可以覆盖Dockerfile中对应变量的取值，请将`http://example.com`替换为HTTP Server上安装包的路径。您也可以通过`--build-arg`传入安装包名称等信息，方便基于同一份Dockerfile构建不同版本异构环境的镜像。

      * `--target`：指定目标构建阶段，对应到Dockerfile中定义的阶段。

   3. 查看构建好的Docker镜像。

      ```bash
      $ docker images
      REPOSITORY       TAG                               IMAGE ID       CREATED              SIZE
      stcrp190         ubuntu2204-hpe-1.9.3-mltc-1.3.0-py310  cacd5995dcb9   5 minutes ago   10.7GB
      ```

2. 基于Docker镜像启动容器。启动容器时，除Docker的原生参数外，还支持指定容器占用的NPU设备。以为容器分配1个NPU设备的4个Cluster为例：

   ```bash
   $ sudo docker run -it --device /dev/stc0 --device /dev/stc0c0 --device /dev/stc0c1 --device /dev/stc0c2 --device /dev/stc0c3 --device /dev/stc0ctrl stcrp180:ubuntu2204-hpe-1.9.1-mltc-1.2.0-py310 /bin/bash
   ```

   * `--device /dev/stc0`：指定使用NPU设备0。

   * `--device /dev/stc0c0`\~`--device /dev/stc0c3`：指定使用NPU设备0的4个Cluster。

   * `stcrp190:ubuntu2204-hpe-1.9.3-mltc-1.3.0-py310`：指定使用的Docker镜像。

### 验证安装结果

1. 在主机中查看是否已加载驱动。显示驱动信息，则代表已加载：

   ```bash
   $ lsmod | grep stc
   stc                   512000  0
   ```

2. 在容器中检查是否已透传驱动，运行hpe-example并尝试加载mltc模块。显示驱动信息，则代表驱动已透传；返回硬件响应信息，则代表已成功安装HPE非驱动模块；mltc模块加载成功，则代表已成功安装MLTC。

   ```bash
   $ lsmod | grep stc
   stc                   512000  0
   $ ls /usr/local/hpe/
   bin  conf  example  include  java  lib  libexec  riscv32npu  share  version.txt  version.yml
   $ cd /usr/local/hpe/example
   $ make
   $ ./hello_world
   host call  hello_world on device......
   hello world from device
   
   $ export RISCV=/usr/local/hpe
   $ python3
   Python 3.10.12 (main, Jul 29 2024, 16:56:48) [GCC 11.4.0] on linux
   Type "help", "copyright", "credits" or "license" for more information.
   >>> import mltc
   >>>
   ```

### 卸载STCRP

对容器中的HPE非驱动模块、MLTC等模块，在不需要使用时终止容器即可，无需卸载。

对HPE驱动模块，卸载步骤如下：

1. 卸载HPE驱动模块。

   ```bash
   $ sudo apt remove hpe-host
   $ sudo apt autoremove
   ```

2. 清除相关的文件。查看安装包状态，并清除包内带有postrm脚本的包（如有），即带rc标识的包（r代表Remove、c代表Config-files），并清除`/var/lib/apt/lists/`下的HPE相关文件。

   ```bash
   $ sudo dpkg --list | grep -E 'hpe|stc'
   $ sudo apt remove {rc-pkg-name} --purge
   $ rm /var/lib/apt/lists/*hpe* 
   ```

3. 如果安装时是离线安装，还需要卸载HPE本地存储库，并查看HPE本地存储库是否卸载干净。

   ```bash
   $ sudo apt remove hpe-repo
   $ sudo dpkg -l|grep hpe
   $ sudo dpkg -l|grep stc
   ```



## 主机中安装STCRP

建议先安装HPE再安装MLTC及其他工具，配套软件之间存在版本对应关系，详细信息请参见*STCRP Release Notes*。

### 安装HPE

#### 准备工作

安装HPE时需要注意大版本和小版本的区别：

* 大版本：例如hpe-1-8、hpe-1-9，限制在安装新版本前必须卸载旧版本。例如在服务器上已安装hpe-1-8后，希望升级到hpe-1-9，不可覆盖安装，必须先卸载掉hpe-1-8，然后再安装hpe-1-9。

* 小版本：例如hpe-1-8-1.8.0、hpe-1-8-1.8.1，允许升级安装。例如在服务器上已安装hpe-1-8-1.8.0，希望升级到hpe-1-8-1.8.1，覆盖安装即可。

#### 安装步骤

配置软件源后，检查软件包信息并安装HPE所有模块的命令如下：

* Ubuntu

  ```bash
  $ sudo apt update
  $ sudo apt install hpe
  ```

* 麒麟V10

  ```bash
  $ sudo yum clean all
  $ sudo yum makecache
  $ sudo yum install hpe
  ```

> 说明：配置软件源后，安装软件时默认安装最新的版本。例如，在软件源中同时存在hpe-1-8-1.8.0、hpe-1-8-1.8.1，默认安装hpe-1-8-1.8.1；在软件源中同时存在hpe-1-8、hpe-1-9，默认安装hpe-1-9。如有需要，您也可以手动指定大版本，例如`sudo apt install hpe-1-8`。

#### 验证安装结果

1. 查看HPE模块以及目录（/usr/local/hpe/）。示例回显信息如下：

   ```bash
   $ lsmod | grep stc
   stc                   512000  0
   $ ls /usr/local/hpe/
   bin  conf  example  include  java  lib  libexec  riscv32npu  share  version.txt  version.yml
   ```

   * include：存放头文件，例如hpert、stc-prof、libstc-common等模块的头文件。

   * lib：存放库文件，例如hpert、stcc、stc-prof等模块的库文件。

   * bin：存放可执行文件，例如stcc、stc-smi、stc-prof、stc-gdb、stc-vprof等模块的可执行文件。

   * conf：存放配置文件，例如stc-vprof等模块的配置文件。

   * riscv32npu：存放设备端使用的一些文件，例如npurt的头文件、库文件等。

   * example：存放异构示例程序。

   * 除`/usr/local/hpe/`下的文件外，还有驱动模块stc-dkms位于`/lib/modules/$(uname -r)/updates/dkms/stc.ko`、stc-kernel-common位于`/lib/udev/rules.d/70-stc.drv.rules`。

2. 试用HPE，进入hpe-example所在目录并运行用例。以hello\_world为例，如果HPE已正常运行，则硬件返回响应信息。示例输出如下：

   > 说明：更多用例的说明，请参见*HPE使用指南*。

   ```bash
   $ cd /usr/local/hpe/example
   $ make
   $ ./hello_world
   host call  hello_world on device......
   hello world from device
   ```

> 注意：如果在虚拟机中使用设备，首次启动虚拟机后，建议在虚拟机中重启一次推理卡，否则可能无法运行hello\_world。

#### 故障排查

安装HPE时，如果遇到提示缺失依赖或者类似的报错，例如：

```bash
$ sudo apt install hpe
Reading package lists... Done
Building dependency tree
Reading state information... Done
Some packages could not be installed. This may mean that you have
requested an impossible situation or if you are using the unstable
distribution that some required packages have not yet been created
or been moved out of Incoming.
The following information may help to resolve the situation:

The following packages have unmet dependencies:
 hpe : Depends: hpe-1-9 (>= 1.9.1) but it is not going to be installed
E: Unable to correct problems, you have held broken packages.
```

原因可能是：

* 重复安装：已经安装了大版本HPE，例如已经安装了hpe-1-8，未经卸载就直接安装hpe-1-9。

* 无法获取到所需的依赖：OS配置的软件源中没有添加所需的依赖，例如服务器未连接外网，且内网软件源中依赖不全。

解决方法为：

* 针对重复安装：请先卸载旧版本HPE，然后再安装新版本的HPE。

* 针对无法获取到所需的依赖：

  apt的报错信息不足以定位缺失的具体依赖，您可以执行`sudo aptitude install hpe`进行更全面地检查。

  > 说明：如果因为找不到依赖导致出错，yum的报错信息中一般会直接提示。

### 安装HPE Python

#### 安装步骤

将HPE Python的安装包复制到服务器，执行安装命令即可。示例命令如下：

```bash
$ pip3 install hpe_python-1.4.0-cp310-cp310-linux_x86_64.whl
```

#### 验证安装结果

查看HPE Python模块，回显HPE Python模块及版本即表示已成功安装HPE Python。

```bash
$ pip3 list | grep hpe
hpe-python               1.4.0
```

### 安装MLTC

#### 安装步骤

1. 安装相关依赖

   - Ubuntu

      ```Bash
      $ sudo apt install -y libopenblas-dev libopenmpi3 libnuma-dev 
      ```

   - 麒麟V10

      ```Bash
      $ sudo yum install -y openblas-devel numactl-libs openmpi-devel
      ```

      > 说明：openmpi-devel的安装版本不低于V4.0。

2. 将MLTC及其他工具的安装包复制到服务器，执行安装命令即可。示例命令如下：

   ```bash
   $ pip3 install mltc-1.3.0-cp310-cp310-linux_x86_64.whl
   ```

#### 验证安装结果

1. 查看mltc模块，回显mltc模块及版本即表示已成功安装MLTC。

   ```bash
   $ pip3 list | grep mltc
   mltc          1.3.0
   ```

2. 验证导入mltc模块。未提示导入错误，则表示导入成功。

   ```bash
   $ python3
   Python 3.10.11 (main, May 16 2023, 00:28:57) [GCC 11.2.0] on linux
   Type "help", "copyright", "credits" or "license" for more information.
   >>> import mltc
   >>> 
   ```

### 安装量化工具

#### 安装步骤

* 安装SNQ量化工具：

  ```bash
  $ pip3 install stcnq-1.0.0-py3-none-any.whl
  ```

* 安装SNC量化工具：

  ```bash
  $ pip3 install stcnc-1.0.1-py3-none-any.whl
  ```

#### 验证安装结果

查看SNQ、SNC模块，回显模块及版本即表示已成功安装。

```bash
$ pip3 list | grep stc
stcnc                            1.0.1
stcnq                            1.0.0
```

### 安装STC\_LLM

#### 准备工作

- STC_LLM依赖HPE Python、STC_LLM_DNN、STC_LLM_MLTC，需一同安装。
- 安装STC_LLM之前，请确保已安装了HPE Python。
- 安装STC_LLM_MLTC之前，请确保已安装了MLTC。

#### 安装步骤

1. 将STC\_LLM、STC\_LLM\_DNN、STC\_LLM\_MLTC安装包复制到目标服务器。

2. 安装STC\_LLM。

   ```bash
   $ pip3 install stc_llm-1.2.0-py3-none-any.whl
   ```

3. 安装所需的库。

   - 安装STC\_LLM\_DNN。

      ```bash
      $ pip3 install stc_llm_dnn-1.2.0-py3-none-any.whl
      ```

   - 安装STC\_LLM\_MLTC。

      ```bash
      $ pip3 install stc_llm_mltc-1.3.0-py3-none-any.whl
      ```

#### 验证安装结果

查看STC\_LLM、STC\_LLM\_DNN模块，回显模块及版本即表示已成功安装。

```bash
$ pip3 list | grep stc
stc_llm                          1.2.0
stc_llm_dnn                      1.2.0
stc_llm_mltc                     1.3.0
```

### 卸载STCRP

在更新安装等情况下，您可能需要卸载并重新安装配套软件。卸载操作本身没有强制顺序要求，先卸载任一软件均可操作成功，但推荐您先卸载其他软件再卸载HPE。

#### 卸载STC\_LLM

1. 查看已安装STC\_LLM、STC\_LLM\_DNN、STC\_LLM\_MLTC模块。

   ```bash
   $ pip3 list | grep -E 'stc'
   stc_llm                          1.2.0
   stc_llm_dnn                      1.2.0
   stc_llm_mltc                     1.3.0
   ```

2. 卸载STC\_LLM模块。

   ```bash
   $ pip3 uninstall stc_llm
   ```

3. 卸载STC\_LLM\_DNN模块。

   ```bash
   $ pip3 uninstall stc-llm-dnn
   ```

4. 卸载STC\_LLM\_MLTC模块。

   ```bash
   $ pip3 uninstall stc-llm-mltc
   ```

#### 卸载HPE Python

1. 查看已安装的HPE Python模块。

   ```bash
   $ pip3 list | grep -E 'hpe'
   hpe-python               1.4.0
   ```

2. 卸载HPE Python模块。

   ```bash
   $ pip3 uninstall hpe-python
   ```

#### 卸载MLTC

1. 查看已安装的MLTC模块。

   ```bash
   $ pip3 list | grep -E "mltc"
   mltc          1.3.0
   ```

2. 卸载MLTC模块。

   ```bash
   $ pip3 uninstall mltc
   ```

#### 卸载量化工具

1. 查看已安装的量化工具模块。

   ```bash
   $ pip3 list | grep -E "stcn"
   stcnc                            1.0.1
   stcnq                            1.0.0
   ```

2. 卸载量化工具模块。

   ```bash
   $ pip3 uninstall stcnc
   $ pip3 uninstall stcnq
   ```

#### 卸载HPE

1. 在卸载HPE前，请确保没有运行任何依赖HPE驱动（stc.ko）的程序，否则会卸载失败。

   1. 查看HPE驱动的占用情况。下方示例中，HPE驱动被48个其他模块占用。

      ```bash
      $ lsmod | grep stc
      stc                   512000  48
      ```

   2. 终止占用HPE驱动的程序。

      * 如果业务允许重启主机，重启主机是最直接的方式。

      * 如果业务不允许重启主机，您可以查看占用HPE驱动的程序，然后判断业务是否允许终止这些程序。如果允许，终止程序对应的进程即可。下方示例中，依赖HPE驱动的程序Pid为1328500。

        ```bash
        $ stc-smi
        # 忽略部分回显
        +--------------------------------------------------------------+
        | Processes:                                                   |
        | NPU CLUSTER       Pid  processName                 MemoryUsed|
        +==============================================================+
        | 0       0       1328500  python3                      339.43M|
        +--------------------------------------------------------------+
        ```

2. 卸载安装的HPE模块。

   * autoremove方案

     * Ubuntu

       ```bash
       $ sudo apt remove hpe
       $ sudo apt autoremove
       ```

     * 麒麟V10

       ```bash
       $ sudo yum remove hpe
       $ sudo yum autoremove
       ```

   * 通配符方案（Ubuntu）

     ```bash
     $ sudo apt-get --purge remove "hpe-hpert-dev*" "stc-gdb*" "stc-smi*" "hpe-example*" "hpe-stcc*" "stc-kernel-common*" "hpe-hpert*" "stc-dkms*" "stc-prof*" "stc-vprof*"
     ```

3. 清除相关的文件。

   * Ubuntu：查看安装包状态，并清除包内带有postrm脚本的包（如有），即带rc标识的包（r代表Remove、c代表Config-files），并清除`/var/lib/apt/lists/`下的HPE相关文件。

     ```bash
     $ sudo dpkg --list | grep -E 'hpe|stc'
     $ sudo apt remove {rc-pkg-name} --purge
     $ rm /var/lib/apt/lists/*hpe* 
     ```

   * 麒麟V10：清除ko文件，并清除`/var/lib/apt/lists/`下的HPE相关文件。

     ```bash
     $ sudo find /lib/modules -name stc.ko.xz -type f | sudo xargs rm -rf
     $ sudo find /lib/modules -name stc.ko -type f | sudo xargs rm -rf
     $ rm /var/lib/apt/lists/*hpe* 
     ```

4. 如果采用了离线安装方式，还需要卸载HPE本地存储库，并查看HPE本地存储库是否卸载干净。

   * Ubuntu

     ```bash
     $ sudo apt remove hpe-repo
     $ sudo dpkg -l|grep hpe
     $ sudo dpkg -l|grep stc
     ```

   * 麒麟V10

     ```bash
     $ sudo yum remove hpe-repo
     $ sudo rpm -qa|grep hpe
     $ sudo rpm -qa|grep stc
     ```

