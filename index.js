/** @babel */
import esformatter from 'esformatter';

const SUPPORTED_SCOPES = [
	'source.js',
	'source.jsx',
	'source.js.jsx'
];

function init(editor, onSave) {
	if (!editor) {
		return;
	}

	let config = esformatter.rc(editor.getURI());

	if (Object.keys(config).length === 0) {
		return;
	}

	const selectedText = onSave ? null : editor.getSelectedText();
	const text = selectedText || editor.getText();
	let retText = '';

	try {
		retText = esformatter.format(text, config);
	} catch (err) {
		console.error(err);
		atom.notifications.addError('esformatter', {detail: err.message});
		return;
	}

	const editorEl = atom.views.getView(editor);
	const cursorPosition = editor.getCursorBufferPosition();
	const line = editorEl.getFirstVisibleScreenRow() + editor.displayBuffer.getVerticalScrollMargin();

	if (selectedText) {
		editor.setTextInBufferRange(editor.getSelectedBufferRange(), retText);
	} else {
		editor.setText(retText);
	}

	editor.setCursorBufferPosition(cursorPosition);

	if (editor.getScreenLineCount() > line) {
		editor.scrollToScreenPosition([line, 0]);
	}
}

export const config = {
	formatOnSave: {
		type: 'boolean',
		default: false
	}
};

export const activate = () => {
	atom.workspace.observeTextEditors(editor => {
		editor.getBuffer().onWillSave(() => {
			const isJS = SUPPORTED_SCOPES.indexOf(editor.getGrammar().scopeName) !== -1;

			if (isJS && atom.config.get('esformatter.formatOnSave')) {
				init(editor, true);
			}
		});
	});

	atom.commands.add('atom-workspace', 'esformatter', () => {
		init(atom.workspace.getActiveTextEditor());
	});
};
