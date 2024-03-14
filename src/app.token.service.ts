import { HttpException, Injectable } from '@nestjs/common';
import axios from 'axios';
@Injectable()
export class AppTokenService {
    private readonly headers = {
        "accept": "application/json",
        "content-type": "application/json",
    }
    constructor() {
        // Initialize the token here
    }

    async getGhbToken() {
        try {
            const response = await this.getLoginInfo();
            return response
        } catch (error) {
            throw new HttpException(error.response || "获取认证信息失败,请稍后再试。", error.status || 500)
        }
    }

    async getLoginInfo() {
        const url = "https://github.com/login/device/code"
        const body = {
            "client_id": "Iv1.b507a08c87ecfe98",
            "scope": "read:user"
        }
        try {
            const response = await axios.post(url, body, { headers: this.headers })
            const data = await response.data
            return data
        } catch (e) {
            console.log(e)
            throw new HttpException(e.response, e.status || 500)
        }
    }

    async pollAuth(device_code: string) {
        const url = "https://github.com/login/oauth/access_token"
        const body = {
            "client_id": "Iv1.b507a08c87ecfe98",
            "device_code": device_code,
            "grant_type": "urn:ietf:params:oauth:grant-type:device_code"
        }
        try {
            const response = await axios.post(url, body, { headers: this.headers })
            console.log(response.data)
            const data = await response.data
            return data
        } catch (e) {
            console.log(e)
            throw new HttpException(e.response, e.status || 500)
        }
    }

}