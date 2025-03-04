// src/services/apiService.ts

import axios from 'axios';
import * as vscode from 'vscode';

interface Course {
    semester: string;
    title: string;
    display_name: string;
    display_semester: string;
    user_group: number;
    registration_section: string;
}

interface ApiResponse {
    status: string;
    data: {
        unarchived_courses: Course[];
        archived_courses: Course[];
        dropped_courses: Course[];
    };
    message?: string;
}

export class ApiService {
    apiBaseUrl: string = '';
    constructor(private context: vscode.ExtensionContext) {}

    async login(url: string, userId: string, password: string): Promise<string> {
        this.apiBaseUrl = url;
        try {
            const response = await axios.post(
                `${this.apiBaseUrl}/api/token`,
                {
                    user_id: userId,
                    password: password,
                },
                {
                    headers: { 'Content-Type': 'multipart/form-data' },
                }
            );
            const token: string = response.data.data.token;
            this.context.globalState.update('submittyToken', token);
            return token;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || error.message);
        }
    }

    async fetchCourses(token: string): Promise<ApiResponse> {
        try {
            const response = await axios.get(`${this.apiBaseUrl}/api/courses`, {
                headers: {
                    Authorization: token,
                },
            });
            return response.data as ApiResponse;
        } catch (error: any) {
            console.error('Error fetching courses:', error);
            throw new Error(error.response?.data?.message || 'Failed to fetch courses.');
        }
    }
}