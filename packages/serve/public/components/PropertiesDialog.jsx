import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react';

import {
  Button,
  Dialog,
} from 'react-leonardo-ui';

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
    <Dialog show={show}>
      <Dialog.Header>
        <Dialog.Title>Modify object properties</Dialog.Title>
      </Dialog.Header>
      <Dialog.Body>
        <textarea value={objectProps} onChange={onChange} ref={text} cols="100" rows="40" />
      </Dialog.Body>
      <Dialog.Footer>
        <Button onClick={close}>Cancel</Button>
        <Button variant="success" onClick={onConfirm}>Confirm</Button>
      </Dialog.Footer>
    </Dialog>
  );
}
