import classnames from "classnames";
import React from "react";
import styled from "styled-components";
import Menu from "./menu";
import ObjectGeneralTab from "./object-general-tab";
import { Helmet } from "react-helmet";
import {
  HashRouter as Router,
  Route,
  Switch,
  Redirect
} from "react-router-dom";
import {
  Badge,
  TabContent,
  TabPane,
  Nav,
  NavItem,
  NavLink,
  Card,
  Button,
  CardTitle,
  CardText,
  Row,
  Col,
  ButtonDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from "reactstrap";
import { injectState, provideState } from "reaclette";
import { isEmpty } from "lodash";
import Logo from "./imgs/logo_banner.png";

import "./app.css";

const NavItemStyled = styled(NavItem)`
  cursor: pointer;
  font-size: 20px;
`;

const TabPaneStyled = styled(TabPane)`
  margin: 20px;
`;

const withState = provideState({
  initialState: () => ({
    activeTab: "1",
    currentObject: {},
    currentObjects: []
  }),
  effects: {
    toggle: (_, activeTab) => ({ activeTab }),
    getObject: (_, currentObject) => ({ currentObject }),
    getObjects: (_, objects) => ({ currentObjects: objects })
  }
});

function App({
  state: { activeTab, currentObject, currentObjects },
  effects: { toggle, getObject, getObjects }
}) {
  return (
    <div className="App">
      {console.log(currentObject)}
      <Helmet>
        <title>Xen Orchestra</title>
      </Helmet>
      <Router>
        <Row>
          <Col md="2" className="mr-n2">
            <Menu setObject={getObject} setObjects={getObjects} />
          </Col>
          <Col md="10" className="p-0">
            <Nav tabs style={{ backgroundColor: "#f3f3f3" }}>
              <NavItemStyled>
                <NavLink
                  className={classnames({ active: activeTab === "1" })}
                  onClick={() => {
                    toggle("1");
                  }}
                >
                  General
                </NavLink>
              </NavItemStyled>
              <NavItemStyled>
                <NavLink
                  className={classnames({ active: activeTab === "2" })}
                  onClick={() => {
                    toggle("2");
                  }}
                >
                  Stats
                </NavLink>
              </NavItemStyled>
              <NavItemStyled>
                <NavLink
                  className={classnames({ active: activeTab === "3" })}
                  onClick={() => {
                    toggle("3");
                  }}
                >
                  Console
                </NavLink>
              </NavItemStyled>
              <NavItemStyled>
                <NavLink
                  className={classnames({ active: activeTab === "4" })}
                  onClick={() => {
                    toggle("4");
                  }}
                >
                  Network
                </NavLink>
              </NavItemStyled>
              <NavItemStyled>
                <NavLink
                  className={classnames({ active: activeTab === "5" })}
                  onClick={() => {
                    toggle("5");
                  }}
                >
                  Disks
                </NavLink>
              </NavItemStyled>
              <NavItemStyled>
                <NavLink
                  className={classnames({ active: activeTab === "6" })}
                  onClick={() => {
                    toggle("6");
                  }}
                >
                  Snapshots
                </NavLink>
              </NavItemStyled>
              <NavItemStyled>
                <NavLink
                  className={classnames({ active: activeTab === "7" })}
                  onClick={() => {
                    toggle("7");
                  }}
                >
                  Logs
                </NavLink>
              </NavItemStyled>
              <NavItemStyled>
                <NavLink
                  className={classnames({ active: activeTab === "8" })}
                  onClick={() => {
                    toggle("8");
                  }}
                >
                  Advanced
                </NavLink>
              </NavItemStyled>
              {!isEmpty(currentObjects) && (
                <ul class="navbar-nav ml-auto">
                  <h4 style={{ verticalAlign: "middle" }} className="mt-1 mr-1">
                    <ButtonDropdown isOpen={true} toggle={toggle}>
                      <DropdownToggle caret>Actions</DropdownToggle>
                      <DropdownMenu>
                        <DropdownItem>Start</DropdownItem>
                        <DropdownItem>Shutdown</DropdownItem>
                      </DropdownMenu>
                    </ButtonDropdown>{" "}
                    &nbsp; &nbsp;
                    <Badge color="warning">{currentObjects.length}</Badge>{" "}
                  </h4>
                </ul>
              )}
            </Nav>
            <TabContent activeTab={activeTab}>
              <TabPaneStyled tabId="1">
                <Row>
                  <Col sm="12">
                    <br />
                    {!isEmpty(currentObject) ? (
                      <ObjectGeneralTab data={currentObject} />
                    ) : (
                      <div className="container h-100">
                        <div className="row h-100 justify-content-center align-items-center">
                          <div>
                            <img src={Logo} alt="logo_banner" />
                          </div>
                        </div>
                        <h1 className="text-center" style={{ color: " gray" }}>
                          Xen Orchestra
                        </h1>
                      </div>
                    )}
                  </Col>
                </Row>
              </TabPaneStyled>
              <TabPaneStyled tabId="2"></TabPaneStyled>
            </TabContent>
          </Col>
        </Row>
      </Router>
    </div>
  );
}

export default withState(injectState(App));
