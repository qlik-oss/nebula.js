import React, { useState } from 'react';
import OutlinedInput from '@mui/material/OutlinedInput';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';

export const FormManager = ({ info, fields, handleSubmit }) => {
  const [inputs, setInputs] = useState({});

  const handleUpdateInputs = (evt) => {
    setInputs({
      ...inputs,
      [evt.target.name]: evt.target.value,
    });
  };

  const handleOnSubmit = (evt) => {
    evt.preventDefault();
    const url = new URL(inputs['engine-websocket-url']);
    if (inputs['web-integration-id']) url.searchParams.append('qlik-web-integration-id', inputs['web-integration-id']);
    if (inputs['client-id']) url.searchParams.append('qlik-client-id', inputs['client-id']);
    handleSubmit(url.toString().replace('?', '&'));
  };

  const isBtnDisabled = Object.entries(inputs).length !== fields.length || Object.values(inputs).some((x) => !x);

  return (
    <form onSubmit={handleOnSubmit}>
      <Grid container spacing={2} direction="column" justifyContent="center">
        {fields.map((field) => (
          <Grid item xs={12} key={field}>
            <OutlinedInput
              autoFocus
              fullWidth
              name={field
                .split(' ')
                .map((x) => x.toLowerCase())
                .join('-')}
              placeholder={field}
              error={info.invalid}
              defaultValue={info.engineUrl}
              onChange={(evt) => handleUpdateInputs(evt)}
            />
          </Grid>
        ))}

        <Grid item xs={12} alignSelf="flex-end">
          <Button type="submit" variant="contained" size="large" disabled={isBtnDisabled}>
            Connect
          </Button>
        </Grid>
      </Grid>
    </form>
  );
};
