import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export function getPanelHtml(context: vscode.ExtensionContext): string {
    const filePath = path.join(context.extensionPath, 'src', 'panel', 'gradeView.html');
    return fs.readFileSync(filePath, 'utf8');
}

export function getLoginPromptHtml(): string {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>Submitty Panel</title>
            <style>
                body {
                    font-family: var(--vscode-font-family);
                    padding: 10px;
                    color: var(--vscode-editor-foreground);
                    background-color: var(--vscode-editor-background);
                }
            </style>
        </head>
        <body>
        </body>
        </html>
    `;
}