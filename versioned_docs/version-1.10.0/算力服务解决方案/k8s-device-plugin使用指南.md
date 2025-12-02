# k8s-device-plugin使用指南

## k8s-device-plugin概述

我们提供了Kubernetes设备插件stc-k8s-device-plugin，方便您在无需修改Kubernetes核心代码情况下，即可实现包含NPU设备的通用解决方案。部署stc-k8s-device-plugin后，在创建Pod时Kubernetes集群会自动申请使用NPU设备，并跟踪NPU设备的健康状况。

## 使用k8s-device-plugin申请NPU设备

### 前提条件

* 安装Kubernetes，支持1.18、1.22、1.23和1.24版本，推荐使用1.18版本。

* 部署Kubernetes集群。

* 在主机上部署异构环境。

  > 说明：目前在主机上有两种方式部署异构环境。采取整包安装方式部署，所有配套软件都将安装在主机侧上。采取Docker安装方式部署，HPE驱动模块安装在主机上，其他模块安装在容器中。安装方式将影响后续创建Pod的方式。

* 获取stc-k8s-device-plugin的工具包。

### 部署设备插件

1. 登录Kubernetes集群的master节点。

2. 解压stc-k8s-device-plugin工具包并进入插件目录。以工具包名称为stc-k8s-device-plugin-1.0.1.tgz为例：

   ```bash
   $ tar -xvzf stc-k8s-device-plugin-1.0.1.tgz
   $ cd stc-k8s-device-plugin-1.0.1
   $ ls
   Dockerfile  go.mod  go.sum  main.go  pod  README.md  stc-device-plugin.yaml
   ```

3. 构建设备插件镜像。目前提供两种方式：

   * 基于插件目录下的Dockerfile构建设备插件镜像，Dockerfile的详细内容，请参见*文件示例*章节。以为设备插件镜像添加标签stc/k8s-device-plugin为例，示例命令如下：

     ```bash
     $ docker build -t stc/k8s-device-plugin .
     ```

   * 基于离线镜像包导入设备插件镜像。以导入stc-k8s-device-plugin-1_0_1.tar镜像包为例，示例命令如下：

     ```bash
     $ docker load -i stc-k8s-device-plugin-1_0_1.tar
     ```

   > 说明：联系技术支持获取离线镜像包。

4. 查看构建或导入好的设备插件镜像，即标签为stc/k8s-device-plugin的镜像。

   ```bash
   $ docker images | grep k8s-device-plugin
   REPOSITORY                                       TAG                             IMAGE ID       CREATED         SIZE
   stc/k8s-device-plugin                            latest                          f8edbe727b00   2 minutes ago   827MB                             3.4.3-0                         303ce5db0e90   3 years ago     288MB
   ```

5. 基于插件目录下的YAML文件在Kubernetes集群中部署设备插件，YAML文件的详细内容，请参见*文件示例*章节。

   > 说明：部署插件时采用创建DaemonSet的方式，新增节点上的NPU设备会自动加入资源池。

   ```bash
   $ kubectl apply -f stc-device-plugin.yaml
   daemonset.apps/stc-device-plugin-daemonset created
   ```

6. 检查部署结果。如果插件部署成功，查看pod时会出现名称以`stc-device-plugin-daemonset`开头的DaemonSet，且状态为Running。以master节点的主机名称为k8smasterdemo为例：

   ```bash
   $ kubectl get pods -n kube-system | grep stc-device-plugin
   NAME                                READY   STATUS    RESTARTS   AGE
   stc-device-plugin-daemonset-hlpgt   1/1     Running   0          7s
   ```

### 创建Pod并申请NPU设备

本章节演示如何在创建Pod时申请NPU设备，并在Pod中使用已部署的异构环境。

> 说明：在创建Pod时，Pod镜像的OS和VM的OS需保持一致，否则可能因glibc、gcc等基础软件不匹配出现异常。

以基于Ubuntu 22.04的Pod为例：

1. 进入插件目录stc-k8s-device-plugin-1.0.1。

