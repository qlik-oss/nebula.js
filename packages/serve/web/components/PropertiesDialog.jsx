import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react';

import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@nebula.js/ui/components';

export default function PropertiesDialog({
  model,
  show,
  close,
}) {
  const text = useRef(null);
  const [objectProps, setObjectProps] = useState('');

  const onConfirm = useCallback(() => {
    if (text.current) {
      model.setProperties(JSON.parse(objectProps)).then(close);
    }
  });

  const onChange = (e) => {
    setObjectProps(e.target.value);
  };

  useEffect(() => {
    if (!show) {
      return undefined;
    }
    const onChanged = () => {
      model && show && model.getProperties().then((props) => {
        show && setObjectProps(JSON.stringify(props || {}, null, 2));
      });
    };

    model.on('changed', onChanged);
    onChanged();
    return () => {
      model && model.removeListener('changed', onChanged);
    };
  }, [model && model.id, show]);

  return (
    <Dialog open={show} scroll="paper" maxWidth="lg" onClose={close}>
      <DialogTitle>
        Modify object properties
      </DialogTitle>
      <DialogContent dividers>
        <textarea value={objectProps} onChange={onChange} ref={text} cols="100" rows="40" />
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={close}>Cancel</Button>
        <Button variant="outlined" onClick={onConfirm}>Confirm</Button>
      </DialogActions>
    </Dialog>
  );
}
