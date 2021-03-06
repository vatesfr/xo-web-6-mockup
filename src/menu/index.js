import React from "react";
import {
  Input,
  ListGroup,
  ListGroupItem,
  Collapse,
  Row,
  Col,
  Form,
  FormGroup,
  Label,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  UncontrolledCollapse,
  UncontrolledTooltip
} from "reactstrap";
import {
  filter,
  find,
  forEach,
  escape,
  groupBy,
  isEmpty,
  lowerCase,
  map,
  mapValues,
  remove,
  startCase,
  capitalize
} from "lodash";
import {
  FaCube,
  FaCubes,
  FaCogs,
  FaAngleRight,
  FaAngleDown,
  FaPlusSquare,
  FaRegMinusSquare,
  FaHdd,
  FaPlus
} from "react-icons/fa";
import styled from "styled-components";
import { injectState, provideState } from "reaclette";
import * as ComplexMatcher from "complex-matcher";

import objects from "../data/objects";
import data from "../data/sample";

import "./index.css";
import "react-sortable-tree/style.css";
import Logo from "../imgs/logo.png";

import SortableTree from "react-sortable-tree";

const MenuItem = styled(ListGroupItem)`
  background-color: transparent;
  cursor: pointer;
  // &:hover {
  //   color: #f9b6b6;
  // }
`;

const Item = styled.div`
  color: white;
  &:hover {
    color: #f9b6b6;
  }
`;

const connectors = {
  VM: "$pool",
  VBD: "VM",
  "VM-snapshot": "snapshot_of",
  "VM-template": "$pool",
  "VM-controller": "$pool",
  host: "$pool",
  FGPU: "$host",
  PBD: "host",
  PCI: "$host",
  SR: "$pool",
  VDI: "$SR",
  "VDI-snapshot": "$SR",
  "VDI-unmanaged": "$SR",
  network: "$pool",
  VIF: "$network",
  PIF: "$network"
};

const nameLabelByObject = {
  VM: "name_label",
  VBD: "device",
  "VM-snapshot": "name_label",
  "VM-template": "name_label",
  "VM-controller": "name_label",
  host: "name_label",
  FGPU: undefined,
  PBD: undefined,
  PCI: "class_name",
  SR: "name_label",
  VDI: "name_label",
  "VDI-snapshot": "name_label",
  "VDI-unmanaged": "name_label",
  network: "name_label",
  VIF: "MAC",
  PIF: "deviceName",
  pool_patch: "name",
  pool: "name_label"
};

const TEMPLATE = {
  pool_patch: {},
  gpuGroup: {},
  PGPU: {},
  pool: {
    VM: {
      VBD: {},
      VM_snapshot: {}
    },
    "VM-template": {},
    "VM-controller": {},
    host: {
      FGPU: {},
      PBD: {},
      PCI: {}
    },
    SR: {
      VDI: {},
      "VDI-snapshot": {},
      "VDI-unmanaged": {}
    },
    network: {
      VIF: {},
      PIF: {}
    }
  },
  network: {
    VIF: {},
    PIF: {}
  },
  VIF: {},
  PIF: {},
  VM: {
    VBD: {},
    "VM-snapshot": {}
  },
  VBD: {},
  "VM-snapshot": {},
  "VM-template": {},
  "VM-controller": {},
  FGPU: {},
  PBD: {},
  PCI: {},
  host: {
    FGPU: {},
    PBD: {},
    PCI: {}
  },
  VDI: {},
  "VDI-snapshot": {},
  "VDI-unmanaged": {},
  SR: {
    VDI: {},
    "VDI-snapshot": {},
    "VDI-unmanaged": {}
  },
  message: {},
  task: {},
  vgpuType: {},
  patch: {}
};

export const generateId = () =>
  "i" +
  Math.random()
    .toString(36)
    .slice(2);

