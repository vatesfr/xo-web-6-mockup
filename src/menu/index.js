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
  UncontrolledCollapse
} from "reactstrap";
import {
  filter,
  find,
  forEach,
  groupBy,
  isEmpty,
  lowerCase,
  map,
  mapValues,
  remove,
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
  FaPlus
} from "react-icons/fa";
import styled from "styled-components";
import { injectState, provideState } from "reaclette";
import * as ComplexMatcher from "complex-matcher";

import objects from "../data/objects";
import data from "../data/sample";

import "./index.css";
import Logo from "../imgs/logo.png";

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
  PIF: "deviceName"
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

const createTree = ({ data }) => {
  const DOMNodes = [];
  forEach(data, (_data, groupKey) => {
    DOMNodes.push(<div>{groupKey}</div>);

    forEach(_data, (obj, objType) => {
      DOMNodes.push(<div style={{ marginLeft: "20px" }}>{objType}</div>);
      const createSubTree = (arrayOfObj, treeTemplate, DOMNodes) => {
        forEach(arrayOfObj, _obj => {
          DOMNodes.push(
            <div style={{ marginLeft: "40px" }}>{_obj.name_label}</div>
          );
          const objTemplate = treeTemplate[objType];
          forEach(objTemplate, (tree, treeKey) => {
            DOMNodes.push(<div style={{ marginLeft: "60px" }}>{treeKey}</div>);
            const correspondingObjects = filter(
              objects,
              _ => _.type === treeKey && _[connectors[treeKey]] === _obj.id
            );

            forEach(correspondingObjects, _ => {
              console.log(_);
              DOMNodes.push(
                <div style={{ marginLeft: "80px" }}>
                  {_[nameLabelByObject[treeKey]]}
                </div>
              );
            });

            // console.log("corresponding objects", correspondingObjects);
            // console.log("tree", tree);
            // console.log("-------------------------------");
            createSubTree(correspondingObjects, tree, DOMNodes);
          });
        });
      };
      createSubTree(obj, TEMPLATE, DOMNodes);
    });
  });
  return DOMNodes;
};

const withState = provideState({
  initialState: () => ({
    isCollapseOpen: {},
    isObjectsOpen: true,
    isInfrastructureOpen: false,
    isSettingsOpen: false,
    searchValue: "",
    selectedElements: [],
    addSearchModal: false,
    searchName: "",
    searchFilter: "",
    searchGroupBy: "",
    savedSearchs: {
      // instrastructure: {
      //   searchFilter: "type:pool",
      //   searchGroupBy: "type"
      // },
      // byType: {
      //   // searchFilter: "type:pool",
      //   searchGroupBy: "type"
      // },
      byVDI: {
        searchFilter: "type:VM",
        searchGroupBy: "type"
      }
    }
  }),
  effects: {
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
    handleSelectedItem(_, evt, elt) {
      if (evt.target.checked) {
        this.props.setObjects([...this.state.selectedElements, elt]);
        return {
          selectedElements: [...this.state.selectedElements, elt]
        };
      } else {
        const _selectedElements = this.state.selectedElements;
        remove(_selectedElements, element => element.id === elt.id);
        this.props.setObjects(_selectedElements);
        return {
          selectedElements: _selectedElements
        };
      }
    },
    setCurrentSavedSearch(_, name) {
      return {
        currentSavedSearch: this.state.savedSearchs[name]
      };
    },
    toggleSearchModal() {
      return { addSearchModal: !this.state.addSearchModal };
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
        searchValue: searchFilter,
        savedSearchs: {
          ...savedSearchs,
          [searchName]: {
            searchFilter,
            searchGroupBy
          }
        },
        addSearchModal: false
      };
    }
  },
  computed: {
    filteredObjects: ({ predicate }) => filter(objects, predicate),
    predicate: ({ searchValue, currentSavedSearch }) =>
      ComplexMatcher.parse(currentSavedSearch.searchFilter).createPredicate(),
    objs: ({ filteredObjects, savedSearchs }) => {
      const objsBySearchName = {};
      Object.keys(savedSearchs).forEach(searchName => {
        objsBySearchName[searchName] = (() => {
          const searchFilter = savedSearchs[searchName].searchFilter;
          const searchGroupBy = savedSearchs[searchName].searchGroupBy;
          const _filteredObjects = filter(
            objects,
            ComplexMatcher.parse(searchFilter || "").createPredicate()
          );
          // When there's no groupBy and no searchFilter, think of a way how you're going to display objects
          return groupBy(_filteredObjects, searchGroupBy || "type");
        })();
      });
      return createTree({ data: objsBySearchName });
      // return objsBySearchName;
    }
  }
});

const Menu = ({ effects, state, setObject }) => (
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
        {map(state.objs, (data, name) => (
          <Item
            className="mb-1 ml-3"
            // onClick={() => effects.setCurrentSavedSearch(name)}
          >
            <div
              style={{ cursor: "pointer" }}
              id={name}
              onClick={() => effects.toggle(name)}
            >
              {!state.isCollapseOpen[name] ? (
                <FaPlusSquare />
              ) : (
                <FaRegMinusSquare />
              )}{" "}
              {capitalize(lowerCase(name))}
            </div>
            <Collapse isOpen={state.isCollapseOpen[name]} className="mt-1 ml-2">
              {/* {state.isCollapseOpen[name] &&
                Object.keys(data).map(key => {
                  return (
                    <Item className="mb-1 ml-3">
                      <div
                        style={{ cursor: "pointer" }}
                        id={key}
                        onClick={() => effects.toggle(key)}
                      >
                        {!state.isCollapseOpen[key] ? (
                          <FaPlusSquare />
                        ) : (
                          <FaRegMinusSquare />
                        )}{" "}
                        {key}
                      </div>
                      <Collapse isOpen={state.isCollapseOpen[key]}>
                        {state.isCollapseOpen[key] && (
                          <Form>
                            {data[key].map(elt => (
                              <Item
                                className="mt-1"
                                onClick={() => setObject(elt)}
                              >
                                <div style={{ marginLeft: "30px" }}>
                                  <FormGroup check>
                                    <Input
                                      type="checkbox"
                                      name="check"
                                      id={elt.id}
                                      onChange={ev =>
                                        effects.handleSelectedItem(ev, elt)
                                      }
                                    />
                                    <Label for={elt.id} check>
                                      {elt.name_label}
                                    </Label>
                                  </FormGroup>
                                </div>
                              </Item>
                            ))}
                          </Form>
                        )}
                      </Collapse>
                    </Item>
                  );
                })} */}
            </Collapse>
          </Item>
        ))}
        {state.objs}
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
    </ListGroup>

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
              <option>folter</option>
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

export default withState(injectState(Menu));
