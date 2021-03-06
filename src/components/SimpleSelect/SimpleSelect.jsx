import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Tooltip from '@material-ui/core/Tooltip';

const useStyles = makeStyles(theme => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}));

export default function SimpleSelect(props) {
  const classes = useStyles();
  const [items, setItems] = useState(props.items);
  const [label, setLabel] = useState(props.label);
  const [toolTip, setToolTip] = useState(props.toolTip);
  const [value, setValue] = useState(props.value);

  useEffect(() => {
    if (props) {
      setItems(props.items);
      setLabel(props.label);
      setToolTip(props.toolTip);
      setValue(props.value);
    }
  }, [props]);

  const handleChange = event => {
    setValue(event.target.value);
    props.onChange(event.target.value);
  };

  return (
    <Tooltip
      aria-label={toolTip}
      placement='right-end'
      title={toolTip}>
      <FormControl className={classes.formControl}>
        <InputLabel id="demo-simple-select-helper-label">{label}</InputLabel>
        <Select
          labelId="demo-simple-select-helper-label"
          id="demo-simple-select-helper"
          value={value}
          onChange={handleChange}
        >
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
          {items.map(item => (
            <MenuItem key={item.value} value={item.value}>{item.option}</MenuItem>
          ))}
        </Select>
      </FormControl>
    </Tooltip>
  );
}
