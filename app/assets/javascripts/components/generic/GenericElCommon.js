/* eslint-disable react/forbid-prop-types */
/* eslint-disable react/no-multi-comp */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Panel, Checkbox, Col, PanelGroup, FormGroup, FormControl, Button, Tooltip, OverlayTrigger, Row, InputGroup, Radio } from 'react-bootstrap';
import uuid from 'uuid';
import { sortBy, filter } from 'lodash';
import Select from 'react-select';
import GenericElDropTarget from './GenericElDropTarget';
import { genUnit, genUnits, genUnitSup, FieldLabel, unitConvToBase } from '../../admin/generic/Utils';

const GenPropertiesText = (opt) => {
  let className = opt.isEditable ? 'editable' : 'readonly';
  className = opt.isRequired && opt.isEditable ? 'required' : className;
  const fieldHeader = opt.label === '' ? null : <FieldLabel label={opt.label} desc={opt.description} />;
  return (
    <FormGroup className="text_generic_properties">
      {fieldHeader}
      <FormControl
        type="text"
        value={opt.value}
        onChange={opt.onChange}
        className={className}
        readOnly={opt.readOnly}
        required={opt.isRequired}
        placeholder={opt.placeholder}
      />
    </FormGroup>
  );
};

const GenPropertiesCheckbox = opt => (
  <FormGroup>
    <Checkbox
      name={opt.field}
      checked={opt.value}
      onChange={opt.onChange}
      disabled={opt.readOnly}
    >
      <FormControl.Static>{opt.label}</FormControl.Static>
    </Checkbox>
  </FormGroup>
);

const GenPropertiesSelect = (opt) => {
  const options = opt.options.map(op => ({ value: op.key, name: op.key, label: op.label }));
  let className = opt.isEditable ? 'select_generic_properties_editable' : 'select_generic_properties_readonly';
  className = opt.isRequired && opt.isEditable ? 'select_generic_properties_required' : className;
  const fieldHeader = opt.label === '' ? null : <FieldLabel label={opt.label} desc={opt.description} />;
  return (
    <FormGroup>
      {fieldHeader}
      <Select
        isClearable
        menuContainerStyle={{ position: 'absolute' }}
        name={opt.field}
        multi={false}
        options={options}
        value={opt.value}
        onChange={opt.onChange}
        className={className}
        disabled={opt.readOnly}
      />
    </FormGroup>
  );
};

const GenPropertiesCalculate = (opt) => {
  const { fields } = opt.layer;
  let showVal = 0;
  let showTxt = null;
  let newFormula = opt.formula;

  const calFields = filter(fields, o => (o.type === 'integer' || o.type === 'system-defined'));
  const regF = /[a-zA-Z]+/gm;
  // eslint-disable-next-line max-len
  const varFields = opt.formula.match(regF) ? opt.formula.match(regF).sort((a, b) => b.length - a.length) : [];

  varFields.forEach((fi) => {
    const tmpField = calFields.find(e => e.field === fi);
    if (typeof tmpField === 'undefined' || tmpField == null) {
      newFormula = newFormula.replace(fi, 0);
    } else {
      newFormula = (tmpField.type === 'system-defined') ? newFormula.replace(fi, parseFloat(unitConvToBase(tmpField) || 0)) : newFormula.replace(fi, parseFloat(tmpField.value || 0));
    }
  });

  if (opt.type === 'formula-field') {
    try {
      showVal = eval(newFormula);
      showTxt = !isNaN(showVal) ? parseFloat(showVal.toFixed(5)) : 0;
    } catch (e) {
      if (e instanceof SyntaxError) {
        showTxt = e.message;
      }
    }
  }

  const fieldHeader = opt.label === '' ? null : (<FieldLabel label={opt.label} desc={opt.description} />);
  return (
    <FormGroup>
      {fieldHeader}
      <FormControl
        type="text"
        value={showTxt}
        onChange={opt.onChange}
        className="readonly"
        readOnly="readonly"
        required={false}
        placeholder={opt.placeholder}
        min={0}
      />
    </FormGroup>
  );
};

