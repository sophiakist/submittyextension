import * as vscode from 'vscode';
import axios from 'axios';
import { getHtmlContent } from './sidebarContent';

export class SidebarProvider implements vscode.WebviewViewProvider {
    private _view?: vscode.WebviewView;

    constructor(private readonly context: vscode.ExtensionContext) {}

    resolveWebviewView(
        webviewView: vscode.WebviewView,
        _context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
        };

        webviewView.webview.html = getHtmlContent();

        // Handle messages from the webview
        webviewView.webview.onDidReceiveMessage(async (message) => {
            if (message.command === 'login') {
                const { userId, password } = message.data;

                if (!userId || !password) {
                    this._view?.webview.postMessage({ command: 'error', message: 'User ID and Password are required!' });
                    return;
                }

                try {
                    const response = await axios.post('https://kistso.cs.wallawalla.edu/api/token', {
                        user_id: userId,
                        password: password,
                    }, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                    });

                    const token = response.data.token;
                    this.context.globalState.update('submittyToken', token);

                    vscode.window.showInformationMessage('Login Successful! Fetching courses...');
                    const courses = await this.fetchCourses(token);
                    this.displayCourses(courses);

                    this._view?.webview.postMessage({ command: 'success', message: 'Login Successful!' });
                } catch (error: any) {
                    this._view?.webview.postMessage({ command: 'error', message: `Login Failed: ${error.message}` });
                }
            }
        });
    }

    private async fetchCourses(token: string): Promise<string[]> {
        try {
            const response = await axios.get('https://kistso.cs.wallawalla.edu/api/courses', {
                headers: {
                    Authorization: token,
                },
            });
            return response.data.courses.map((course: any) => course.course_name);
        } catch (error: any) {
            vscode.window.showErrorMessage(`Failed to fetch courses: ${error.message}`);
            return [];
        }
    }

    private displayCourses(courses: string[]) {
        const panel = vscode.window.createWebviewPanel(
            'submittyCourses',
            'Submitty Courses',
            vscode.ViewColumn.One,
            { enableScripts: true }
        );

        const coursesHtml = courses.length
            ? courses.map((course) => `<li>${course}</li>`).join('')
            : '<p>No courses found.</p>';

        panel.webview.html = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Submitty Courses</title>
                <style>
                    body {
                        font-family: sans-serif;
                        padding: 10px;
                    }
                    ul {
                        list-style-type: none;
                        padding: 0;
                    }
                    li {
                        padding: 5px;
                        background: #f0f0f0;
                        margin-bottom: 5px;
                        border-radius: 5px;
                    }
                </style>
            </head>
            <body>
                <h3>Your Courses</h3>
                <ul>${coursesHtml}</ul>
            </body>
            </html>
        `;
    }
}