const adjustableTemplate = [
  {
    title: "Pool",
    children: [
      { title: "VM", children: [{ title: "VBD" }, { title: "VM_snapshot" }] },
      { title: "VM_template" },
      { title: "VM_controller" },
      {
        title: "Host",
        children: [{ title: "FGPU" }, { title: "PBD" }, { title: "PCI" }]
      },
      {
        title: "SR",
        children: [
          { title: "VDI" },
          { title: "VDI_snapshot" },
          { title: "VDI_unmanaged" }
        ]
      },
      { title: "Netword", children: [{ title: "VIF" }, { title: "PIF" }] }
    ]
  }
];

const ELEMENTS_BY_VIEW = 20;

const withState = provideState({
  initialState: () => ({
    isCollapseOpen: {},
    isObjectsOpen: true,
    isInfrastructureOpen: false,
    isSettingsOpen: false,
    searchValue: "",
    selectedElements: [],
    addSearchModal: false,
    adjustModal: false,
    searchName: "",
    searchFilter: "",
    searchGroupBy: "",
    savedSearchs: {
      Instrastructures: {
        searchFilter: "type:pool",
        searchGroupBy: "type"
      },
      ByType: {
        searchGroupBy: "type"
      }
    },
    treeTemplateData: adjustableTemplate,
    elementsPerTree: ELEMENTS_BY_VIEW
  }),
  effects: {
    displayMore() {
      return { elementsPerTree: this.state.elementsPerTree + ELEMENTS_BY_VIEW };
    },
    handleSearch(_, evt) {
      return {
        searchValue: evt.target.value
      };
    },
    toggle(_, key) {
      const { isCollapseOpen } = this.state;
      return {
        isCollapseOpen: {
          ...isCollapseOpen,
          [key]: !Boolean(this.state.isCollapseOpen[key])
        }
      };
    },
    toggleObjects() {
      return { isObjectsOpen: !this.state.isObjectsOpen };
    },
    handleSelectedItem(_, elt) {
      this.props.setObject(elt);
    },
    setCurrentSavedSearch(_, name) {
      return {
        currentSavedSearch: this.state.savedSearchs[name]
      };
    },
    toggleSearchModal() {
      return { addSearchModal: !this.state.addSearchModal };
    },
    toggleAdjustModal() {
      return { adjustModal: !this.state.adjustModal };
    },
    handleSearchInputs(_, ev) {
      return {
        [ev.target.name]: ev.target.value
      };
    },
    handleSubmitAddSearch(_, ev) {
      ev.preventDefault();
      const {
        searchFilter,
        savedSearchs,
        searchName,
        searchGroupBy
      } = this.state;
      // Add search
      return {
        // searchValue: searchFilter,
        savedSearchs: {
          ...savedSearchs,
          [searchName]: {
            searchFilter,
            searchGroupBy
          }
        },
        addSearchModal: false
      };
    },
    onTreeTemplateDataChange: (_, treeTemplateData) => ({ treeTemplateData })
  },
  computed: {
    filteredObjects: ({ predicate }) => filter(objects, predicate),
    predicate: ({ searchValue }) =>
      ComplexMatcher.parse(searchValue).createPredicate(),
    objs: ({ filteredObjects, savedSearchs, searchValue }) => {
      console.log(filteredObjects);
      const objsBySearchName = {};
      if (searchValue) {
        return filteredObjects;
      }
      Object.keys(savedSearchs).forEach(searchName => {
        objsBySearchName[searchName] = (() => {
          const searchFilter = savedSearchs[searchName].searchFilter;
          let searchGroupBy = savedSearchs[searchName].searchGroupBy;
          const _filteredObjects = filter(
            // objects,
            filteredObjects,
            ComplexMatcher.parse(searchFilter || "").createPredicate()
          );

          return !isEmpty(searchGroupBy)
            ? groupBy(_filteredObjects, searchGroupBy)
            : _filteredObjects;
        })();
      });
      return objsBySearchName;
    }
  }
});