const GenPropertiesNumber = (opt) => {
  let className = opt.isEditable ? 'editable' : 'readonly';
  className = opt.isRequired && opt.isEditable ? 'required' : className;
  const fieldHeader = opt.label === '' ? null : <FieldLabel label={opt.label} desc={opt.description} />;
  return (
    <FormGroup>
      {fieldHeader}
      <FormControl
        type="number"
        value={opt.value}
        onChange={opt.onChange}
        className={className}
        readOnly={opt.readOnly}
        required={opt.isRequired}
        placeholder={opt.placeholder}
        min={1}
      />
    </FormGroup>
  );
};

const GenPropertiesSystemDefined = (opt) => {
  let className = opt.isEditable ? 'editable' : 'readonly';
  className = opt.isRequired && opt.isEditable ? 'required' : className;
  const fieldHeader = opt.label === '' ? null : <FieldLabel label={opt.label} desc={opt.description} />;
  return (
    <FormGroup>
      {fieldHeader}
      <InputGroup>
        <FormControl
          type="number"
          value={opt.value}
          onChange={opt.onChange}
          className={className}
          readOnly={opt.readOnly}
          required={opt.isRequired}
          placeholder={opt.placeholder}
          min={1}
        />
        <InputGroup.Button>
          <Button disabled={opt.readOnly} active onClick={opt.onClick} bsStyle="success">
            {genUnitSup(genUnit(opt.option_layers, opt.value_system).label) || ''}
          </Button>
        </InputGroup.Button>
      </InputGroup>
    </FormGroup>
  );
};

const GenPropertiesInputGroup = (opt) => {
  const fieldHeader = opt.label === '' ? null : <FieldLabel label={opt.label} desc={opt.description} />;
  const fLab = e => <div className="form-control g_input_group_label">{e.value}</div>;
  const fTxt = e => <FormControl className="g_input_group" key={e.id} type={e.type} name={e.id} value={e.value} onChange={o => opt.onSubChange(o, e.id, opt.f_obj)} />;
  const subs = opt.f_obj.sub_fields.map((e) => {
    if (e.type === 'label') { return fLab(e); } return fTxt(e);
  });
  return (
    <FormGroup>
      {fieldHeader}
      <InputGroup style={{ display: 'flex' }}>
        {subs}
      </InputGroup>
    </FormGroup>
  );
};

const GenPropertiesDrop = (opt) => {
  const className = opt.isRequired ? 'drop_generic_properties field_required' : 'drop_generic_properties';

  let createOpt = null;
  if (opt.value.is_new === true) {
    createOpt = (
      <div className="sample_radios">
        <OverlayTrigger placement="top" overlay={<Tooltip id={uuid.v4()}>associate with this sample</Tooltip>}>
          <Radio name={`dropS_${opt.value.el_id}`} disabled={opt.value.isAssoc === true} checked={opt.value.cr_opt === 0} onChange={() => opt.onChange({ ...opt.value, cr_opt: 0 })} inline>Current</Radio>
        </OverlayTrigger>
        <OverlayTrigger placement="top" overlay={<Tooltip id={uuid.v4()}>split from the sample first and then associate with it</Tooltip>}>
          <Radio name={`dropS_${opt.value.el_id}`} checked={opt.value.cr_opt === 1} onChange={() => opt.onChange({ ...opt.value, cr_opt: 1 })} inline>Split</Radio>
        </OverlayTrigger>
        <OverlayTrigger placement="top" overlay={<Tooltip id={uuid.v4()}>duplicate the sample first and then associate with it</Tooltip>}>
          <Radio name={`dropS_${opt.value.el_id}`} checked={opt.value.cr_opt === 2} onChange={() => opt.onChange({ ...opt.value, cr_opt: 2 })} inline>Copy</Radio>
        </OverlayTrigger>
      </div>
    );
  }
  const fieldHeader = opt.label === '' ? null : <FieldLabel label={opt.label} desc={opt.description} />;

  return (
    <FormGroup>
      {fieldHeader}
      <FormControl.Static style={{ paddingBottom: '0px' }}>
        <div className={className}>
          <GenericElDropTarget opt={opt} onDrop={opt.onChange} />
          {createOpt}
          <div>
            <OverlayTrigger placement="top" overlay={<Tooltip id={uuid.v4()}>remove</Tooltip>}>
              <Button className="btn_del" bsStyle="danger" bsSize="xsmall" onClick={() => opt.onChange({})} ><i className="fa fa-trash-o" aria-hidden="true" /></Button>
            </OverlayTrigger>
          </div>
        </div>
      </FormControl.Static>
    </FormGroup>
  );
};

