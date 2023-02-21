import React from 'react';
import { makeStyles } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'grid',
    marginTop: '17vh',
  },
  loader: {
    width: '100%',
    margin: 'auto',
  }
}));

export default function Loading() {
  const classes = useStyles();

  return (

    <div className={classes.root}>
      <CircularProgress className={classes.loader} />
      <div variant="h6" className='scanProgress'>Please wait while we scan your site...</div>
    </div>

  );
}
