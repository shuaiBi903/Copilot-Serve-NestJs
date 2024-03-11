import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import { Worker } from 'worker_threads';

@Injectable()
export class WorkerPoolService implements OnModuleInit, OnModuleDestroy {
    private workers: Worker[] = [];
    constructor(
        private readonly configService: ConfigService,
    ) { }
    onModuleInit() {
        const WORKER = this.configService.get("WORKER")
        if (!WORKER) {
            return
        }
        // 判断是否是数字
        if (isNaN(+WORKER)) {
            console.log("WORKER is not a number")
            throw new Error("WORKER is not a number")
        }
        console.log("WORKER>>>>>>>>>>线程数量", WORKER)
        for (let i = 0; i < WORKER; i++) {  // 这里将最大线程数设置为 10
            const worker = new Worker(path.join(__dirname, './app.worker.js'));
            // 写入线程池
            this.workers.push(worker);
        }
    }

    onModuleDestroy() {
        // 关闭所有线程
        for (const worker of this.workers) {
            worker.terminate();
        }
    }

    getWorker() {
        // 如果没有空闲线程，返回 null
        if (this.workers.length === 0) {
            console.log('All workers are busy. Please wait...');
            return null;
        }

        return this.workers.pop();
    }
    // 重新添加线程
    releaseWorker(worker: Worker) {
        this.workers.unshift(worker);
    }
    // 删除线程并关闭, 用于线程异常退出, 重新创建线程
    async removeWorker(worker: Worker) {
        await worker.terminate(); // 关闭线程
        this.workers = this.workers.filter(w => w !== worker); // 删除线程
        //确认线程删除
        if (this.workers.length < 10) {
            // 重新创建线程
            const newWorker = new Worker(path.join(__dirname, './app.worker.js'));
            this.workers.unshift(newWorker);
        }
    }

}
