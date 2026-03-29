import moment from "moment";
import { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View, ViewStyle } from "react-native";
import DatePicker from "react-native-date-picker";

import CustomText from "./CustomText";

import colors from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { useApp } from "@/contexts/AppContext";

interface CustomDatePickerProps {
  value: Date | null;
  setValue: (date: Date) => void;
  error?: string;
  withLabel?: string;
  placeholder?: string;
  type?: "date" | "time" | "datetime";
  maxDate?: Date;
  backgroundColor?: string;
  defaultError?: string;
  width?: string | number;
  marginBottom?: number;
  height?: number;
  isIcon?: boolean;
  minDate?: Date;
  isRightIcon?: boolean;
  disabled?: boolean;
  isClock?: boolean;
  marginTop?: number;
}

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  value,
  setValue,
  error,
  withLabel,
  placeholder = "Date",
  type = "date",
  maxDate,
  width,
  marginBottom,
  height,
  isIcon = false,
  minDate,

  disabled = false,
  isClock,
  marginTop = 0,
}) => {
  const { isDarkMode } = useApp();

  const theme = isDarkMode ? colors.dark : colors.light;

  const [isModal, setModal] = useState<boolean>(false);
  const [prevError, setPrevError] = useState<string | undefined>(error);
  const [showSuccessColor, setShowSuccessColor] = useState<boolean>(false);

  useEffect(() => {
    if (prevError && !error) {
      setShowSuccessColor(true);
      const timer = setTimeout(() => {
        setShowSuccessColor(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
    setPrevError(error);
  }, [error, prevError]);

  // 16 saal pehle ki date calculate karo
  const getDefaultDate = (): Date => {
    if (value) return value;

    const sixteenYearsAgo = new Date();
    sixteenYearsAgo.setFullYear(sixteenYearsAgo.getFullYear() - 16);
    return sixteenYearsAgo;
  };

  return (
    <>
      <TouchableOpacity
        disabled={disabled}
        onPress={() => setModal(true)}
        style={[
          styles.mainContainer,
          {
            marginBottom: error ? 5 : marginBottom || 0,
            marginTop: marginTop,
            paddingHorizontal: 12,
            backgroundColor: theme.cardBackground,
            borderWidth: error ? 1 : 0,
            width: width || "100%",
            height: height || 56,
            flexDirection: isIcon ? "row" : "column",
            alignItems: isIcon ? "center" : "flex-start",
            justifyContent: isIcon ? "space-between" : "center",
          } as ViewStyle,
        ]}
      >
        <View style={isIcon ? styles.contentContainer : null}>
          {withLabel && (
            <CustomText
              label={withLabel}
              textTransform="uppercase"
              color={theme.lightWhite}
              fontFamily={Fonts.medium}
              fontSize={12}
            />
          )}

          <View style={isIcon || isClock ? styles.dateRow : null}>
            <CustomText
              label={
                value
                  ? moment(value).format(
                      type === "date" ? "MMM DD, YYYY" : "h:mm A"
                    )
                  : placeholder
              }
              fontSize={16}
              fontFamily={value ? Fonts.medium : Fonts.regular}
              lineHeight={16 * 1.4}
              color={theme.text}
            />
          </View>
        </View>
      </TouchableOpacity>

      {isModal && (
        <DatePicker
          modal
          open={isModal}
          date={getDefaultDate()}
          onConfirm={(date: Date) => {
            setValue(date);
            setModal(false);
          }}
          onCancel={() => setModal(false)}
          mode={type}
          theme="dark"
          minimumDate={minDate}
          maximumDate={maxDate}
        />
      )}
    </>
  );
};

export default CustomDatePicker;

const styles = StyleSheet.create({
  mainContainer: {
    width: "100%",
    borderRadius: 12,
    justifyContent: "center",
  },
  contentContainer: {
    flex: 1,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  calendarButton: {
    width: 32,
    height: 32,
  },
});