const GenProperties = (opt) => {
  const fieldProps = { ...opt, dndItems: [] };
  const type = fieldProps.type.split('_');
  if (opt.isSearchCriteria && type[0] === 'drag') type[0] = 'text';
  switch (type[0]) {
    case 'checkbox':
      return GenPropertiesCheckbox(fieldProps);
    case 'formula-field':
      return GenPropertiesCalculate(fieldProps);
    case 'select':
      return GenPropertiesSelect(fieldProps);
    case 'drag':
      fieldProps.dndItems = [...fieldProps.dndItems, type[1]];
      return GenPropertiesDrop(fieldProps);
    case 'integer':
      return GenPropertiesNumber(fieldProps);
    case 'system-defined':
      return GenPropertiesSystemDefined(fieldProps);
    case 'input-group':
      return GenPropertiesInputGroup(fieldProps);
    default:
      return GenPropertiesText(fieldProps);
  }
};

const GenPropertiesSearch = opt => GenProperties({ ...opt, isSearchCriteria: true });

class GenPropertiesLayer extends Component {
  constructor(props) {
    super(props);
    this.handleSubChange = this.handleSubChange.bind(this);
  }
  // event, field, layer, type
  handleChange(e, f, k, t) {
    this.props.onChange(e, f, k, t);
  }

  handleSubChange(e, id, f) {
    const sub = f.sub_fields.find(m => m.id === id);
    sub.value = e.target.value;
    const { layer } = this.props;
    const obj = { f, sub };
    this.props.onSubChange(layer.key, obj);
  }

  // event, field, key of layer, field object, value, unitsSystem
  handleClick(keyLayer, obj, val) {
    const units = genUnits(obj.option_layers);
    let uIdx = units.findIndex(e => e.key === val);
    if (uIdx < units.length - 1) uIdx += 1; else uIdx = 0;
    const update = obj;
    update.value_system = units.length > 0 ? units[uIdx].key : '';
    this.props.onClick(keyLayer, update);
  }

  views() {
    const { layer, selectOptions, id } = this.props;
    const { cols, fields, key } = layer;
    const col = Math.floor(12 / (cols || 1));
    const perRow = 12 / col;
    const vs = [];
    let op = [];
    fields.forEach((f, i) => {
      const unit = genUnits(f.option_layers)[0] || {};
      const eachCol = (
        <Col key={`prop_${key}_${f.priority}_${f.field}`} md={col} lg={col}>
          <GenProperties
            id={id}
            layer={layer}
            f_obj={f}
            label={f.label}
            value={f.value || ''}
            description={f.description || ''}
            type={f.type || 'text'}
            field={f.field || 'field'}
            formula={f.formula || ''}
            options={(selectOptions && selectOptions[f.option_layers]) || []}
            onChange={event => this.handleChange(event, f.field, key, f.type)}
            onSubChange={this.handleSubChange}
            isEditable
            readOnly={false}
            isRequired={f.required || false}
            placeholder={f.placeholder || ''}
            option_layers={f.option_layers}
            value_system={f.value_system || unit.key}
            onClick={() => this.handleClick(key, f, (f.value_system || unit.key))}
          />
        </Col>
      );
      op.push(eachCol);
      if (((i + 1) % perRow === 0) || ((i + 1) % perRow !== 0 && fields.length === (i + 1))) {
        vs.push(<Row key={`prop_row_${key}_${f.priority}_${f.field}`}>{op}</Row>);
        op = [];
      }
    });
    return vs;
  }

  render() {
    const bs = this.props.layer.color ? this.props.layer.color : 'default';
    const cl = this.props.layer.style ? this.props.layer.style : 'panel_generic_heading';
    const panelHeader = this.props.layer.label === '' ? (<span />) : (
      <Panel.Heading className={cl} >
        <Panel.Title toggle>{this.props.layer.label}</Panel.Title>
      </Panel.Heading>
    );
    return (
      <PanelGroup accordion id="accordion_generic_layer" defaultActiveKey="1" style={{ marginBottom: '0px' }}>
        <Panel bsStyle={bs} className="panel_generic_properties" eventKey="1">
          {panelHeader}
          <Panel.Collapse>
            <Panel.Body className="panel_generic_properties_body">{this.views()}</Panel.Body>
          </Panel.Collapse>
        </Panel>
      </PanelGroup>
    );
  }
}

