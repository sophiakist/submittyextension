import * as vscode from 'vscode';
import { SidebarProvider } from './sidebarProvider';
import { PanelProvider } from './panelProvider';

export function activate(context: vscode.ExtensionContext) {
    const sidebarProvider = new SidebarProvider(context);
    const panelProvider = new PanelProvider(context);
    
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider('submittyWebview', sidebarProvider)
    );

    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider('submitty-panel', panelProvider)
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('submitty.grade', () => {
            vscode.window.showInformationMessage('Grade command executed!');
        })
    );
}

export function deactivate() {}