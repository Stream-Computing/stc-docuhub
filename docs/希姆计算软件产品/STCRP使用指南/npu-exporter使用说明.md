# npu-exporter使用说明

## npu-exporter概述

npu-exporter用于获取NPU设备的指标数据或者相关信息并推送给Prometheus，例如NPU设备ID、NPU利用率、内存使用量等。方便您进一步图形化监控资源使用情况，以及根据AI应用的要求设置告警规则，实现指标数据异常时自动告警。

- npu-exporter支持推送的NPU指标如下表所示。

  | **指标名称**         | **指标类型** | **单位** | **说明**                            |
  | -------------------- | ------------ | -------- | ----------------------------------- |
  | npu_temp             | Gauge        | ℃        | 设备的当前NPU温度读数。             |
  | npu_util             | Gauge        | %        | NPU利用率。                         |
  | power_draw           | Gauge        | W        | 设备的功耗使用情况。                |
  | power_total          | Gauge        | W        | 设备所能达到的总功耗。              |
  | memory_used          | Gauge        | MB       | 设备已使用的内存。                  |
  | memory_total         | Gauge        | GB       | 设备的总内存。                      |
  | cluster_count        | Gauge        | 个       | 设备内NPC Cluster的数量。           |
  | cluster_util         | Gauge        | %        | 设备内每个NPC Cluster的使用率。     |
  | cluster_memory_used  | Gauge        | MB       | 设备内每个NPC Cluster已使用的内存。 |
  | cluster_memory_total | Gauge        | GB       | 设备内每个NPC Cluster的总内存。     |

- npu-exporter支持获取的NPU设备相关信息如下表所示。

  | **信息类型** | **指标类型** | **说明**                                                     |
  | ------------ | ------------ | ------------------------------------------------------------ |
  | npu_info     | Gauge        | 设备相关的信息，包括服务器IP、设备ID、设备名称、板卡类型、设备SN、驱动版本、设备频率、PCIe总线ID、MCU firmware版本、NPU_ctrl firmware版本。 |
  | cluster_info | Gauge        | 设备内每个NPC Cluster相关的信息， 包括服务器IP、NPC Cluster所属设备的ID、NPC Cluster ID、NPC Cluster状态。 |

## 验证采集NPU指标数据

为了向Prometheus推送NPU指标数据，您需要开启npu-exporter服务并启用9836端口。

1. 开启npu-exporter服务，并设定为开机自动启动服务。

   ```bash
   $ sudo systemctl daemon-reload
   $ sudo systemctl enable npu_exporter.service --now
   ```

2. 确认9836端口已启用。返回9836端口相关的信息则表明端口已启用。

   ```bash
   $ ss -ntupl | grep 9836
   tcp     LISTEN   0        5                0.0.0.0:9836           0.0.0.0:*      users:(("python",pid=253431,fd=3))
   ```

3. 调用npu-exporter接口验证采集NPU指标数据。请将命令中的server_ip替换为安装了npu-exporter的服务器的IP。8卡机器的采集示例如下，回显了8张板卡的信息，然后采集了NPU的温度数据。

   > 说明：如果没有正常返回板卡的信息，可以执行命令`sudo systemctl restart npu_exporter.service`尝试重启服务。如果重启仍无法解决，请联系希姆计算技术支持。

	```bash
	$ curl {server_ip}:9836/metrics | grep npu_info
	  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
	                                 Dload  Upload   Total   Spent    Left  Speed
	1# HELP npu_info npu_info
	# TYPE npu_info gauge
	00npu_info{boardType="D02",bus_id="0000:03:00.0",driver_version="1.9.0",frequency="1000M",ip="172.16.32.250",mcu_firmware="1.0.9",npu_ctrl_firmware="1.3.4",npu_name="STCP920",npu_no="0",sn="01PSF60000170610"} 1.0
	  4302  100  4302    0     0   107k      0 --:--:-- --:--:-- --:--:--  107k
	
	$ curl {server_ip}:9836/metrics | grep npu_temp
	  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
	                                 Dload  Upload   Total   Spent    Left  Speed
	100# HELP npu_temp npu_temp
	# TYPE npu_temp gauge
	 npu_temp{ip="172.16.32.250",npu_no="0"} 39.0
    4300  100  4300    0     0   116k      0 --:--:-- --:--:-- --:--:--  116k

## 故障排查

如果出现设定为开机自动启动服务失败情况，如下图：

![img](/_static/images/npu-exporter-01.png)

可先使用`systemctl status npu_exporter.service`查看详情，如出现图中错误，可检查一下`/usr/lib/systemd/system/npu_exporter.service`服务配置文件中的路径。
