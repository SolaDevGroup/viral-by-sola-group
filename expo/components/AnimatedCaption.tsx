import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
  Animated,
  Platform,
  UIManager,
  TextLayoutLine,
  Easing,
} from "react-native";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type AnimatedCaptionProps = {
  text: string;
  numberOfLines?: number;
};

const STAGGER_DELAY = 40;
const LINE_ANIMATION_DURATION = 250;

const AnimatedCaption: React.FC<AnimatedCaptionProps> = ({
  text,
  numberOfLines = 2,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [textLines, setTextLines] = useState<TextLayoutLine[]>([]);
  const [isTruncatable, setIsTruncatable] = useState(false);
  const animatedHeight = useRef(new Animated.Value(0)).current;
  const containerOpacity = useRef(new Animated.Value(1)).current;
  const lineAnimations = useRef<Animated.Value[]>([]).current;
  const [collapsedHeight, setCollapsedHeight] = useState(0);
  const [expandedHeight, setExpandedHeight] = useState(0);
  const [hasLayout, setHasLayout] = useState(false);

  useEffect(() => {
    while (lineAnimations.length < textLines.length) {
      lineAnimations.push(new Animated.Value(expanded ? 1 : 0));
    }
  }, [textLines.length, expanded, lineAnimations]);

  const handleTextLayout = useCallback((e: any) => {
    const lines = e.nativeEvent.lines as TextLayoutLine[];
    setTextLines(lines);
    
    if (lines.length > numberOfLines) {
      setIsTruncatable(true);
      const collapsed = lines.slice(0, numberOfLines).reduce((sum, line) => sum + line.height, 0);
      const full = lines.reduce((sum, line) => sum + line.height, 0);
      setCollapsedHeight(collapsed);
      setExpandedHeight(full);
      
      if (!hasLayout) {
        animatedHeight.setValue(collapsed);
        setHasLayout(true);
      }
    } else {
      setIsTruncatable(false);
      const full = lines.reduce((sum, line) => sum + line.height, 0);
      setExpandedHeight(full);
      setCollapsedHeight(full);
      if (!hasLayout) {
        animatedHeight.setValue(full);
        setHasLayout(true);
      }
    }
  }, [numberOfLines, hasLayout, animatedHeight]);

  const toggle = () => {
    if (!isTruncatable) return;
    
    const toExpanded = !expanded;
    const toValue = toExpanded ? expandedHeight : collapsedHeight;
    
    Animated.sequence([
      Animated.timing(containerOpacity, {
        toValue: 0.7,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(containerOpacity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.spring(animatedHeight, {
      toValue,
      useNativeDriver: false,
      friction: 12,
      tension: 100,
    }).start();

    if (toExpanded && lineAnimations.length > numberOfLines) {
      const hiddenLineAnims = lineAnimations.slice(numberOfLines);
      hiddenLineAnims.forEach((anim, i) => {
        anim.setValue(0);
        Animated.timing(anim, {
          toValue: 1,
          duration: LINE_ANIMATION_DURATION,
          delay: i * STAGGER_DELAY,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }).start();
      });
    } else if (!toExpanded && lineAnimations.length > numberOfLines) {
      const hiddenLineAnims = lineAnimations.slice(numberOfLines);
      hiddenLineAnims.reverse().forEach((anim, i) => {
        Animated.timing(anim, {
          toValue: 0,
          duration: LINE_ANIMATION_DURATION / 2,
          delay: i * (STAGGER_DELAY / 2),
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }).start();
      });
    }
    
    setExpanded(toExpanded);
  };

  const renderTextLine = (line: TextLayoutLine, index: number, totalLines: number) => {
    const isHiddenLine = index >= numberOfLines;
    const lineAnim = lineAnimations[index];
    
    if (!expanded && isTruncatable && index === numberOfLines - 1) {
      const lineText = line.text.trim();
      const truncatedText = lineText.length > 30 
        ? lineText.slice(0, lineText.length - 10) 
        : lineText;
      
      return (
        <Animated.View 
          key={index} 
          style={[
            styles.truncatedLineContainer,
            {
              opacity: containerOpacity,
            }
          ]}
        >
          {truncatedText.length > 0 && (
            <Text style={styles.captionText}>
              {truncatedText}
            </Text>
          )}
          <Text style={styles.captionText}>
            {truncatedText ? "... " : ""}
            <Text style={styles.moreText}>more</Text>
          </Text>
        </Animated.View>
      );
    }

    if (isHiddenLine && lineAnim) {
      return (
        <Animated.View
          key={index}
          style={[
            {
              opacity: lineAnim,
              transform: [{
                translateY: lineAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [8, 0],
                }),
              }, {
                scale: lineAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.95, 1],
                }),
              }],
            },
          ]}
        >
          <Text style={styles.captionText}>
            {line.text.trim()}
          </Text>
        </Animated.View>
      );
    }

    return (
      <Animated.View key={index} style={{ opacity: containerOpacity }}>
        <Text style={styles.captionText}>
          {line.text.trim()}
        </Text>
      </Animated.View>
    );
  };

  const visibleLines = expanded 
    ? textLines 
    : textLines.slice(0, numberOfLines);

  return (
    <TouchableWithoutFeedback onPress={toggle}>
      <View style={styles.container}>
        <Text
          style={[styles.captionText, styles.hiddenText]}
          onTextLayout={handleTextLayout}
        >
          {text}
        </Text>
        
        <Animated.View
          style={[
            styles.visibleContainer,
            hasLayout && isTruncatable ? { height: animatedHeight } : undefined,
          ]}
        >
          {textLines.length > 0 ? (
            <View>
              {visibleLines.map((line, index) => 
                renderTextLine(line, index, textLines.length)
              )}
              {expanded && isTruncatable && (
                <TouchableWithoutFeedback onPress={toggle}>
                  <Animated.Text 
                    style={[
                      styles.lessText,
                      {
                        opacity: lineAnimations[textLines.length - 1] || 1,
                      }
                    ]}
                  >
                    {" "}less
                  </Animated.Text>
                </TouchableWithoutFeedback>
              )}
            </View>
          ) : (
            <Text style={styles.captionText} numberOfLines={expanded ? undefined : numberOfLines}>
              {text}
              {isTruncatable && !expanded && (
                <Text style={styles.moreText}> more</Text>
              )}
            </Text>
          )}
        </Animated.View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default AnimatedCaption;

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  hiddenText: {
    position: "absolute",
    opacity: 0,
    pointerEvents: "none",
  },
  visibleContainer: {
    overflow: "hidden",
  },
  truncatedLineContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  captionText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#FFFFFF",
    fontFamily: "Poppins_500Medium",
    letterSpacing: -0.07,
  },
  moreText: {
    color: "rgba(255, 255, 255, 0.48)",
    fontSize: 14,
    fontFamily: "Poppins_500Medium",
  },
  lessText: {
    color: "rgba(255, 255, 255, 0.48)",
    fontSize: 14,
    fontFamily: "Poppins_500Medium",
  },
});
