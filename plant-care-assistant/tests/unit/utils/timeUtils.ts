export const isAllDayEvent = (startDate: Date, endDate: Date): boolean => {
  return (
    startDate.getHours() === 0 &&
    startDate.getMinutes() === 0 &&
    endDate.getHours() === 23 &&
    endDate.getMinutes() === 59
  );
};

export const formatEventDateTime = (startDate: Date, endDate: Date): string => {
  if (isAllDayEvent(startDate, endDate)) {
    return `${startDate.toLocaleDateString()} (All day)`;
  } else {
    const startTime = startDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    const endTime = endDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${startDate.toLocaleDateString()} from ${startTime} to ${endTime}`;
  }
};
