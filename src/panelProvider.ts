import * as vscode from 'vscode';
import { getPanelHtml, getLoginPromptHtml } from './panelContent';
import { SidebarProvider } from './sidebarProvider';

export class PanelProvider implements vscode.WebviewViewProvider {
    private _view?: vscode.WebviewView;

    constructor(private readonly context: vscode.ExtensionContext) {
        // Listen for login success events
        SidebarProvider.loginEventEmitter.on('loginSuccess', (token: string) => {
            this.showPanelContent(token);
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

        // Initially show login prompt
        webviewView.webview.html = getLoginPromptHtml();

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
            this._view.webview.html = getPanelHtml(this.context);
        }
    }
}