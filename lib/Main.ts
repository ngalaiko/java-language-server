'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as V from 'vscode';
import * as J from './JavacServices';
import * as P from 'path';
import * as F from './Finder';
import {JavaConfig} from './JavaConfig';
import {JavaCompletionProvider} from './JavaCompletionProvider';
import {JavaLint} from './JavaLint';

const JAVA_MODE: V.DocumentFilter = { language: 'java', scheme: 'file' };


// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(ctx: V.ExtensionContext) {
    let provideJavac: Promise<J.JavacServices> = J.provideJavac(V.workspace.rootPath, [], onErrorWithoutRequestId);
    let diagnosticCollection: V.DiagnosticCollection = V.languages.createDiagnosticCollection('java');
    let autocomplete = new JavaCompletionProvider(provideJavac);
    let lint = new JavaLint(provideJavac, diagnosticCollection);
    
	ctx.subscriptions.push(diagnosticCollection);
    ctx.subscriptions.push(V.languages.registerCompletionItemProvider(JAVA_MODE, autocomplete))
    ctx.subscriptions.push(V.workspace.onDidSaveTextDocument(document => lint.onSave(document)));
    ctx.subscriptions.push(V.workspace.onDidSaveTextDocument(document => {
        if (P.basename(document.fileName) == 'javaconfig.json')
            F.invalidateCaches();
    }));
}

function onErrorWithoutRequestId(message: string) {
    V.window.showErrorMessage(message);
}

// this method is called when your extension is deactivated
export function deactivate() {
}