2. 使用示例配置创建一个Pod。

   1. 构建Pod镜像，目前根据HPE安装方式的不同，可分为映射场景和非映射场景。

      * 若HPE采取整包方式安装，所有配套软件都安装在主机上。构建Pod镜像，可采用映射的方式获取HPE相关库。示例如下，Dockerfile的详细内容，请参见*文件示例*章节。

        ```bash
        $ docker build -t stc/k8s-pod-example pod/
        ```

      * 若HPE驱动模块安装在主机上，其他模块安装在容器中。构建Pod镜像，可采用非映射的方式，需要将HPE相关库安装在Pod中。构建Pod镜像示例如下，Dockerfile的详细内容，请参见*文件示例*章节。

        ```bash
        $ DOCKER_BUILDKIT=1 docker build -f Dockerfile -t stc/k8s-pod-example --build-arg URI=http://example.com --target dev .
        ```

   2. 查看构建好的Pod镜像，即标签为stc/k8s-pod-example的镜像。

      ```bash
      $ docker images | grep k8s-pod-example
      REPOSITORY                                       TAG                             IMAGE ID       CREATED         SIZE
      stc/k8s-pod-example                              latest                          35dac764fd1f   1 minutes ago   114MB
      ```

   3. 基于pod目录下YAML文件创建一个名为stc-example-pod的Pod，YAML文件的详细内容，请参见*文件示例*章节。

      ```bash
      $ kubectl apply -f pod/example.yaml
      ```

3. 检查Pod的运行状态，确定状态为Running。

   ```bash
   $ kubectl get pods
   NAME              READY   STATUS    RESTARTS   AGE
   stc-example-pod   1/1     Running   0          10s
   ```

4. 在Pod中验证NPU设备可用。

   * 通过容器的Shell访问。以Bash为例，打开一个Bash终端后输入Shell命令即可。该示例过程中Kubernetes集群会将控制台输入发送到stc-example-pod中第一个容器的Shell，并将输出返回到控制台。如果成功访问到设备，会返回NPC的response。

     > 注意：采用映射方式构建的Pod，example文件下的文件在主机侧编译后，在Pod中可直接运行。采用非映射方式构建的Pod，example文件下的文件需先在Pod中编译后才能运行。

     ```bash
     $ kubectl exec -it stc-example-pod -- bash
     root@stc-example-pod:/# cd /usr/local/hpe/example
     root@stc-example-pod:/usr/local/hpe/example# ./hello_world
     host call  hello_world on device......
     hello world from device
     ```

   * 您也可以通过kubectl命令访问。如果成功访问到设备，会返回NPC的response。

     ```bash
     $ kubectl exec stc-example-pod -- /usr/local/hpe/example/hello_world
     host call  hello_world on device......
     hello world from device
     ```

### 文件示例

#### Dockerfile（构建设备插件镜像）

```dockerfile
FROM ubuntu:bionic
RUN apt-get update \
    && apt-get install -y vim \
    && apt-get install -y coreutils \
    && apt-get install -y bash \
    && apt-get install -y wget

RUN wget -nv -O - https://storage.googleapis.com/golang/go1.16.4.linux-amd64.tar.gz \
    | tar -C /usr/local -xz
ENV GOPATH /go
ENV PATH $GOPATH/bin:/usr/local/go/bin:$PATH

WORKDIR /gosrc/k8s-device-plugin
COPY * ./
RUN go version
RUN go env -w GOPROXY=https://goproxy.cn
RUN go env -w GOSUMDB=off
RUN go build
RUN cp k8s-device-plugin /usr/bin/

CMD ["k8s-device-plugin"]
```

#### stc-device-plugin.yaml（在Kubernetes集群中部署设备插件）

```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: stc-device-plugin-daemonset
  namespace: kube-system
spec:
  selector:
    matchLabels:
      name: stc-device-plugin-ds
  template:
    metadata:
      annotations:
        scheduler.alpha.kubernetes.io/critical-pod: ""
      labels:
        name: stc-device-plugin-ds
    spec:
      tolerations:
      - key: CriticalAddonsOnly
        operator: Exists
      - key: streamcomputing.com/npu
        operator: Exists
        effect: NoSchedule
      containers:
      - image: stc/k8s-device-plugin
        imagePullPolicy: IfNotPresent
        name: stc-device-plugin-ctr
        securityContext:
          privileged: true
          capabilities:
            drop: ["ALL"]
        volumeMounts:
          - name: device-plugin
            mountPath: /var/lib/kubelet/device-plugins
          - name: dev
            mountPath: /dev
      volumes:
        - name: device-plugin
          hostPath:
            path: /var/lib/kubelet/device-plugins
        - name: dev
          hostPath:
            path: /dev
```

#### Dockerfile（构建Pod镜像采用映射方式获取HPE相关库）

```dockerfile
FROM ubuntu:22.04
ENV LD_LIBRARY_PATH /usr/local/hpe/lib:$LD_LIBRARY_PATH
RUN ln -s /usr/local/hpe/bin/clang++ /usr/bin/stc-clang++
RUN ln -s /usr/local/hpe/bin/stcc /usr/bin/stcc
RUN ln -s /usr/local/hpe/bin/lld /usr/bin/stc-ld.lld
```

#### Dockerfile（构建Pod镜像采用非映射方式获取HPE相关库）

