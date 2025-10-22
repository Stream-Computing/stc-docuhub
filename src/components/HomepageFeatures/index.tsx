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
    title: 'AI加速卡',
    Svg: require('@site/static/img/stc_ai_card.svg').default,
    description: (
      <>
        基于RISC-V自研关键的AI计算矩阵扩展指令集，实现NPU神经网络计算架构NeuralScale，并推出软硬件协同设计的云端推理AI芯片以及AI加速卡，具有高能效、低延时、灵活可编程等特点，广泛应用于需要推理加速的场景中。
      </>
    ),
  },
  {
    title: 'AI一体机',
    Svg: require('@site/static/img/stc_ai_aio.svg').default,
    description: (
      <>
        面向垂直场景深度定制的系统级解决方案，采用自主可控的RISC-V AI算力，搭配自研的垂域大模型底座、智能体开发平台等，凭借先进的核心算法库和数据智能治理套件，助力行业客户快速落地垂域智能体，一站式解决数智化转型的痛点。
      </>
    ),
  },
  {
    title: '智算云平台',
    Svg: require('@site/static/img/stc_ai_cloud.svg').default,
    description: (
      <>
        面向未来的大规模智算算力管理方案，致力于突破算力孤岛和资源受限的桎梏，建设集中管理、智能编排、弹性伸缩、主动运维、可审计的算力及应用生态，助力客户以更低的成本、更高的效率、更安全可控的方式构建和运转人工智能和大数据业务。
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
