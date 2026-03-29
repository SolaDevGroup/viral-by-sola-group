import moment from "moment";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";

import { ToastMessage } from "@/utils/ToastMessage";
import CustomDatePicker from "./CustomDatePicker";

interface DateRangeProps {
  startDate: Date | null;
  endDate: Date | null;
  setStartDate: (date: Date | null) => void;
  setEndDate: (date: Date | null) => void;

  startTime: Date | null;
  endTime: Date | null;
  setStartTime: (date: Date | null) => void;
  setEndTime: (date: Date | null) => void;

  isBorder?: boolean;
}

const DateRange: React.FC<DateRangeProps> = ({
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  startTime,
  endTime,
  setStartTime,
  setEndTime,
  isBorder = true,
}) => {
  const [sDate, setsDate] = useState<Date | null>(null);
  const [eDate, seteDate] = useState<Date | null>(null);

  const handleStartDate = (date: Date | null) => {
    if (!date) {
      setStartDate(null);
      setStartTime(null);
      setEndDate(null);
      setEndTime(null);
      setsDate(null);
      seteDate(null);
      return;
    }

    setsDate(date);
    seteDate(null);
    setStartTime(null);
    setEndDate(null);
    setEndTime(null);
    setStartDate(date);
  };

  const handleEndDate = (date: Date | null) => {
    if (!startDate) {
      ToastMessage("Please select start date before end date", "error");
      return;
    }

    if (date && moment(date).isBefore(moment(startDate), "day")) {
      ToastMessage("End date cannot be before start date", "error");
      return;
    }

    seteDate(date);
    setEndDate(date);
    setEndTime(null);
  };

  return (
    <View style={{}}>
      {/* Start Date & Time */}
      <View style={[styles.row, { marginTop: 12 }]}>
        <CustomDatePicker
          isIcon
          width="49%"
          marginBottom={8}
          minDate={new Date()}
          withLabel="STARTING DATE"
          setValue={handleStartDate}
          value={sDate}
        />
        <CustomDatePicker
          isIcon
          type="time"
          width="49%"
          marginBottom={8}
          minDate={new Date()}
          setValue={setStartTime}
          withLabel="TIME"
          value={startTime}
        />
      </View>

      {/* End Date & Time */}
      <View style={styles.row}>
        <CustomDatePicker
          isIcon
          width="49%"
          marginBottom={8}
          setValue={handleEndDate}
          withLabel="ENDING DATE"
          minDate={sDate || new Date()}
          value={eDate}
        />
        <CustomDatePicker
          isIcon
          type="time"
          width="49%"
          marginBottom={8}
          minDate={new Date()}
          setValue={setEndTime}
          withLabel="TIME"
          value={endTime}
        />
      </View>
    </View>
  );
};

export default DateRange;

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
