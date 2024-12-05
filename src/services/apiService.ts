// src/services/apiService.ts

import axios from 'axios';
import * as vscode from 'vscode';

export class ApiService {
    private apiBaseUrl: string = 'https://kistso.cs.wallawalla.edu/api';

    constructor(private context: vscode.ExtensionContext) {}

    async login(userId: string, password: string): Promise<string> {
        try {
            const response = await axios.post(
                `${this.apiBaseUrl}/token`,
                {
                    user_id: userId,
                    password: password,
                },
                {
                    headers: { 'Content-Type': 'multipart/form-data' },
                }
            );
            const token = response.data.token;
            this.context.globalState.update('submittyToken', token);
            return token;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || error.message);
        }
    }

    async fetchCourses(token: string): Promise<{ display_name?: string; title?: string }[]> {
        try {
            const response = await axios.get(`${this.apiBaseUrl}/courses`, {
                headers: {
                    Authorization: token,
                },
            });
            return response.data.courses.map((course: any) => course.course_name);
        } catch (error: any) {
            throw new Error(error.response?.data?.message || error.message);
        }
    }
}