const Menu = ({ effects, state }) => {
  const makeNameCompletableByToolTip = (elt, name, id) => {
    id = id.replace(":", "");
    return name && name.length > 18 ? (
      <span>
        <span
          id={"s" + id}
          onClick={() => effects.handleSelectedItem(elt)}
        >{`${name.substring(0, 22).trim()}...`}</span>
        <UncontrolledTooltip target={"s" + id} placement="top">
          {name}
        </UncontrolledTooltip>
      </span>
    ) : (
      name
    );
  };

  const makeSubTreeFromTemplateTree = (type, parentId) => {
    const objs = filter(
      objects,
      _ => _.type === type && _[connectors[type]] === parentId
    );

    const res = map(objs, _ => (
      <Item style={{ marginLeft: "10px" }}>
        <span onClick={() => effects.toggle(_.id)}>
          <span
            style={{
              whiteSpace: "nowrap"
            }}
          >
            <FaHdd />{" "}
            {makeNameCompletableByToolTip(
              _,
              _[nameLabelByObject[_.type]],
              _.id
            )}
          </span>
        </span>
        <div>{constructSubTree(_)}</div>
      </Item>
    ));

    return res.length > 0 ? (
      res
    ) : (
      <div className="text-muted" style={{ marginLeft: "10px" }}>
        Empty
      </div>
    );
  };

  const constructSubTree = (obj, elementsPerTree) =>
    map(TEMPLATE[obj.type], (value, type) => (
      <Item style={{ marginLeft: "10px" }}>
        <span onClick={() => effects.toggle(obj.id + type)}>
          {!state.isCollapseOpen[obj.id + type] ? (
            <FaPlusSquare />
          ) : (
            <FaRegMinusSquare />
          )}{" "}
        </span>
        {`${type}s`}
        <Collapse isOpen={state.isCollapseOpen[obj.id + type]}>
          {state.isCollapseOpen[obj.id + type] &&
            makeSubTreeFromTemplateTree(type, obj.id)}
        </Collapse>
      </Item>
    ));

  const constructTreeFromArray = (data, elementsPerTree) => {
    let _data = [...data];
    _data = _data.splice(0, elementsPerTree);
    return map(_data, obj => (
      <Item style={{ marginLeft: "10px" }}>
        <span onClick={() => effects.toggle(obj.id)}>
          {isEmpty(TEMPLATE[obj.type]) ? (
            <FaHdd />
          ) : !state.isCollapseOpen[obj.id] ? (
            <FaPlusSquare />
          ) : (
            <FaRegMinusSquare />
          )}{" "}
        </span>
        <span onClick={() => effects.handleSelectedItem(obj)}>
          {obj[nameLabelByObject[obj.type]]}
        </span>
        <Collapse isOpen={state.isCollapseOpen[obj.id]}>
          {state.isCollapseOpen[obj.id] &&
            constructSubTree(obj, elementsPerTree)}
        </Collapse>
      </Item>
    ));
  };

  const objs = (data, elementsPerTree) =>
    Array.isArray(data)
      ? constructTreeFromArray(data, elementsPerTree)
      : map(data, (values, name) => {
          const isArray = Array.isArray(values);
          const isObject = typeof values === "object";
          return (
            <Item style={{ marginLeft: "10px" }}>
              <span onClick={() => effects.toggle(name)}>
                {!state.isCollapseOpen[name] ? (
                  <FaPlusSquare />
                ) : (
                  <FaRegMinusSquare />
                )}{" "}
              </span>
              {startCase(name)}
              <Collapse isOpen={state.isCollapseOpen[name]}>
                {state.isCollapseOpen[name] && !isEmpty(values) ? (
                  isArray ? (
                    constructTreeFromArray(values, elementsPerTree)
                  ) : (
                    isObject && objs(values, elementsPerTree)
                  )
                ) : (
                  <div className="text-muted" style={{ marginLeft: "10px" }}>
                    Empty
                  </div>
                )}
                {isArray && values.length > ELEMENTS_BY_VIEW && (
                  <div>
                    <Button
                      color="link"
                      style={{ color: "#9ea2a0" }}
                      onClick={effects.displayMore}
                    >
                      Display more
                    </Button>
                  </div>
                )}
              </Collapse>
            </Item>
          );
        });

  return (
    <div className="menu scroll-style">
      <p style={{ fontSize: "24px" }}>
        <img src={Logo} alt="logo" height="20" width="40" /> Xen Orchestra
      </p>
      <ListGroup style={{ color: "white" }} flush className="h-100">
        <MenuItem>
          <div onClick={effects.toggleObjects}>
            <strong style={{ fontSize: "22px" }}>
              <FaCube /> Objects{" "}
              {state.isObjectsOpen ? (
                <FaAngleDown size="30" className="float-right" />
              ) : (
                <FaAngleRight size="30" className="float-right" />
              )}
            </strong>
          </div>
          <div
            style={{
              marginLeft: "20px",
              marginRight: "20px",
              marginTop: "10px",
              marginBottom: "10px"
            }}
          >
            <Input
              style={{ backgroundColor: "#404040", color: "white" }}
              onChange={effects.handleSearch}
              placeholder="search"
              value={state.searchValue}
            />
          </div>
          <br />
          <span>Saved searchs</span>
          <br />
          {objs(state.objs, state.elementsPerTree)}
        </MenuItem>
        <div className="text-center">
          <Button
            // color="light"
            size="sm"
            onClick={effects.toggleSearchModal}
            style={{
              width: "200px",
              marginTop: "10px",
              marginBottom: "10px"
            }}
          >
            New search <FaPlus />
          </Button>
        </div>
        <div className="text-center">
          <Button
            // color="light"
            size="sm"
            onClick={effects.toggleAdjustModal}
            style={{
              width: "200px",
              marginTop: "10px",
              marginBottom: "10px"
            }}
          >
            Edit tree view
          </Button>
        </div>
      </ListGroup>

      <Modal
        isOpen={state.adjustModal}
        toggle={effects.toggleAdjustModal}
        size="lg"
      >
        <ModalHeader toggle={effects.toggleAdjustModal}>
          Adjust tree view
        </ModalHeader>
        <ModalBody>
          <div style={{ height: 600 }}>
            <SortableTree
              treeData={state.treeTemplateData}
              onChange={effects.onTreeTemplateDataChange}
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" type="submit">
            Adjust
          </Button>{" "}
          <Button color="secondary" onClick={effects.toggleAdjustModal}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={state.addSearchModal} toggle={effects.toggleSearchModal}>
        <ModalHeader toggle={effects.toggleSearchModal}>New search</ModalHeader>
        <Form onSubmit={effects.handleSubmitAddSearch}>
          <ModalBody>
            <FormGroup>
              <Label for="searchName">Search name</Label>
              <Input
                type="text"
                name="searchName"
                id="searchName"
                placeholder="Search name"
                onChange={effects.handleSearchInputs}
                value={state.searchName}
                required
              />
            </FormGroup>
            <FormGroup>
              <Label for="searchFilter">Filter</Label>
              <Input
                type="text"
                name="searchFilter"
                id="searchFilter"
                placeholder="Filter"
                value={state.searchFilter}
                onChange={effects.handleSearchInputs}
              />
            </FormGroup>
            <FormGroup>
              <Label for="searchGroupBy">Group by</Label>
              <Input
                type="select"
                name="searchGroupBy"
                id="searchGroupBy"
                onChange={effects.handleSearchInputs}
                value={state.searchGroupBy}
              >
                <option value="" disabled selected>
                  Select your option
                </option>
                <option>type</option>
                <option>tag</option>
                <option>folder</option>
              </Input>
            </FormGroup>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" type="submit">
              Search
            </Button>{" "}
            <Button color="secondary" onClick={effects.toggleSearchModal}>
              Cancel
            </Button>
          </ModalFooter>
        </Form>
      </Modal>
    </div>
  );
};

export default withState(injectState(Menu));
