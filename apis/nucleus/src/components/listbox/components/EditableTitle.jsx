import React, { useState, useRef } from 'react';
import { styled } from '@mui/material/styles';
import { Typography, InputBase } from '@mui/material';
import useProperties from '../../../hooks/useProperties';

const Title = styled(Typography)(({ theme }) => ({
  color: theme.listBox?.title?.main?.color,
  fontSize: theme.listBox?.title?.main?.fontSize,
  fontFamily: theme.listBox?.title?.main?.fontFamily,
}));

const StyledInput = styled(InputBase)(({ theme }) => ({
  color: theme.listBox?.title?.main?.color,
  fontSize: theme.listBox?.title?.main?.fontSize ?? theme.typography.h6.fontSize,
  fontFamily: theme.listBox?.title?.main?.fontFamily ?? theme.typography.h6.fontFamily,
  fontWeight: theme.listBox?.title?.main?.fontWeight ?? theme.typography.h6.fontWeight,
}));

export default function EditableTitle({ layout, model }) {
  const [properties] = useProperties(model);
  const [titleDef, setTitleDef] = useState(
    properties?.title?.qStringExpression?.qExpr ? `=${properties?.title?.qStringExpression?.qExpr}` : properties?.title
  );
  const [isTitleFocused, setIsTitleFocused] = useState(false);
  const isCanceledChange = useRef(false);

  const confirmChange = () => {
    if (isCanceledChange.current) {
      isCanceledChange.current = false;
      return;
    }
    model.setProperties({
      ...properties,
      title: titleDef[0] === '=' ? { qStringExpression: { qExpr: titleDef.substr(1) } } : titleDef,
    });
    setIsTitleFocused(false);
  };

  const onClick = () => {
    setTitleDef(
      properties?.title?.qStringExpression?.qExpr
        ? `=${properties?.title?.qStringExpression?.qExpr}`
        : properties?.title
    );
    setIsTitleFocused(true);
  };

  const onChange = (event) => {
    setTitleDef(event.target.value);
  };

  const onKeyDown = (event) => {
    switch (event.key) {
      case 'Enter':
        confirmChange();
        break;
      case 'Escape':
        isCanceledChange.current = true;
        setIsTitleFocused(false);
        break;
      default:
        break;
    }
  };

  return (
    <div>
      {!isTitleFocused ? (
        <Title variant="h6" noWrap title={layout.title} onClick={onClick}>
          {layout.title}
        </Title>
      ) : (
        <StyledInput
          title={layout.title}
          autoFocus
          value={titleDef}
          onChange={onChange}
          onKeyDown={onKeyDown}
          onBlur={() => confirmChange()}
        />
      )}
    </div>
  );
}
