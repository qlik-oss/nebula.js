export const shouldDisableSubmitBtn = ({ isCredentialProvided, inputs, fields }) => {
  if (isCredentialProvided) {
    if (inputs['engine-websocket-url']) return false;
    return true;
  }

  return Object.entries(inputs).length !== fields.length || Object.values(inputs).some((x) => !x);
};

export const getFieldPlaceHolder = ({ isCredentialProvided, field }) => {
  if (isCredentialProvided) return `You have provided "${field}" through cli or nebula.config.js file already!`;
  return field;
};
