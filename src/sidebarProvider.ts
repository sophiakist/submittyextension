import * as vscode from 'vscode';
import { getLoginHtml, getClassesHtml } from './sidebarContent';
import { ApiService } from './services/apiService';
import { EventEmitter } from 'events';

export class SidebarProvider implements vscode.WebviewViewProvider {
    private _view?: vscode.WebviewView;
    private apiService: ApiService;
    public static loginEventEmitter = new EventEmitter();

    constructor(private readonly context: vscode.ExtensionContext) {
        this.apiService = new ApiService(this.context);
    }

    resolveWebviewView(
        webviewView: vscode.WebviewView,
        _context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [vscode.Uri.joinPath(this.context.extensionUri, 'src', 'webview')],
        };

        webviewView.webview.html = getLoginHtml(this.context);

        // Handle messages from the webview
        webviewView.webview.onDidReceiveMessage(
            async (message) => {
                await this.handleMessage(message, webviewView);
            },
            undefined,
            this.context.subscriptions
        );
    }

    private async handleMessage(message: any, view: vscode.WebviewView) {
        switch (message.command) {
            case 'login':
                await this.handleLogin(message.data, view);
                break;
            case 'fetchAndDisplayCourses':
                await this.fetchAndDisplayCourses(message.token, view);
                break;
            case 'hw1Click':
                SidebarProvider.loginEventEmitter.emit('hw1Click');
                break;
            default:
                vscode.window.showWarningMessage(`Unknown command: ${message.command}`);
                break;
        }
    }

    private async handleLogin(data: any, view: vscode.WebviewView) {
        const { url, userId, password } = data;

        if (!userId || !password) {
            view.webview.postMessage({ command: 'error', message: 'Username and Password are required!' });
            return;
        }

        try {
            const token = await this.apiService.login(url, userId, password);
            view.webview.postMessage({ command: 'success', message: 'Login Successful!' });
            view.webview.html = getClassesHtml(this.context);
            await this.fetchAndDisplayCourses(token, view);

            // Emit login success event
            SidebarProvider.loginEventEmitter.emit('loginSuccess', token);
        } catch (error: any) {
            view.webview.postMessage({ command: 'error', message: `Login Failed: ${error.message}` });
        }
    }

    private async fetchAndDisplayCourses(token: string, view: vscode.WebviewView) {
        try {
            const courses = await this.apiService.fetchCourses(token);
    
            const unarchivedHtml = courses.data.unarchived_courses.length
                ? courses.data.unarchived_courses.map((course) => `
                    <button class="accordion" onclick="vscode.postMessage({ command: 'hw1Click' })">${sanitize(course.display_name || course.title || 'Untitled Course')}</button>
                    <div class="panel">
                        <p>HW 1</p>
                        <p>HW 2</p>
                        <p>HW 3</p>
                    </div>
                `).join('')
                : '<p>No courses found.</p>';
    
            view.webview.postMessage({
                command: 'displayCourses',
                data: {
                    unarchivedHtml,
                }
            });
        } catch (error: any) {
            vscode.window.showErrorMessage(`Failed to fetch courses: ${error.message}`);
            view.webview.postMessage({ command: 'error', message: `Failed to fetch courses: ${error.message}` });
        }
    }
}

function sanitize(str: string): string {
    return str.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}