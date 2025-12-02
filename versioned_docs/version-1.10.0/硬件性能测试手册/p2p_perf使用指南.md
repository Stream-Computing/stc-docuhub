# p2p_perf使用指南

## p2p\_perf概述

p2p\_perf用于测试板卡之间的数据传输速度，以评估卡卡互联的性能。

## 使用p2p\_perf测试板卡间数据传输

### 前提条件

保证主机上至少有2张板卡。

### 操作步骤

1. 将p2p\_perf包传输到主机上并解压。

   ```bash
   $ tar -xvzf p2p_perf-v1.3.0.tar.gz
   ```

2. 启动测试，然后等待测试完成即可。

   ```bash
   $ cd p2p_perf_rdma/
   $ make
   $ ./memcpy_p2p
   ```

3. 查看测试结果。测试完成后直接在终端显示测试结果，包括在NPU0和NPU1之间做DDR2DDR、DDR2LLB、LLB2DDR、LLB2LLB数据传输时耗时和速度。

   ```bash
   $ ./memcpy_p2p
   ------ executing memcpy_p2p test from NPU0 to NPU1 ------
   
   DDR cp length (2176MB):
     using allocated local_ddr: 0x01400000
     using allocated remote_ddr: 0x01400000
   LLB cp length (32MB):
     using fixed local_llb: 0xf8000000
     using fixed remote_llb: 0xf8000000
   
   ------ddr -> ddr------
   >> local 0x01400000 -> remote 0x801400000, len: 0x88000000, data = 0x01010101, flag = 0x11111111@0x889400000
   >> memcpy_p2p done, time = 2567703143ns, speed = 888.615783 MB/s
   ------ddr -> ddr done------
   
   ------ddr -> llb------
   >> local 0x01400000 -> remote 0x0f8000000, len: 0x1fffffc, data = 0x02020202, flag = 0x22222222@0x0f9fffffc
   >> memcpy_p2p done, time = 3726055ns, speed = 9005.349609 MB/s
   ------ddr -> llb done------
   
   ------llb -> ddr------
   >> local 0xf8000000 -> remote 0x801400000, len: 0x1fffffc, data = 0x03030303, flag = 0x33333333@0x8033ffffc
   >> memcpy_p2p done, time = 37849019ns, speed = 886.533569 MB/s
   ------llb -> ddr done------
   
   ------llb -> llb------
   >> local 0xf8000000 -> remote 0x0f8000000, len: 0x1fffffc, data = 0x04040404, flag = 0x44444444@0x0f9fffffc
   >> memcpy_p2p done, time = 3722323ns, speed = 9014.377929 MB/s
   ------llb -> llb done------
   ```

