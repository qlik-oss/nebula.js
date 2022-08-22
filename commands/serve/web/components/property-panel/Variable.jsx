/* eslint no-param-reassign:0 */
import React, { useState, useEffect } from 'react';

import { Select, FormControl, MenuItem } from '@mui/material';

let variableList = null;

async function getVariables(app) {
  if (!variableList) {
    variableList = await app.createSessionObject({
      qInfo: {
        qType: 'VariableList',
      },
      qVariableListDef: {
        qType: 'variable',
        qShowReserved: false,
        qShowConfig: false,
      },
    });
  }
  const reply = await variableList.getLayout();

  const list = reply.qVariableList.qItems.map((item) => ({
    value: item.qName,
    label: item.qName.length > 50 ? `${item.qName.slice(0, 50)}...` : item.qName,
  }));

  return list;
}
// variable, {name, value}, properties
export default function Variable({ property, value, target, changed, app }) {
  const [s, setS] = useState(value.name);
  const [l, setL] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const list = await getVariables(app);
      setL(list);
    }
    fetchData();
  }, []);

  const handleChange = (e) => {
    setS(e.target.value);
    target[property].name = e.target.value;
    target[property].value = { qStringExpression: { qExpr: `[${e.target.value}]` } };
    changed();
  };
  return l.length === 0 ? (
    <em>No variables in app</em>
  ) : (
    <FormControl size="small" fullWidth>
      <Select
        onChange={handleChange}
        displayEmpty
        fullWidth
        value={s}
        renderValue={(selected) => {
          if (selected.length === 0) {
            return <em>Select a variable</em>;
          }
          return selected;
        }}
      >
        {l.map((c) => (
          <MenuItem key={c.value} value={c.value}>
            {c.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
