import { Plugin, MarkdownView, Editor } from "obsidian";

export default class LazyScript extends Plugin {
  onload() {
    this.addCommand({
      id: "toggle-subscript",
      name: "Enter or Exit <sub> tags",
      editorCallback: () => this.toggleSubscript(),
      hotkeys: [
        {
          modifiers: ["Mod", "Shift"],
          key: ",",
        },
      ],
    });
    this.addCommand({
      id: "toggle-superscript",
      name: "Enter or Exit <sup> tags",
      editorCallback: () => this.toggleSuperscript(),
      hotkeys: [
        {
          modifiers: ["Mod", "Shift"],
          key: ".",
        },
      ],
    });

    // Add a universal Escape hotkey with "Esc + S" to exit tags mode
    this.addCommand({
      id: "exit-tags-mode",
      name: "Exit Tags Mode",
      editorCallback: () => this.exitTagsMode(),
      hotkeys: [
        {
          modifiers: [],
          key: "Escape",
        },
      ],
    });
  }

  toggleSubscript() {
    this.toggleTags("<sub>", "</sub>");
  }

  toggleSuperscript() {
    this.toggleTags("<sup>", "</sup>");
  }

  exitTagsMode() {
    const editor = this.getEditorIfMarkdownView();
    if (!editor) return;

    const cursorPos = editor.getCursor();
    const lineText = editor.getLine(cursorPos.line);

    // Check if the cursor is inside a tag (either <sub> or <sup>)
    if (lineText.includes("<sub>") || lineText.includes("<sup>")) {
      // Move the cursor to the end of the line to exit the tags mode
      editor.setCursor(cursorPos.line, lineText.length);
    }
  }

  toggleTags(openTag: string, closeTag: string) {
    const editor = this.getEditorIfMarkdownView();
    if (!editor) return;

    const cursorPos = editor.getCursor();
    const lineText = editor.getLine(cursorPos.line);
    const isInsideTag = lineText.includes(openTag) && lineText.includes(closeTag);

    if (isInsideTag) {
      // Cursor is inside an existing tag; move cursor to the end of the text within the tag
      const startIndex = lineText.indexOf(openTag);
      const endIndex = lineText.lastIndexOf(closeTag);
      if (startIndex !== -1 && endIndex !== -1) {
        editor.setCursor(cursorPos.line, endIndex + closeTag.length);
      }
    } else {
      // Cursor is not inside a tag; insert tags and move cursor inside the open tag without a space
      const insertionText = `${openTag}${closeTag}`;
      editor.replaceSelection(insertionText);
      editor.setCursor(cursorPos.line, cursorPos.ch + openTag.length); // Move cursor inside the open tag
    }
  }

  getEditorIfMarkdownView(): Editor | null {
    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    return view ? view.editor : null;
  }
}
