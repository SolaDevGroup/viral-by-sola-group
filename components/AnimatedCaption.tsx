import React, { useState } from "react";
import { StyleSheet, Text, TouchableWithoutFeedback, View } from "react-native";

type AnimatedCaptionProps = {
  text: string;
  previewLength?: number; // how many chars to show when collapsed
};

const AnimatedCaption: React.FC<AnimatedCaptionProps> = ({
  text,
  previewLength = 40,
}) => {
  const [expanded, setExpanded] = useState(false);

  const isLongText = text.length > previewLength * 2;

  const displayedText =
    expanded || !isLongText ? text : text.slice(0, previewLength);

  const toggle = () => {
    if (!isLongText) return;
    setExpanded((prev) => !prev);
  };

  return (
    <TouchableWithoutFeedback onPress={toggle}>
      <View>
        <Text style={styles.captionText}>
          {displayedText}
          {!expanded && isLongText && " ... "}
          {isLongText && (
            <Text style={styles.moreText}>{expanded ? " less" : "more"}</Text>
          )}
        </Text>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default AnimatedCaption;

const styles = StyleSheet.create({
  captionText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#FFFFFF",
    fontFamily: "Poppins_500Medium",
  },
  moreText: {
    color: "#B5B5B5",
    fontSize: 13,
    fontFamily: "Poppins_500Medium",
  },
});
