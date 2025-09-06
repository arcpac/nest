import React from "react";
import HouseHoldItem from "./HouseHoldItem";
import { getAllHouseholds } from "../lib/houseHold";

const HouseHoldList = async () => {
  const households = await getAllHouseholds();
  if (!households || households.length === 0) {
    return <div>No households found</div>;
  }
  return (
    <div>
      <ul className="space-y-3">
        {households.map((h, i) => (
          <HouseHoldItem key={i} household={h} />
        ))}
      </ul>
    </div>
  );
};

export default HouseHoldList;
