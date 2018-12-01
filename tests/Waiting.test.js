import Waiting from "../../src/components/Waiting";
import { shallow } from "enzyme";

describe("Readying Up", () => {
  test("starts with a count of 0", () => {
    const wrapper = shallow(<Waiting />); // perform shallow render of Like
    const text = wrapper.find(".players-ready").text(); // extract text in span
    expect(text).toEqual("Players Ready: 0 / 4");
  });
});
