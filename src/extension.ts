// src/extension.ts

import * as vscode from 'vscode';
import { SidebarProvider } from './sidebarProvider';

export function activate(context: vscode.ExtensionContext) {
    const sidebarProvider = new SidebarProvider(context);
    
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider('submittyWebview', sidebarProvider)
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('submitty.grade', () => {
          vscode.window.showInformationMessage('Grade command executed!');
        })
      );
}

export function deactivate() {}