import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: '云端推理卡',
    Svg: require('@site/static/img/stc_inference_card.svg').default,
    description: (
      <>
        面向云端AI推理计算的板卡级产品，基于自研AI计算矩阵扩展指令集和NeuralScale架构，软硬件
        协同设计，具有高能效、低延时等特点，广泛应用于需要AI推理加速的场景中。
      </>
    ),
  },
  {
    title: '智能体一体机',
    Svg: require('@site/static/img/stc_agent_allinone.svg').default,
    description: (
      <>
        面向政务场景深度定制的系统级解决方案，采用自主可控的RISC-V AI算力，配套自研大模型
        推理引擎，搭载希姆九州、DeepSeek等大模型底座，依托擎天智能体开发平台的算法能力，为
        客户快速落地智能政务通助手，一站式解决政务场景的痛点，助力政务服务数智化转型。
      </>
    ),
  },
  {
    title: '智算云平台',
    Svg: require('@site/static/img/stc_aicomputing_cloud.svg').default,
    description: (
      <>
        面向智算中心研发的专业算力平台，旨在有机调动智算集群中的计算、网络、存储资源，形成
        云上随用随取的AI算力，应对当前AI算力中心建设中标准不一、技术深度不足、交付周期冗长
        等一系列挑战。
      </>
    ),
  },
];

function Feature({title, Svg, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
