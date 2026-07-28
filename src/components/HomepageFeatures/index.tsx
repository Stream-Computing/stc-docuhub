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
    title: '算力矩阵',
    Svg: require('@site/static/img/stc_hardware.svg').default,
    description: (
      <>
        AI加速卡、AI服务器、AI智算集群、AI超节点，各种形态的AI算力产品，覆盖云边端全场景。
      </>
    ),
  },
  {
    title: '软件生态',
    Svg: require('@site/static/img/stc_software.svg').default,
    description: (
      <>
        基础层的异构编程引擎、AI编译器、推理框架，平台层的云管平台、算力调度平台、大模型平台，应用层的智能体开发平台、企业级智能体，精简开发部署AI应用的过程，提供开箱即用的服务。
      </>
    ),
  },
  {
    title: '解决方案',
    Svg: require('@site/static/img/stc_solution.svg').default,
    description: (
      <>
        智算中心、智慧政务、智慧医疗、智慧金融、智慧教育、智慧制造、智慧能源等，深耕行业，为各领域提供软硬一体的数智化转型方案。
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
