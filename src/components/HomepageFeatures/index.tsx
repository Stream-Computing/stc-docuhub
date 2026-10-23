import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';
import Link from '@docusaurus/Link';

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  description: ReactNode;
  link: Map<string, string>;
};

const FeatureList: FeatureItem[] = [
  {
    title: '算力矩阵',
    Svg: require('@site/static/img/stc_hardware.svg').default,
    description: (
      <>
        AI加速卡、AI服务器、AI智算集群、AI超节点等
      </>
    ),
    link: new Map([
      ["AI加速卡", "/AI加速卡/硬件产品手册/STCP950L产品手册"],
    ])
  },
  {
    title: '软件生态',
    Svg: require('@site/static/img/stc_software.svg').default,
    description: (
      <>
        异构编程引擎、AI编译器、推理框架、智算云平台、企业级智能体等
      </>
    ),
    link: new Map([
      ["智算云平台", "/智算云平台/云管平台使用指南（系统管理员）"],
      ["芯周通用智能体", "/芯周通用智能体/芯周通用智能体"],
      ["TAX编译智能体", "/TAX编译智能体/TAX编译智能体"],
      
    ])
  },
  {
    title: '解决方案',
    Svg: require('@site/static/img/stc_solution.svg').default,
    description: (
      <>
        智算中心、智慧政务、智慧医疗、智慧金融、智慧教育、智慧制造、智慧能源等
      </>
    ),
    link: new Map([
    ])
  },
];

function Feature({title, Svg, description, link}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p> 
      </div>
      {link && Array.from(link.entries()).map(([key, value]) => (
        <a key={key} href={value} style={{ display: 'block', margin: '4px 50px', padding: '0 20px' }}>
          {key}
        </a>
       ))}
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
