import React from 'react';
import List from '@mui/material/List';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { useNavigate, useLocation } from 'react-router';
import { ListItemButton } from '@mui/material';
import { useAppList } from '../../hooks';
import { ContentWrapper } from './styles';
import { getAppLink } from '../../utils';

import { useRootContext } from '../../contexts/RootContext';

const AppList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { info, glob, treatAsDesktop } = useRootContext();
  const { loading, appList } = useAppList({ glob, info });

  return (
    <ContentWrapper>
      <Typography variant="h5" gutterBottom>
        Select an app
      </Typography>
      {loading && <CircularProgress data-testid="loading" size={32} />}
      {!loading && appList && !appList.length && <Typography component="span">No apps found!</Typography>}
      {appList && appList.length > 0 && (
        <List>
          {appList.map((appData) => (
            <ListItemButton
              button
              component="a"
              key={appData.qDocId}
              onClick={() =>
                getAppLink({
                  info,
                  navigate,
                  location,
                  targetApp: treatAsDesktop ? appData.qDocName : appData.qDocId,
                })
              }
            >
              <ListItemText primary={appData.qTitle} secondary={appData.qDocId} />
            </ListItemButton>
          ))}
        </List>
      )}
    </ContentWrapper>
  );
};
export default AppList;
