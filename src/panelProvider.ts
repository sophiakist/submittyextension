import * as vscode from 'vscode';
import { SidebarProvider } from './sidebarProvider';
import * as path from 'path';
import * as fs from 'fs';

export class PanelProvider implements vscode.WebviewViewProvider {
    private _view?: vscode.WebviewView;

    constructor(private readonly context: vscode.ExtensionContext) {
        // Listen for login success events
        SidebarProvider.loginEventEmitter.on('loginSuccess', (token: string) => {
            this.showPanelContent(token);
        });

        // Register command to show grade panel
        vscode.commands.registerCommand('extension.showGradePanel', (data) => {
            this.showGradePanel(data);
        });
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

        // Initially show blank screen
        webviewView.webview.html = this.getHtmlForWebview('blank.html');

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
            default:
                vscode.window.showWarningMessage(`Unknown command: ${message.command}`);
                break;
        }
    }

    private showPanelContent(token: string) {
        if (this._view) {
            this._view.webview.html = this.getHtmlForWebview('panel.html');
        }
    }

    private showGradePanel(data: { hw: string, gradeDetails: any }) {
        if (this._view) {
            this._view.webview.html = this.getHtmlForWebview('gradeView.html');
            this._view.webview.postMessage({
                command: 'displayGrade',
                data: data
            });
        }
    }

    private getHtmlForWebview(filename: string): string {
        const filePath = vscode.Uri.file(path.join(this.context.extensionPath, 'src', 'panel', filename));
        const fileContent = fs.readFileSync(filePath.fsPath, 'utf8');
        return fileContent;
    }
}