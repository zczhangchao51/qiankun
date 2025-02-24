/**
 * @author kuitos
 * @since 2019-05-16
 */
import { ImportEntryOpts } from 'import-html-entry';
import { RegisterApplicationConfig, StartOpts, Parcel } from 'single-spa';

declare global {
  interface Window {
    __POWERED_BY_QIANKUN__?: boolean;
    __INJECTED_PUBLIC_PATH_BY_QIANKUN__?: string;
  }
}

export type Entry =
  | string
  | {
      scripts?: string[];
      styles?: string[];
      html?: string;
    };

export type HTMLContentRender = (props: { appContent: string; loading: boolean }) => any;

export type AppMetadata = {
  // app name
  name: string;
  // app entry
  entry: Entry;
};

// just for manual loaded apps, in single-spa it called parcel
export type LoadableApp<T extends object = {}> = AppMetadata & { /* props pass through to app */ props?: T } & (
    | {
        // legacy mode, the render function all handled by user
        render: HTMLContentRender;
      }
    | {
        // where the app mount to, mutual exclusive with the legacy custom render function
        container: string | HTMLElement;
      }
  );

// for the route-based apps
export type RegistrableApp<T extends object = {}> = LoadableApp<T> & {
  loader?: (loading: boolean) => void;
  activeRule: RegisterApplicationConfig['activeWhen'];
};

export type PrefetchStrategy =
  | boolean
  | 'all'
  | string[]
  | ((apps: AppMetadata[]) => { criticalAppNames: string[]; minorAppsName: string[] });

type QiankunSpecialOpts = {
  prefetch?: PrefetchStrategy;
  sandbox?:
    | boolean
    | {
        strictStyleIsolation?: boolean;
        patchers?: Patcher[];
      };
  /*
    with singular mode, any app will wait to load until other apps are unmouting
    it is useful for the scenario that only one sub app shown at one time
  */
  singular?: boolean | ((app: LoadableApp<any>) => Promise<boolean>);
};
export type FrameworkConfiguration = QiankunSpecialOpts & ImportEntryOpts & StartOpts;

export type LifeCycleFn<T extends object> = (app: LoadableApp<T>, global: typeof window) => Promise<any>;
export type FrameworkLifeCycles<T extends object> = {
  beforeLoad?: LifeCycleFn<T> | Array<LifeCycleFn<T>>; // function before app load
  beforeMount?: LifeCycleFn<T> | Array<LifeCycleFn<T>>; // function before app mount
  afterMount?: LifeCycleFn<T> | Array<LifeCycleFn<T>>; // function after app mount
  beforeUnmount?: LifeCycleFn<T> | Array<LifeCycleFn<T>>; // function before app unmount
  afterUnmount?: LifeCycleFn<T> | Array<LifeCycleFn<T>>; // function after app unmount
};

export type MicroApp = Parcel;

export type Rebuilder = () => void;
export type Freer = () => Rebuilder;
export type Patcher = () => Freer;

export interface SandBox {
  /** 沙箱的名字 */
  name: string;
  /** 沙箱导出的代理实体 */
  proxy: WindowProxy;
  /** 沙箱是否在运行中 */
  sandboxRunning: boolean;
  /** 启动沙箱 */
  active(): void;
  /** 关闭沙箱 */
  inactive(): void;
}

export type OnGlobalStateChangeCallback = (state: Record<string, any>, prevState: Record<string, any>) => void;

export type MicroAppStateActions = {
  onGlobalStateChange: (callback: OnGlobalStateChangeCallback, fireImmediately?: boolean) => void;
  setGlobalState: (state: Record<string, any>) => boolean;
  offGlobalStateChange: () => boolean;
};
