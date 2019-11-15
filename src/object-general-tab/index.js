import React from "react";
import { Input, ListGroup, ListGroupItem, Collapse } from "reactstrap";
import {
  FaCube,
  FaCubes,
  FaCogs,
  FaAngleRight,
  FaAngleDown,
  FaPlusSquare,
  FaRegMinusSquare
} from "react-icons/fa";
import styled from "styled-components";
import { isEmpty } from "lodash";
import { injectState, provideState } from "reaclette";

import objects from "../data/objects";

const withState = provideState({
  initialState: () => ({}),
  effects: {},
  computed: {
    poolNameLabel: (_, { data }) =>
      objects.find(obj => obj.type === "pool" && data.$pool === obj.id)
        .name_label
  }
});

const ObjectGeneralTab = ({ effects, state, data }) => (
  <div>
    {!isEmpty(data) && (
      <div>
        <h2>
          {data.name_label} <strong>></strong>{" "}
          <strong>{state.poolNameLabel}</strong>
        </h2>
        <br />
        <div className="text-muted">{data.name_description}</div>
        <br />
      </div>
    )}
  </div>
);

export default withState(injectState(ObjectGeneralTab));
