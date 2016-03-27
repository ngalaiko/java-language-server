import V = require('vscode');
import {JavacFactory, JavacServices, ResponseAutocomplete, AutocompleteSuggestion} from './JavacServices';
import {findJavaConfig} from './Finder';

export class Autocomplete implements V.CompletionItemProvider {
    constructor(private javac: JavacFactory) { }
    
    provideCompletionItems(document: V.TextDocument, 
                           position: V.Position,
                           token: V.CancellationToken): Promise<V.CompletionItem[]> {
        let text = document.getText();
        let path = document.uri.fsPath;
        let config = findJavaConfig(V.workspace.rootPath, document.fileName);
        let javac = this.javac.forConfig(config.sourcePath, config.classPath, config.outputDirectory);
        let response = javac.then(javac => javac.autocomplete({path, text, position}));
        
        return response.then(asCompletionItems);
    }
}

function asCompletionItems(response: ResponseAutocomplete): V.CompletionItem[] {
    return response.suggestions.map(asCompletionItem);
}

function asCompletionItem(s: AutocompleteSuggestion): V.CompletionItem {
    let item = new V.CompletionItem(s.label);
    
    item.detail = s.detail;
    item.documentation = s.documentation;
    item.filterText = s.filterText;
    item.insertText = s.insertText;
    item.kind = s.kind;
    item.label = s.label;
    item.sortText = s.sortText;
    
    return item;
}