import Waiting from "../src/components/Waiting";
import React from "react";
import { shallow } from "enzyme";

describe("Readying Up", () => {
  test("starts with a count of 0", () => {
    const wrapper = shallow(<Waiting />);
    const text = wrapper.find(".players-ready").text();
    expect(text).toEqual("Players Ready: 0 / 4");
  });
});