GenPropertiesLayer.propTypes = {
  id: PropTypes.number,
  layer: PropTypes.object,
  selectOptions: PropTypes.object,
  onChange: PropTypes.func.isRequired,
  onSubChange: PropTypes.func.isRequired,
  onClick: PropTypes.func
};

GenPropertiesLayer.defaultProps = {
  id: 0,
  selectOptions: {}, onClick: () => {}
};

class GenPropertiesLayerSearchCriteria extends Component {
  handleChange(e, f, k, t) {
    this.props.onChange(e, f, k, t);
  }

  views() {
    const { layer, selectOptions } = this.props;
    const { cols, fields, key } = layer;
    const col = 12 / (cols || 1);
    const vs = fields.map((f) => {
      const unit = genUnits(f.option_layers)[0] || {};
      return (
        <Col key={`prop_${key}_${f.priority}_${f.field}`} md={col}>
          <GenPropertiesSearch
            label={f.label}
            value={f.value || ''}
            type={f.type || 'text'}
            field={f.field || 'field'}
            options={(selectOptions && selectOptions[f.option_layers]) || []}
            onChange={event => this.handleChange(event, f.field, key, f.type)}
            option_layers={f.option_layers}
            value_system={f.value_system || unit.key}
            isEditable
            readOnly={false}
            isRequired={false}
          />
        </Col>
      );
    });
    return vs;
  }

  render() {
    return (
      <Panel className="panel_generic_properties" defaultExpanded>
        <Panel.Heading><Panel.Title toggle>{this.props.layer.label}</Panel.Title></Panel.Heading>
        <Panel.Collapse><Panel.Body>{this.views()}</Panel.Body></Panel.Collapse>
      </Panel>
    );
  }
}

GenPropertiesLayerSearchCriteria.propTypes = {
  layer: PropTypes.object,
  selectOptions: PropTypes.object,
  onChange: PropTypes.func.isRequired,
};

GenPropertiesLayerSearchCriteria.defaultProps = {
  selectOptions: {}
};

const LayersLayout = (layers, options, funcChange, funcSubChange = () => {}, funcClick = () => {}, layout = [], id = 0) => {
  const sortedLayers = sortBy(layers, l => l.position) || [];
  sortedLayers.forEach((layer) => {
    if (layer.condition == null || layer.condition.trim().length === 0) {
      const ig = (
        <GenPropertiesLayer
          id={id}
          key={layer.key}
          layer={layer}
          onChange={funcChange}
          onSubChange={funcSubChange}
          selectOptions={options}
          onClick={funcClick}
        />
      );
      layout.push(ig);
    } else if (layer.condition && layer.condition.trim().length > 0) {
      const conditions = layer.condition.split(';');
      let showLayer = false;

      for (let i = 0; i < conditions.length; i += 1) {
        const arr = conditions[i].split(',');
        if (arr.length >= 3) {
          const specificObj = layers[`${arr[0].trim()}`] && layers[`${arr[0].trim()}`].fields.find(e => e.field === `${arr[1].trim()}`) && layers[`${arr[0].trim()}`].fields.find(e => e.field === `${arr[1].trim()}`);
          const specific = specificObj && specificObj.value;
          if ((specific && specific.toString()) === (arr[2] && arr[2].toString().trim())) {
            showLayer = true;
            break;
          }
        }
      }

      if (showLayer === true) {
        const igs = (
          <GenPropertiesLayer
            key={layer.key}
            layer={layer}
            onChange={funcChange}
            onSubChange={funcSubChange}
            selectOptions={options}
            onClick={funcClick}
          />
        );
        layout.push(igs);
      }
    }
  });

  return layout;
};

export {
  LayersLayout,
  GenProperties,
  GenPropertiesLayer,
  GenPropertiesLayerSearchCriteria,
};
