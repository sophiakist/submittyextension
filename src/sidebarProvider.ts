// src/sidebarProvider.ts

import * as vscode from 'vscode';
import { getHtmlContent } from './sidebarContent';
import { ApiService } from './services/apiService';
import { CourseDisplay } from './display/courseDisplay';

export class SidebarProvider implements vscode.WebviewViewProvider {
    private _view?: vscode.WebviewView;
    private apiService: ApiService;

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

        webviewView.webview.html = getHtmlContent(this.context);

        // Handle messages from the webview
        webviewView.webview.onDidReceiveMessage(
            async (message) => {
                await this.handleMessage(message, webviewView);
            },
            undefined,
            this.context.subscriptions
        );
    }

    /**
     * Handles incoming messages from the webview.
     * Delegates tasks based on the message command.
     * @param message The message received from the webview.
     * @param view The WebviewView instance.
     */
    private async handleMessage(message: any, view: vscode.WebviewView) {
        switch (message.command) {
            case 'login':
                await this.handleLogin(message.data, view);
                break;
            // Future commands can be handled here
            default:
                vscode.window.showWarningMessage(`Unknown command: ${message.command}`);
                break;
        }
    }

    /**
     * Handles the login operation.
     * @param data The data containing userId and password.
     * @param view The WebviewView instance.
     */
    private async handleLogin(data: any, view: vscode.WebviewView) {
        const { userId, password } = data;

        if (!userId || !password) {
            view.webview.postMessage({ command: 'error', message: 'User ID and Password are required!' });
            return;
        }

        try {
            const token = await this.apiService.login(userId, password);
            view.webview.postMessage({ command: 'success', message: 'Login Successful!' });
            // await this.fetchAndDisplayCourses(token, view);
        } catch (error: any) {
            view.webview.postMessage({ command: 'error', message: `Login Failed: ${error.message}` });
        }
    }

    /**
     * Fetches courses using the provided token and displays them.
     * @param token The authentication token received after login.
     * @param view The WebviewView instance.
     */
//     private async fetchAndDisplayCourses(token: string, view: vscode.WebviewView) {
//         vscode.window.showInformationMessage('Login Successful! Fetching courses...');

//         try {
//             const courses = await this.apiService.fetchCourses(token);
//             CourseDisplay.displayCourses(courses);
//         } catch (error: any) {
//             vscode.window.showErrorMessage(`Failed to fetch courses: ${error.message}`);
//             view.webview.postMessage({ command: 'error', message: `Failed to fetch courses: ${error.message}` });
//         }
//     }
}