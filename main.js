'use strict';

var obsidian = require('obsidian');



class MyModal extends obsidian.Modal {

    constructor(app, message) {
        super(app);
        this.message = message;
    }

    onOpen() {
        let contentEl = this.contentEl;
        contentEl.innerHTML = this.message
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


class SpaceMonkeyPlugin extends obsidian.Plugin {
  async onload() {

    this.registerMarkdownPostProcessor((element, context) => {
      element.addEventListener("contextmenu", function (event) {

        const selection = window.getSelection().toString();

        if (selection) {
          const transformedSelection = selection.toUpperCase();
          const range = window.getSelection().getRangeAt(0);
          range.deleteContents();
          range.insertNode(document.createTextNode(transformedSelection));
          event.preventDefault();
        }
      });
    });

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    this.addCommand({
        id: 'space-monkey-command',
        name: 'Space Monkey',  // Remove all empty lines in selection

        editorCallback: (editor, view) => {

            const selection = editor.getSelection()

            // Split the text into an array of lines
            const lines = selection.split('\n');

            // Filter out the empty lines
            const nonEmptyLines = lines.filter(line => line.trim() !== '');

            // Join the non-empty lines back into a single string
            const result = nonEmptyLines.join('\n') + '\n';

            editor.replaceSelection(result);

        },
    });

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    this.addCommand({
        id: 'space-panda-command',
        name: 'Space Panda',  // Collapse blocks of 3 or more empty lines into 2, leaves single empty lines intact

        editorCallback: (editor, view) => {

            const selection = editor.getSelection()

            // Split the text into an array of lines
            const lines = selection.split('\n');

            let isInsideBlock = false;
            let blockCount = 0;
            let result = [];

            for (let i = 0; i < lines.length; i++) {
                console.log('')
                const line = lines[i].trim();

                if (line === '') {
                  if (!isInsideBlock) {
                    result.push(line);
                    isInsideBlock = true;
                    blockCount = blockCount + 1
                  } else {
                    if (blockCount < 2) {
                      result.push(line);
                      blockCount = blockCount + 1
                    }
                  }
                } else {
                  result.push(line);
                  isInsideBlock = false;
                  blockCount = 0
                }
              }

            const output = result.join('\n');

            editor.replaceSelection(output);

        },
    });


    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    this.addCommand({
        id: 'space-mouse-command',
        name: 'Space Mouse',  // Trim each of selected lines

        editorCallback: (editor, view) => {

            const sel = editor.getSelection()
            let result = [];

            // Split the text into an array of lines
            const lines = sel.split('\n');

            for (let i = 0; i < lines.length; i++) {

                const line = lines[i].trim();
                result.push(line)

            }

            const output = result.join('\n');

            editor.replaceSelection(output);

        },
    });

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    this.addCommand({
        id: 'space-fossa-command',
        name: 'Space Fossa',  // Select list upper and lower of cursor position

        editorCallback: (editor, view) => {

            const cursor = editor.getCursor(); // Get current cursor position
            const lines = editor.getValue().split("\n"); // Get all lines
            const currentLineIndex = cursor.line;

            // Determine the range of lines to select
            let startLine = currentLineIndex;
            let endLine = currentLineIndex;

            // Check lines above (including the current one)
            for (let i = currentLineIndex; i >= 0; i--) {
                if (lines[i].startsWith("- [")) {
                    startLine = i; // Update the starting line
                } else {
                    break; // Stop if the line doesn't start with '- ['
                }
            }

            // Check lines below
            for (let i = currentLineIndex + 1; i < lines.length; i++) {
                if (lines[i].startsWith("- [")) {
                    endLine = i; // Update the ending line
                } else {
                    break; // Stop if the line doesn't start with '- ['
                }
            }

            // Highlight the selected lines in the editor
            editor.setSelection(
                { line: startLine, ch: 0 }, // Start of the first list line
                { line: endLine, ch: lines[endLine].length } // End of the last list line
            );

            // Optional: Display in editor or use in a meaningful way
            new Notice(`Selected lines from ${startLine + 1} to ${endLine + 1}.`);

        },
    });

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    this.addCommand({
            id: 'space-raven-command',
            name: 'Space Raven',  // Rid empty daily notes

            editorCallback: (editor, view) => {
                const files = app.vault.getAllLoadedFiles();

                const note_text_promises = [];
                let notes = [];

                for (const item of files) {
                    if (item.path.startsWith("DAILY") &&
                        !item.path.startsWith("DAILY/DONE") &&
                        !item.path.startsWith("DAILY/REMINDER") &&
                        !('children' in item) ) {
                        //console.log(item.path, item.type)
                        let note_text_promise = app.vault.cachedRead(item);
                        notes.push(item);
                        note_text_promises.push(note_text_promise);
                    }
                }


                Promise.all(note_text_promises).then((fulfilled_promise_texts) => {

                    const result = [];

                    fulfilled_promise_texts.forEach((text_value, index) => {

                        if (text_value.trim().length === 0) {

                            // Construct paths
                            const path = notes[index].path
                            result.push(path)

                            // Move the file to the new path
                            app.vault.delete(notes[index], false).then(() => {
                                console.log(`Note ${path} deleted`);
                            }).catch((error) => {
                                console.error("Error deleting the note:", error);
                            });

                        }
                    })


                    const message = "Notes <i>" + result + "</i> were deleted.";
                    const modal = new MyModal(app, message);
                    modal.open();

                })

            },
        });

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    this.addCommand({
        id: 'space-porcupine-command',
        name: 'Space Porcupine',

        editorCallback: (editor, view) => {


            // Preparation to select whole list
            const cursor = editor.getCursor(); // Get current cursor position
            const all_lines = editor.getValue().split("\n"); // Get all lines
            const currentLineIndex = cursor.line;

            // Determine the range of lines to select
            let startLine = currentLineIndex;
            let endLine = currentLineIndex;

            // Check lines above (including the current one)
            for (let i = currentLineIndex; i >= 0; i--) {
                if (all_lines[i].startsWith("- [")) {
                    startLine = i; // Update the starting line
                } else {
                    break; // Stop if the line doesn't start with '- ['
                }
            }

            // Check lines below
            for (let i = currentLineIndex + 1; i < all_lines.length; i++) {
                if (all_lines[i].startsWith("- [")) {
                    endLine = i; // Update the ending line
                } else {
                    break; // Stop if the line doesn't start with '- ['
                }
            }

            // Highlight the selected lines in the editor
            editor.setSelection(
                { line: startLine, ch: 0 }, // Start of the first list line
                { line: endLine, ch: all_lines[endLine].length } // End of the last list line
            );

            // Get previously highlighted selection
            const selection = editor.getSelection()

            // Split the text into an array of lines
            let lines = selection.split('\n');

            const regex = /^(- \[.\] .*|\s*)$/;

            const invalidLines = lines.reduce((invalidIndices, line, index) => {
              if (!regex.test(line)) {
                invalidIndices.push(index + 1);
                console.log(`>>>${line}<<<`)
              }
              return invalidIndices;
            }, []);

            if (invalidLines.length === 0) {
              console.log('All lines are valid.');
            } else {
              console.log('The following lines are not valid:', invalidLines.join(', '));

              const modal = new MyModal(app, "Cannot proceed to rearrange selected list, lines are not similar " +
                  "(different indentations etc)!");
              modal.open();
              return;
            }

            lines = lines.filter(line => line.trim() !== '');

            lines.sort((a, b) => {
                const charA = a.charAt(3);
                const charB = b.charAt(3);
                console.log(`>>>${charA}-${charB}<<<`)
                return charB.localeCompare(charA);
            });


            const result = lines.join('\n') + '\n';

            editor.replaceSelection(result);

        },
    });

  }
}

module.exports = SpaceMonkeyPlugin;


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// hotkeys: [{ modifiers: ["Mod", "Shift"], key: "a" }],
// https://marcus.se.net/obsidian-plugin-docs/user-interface/commands#editor-commands

// const mouse_sel = editor.getSelection()
// console.log(`You have selected: ${mouse_sel}`);