
// src/display/courseDisplay.ts

import * as vscode from 'vscode';

export class CourseDisplay {
    static displayCourses(apiResponse: string) {
        // Parse the JSON response
        let unarchivedCourses: string[] = [];
        let archivedCourses: string[] = [];
        
        try {
            const data = JSON.parse(apiResponse);
            unarchivedCourses = data.data.unarchived_courses.map(
                (course: {
                    title: string; display_name: string; display_semester: string 
}) =>
                    course.display_name || course.title || 'Untitled Course'
            );
            archivedCourses = data.data.archived_courses.map(
                (course: {
                    title: string; display_name: string; display_semester: string 
}) =>
                    course.display_name || course.title || 'Untitled Course'
            );
        } catch (error) {
            vscode.window.showErrorMessage('Failed to parse courses data.');
        }

        // Create the webview panel
        const panel = vscode.window.createWebviewPanel(
            'submittyCourses',
            'Submitty Courses',
            vscode.ViewColumn.One,
            { enableScripts: true }
        );

        // Generate HTML for courses
        const unarchivedHtml = unarchivedCourses.length
            ? unarchivedCourses.map((course) => `<li>${course}</li>`).join('')
            : '<p>No unarchived courses found.</p>';

        const archivedHtml = archivedCourses.length
            ? archivedCourses.map((course) => `<li>${course}</li>`).join('')
            : '<p>No archived courses found.</p>';

        // Set the panel's webview HTML content
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
                    section {
                        margin-bottom: 20px;
                    }
                </style>
            </head>
            <body>
                <section>
                    <h3>Unarchived Courses</h3>
                    <ul>${unarchivedHtml}</ul>
                </section>
                <section>
                    <h3>Archived Courses</h3>
                    <ul>${archivedHtml}</ul>
                </section>
            </body>
            </html>
        `;
    }
}
