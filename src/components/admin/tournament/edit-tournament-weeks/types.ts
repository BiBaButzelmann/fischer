export type Week = {
  index: number;
  status: WeekStatus;
  weekNumber: number;
  tuesday: {
    refereeNeeded: boolean;
  };
  thursday: {
    refereeNeeded: boolean;
  };
  friday: {
    refereeNeeded: boolean;
  };
};

export type WeekStatus = "regular" | "catch-up";

export type WeekDay = "tuesday" | "thursday" | "friday";
