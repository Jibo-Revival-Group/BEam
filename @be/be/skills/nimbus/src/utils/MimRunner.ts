import jibo = require('jibo');
import { libraries } from '@be/be-framework';
const { ExtPromiseWrapper } = libraries.jibo_cai_utils;


export class MimRunner {
    private mim: jibo.bt.behaviors.Mim;
    private runStatus: libraries.jibo_cai_utils.ExtPromiseWrapper<any>;
    private initialized: boolean;

    public init(options: any) {
        // Don't handle Q failure as it will be handled by cloud
        options.onFailure = () => true;
        this.mim = new jibo.bt.behaviors.Mim(options);
        this.update = this.update.bind(this);
        this.runStatus = new ExtPromiseWrapper();
        this.initialized = true;
    }

    public run(): Promise<any> {
        if (!this.initialized) {
            throw new Error('Cannot start un-initialized MimRunner!');
        } else {
            this.mim.start();
            jibo.timer.on('update', this.update);
            return this.runStatus.promise;
        }
    }

    public stop(): Promise<void> {
        jibo.timer.removeListener('update', this.update);
        if (!this.mim) {
            return Promise.resolve();
        }
        return this.mim.stop()
            .then((data) => this.runStatus.resolve(data))
            .catch((err) => this.runStatus.reject(err));
    }

    public destroy(): void {
        this.runStatus = null;
        if (!this.mim) {
            return;
        }
        this.mim.destroy();
        this.mim = null;
    }

    private update(): void {
        const status = this.mim.update();
        if (status !== jibo.bt.Status.IN_PROGRESS) {
            jibo.timer.removeListener('update', this.update);
            this.runStatus.resolve(status);
        }
    }
}