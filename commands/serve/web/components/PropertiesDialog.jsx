import React, { useEffect, useState, useCallback } from 'react';

import { Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@material-ui/core';
import { useTheme } from '@nebula.js/ui/theme';
import useRect from '@nebula.js/nucleus/src/hooks/useRect';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

export default function PropertiesDialog({ model, show, close }) {
  const [objectProps, setObjectProps] = useState('');
  const [monacoEditor, setMonacoEditor] = useState(null);
  const [monacoEditorMarkers, setMonacoEditorMarkers] = useState([]);
  const [monacoRef, monacoRect, monacoNode] = useRect();
  const theme = useTheme();

  const onConfirm = useCallback(() => {
    if (monacoEditorMarkers.length) {
      return;
    }
    model.setProperties(JSON.parse(monacoEditor.getValue())).then(close);
  });

  useEffect(() => {
    if (!show) {
      return undefined;
    }
    const onChanged = () => {
      model &&
        show &&
        model.getProperties().then((props) => {
          show && setObjectProps(JSON.stringify(props || {}, null, 2));
        });
    };

    model.on('changed', onChanged);
    onChanged();
    return () => {
      model && model.removeListener('changed', onChanged);
    };
  }, [model && model.id, show]);

  useEffect(() => {
    if (!monacoRef || !monacoNode || !monacoRect || !objectProps) {
      return undefined;
    }
    const { left, top, width, height } = monacoRect;
    if (left === 0 && top === 0 && width === 0 && height === 0) {
      return undefined;
    }
    const editor = monaco.editor.create(monacoNode, {
      value: objectProps,
      language: 'json',
      scrollBeyondLastLine: false,
      theme: theme.palette.type === 'dark' ? 'vs-dark' : 'vs-light',
    });
    editor.layout({ width: monacoRect.width, height: monacoRect.height });
    const subscription = editor.onDidChangeModelDecorations(() => {
      const m = monaco.editor.getModelMarkers();
      setMonacoEditorMarkers(m);
    });
    editor.focus();
    setMonacoEditor(editor);
    return () => {
      subscription.dispose();
      const editorModel = editor.getModel();
      if (editorModel) {
        editorModel.dispose();
      }
      editor.dispose();
    };
  }, [monacoNode, monacoRect, objectProps]);

  return (
    <Dialog
      disableEscapeKeyDown
      open={show}
      scroll="paper"
      maxWidth="md"
      onClose={close}
      PaperProps={{
        style: {
          height: '80%',
          width: '80%',
        },
      }}
    >
      <DialogTitle>Modify object properties</DialogTitle>
      <DialogContent dividers>
        <div ref={monacoRef} style={{ overflow: 'hidden', height: '100%' }} />
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={close}>
          Cancel
        </Button>
        <Button variant="contained" onClick={onConfirm} disabled={monacoEditorMarkers.length > 0}>
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
}
