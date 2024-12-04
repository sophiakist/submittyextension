import * as vscode from 'vscode';
import { SidebarProvider } from './sidebarProvider';

export function activate(context: vscode.ExtensionContext) {
    // Register the WebviewView
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            'submittyWebview',
            new SidebarProvider(context)
        )
    );
}