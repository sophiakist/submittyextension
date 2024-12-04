export function getHtmlContent(): string {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Submitty Login</title>
        <style>
            body {
                font-family: var(--vscode-font-family);
                padding: 10px;
                color: var(--vscode-editor-foreground);
                background-color: var(--vscode-editor-background);
            }
            .form-group {
                margin-bottom: 10px;
            }
            input {
                width: 90%;
                padding: 8px;
                margin-top: 5px;
                background-color: var(--vscode-input-background);
                color: var(--vscode-input-foreground);
                border: 1px solid var(--vscode-input-border);
            }
            button {
                padding: 10px 15px;
                background-color: var(--vscode-button-background);
                color: var(--vscode-button-foreground);
                border: none;
                cursor: pointer;
                width: 100%;
            }
            button:hover {
                background-color: var(--vscode-button-hoverBackground);
            }
            .message {
                margin-top: 10px;
                font-size: 14px;
            }
        </style>
    </head>
    <body>
        <h3>Submitty Login</h3>
        <div class="form-group">
            <label for="userId">User ID</label>
            <input type="text" id="userId" placeholder="Enter User ID" />
        </div>
        <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" placeholder="Enter Password" />
        </div>
        <button id="loginButton">Log In</button>
        <div class="message" id="message"></div>

        <script>
            const vscode = acquireVsCodeApi();

            document.getElementById('loginButton').addEventListener('click', () => {
                const userId = document.getElementById('userId').value;
                const password = document.getElementById('password').value;

                vscode.postMessage({
                    command: 'login',
                    data: { userId, password }
                });
            });

            window.addEventListener('message', (event) => {
                const { command, message } = event.data;

                const messageDiv = document.getElementById('message');
                if (command === 'success') {
                    messageDiv.style.color = 'green';
                } else if (command === 'error') {
                    messageDiv.style.color = 'red';
                }
                messageDiv.textContent = message;
            });
        </script>
    </body>
    </html>
    `;
}