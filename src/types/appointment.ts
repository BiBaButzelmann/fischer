export type Appointment = {
  matchdayId: number;
  date: Date;
  dayOfWeek: string;
  tournamentId: number;
  isCanceled: boolean;
  userRoles: {
    isReferee: boolean;
    isSetupHelper: boolean;
  };
  contactDetails: {
    otherSetupHelpers: {
      firstName: string;
      lastName: string;
      email: string;
      phoneNumber: string;
      canceled: boolean | null;
    }[];
    referee: {
      firstName: string;
      lastName: string;
      email: string;
      phoneNumber: string;
      canceled: boolean | null;
    } | null;
  };
};
