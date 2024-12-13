// src/display/courseDisplay.ts

import * as vscode from 'vscode';

interface Course {
    semester: string;
    title: string;
    display_name: string;
    display_semester: string;
    user_group: number;
    registration_section: string;
}

interface ApiResponse {
    status: string;
    data: {
        unarchived_courses: Course[];
        archived_courses: Course[];
        dropped_courses: Course[];
    };
    message?: string;
}

export class CourseDisplay {
    static displayCourses(apiResponse: ApiResponse) {
        console.log('displayCourses method called');

        // Initialize course arrays
        let unarchivedCourses: string[] = [];
        let archivedCourses: string[] = [];

        try {
            console.log('Processing unarchived_courses');
            unarchivedCourses = apiResponse.data.unarchived_courses.map(
                (course) =>
                    course.display_name || course.title || 'Untitled Course'
            );
            console.log('Mapped Unarchived Courses:', unarchivedCourses);

            console.log('Processing archived_courses');
            archivedCourses = apiResponse.data.archived_courses.map(
                (course) =>
                    course.display_name || course.title || 'Untitled Course'
            );
            console.log('Mapped Archived Courses:', archivedCourses);
        } catch (error) {
            console.error('Error in displayCourses:', error);
            vscode.window.showErrorMessage('Failed to process courses data.');
            return;
        }

        // Create the webview panel
        const panel = vscode.window.createWebviewPanel(
            'submittyCourses',
            'Submitty Courses',
            vscode.ViewColumn.One,
            { enableScripts: true }
        );

        // Generate HTML for unarchived courses
        const unarchivedHtml = unarchivedCourses.length
            ? `<ul>${unarchivedCourses.map((course) => `<li>${sanitize(course)}</li>`).join('')}</ul>`
            : '<p>No unarchived courses found.</p>';

        // Generate HTML for archived courses
        const archivedHtml = archivedCourses.length
            ? `<ul>${archivedCourses.map((course) => `<li>${sanitize(course)}</li>`).join('')}</ul>`
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
                    ${unarchivedHtml}
                </section>
                <section>
                    <h3>Archived Courses</h3>
                    ${archivedHtml}
                </section>
            </body>
            </html>
        `;
    }
}

// Utility function to sanitize HTML content
function sanitize(str: string): string {
    return str.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}