以在Ubuntu 22.04上构建STCRP1.10.0版本为例：

```dockerfile
FROM scratch AS base

COPY pip.conf /mnt/pip.conf
COPY jupyter_notebook_config.json /mnt/jupyter_notebook_config.json
COPY tini /mnt/tini

#FROM harbor.streamcomputing.com/devops/ubuntu:22.04 AS final
FROM harbor.streamcomputing.com/nvidia/tritonserver:24.05-py3-base AS final

ENV PYTHONIOENCODING=UTF-8
ENV RISCV=/usr/local/hpe
ENV TZ=Asia/Shanghai

ARG URI
ARG HPE_REPO=hpe-repo-ubuntu2204-1-9-local_1.9.4_amd64.deb
ARG MLTC_install_file=mltc-1.4.0-cp310-cp310-linux_x86_64.whl
ARG STCNQ_install_file=stcnq-1.0.0-py3-none-any.whl
ARG STC_IE_install_file=stc_ie-1.4.0-py3-none-any.whl
ARG STCNC_install_file=stcnc-1.0.1-py3-none-any.whl
ARG HPE_PYTHON_install_file=hpe_python-1.4.1-cp310-cp310-linux_x86_64.whl

ENV PASSWORD=666666

WORKDIR /workspace

RUN --mount=type=bind,from=base,source=/mnt,target=/mnt,rw \
    sed -i "s/archive\.ubuntu\.com/mirrors.tuna.tsinghua.edu.cn/g; s/security\.ubuntu\.com/mirrors.tuna.tsinghua.edu.cn/g" /etc/apt/sources.list \
    && mkdir -p ~/.pip && cp /mnt/pip.conf ~/.pip/pip.conf \
    && apt-get update \
    && apt install -y wget && wget http://apt.streamcomputing.com/docker_sources_mirror.sh -O docker_sources_mirror.sh && bash docker_sources_mirror.sh \
    && apt-get install -y wget gpg-agent gnupg ca-certificates sudo make cmake gcc g++ libopenblas-dev libopenmpi3 libnuma-dev --no-install-recommends \
    && wget ${URI}/${HPE_REPO} -O /tmp/hpe.deb \
    && dpkg -i /tmp/hpe.deb \
    && sudo cp /var/hpe-repo-*-local/hpe-*.gpg /usr/share/keyrings/ \
    && apt-get update \
    && apt-get install hpe-simple -y \
    && pip3 install ${URI}/${MLTC_install_file} ${URI}/${STC_IE_install_file} ${URI}/${HPE_PYTHON_install_file} \
    && pip3 install ${URI}/${STCNQ_install_file} ${URI}/${STCNC_install_file} \
    && pip3 install sentencepiece onnx onnxruntime jupyterlab opencv-python \
    && apt-get install vim tree openssh-server unzip gdb -y \
    && echo 'root:666666' | chpasswd \
    && echo 'PermitRootLogin yes' >> /etc/ssh/sshd_config \
    && mkdir -p /run/sshd \
    && pip3 install jupyter jupyterlab qgrid ipywidgets \
       ipython \
       ipython-sql \
       jupyterlab-git \
       jupyterlab-lsp \
       python-lsp-server[all] \
       jupyterlab-language-pack-zh-CN \
#    && pip install torch==2.0.1+cpu torchvision==0.15.2+cpu --extra-index-url https://download.pytorch.org/whl/cpu \
    && cp /mnt/jupyter_notebook_config.json /jupyter_notebook_config.json \
    && cp /mnt/tini /usr/bin/tini \
    && chmod +x /usr/bin/tini \
    && rm -rf /root/.cache /tmp/hpe.deb /var/lib/apt/lists/*

EXPOSE 8888 22 8080

ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["jupyter", "lab", "--port=8888", "--no-browser", "--allow-root", "--ip=0.0.0.0", "--config=/jupyter_notebook_config.json"]
```

#### example.yaml（创建Pod）

Pod名为stc-example-pod，目前仅支持以一个NPU为最小粒度申请，并限制申请一个NPU设备。

```yaml
# example of a POD running sleep 100000 and allocated 1 NPU device

apiVersion: v1
kind: Pod
metadata:
  name: stc-example-pod
spec:
#  restartPolicy: OnFailure
  containers:
  - image: stc/k8s-pod-example
    imagePullPolicy: IfNotPresent
    name: stc-example-ctr
    command: ["sleep"]
    args: ["100000"]

    volumeMounts:
      - name: hpelink
        mountPath: /usr/local/hpe
    resources:
      limits:
        streamcomputing.com/npu: 1

  volumes:
    - name: hpelink
      hostPath:
        path: /usr/local/hpe
```
