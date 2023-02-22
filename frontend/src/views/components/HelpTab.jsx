import React from 'react';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import AboutSlider from "./SliderComponent/AboutSlider";
import ReportFormatSlider from "./SliderComponent/ReportFormatSlider";
import '../../styles/HelpTab.css'; 
import { useEffect } from 'react';


function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography component={'span'}>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export default function HelpTab(props) {
  const [value, setValue] = React.useState(Number(props.value));
  // console.log("Value: ", props.value)
  // console.log("set", value)

  useEffect(() => {
    setValue(props.value)
  }, [props.value])

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <>
      <div className='tab'>
        <Tabs value={value} onChange={handleChange} indicatorColor="primary" aria-label="simple tabs example" centered>
          <Tab label={<span className='tab-title'>About</span>} {...a11yProps(0)} />
          <Tab label={<span className='tab-title'>Report Format</span>} {...a11yProps(1)} />
        </Tabs>
      </div>
      <div className='tab-content'>
        <TabPanel value={value} index={0}>
          <AboutSlider />
        </TabPanel>
        <TabPanel value={value} index={1}>
          <ReportFormatSlider />
        </TabPanel>
      </div>
    </>
  );
}
